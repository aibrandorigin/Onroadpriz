import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { db } from '../../db/index.js';
import { siteSettings } from '../../db/schema.js';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../..');
const dataDir = path.resolve(rootDir, 'data');
const SECRETS_FILE_PATH = path.resolve(dataDir, 'secure-settings.json');

export const REQUIRED_SECRET_KEYS = [
  'GEMINI_API_KEY',
  'SMS_BASE_URL',
  'SMS_PE_ID',
  'SMS_USER',
  'SMS_PASSWORD',
  'SMS_DLT_TEMPLATE_ID',
  'SMS_CHANNEL',
  'SMS_SENDER_ID',
  'SMS_ROUTE',
] as const;

export type RequiredSecretKey = (typeof REQUIRED_SECRET_KEYS)[number];

export interface SecretFieldMeta {
  key: RequiredSecretKey;
  label: string;
  description: string;
  category: 'gemini' | 'sms';
  isSecret: boolean;
  isConfigured: boolean;
  source: 'environment' | 'database' | 'default' | 'missing';
  maskedValue: string;
  lastUpdated?: string;
  updatedBy?: string;
}

export interface SecretKeyDefinition {
  key: RequiredSecretKey;
  label: string;
  description: string;
  category: 'gemini' | 'sms';
  isSecret: boolean;
  defaultVal?: string;
}

export const SECRET_DEFINITIONS: Record<RequiredSecretKey, SecretKeyDefinition> = {
  GEMINI_API_KEY: {
    key: 'GEMINI_API_KEY',
    label: 'Gemini API Key',
    description: 'Server-side API key for Google Gemini AI models used for vehicle appraisal, descriptions, and insights',
    category: 'gemini',
    isSecret: true,
  },
  SMS_BASE_URL: {
    key: 'SMS_BASE_URL',
    label: 'SMS Provider Base URL',
    description: 'Endpoint URL for the SMS gateway (Ultron SMS DLT HTTP gateway)',
    category: 'sms',
    isSecret: false,
    defaultVal: 'https://ultronsms.com/api/mt/SendSMS',
  },
  SMS_PE_ID: {
    key: 'SMS_PE_ID',
    label: 'Principal Entity ID (PE ID)',
    description: 'Telecom DLT-registered Principal Entity ID assigned to OnRoadPriz/Trussets enterprise',
    category: 'sms',
    isSecret: false,
    defaultVal: '1701177943584895129',
  },
  SMS_USER: {
    key: 'SMS_USER',
    label: 'SMS Provider Username',
    description: 'Authorized account username for the Ultron SMS gateway',
    category: 'sms',
    isSecret: true,
  },
  SMS_PASSWORD: {
    key: 'SMS_PASSWORD',
    label: 'SMS Provider Password',
    description: 'Authorized account password for the Ultron SMS gateway',
    category: 'sms',
    isSecret: true,
  },
  SMS_DLT_TEMPLATE_ID: {
    key: 'SMS_DLT_TEMPLATE_ID',
    label: 'DLT Template ID',
    description: 'Approved DLT content template ID for transactional OTP and notification dispatches',
    category: 'sms',
    isSecret: false,
    defaultVal: '1707178132876719605',
  },
  SMS_CHANNEL: {
    key: 'SMS_CHANNEL',
    label: 'SMS Channel',
    description: 'Gateway channel routing type (e.g. Trans / Transactional)',
    category: 'sms',
    isSecret: false,
    defaultVal: 'Trans',
  },
  SMS_SENDER_ID: {
    key: 'SMS_SENDER_ID',
    label: 'Approved Sender ID',
    description: 'DLT-registered 6-character sender header (e.g. TRSSET)',
    category: 'sms',
    isSecret: false,
    defaultVal: 'TRSSET',
  },
  SMS_ROUTE: {
    key: 'SMS_ROUTE',
    label: 'SMS Route Identifier',
    description: 'Gateway delivery route identifier (e.g. 02 for premium transactional)',
    category: 'sms',
    isSecret: false,
    defaultVal: '02',
  },
};

/**
 * Mask secret strings to protect against accidental exposure while allowing verification
 */
