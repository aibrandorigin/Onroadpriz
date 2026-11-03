import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema.ts';

// Add global connection pool caching to persist across hot-reloads
declare global {
  var _postgresPool: Pool | undefined;
}

// Function to create or retrieve the connection pool.
export const createPool = () => {
  if (!global._postgresPool) {
    global._postgresPool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      max: 10,
      connectionTimeoutMillis: 5000,
      idleTimeoutMillis: 20000,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10000,
      allowExitOnIdle: true,
    });

    // Prevent unhandled pool-level errors on idle client disconnects from crashing the application
    global._postgresPool.on('error', (err: any) => {
      const msg = String(err?.message || '');
      if (
        msg.includes('Connection terminated unexpectedly') ||
        msg.includes('Client has encountered a connection error') ||
        err?.code === '57P01' ||
        err?.code === 'ECONNRESET'
      ) {
        // Expected when serverless Cloud SQL proxy recycles idle connections; pool automatically reconnects on next query
        return;
      }
      console.warn('[CloudSQL Pool] Idle client warning:', msg);
    });
  }
  return global._postgresPool;
};

// Create or retrieve the pool instance.
const pool = createPool();

// Initialize Drizzle with the pool and schema.
export const db = drizzle(pool, { schema });
