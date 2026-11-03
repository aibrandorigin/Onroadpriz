import { db } from './index.ts';
import { users } from './schema.ts';
import { eq } from 'drizzle-orm';

export async function getOrCreateUser(uid: string, email: string, name?: string, phone?: string) {
  try {
    const userData = {
      id: uid,
      uid,
      email,
      name: name || '',
      fullName: name || '',
      phone: phone || '',
      role: 'Buyer',
      status: 'Active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const result = await db.insert(users)
      .values({
        id: uid,
        uid,
        email,
        name: name || null,
        phone: phone || null,
        data: JSON.stringify(userData),
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          email,
          ...(name ? { name } : {}),
          ...(phone ? { phone } : {}),
          data: JSON.stringify(userData),
          updatedAt: new Date(),
        },
      })
      .returning();

    return result[0];
  } catch (error) {
    console.error('Database query failed in getOrCreateUser:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUsers() {
  try {
    const rows = await db.select().from(users);
    return rows.map(r => {
      try {
        return JSON.parse(r.data);
      } catch {
        return r;
      }
    });
  } catch (error) {
    console.error('Database query failed in getUsers:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function getUserByUid(uid: string) {
  try {
    const rows = await db.select().from(users).where(eq(users.id, uid)).limit(1);
    if (!rows[0]) return null;
    try {
      return JSON.parse(rows[0].data);
    } catch {
      return rows[0];
    }
  } catch (error) {
    console.error('Database query failed in getUserByUid:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}