export function maskSecretValue(value: string, isSecret: boolean): string {
  if (!value || typeof value !== 'string') return '';
  const trimmed = value.trim();
  if (!trimmed) return '';

  if (!isSecret) {
    // For non-secrets like URLs or IDs, show safe preview
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
      try {
        const u = new URL(trimmed);
        return `${u.protocol}//${u.host}${u.pathname}`;
      } catch {
        return trimmed;
      }
    }
    if (trimmed.length > 8) {
      return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
    }
    return trimmed;
  }

  // Sensitive credentials
  if (trimmed.length <= 4) {
    return '••••••••';
  }
  if (trimmed.length <= 8) {
    return `${trimmed.slice(0, 2)}••••${trimmed.slice(-2)}`;
  }
  return `${trimmed.slice(0, 4)}••••••••${trimmed.slice(-4)}`;
}

export class SecretsManager {
  private static cachedDbSecrets: Record<string, string> = {};
  private static metadata: Record<string, { lastUpdated: string; updatedBy: string }> = {};
  private static isInitialized = false;

  /**
   * Initialize secrets cache from secure server file and Cloud SQL
   */
  public static async init(): Promise<void> {
    if (this.isInitialized) return;

    // 1. Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch (e) {
        console.warn('[SecretsManager] Could not create dataDir:', e);
      }
    }

    // 2. Read from disk if present
    try {
      if (fs.existsSync(SECRETS_FILE_PATH)) {
        const raw = fs.readFileSync(SECRETS_FILE_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') {
          this.cachedDbSecrets = parsed.secrets || {};
          this.metadata = parsed.metadata || {};
        }
      }
    } catch (err) {
      console.error('[SecretsManager] Failed to read SECRETS_FILE_PATH:', err);
    }

    // 3. Try to sync from Cloud SQL if available
    try {
      const rows = await db
        .select()
        .from(siteSettings)
        .where(eq(siteSettings.id, 'secrets_config'))
        .limit(1);

      if (rows.length > 0 && rows[0].data) {
        const sqlData = JSON.parse(rows[0].data);
        if (sqlData && typeof sqlData === 'object') {
          // Prefer Cloud SQL secrets over container disk snapshot so republishing never reverts secrets
          this.cachedDbSecrets = { ...this.cachedDbSecrets, ...sqlData.secrets };
          this.metadata = { ...this.metadata, ...sqlData.metadata };
          this.saveToDisk();
        }
      }
    } catch {
      // Cloud SQL might not be configured or table empty, disk fallback works
    }

    // 4. Populate process.env for any keys configured in storage that aren't already in process.env
    for (const [k, v] of Object.entries(this.cachedDbSecrets)) {
      if (v && typeof v === 'string' && !process.env[k]) {
        process.env[k] = v;
      }
    }

    this.isInitialized = true;
  }

  /**
   * Get effective secret value
   * Hierarchy:
   * 1. Explicitly configured secure settings (database / secure-settings.json)
   * 2. process.env environment variable
   * 3. Built-in DLT default (for non-sensitive configurations only)
   */
  public static get(key: RequiredSecretKey): string {
    const configured = this.cachedDbSecrets[key]?.trim();
    if (configured) return configured;

    const envVal = process.env[key]?.trim();
    if (envVal) return envVal;

    const def = SECRET_DEFINITIONS[key]?.defaultVal;
    return def || '';
  }

  /**
   * Check if a specific key is configured (either in DB, env, or default)
   */
  public static isConfigured(key: RequiredSecretKey): boolean {
    const val = this.get(key);
    return Boolean(val && val.length > 0);
  }

  /**
   * Get source of a key
   */
  public static getSource(key: RequiredSecretKey): 'environment' | 'database' | 'default' | 'missing' {
    if (this.cachedDbSecrets[key]?.trim()) return 'database';
    if (process.env[key]?.trim()) return 'environment';
    if (SECRET_DEFINITIONS[key]?.defaultVal) return 'default';
    return 'missing';
  }

  /**
   * Get all 9 fields metadata for admin settings view
   * NEVER returns plain secret values!
   */
  public static getAllPublicMeta(): SecretFieldMeta[] {
    return REQUIRED_SECRET_KEYS.map(key => {
      const def = SECRET_DEFINITIONS[key];
      const effectiveVal = this.get(key);
      const isConfigured = Boolean(effectiveVal && effectiveVal.length > 0);
      const source = this.getSource(key);
      const masked = maskSecretValue(effectiveVal, def.isSecret);
      const meta = this.metadata[key];

      return {
        key,
        label: def.label,
        description: def.description,
        category: def.category,
        isSecret: def.isSecret,
        isConfigured,
        source,
        maskedValue: masked,
        lastUpdated: meta?.lastUpdated,
        updatedBy: meta?.updatedBy,
      };
    });
  }

  /**
   * Get raw secret value for authorized admin inspection or reveal
   */
  public static getPlainSecret(key: RequiredSecretKey): string {
    return this.get(key);
  }

  /**
   * Update configuration fields safely
   * - Preserves existing values when empty or omitted
   * - Validates URL and required formats
   * - Atomically persists to disk & Cloud SQL
   * - Updates process.env in memory
   */
  public static async updateSecrets(
    updates: Partial<Record<RequiredSecretKey, string>>,
    updatedBy: string = 'Super Admin'
  ): Promise<{ success: boolean; updatedKeys: string[]; errors?: string[] }> {
    await this.init();

    const errors: string[] = [];
    const updatedKeys: string[] = [];
    const nowIso = new Date().toISOString();

    for (const key of REQUIRED_SECRET_KEYS) {
      if (!(key in updates)) continue;
      const rawInput = updates[key];
      if (rawInput === undefined || rawInput === null) continue;

      const trimmed = typeof rawInput === 'string' ? rawInput.trim() : '';

      // If user submitted empty string or masked placeholder, PRESERVE existing value!
      if (!trimmed || trimmed.includes('••••••••')) {
        continue;
      }

      // Format validations
      if (key === 'SMS_BASE_URL') {
        try {
          const u = new URL(trimmed);
          if (u.protocol !== 'http:' && u.protocol !== 'https:') {
            errors.push('SMS_BASE_URL must be a valid HTTP or HTTPS URL.');
            continue;
          }
        } catch {
          errors.push('SMS_BASE_URL is not a valid URL format.');
          continue;
        }
      }

      if (key === 'SMS_PE_ID' && !/^\d+$/.test(trimmed)) {
        errors.push('SMS_PE_ID must contain numeric digits only.');
        continue;
      }

      if (key === 'SMS_DLT_TEMPLATE_ID' && !/^\d+$/.test(trimmed)) {
        errors.push('SMS_DLT_TEMPLATE_ID must contain numeric digits only.');
        continue;
      }

      // Value is valid: update cached storage
      this.cachedDbSecrets[key] = trimmed;
      this.metadata[key] = {
        lastUpdated: nowIso,
        updatedBy,
      };
      // Keep process.env in sync
      process.env[key] = trimmed;
      updatedKeys.push(key);
    }

    if (errors.length > 0 && updatedKeys.length === 0) {
      return { success: false, updatedKeys: [], errors };
    }

    // Persist to secure disk storage
    try {
      const payload = {
        secrets: this.cachedDbSecrets,
        metadata: this.metadata,
        lastUpdated: nowIso,
        updatedBy,
      };
      const tempPath = `${SECRETS_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tempPath, SECRETS_FILE_PATH);
    } catch (err: any) {
      console.error('[SecretsManager] Error saving to disk:', err);
    }

    // Persist to Cloud SQL site_settings
    try {
      const payload = {
        secrets: this.cachedDbSecrets,
        metadata: this.metadata,
        lastUpdated: nowIso,
        updatedBy,
      };
      const serialized = JSON.stringify(payload);
      await db
        .insert(siteSettings)
        .values({
          id: 'secrets_config',
          data: serialized,
          updatedAt: new Date(),
        })
        .onConflictDoUpdate({
          target: siteSettings.id,
          set: {
            data: serialized,
            updatedAt: new Date(),
          },
        });
    } catch (sqlErr) {
      console.warn('[SecretsManager] Cloud SQL save warning (disk saved):', sqlErr);
    }

    console.log(`[SecretsManager] Successfully updated ${updatedKeys.length} secret configuration fields by ${updatedBy}`);
    return { success: true, updatedKeys, errors: errors.length > 0 ? errors : undefined };
  }
}
