import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';
import { User, UserRole } from '../../types';
import { INITIAL_USERS } from '../../data/initialData';
import { DbService } from '../dbService.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.resolve(__dirname, '..', '..', '..', 'data');
const USERS_FILE_PATH = path.resolve(dataDir, 'users.json');
const SESSIONS_FILE_PATH = path.resolve(dataDir, 'sessions.json');

export interface SessionRecord {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: number;
}

/**
 * Normalize Indian mobile numbers to canonical format: +919876543210
 * Handles inputs like:
 * 9876543210
 * +91 9876543210
 * 09876543210
 * 919876543210
 * +919876543210
 */
export function normalizeIndianMobile(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const digits = String(raw).replace(/\D/g, '');
  if (digits.length === 10) {
    return `+91${digits}`;
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return `+91${digits.slice(1)}`;
  }
  if (digits.length === 12 && digits.startsWith('91')) {
    return `+91${digits.slice(2)}`;
  }
  if (digits.length > 10) {
    return `+91${digits.slice(-10)}`;
  }
  return null;
}

/**
 * Enterprise Server Authentication Service
 * Single source of truth for canonical User records, Unique Mobile constraints,
 * Strict Null Email integrity, and Session management.
 */
export class AuthService {
  private static usersCache: Map<string, User> = new Map();
  private static sessionsCache: Map<string, SessionRecord> = new Map();
  private static isInitialized = false;
  private static isSyncedWithDb = false;
  private static dbSyncPromise: Promise<void> | null = null;

  private static ensureDataDir() {
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
  }

  /**
   * Load users from local cache as synchronous fallback; NEVER overwrite Cloud SQL during init()
   */
  public static init() {
    if (this.isInitialized) return;
    this.ensureDataDir();

    // 1. Initialize Users from disk cache if present
    try {
      if (fs.existsSync(USERS_FILE_PATH)) {
        const raw = fs.readFileSync(USERS_FILE_PATH, 'utf-8');
        const list: User[] = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          list.forEach(u => {
            if (u.email && u.email.endsWith('@onroadpriz.com') && 
                u.email !== 'onroadpriz@admin.com' && 
                u.email !== 'admin@onroadpriz.com' && 
                u.email !== 'moderator@onroadpriz.com' &&
                u.role !== 'Super Admin' && u.role !== 'Admin' && u.role !== 'Moderator') {
              delete u.email;
            }
            const norm = normalizeIndianMobile(u.normalized_mobile || u.mobile || u.phone);
            if (norm) {
              u.normalized_mobile = norm;
              u.phone = norm;
              u.mobile = norm;
            }
            this.usersCache.set(u.id, u);
          });
        }
      }
    } catch (err) {
      console.error('[AuthService] Error reading users file:', err);
    }

    // Seed defaults into memory only if completely empty
    if (this.usersCache.size === 0) {
      INITIAL_USERS.forEach(u => {
        const clone = { ...u };
        const norm = normalizeIndianMobile(clone.phone || clone.mobile);
        if (norm) {
          clone.normalized_mobile = norm;
          clone.phone = norm;
          clone.mobile = norm;
        }
        this.usersCache.set(clone.id, clone);
      });
      this.writeUsersToDisk();
    } else {
      // Only seed default Super Admin if NO Super Admin / Admin account exists at all
      const hasAnyAdmin = Array.from(this.usersCache.values()).some(
        u => u.id === 'usr-adm-orp-01' || u.role === 'Super Admin' || u.role === 'Admin'
      );
      if (!hasAnyAdmin && INITIAL_USERS[0]) {
        const adminClone = { ...INITIAL_USERS[0] };
        const norm = normalizeIndianMobile(adminClone.phone);
        if (norm) {
          adminClone.normalized_mobile = norm;
          adminClone.phone = norm;
          adminClone.mobile = norm;
        }
        this.usersCache.set(adminClone.id, adminClone);
        this.writeUsersToDisk();
      }
    }

    // 2. Initialize Sessions from disk cache
    try {
      if (fs.existsSync(SESSIONS_FILE_PATH)) {
        const raw = fs.readFileSync(SESSIONS_FILE_PATH, 'utf-8');
        const list: SessionRecord[] = JSON.parse(raw);
        const now = Date.now();
        if (Array.isArray(list)) {
          list.forEach(s => {
            if (s.expiresAt > now) {
              this.sessionsCache.set(s.token, s);
            }
          });
        }
      }
    } catch (err) {
      console.error('[AuthService] Error reading sessions file:', err);
    }

    this.isInitialized = true;
    console.log(`[AuthService] Initialized with ${this.usersCache.size} users and ${this.sessionsCache.size} active sessions.`);
  }

  /**
   * Authoritative Cloud SQL synchronization on server boot / republish.
   * Ensures Cloud SQL user & admin details ALWAYS override stale container snapshot files.
   */
  public static async syncFromDatabase(): Promise<void> {
    this.init();
    try {
      const dbUsers = await DbService.getUsers();
      if (Array.isArray(dbUsers) && dbUsers.length > 0) {
        this.usersCache.clear();
        for (const u of dbUsers) {
          if (!u || !u.id) continue;
          const norm = normalizeIndianMobile(u.normalized_mobile || u.mobile || u.phone);
          if (norm) {
            u.normalized_mobile = norm;
            u.phone = norm;
            u.mobile = norm;
          }
          this.usersCache.set(u.id, u);
        }
        this.writeUsersToDisk();
      }

      const dbSessions = await DbService.getSessions();
      if (Array.isArray(dbSessions) && dbSessions.length > 0) {
        const now = Date.now();
        for (const s of dbSessions) {
          if (s && s.token && s.userId && s.expiresAt > now) {
            this.sessionsCache.set(s.token, s);
          }
        }
        this.writeSessionsToDisk();
      }

      this.isSyncedWithDb = true;
    } catch (err) {
      console.warn('[AuthService] Cloud SQL sync warning:', err);
    }
  }

  public static async ensureSyncedWithDb(): Promise<void> {
    if (this.isSyncedWithDb) return;
    if (!this.dbSyncPromise) {
      this.dbSyncPromise = this.syncFromDatabase().finally(() => {
        this.dbSyncPromise = null;
      });
    }
    await this.dbSyncPromise;
  }

  private static writeUsersToDisk() {
    try {
      this.ensureDataDir();
      const list = Array.from(this.usersCache.values());
      const tempPath = `${USERS_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf-8');
      fs.renameSync(tempPath, USERS_FILE_PATH);
    } catch (err) {
      console.error('[AuthService] Error writing users to disk:', err);
    }
  }

  private static persistUsers(changedUser?: User) {
    this.writeUsersToDisk();
    if (changedUser && changedUser.id) {
      DbService.upsertUser(changedUser).catch(err => {
        console.warn(`[AuthService] Error upserting user ${changedUser.id} to Cloud SQL:`, err);
      });
    }
  }

  private static writeSessionsToDisk() {
    try {
      this.ensureDataDir();
      const list = Array.from(this.sessionsCache.values());
      const tempPath = `${SESSIONS_FILE_PATH}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(list, null, 2), 'utf-8');
      fs.renameSync(tempPath, SESSIONS_FILE_PATH);
    } catch (err) {
      console.error('[AuthService] Error writing sessions to disk:', err);
    }
  }

  private static persistSessions() {
    this.writeSessionsToDisk();
    const list = Array.from(this.sessionsCache.values());
    DbService.saveSessions(list).catch(() => {});
  }

  public static getAllUsers(): User[] {
    this.init();
    return Array.from(this.usersCache.values());
  }

  public static findUserById(id: string): User | null {
    this.init();
    return this.usersCache.get(id) || null;
  }

  public static saveUser(user: User): User {
    this.init();
    if (!user || !user.id) return user;
    this.usersCache.set(user.id, user);
    this.persistUsers(user);
    return user;
  }

  public static findUserByEmail(email: string): User | null {
    this.init();
    const clean = (email || '').trim().toLowerCase();
    if (!clean) return null;
    for (const u of this.usersCache.values()) {
      if (u.email && u.email.trim().toLowerCase() === clean) {
        return u;
      }
    }
    return null;
  }

  /**
   * Find user by mobile number matching canonical representation
   */
  public static findUserByMobile(mobileInput: string): User | null {
    this.init();
    const canonical = normalizeIndianMobile(mobileInput);
    if (!canonical) return null;
    const tenDigits = canonical.slice(-10);

    for (const u of this.usersCache.values()) {
      if (u.normalized_mobile && u.normalized_mobile === canonical) {
        return u;
      }
      const uNormPhone = normalizeIndianMobile(u.phone);
      if (uNormPhone && uNormPhone === canonical) {
        return u;
      }
      const uNormMobile = normalizeIndianMobile(u.mobile);
      if (uNormMobile && uNormMobile === canonical) {
        return u;
      }
      if (u.phone && String(u.phone).replace(/\D/g, '').endsWith(tenDigits)) {
        return u;
      }
      if (u.mobile && String(u.mobile).replace(/\D/g, '').endsWith(tenDigits)) {
        return u;
      }
    }
    return null;
  }

  /**
   * Check if mobile number is already registered by ANOTHER user account
   */
  public static isMobileRegisteredByAnother(mobileInput: string, excludeUserId?: string): boolean {
    this.init();
    const user = this.findUserByMobile(mobileInput);
    if (!user) return false;
    if (excludeUserId && user.id === excludeUserId) return false;
    return true;
  }

  /**
   * Check if email is already registered by ANOTHER user account
   */
  public static isEmailRegisteredByAnother(emailInput: string, excludeUserId?: string): boolean {
    this.init();
    const clean = (emailInput || '').trim().toLowerCase();
    if (!clean) return false;
    for (const u of this.usersCache.values()) {
      if (u.email && u.email.trim().toLowerCase() === clean) {
        if (!excludeUserId || u.id !== excludeUserId) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Authenticate with email & password
   * Uses authoritative user record (including updated admin email/password) and NEVER leaks credentials in errors.
   */
  public static authenticateWithEmail(
    emailInput: string,
    passwordInput: string
  ): { success: boolean; user?: User; error?: string } {
    this.init();
    const cleanEmail = (emailInput || '').trim().toLowerCase();
    const cleanPass = (passwordInput || '').trim();

    if (!cleanEmail || !cleanPass) {
      return { success: false, error: 'Email and password are required.' };
    }

    const existing = this.findUserByEmail(cleanEmail);
    if (existing) {
      if (existing.status === 'Blocked' || (existing.status as any) === 'Suspended') {
        return { success: false, error: 'Your account is suspended. Please contact support.' };
      }

      const storedPass = existing.password ? String(existing.password).trim() : '';
      let passwordValid = false;

      if (storedPass) {
        passwordValid = (cleanPass === storedPass);
        // Also allow 'admin123' if storedPass is default 'admin'
        if (!passwordValid && storedPass === 'admin' && cleanPass === 'admin123') {
          passwordValid = true;
        }
      } else {
        // Legacy accounts without an explicit password field
        passwordValid = (cleanPass === '123' || cleanPass === '123456' || cleanPass === '111111');
      }

      if (!passwordValid) {
        return { success: false, error: 'Invalid email or password. Please check your credentials and try again.' };
      }

      existing.lastLogin = new Date().toISOString();
      this.persistUsers(existing);
      return { success: true, user: existing };
    }

    return {
      success: false,
      error: 'Invalid email or password. Please check your credentials and try again.'
    };
  }

  /**
   * Authenticate or provision user via verified Mobile OTP.
   * Enforces UNIQUE normalized mobile and STRICT NULL EMAIL integrity.
   */
  public static authenticateWithOtp(
    mobileInput: string,
    fullNameInput?: string
  ): { success: boolean; user?: User; isNewUser: boolean; error?: string } {
    this.init();
    const canonical = normalizeIndianMobile(mobileInput);
    if (!canonical) {
      return { success: false, isNewUser: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    const existing = this.findUserByMobile(canonical);

    if (existing) {
      existing.lastLogin = new Date().toISOString();
      existing.normalized_mobile = canonical;
      existing.phone = canonical;
      existing.mobile = canonical;
      existing.verified_mobile = true;
      if (fullNameInput && (!existing.name || existing.name.startsWith('User '))) {
        existing.name = fullNameInput.trim();
        existing.fullName = fullNameInput.trim();
      }
      existing.updatedAt = new Date().toISOString();
      this.persistUsers(existing);
      return { success: true, user: existing, isNewUser: false };
    }

    // Provision new canonical user
    const tenDigits = canonical.slice(-10);
    const last4 = tenDigits.slice(-4);
    const name = fullNameInput?.trim() || `User ${last4}`;
    const now = new Date().toISOString();

    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name,
      fullName: name,
      phone: canonical,
      mobile: canonical,
      normalized_mobile: canonical,
      email: undefined, // Email is NULL for mobile-only users. NEVER invent email!
      role: 'Buyer',
      status: 'Active',
      verified: true,
      verified_mobile: true,
      verified_email: false,
      registeredAt: now,
      lastLogin: now,
      updatedAt: now
    };

    this.usersCache.set(newUser.id, newUser);
    this.persistUsers(newUser);
    return { success: true, user: newUser, isNewUser: true };
  }

  /**
   * Change an existing user's mobile number:
   * 1. Normalize new mobile
   * 2. Check uniqueness across all other user records
   * 3. Update the SAME user record (no duplicate user created)
   * 4. Persist updated_at timestamp
   */
  public static changeUserMobile(
    userId: string,
    newMobileInput: string
  ): { success: boolean; user?: User; error?: string; errorCode?: string } {
    this.init();
    const user = this.findUserById(userId);
    if (!user) {
      return { success: false, error: 'User account not found.' };
    }

    const canonical = normalizeIndianMobile(newMobileInput);
    if (!canonical) {
      return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
    }

    // Check database uniqueness constraint
    if (this.isMobileRegisteredByAnother(canonical, userId)) {
      return {
        success: false,
        errorCode: 'MOBILE_ALREADY_REGISTERED',
        error: 'This mobile number is already registered. Please log in or use a different mobile number.'
      };
    }

    // Update the same user record
    user.phone = canonical;
    user.mobile = canonical;
    user.normalized_mobile = canonical;
    user.verified_mobile = true;
    user.updatedAt = new Date().toISOString();

    this.persistUsers(user);
    return { success: true, user };
  }

  /**
   * Create an authoritative session token for a user
   */
  public static createSession(userId: string): SessionRecord {
    this.init();
    const token = `orp_sess_${crypto.randomBytes(24).toString('hex')}`;
    const now = Date.now();
    const expiresAt = now + 30 * 24 * 60 * 60 * 1000; // 30 days session

    const session: SessionRecord = {
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt
    };

    this.sessionsCache.set(token, session);
    this.persistSessions();
    return session;
  }

  /**
   * Validate session token and retrieve user
   */
  public static getUserFromSession(token: string): User | null {
    if (!token || typeof token !== 'string') return null;
    this.init();

    const session = this.sessionsCache.get(token);
    if (!session) return null;

    if (Date.now() > session.expiresAt) {
      this.sessionsCache.delete(token);
      this.persistSessions();
      return null;
    }

    const user = this.findUserById(session.userId);
    return user || null;
  }

  /**
   * Destroy an existing session
   */
  public static destroySession(token: string): boolean {
    if (!token) return false;
    this.init();
    const existed = this.sessionsCache.delete(token);
    if (existed) {
      this.persistSessions();
    }
    return existed;
  }

  /**
   * Update user's verified location in database with high precision fields
   */
  public static updateUserLocation(
    userId: string,
    locationData: {
      city?: string;
      state?: string;
      location_name?: string;
      latitude?: number;
      longitude?: number;
      location_accuracy_meters?: number;
      formatted_address?: string;
      premise?: string;
      street?: string;
      area?: string;
      locality?: string;
      district?: string;
      postal_code?: string;
      country?: string;
      location_source?: 'DEVICE_GEOLOCATION' | 'MANUAL' | 'GPS' | 'PROFILE';
      location_confirmed_at?: string;
    }
  ): User | null {
    this.init();
    const user = this.findUserById(userId);
    if (!user) return null;

    const now = new Date().toISOString();
    const city = locationData.city !== undefined ? locationData.city : (user.city || '');
    const state = locationData.state !== undefined ? locationData.state : (user.state || '');
    const area = locationData.area !== undefined ? locationData.area : (user.area || locationData.locality || user.locality || '');
    const locality = locationData.locality !== undefined ? locationData.locality : (user.locality || area || '');
    
    let locationName = locationData.location_name;
    if (!locationName) {
      if (area && city) {
        locationName = `${area}, ${city}`;
      } else if (city) {
        locationName = `${city}${state ? ', ' + state : ''}`;
      } else {
        locationName = '';
      }
    }

    user.city = city;
    user.state = state;
    user.area = area;
    user.locality = locality;
    user.location = locationData.formatted_address || locationName || user.location;
    user.location_name = locationName;

    if (locationData.latitude !== undefined) user.latitude = locationData.latitude;
    if (locationData.longitude !== undefined) user.longitude = locationData.longitude;
    if (locationData.location_accuracy_meters !== undefined) user.location_accuracy_meters = locationData.location_accuracy_meters;
    if (locationData.formatted_address !== undefined) user.formatted_address = locationData.formatted_address;
    if (locationData.premise !== undefined) user.premise = locationData.premise;
    if (locationData.street !== undefined) user.street = locationData.street;
    if (locationData.district !== undefined) user.district = locationData.district;
    if (locationData.postal_code !== undefined) user.postal_code = locationData.postal_code;
    if (locationData.country !== undefined) user.country = locationData.country;

    user.location_source = locationData.location_source || 'MANUAL';
    user.location_confirmed_at = locationData.location_confirmed_at || now;
    user.location_updated_at = now;
    user.updatedAt = now;

    this.persistUsers(user);
    return user;
  }

  /**
   * Update user profile fields with database uniqueness checks and strict null email handling
   */
  public static updateUserProfile(
    userId: string,
    updates: Partial<User>
  ): { success: boolean; user?: User; error?: string; errorCode?: string } {
    this.init();
    const user = this.findUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    // Mobile uniqueness check if mobile is being changed
    const newPhone = updates.phone || updates.mobile;
    if (newPhone) {
      const canonical = normalizeIndianMobile(newPhone);
      if (!canonical) {
        return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }
      if (this.isMobileRegisteredByAnother(canonical, userId)) {
        return {
          success: false,
          errorCode: 'MOBILE_ALREADY_REGISTERED',
          error: 'This mobile number is already registered. Please log in or use a different mobile number.'
        };
      }
      user.phone = canonical;
      user.mobile = canonical;
      user.normalized_mobile = canonical;
      user.verified_mobile = true;
    }

    if (updates.name) {
      user.name = updates.name.trim();
      user.fullName = updates.name.trim();
    }
    if (updates.fullName) {
      user.fullName = updates.fullName.trim();
      if (!updates.name) user.name = updates.fullName.trim();
    }

    if (updates.email !== undefined) {
      const rawEmail = updates.email ? String(updates.email).trim().toLowerCase() : '';
      if (rawEmail) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail)) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        const existingEmailUser = this.findUserByEmail(rawEmail);
        if (existingEmailUser && existingEmailUser.id !== userId) {
          return { success: false, error: 'This email is already registered to another account.' };
        }
        user.email = rawEmail;
        user.verified_email = true;
      } else {
        delete user.email;
      }
    }

    if (updates.city !== undefined) user.city = updates.city;
    if (updates.state !== undefined) user.state = updates.state;
    if (updates.area !== undefined) user.area = updates.area;
    if (updates.locality !== undefined) user.locality = updates.locality;
    if (updates.postal_code !== undefined) user.postal_code = updates.postal_code;
    if (updates.pincode !== undefined) {
      user.pincode = updates.pincode;
      user.postal_code = updates.pincode;
    }
    if (updates.street !== undefined) user.street = updates.street;
    if (updates.district !== undefined) user.district = updates.district;
    if (updates.formatted_address !== undefined) user.formatted_address = updates.formatted_address;
    if (updates.location !== undefined) user.location = updates.location;
    if (updates.location_name !== undefined) user.location_name = updates.location_name;

    if (updates.role !== undefined && (updates.role === 'Buyer' || updates.role === 'Seller')) {
      if (user.role !== 'Admin' && user.role !== 'Super Admin' && user.role !== 'Moderator') {
        user.role = updates.role;
      }
    }

    if (updates.password !== undefined && String(updates.password).trim()) {
      user.password = String(updates.password).trim();
    }

    user.updatedAt = new Date().toISOString();
    this.persistUsers(user);
    return { success: true, user };
  }

  /**
   * Admin-level user update (status, role, verification, password, etc.)
   */
  public static adminUpdateUser(
    userId: string,
    updates: Partial<User>
  ): { success: boolean; user?: User; error?: string; errorCode?: string } {
    this.init();
    const user = this.findUserById(userId);
    if (!user) return { success: false, error: 'User not found' };

    if (updates.phone || updates.mobile) {
      const raw = updates.phone || updates.mobile;
      const canonical = normalizeIndianMobile(raw);
      if (canonical) {
        if (this.isMobileRegisteredByAnother(canonical, userId)) {
          return {
            success: false,
            errorCode: 'MOBILE_ALREADY_REGISTERED',
            error: 'This mobile number is already registered to another account.'
          };
        }
        user.phone = canonical;
        user.mobile = canonical;
        user.normalized_mobile = canonical;
      }
    }

    if (updates.name !== undefined) user.name = updates.name.trim();
    if (updates.fullName !== undefined) user.fullName = updates.fullName.trim();
    if (updates.role !== undefined) user.role = updates.role;
    if (updates.status !== undefined) user.status = updates.status;
    if (updates.verified !== undefined) user.verified = updates.verified;
    if (updates.verified_mobile !== undefined) user.verified_mobile = updates.verified_mobile;
    if (updates.verified_email !== undefined) user.verified_email = updates.verified_email;

    if (updates.email !== undefined) {
      const raw = updates.email ? String(updates.email).trim().toLowerCase() : '';
      if (raw) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(raw)) {
          return { success: false, error: 'Please enter a valid email address.' };
        }
        if (this.isEmailRegisteredByAnother(raw, userId)) {
          return {
            success: false,
            errorCode: 'EMAIL_ALREADY_REGISTERED',
            error: 'This email is already registered to another account.'
          };
        }
        user.email = raw;
      } else {
        delete user.email;
      }
    }

    if (updates.city !== undefined) user.city = updates.city;
    if (updates.state !== undefined) user.state = updates.state;
    if (updates.area !== undefined) user.area = updates.area;
    if (updates.locality !== undefined) user.locality = updates.locality;
    if (updates.postal_code !== undefined) user.postal_code = updates.postal_code;
    if (updates.pincode !== undefined) {
      user.pincode = updates.pincode;
      user.postal_code = updates.pincode;
    }
    if (updates.street !== undefined) user.street = updates.street;
    if (updates.district !== undefined) user.district = updates.district;
    if (updates.formatted_address !== undefined) user.formatted_address = updates.formatted_address;
    if (updates.location !== undefined) user.location = updates.location;
    if (updates.location_name !== undefined) user.location_name = updates.location_name;
    if (updates.password !== undefined && String(updates.password).trim()) {
      user.password = String(updates.password).trim();
    }

    if (updates.subscriptionPlanId !== undefined) user.subscriptionPlanId = updates.subscriptionPlanId;
    if (updates.activePlan !== undefined) user.activePlan = updates.activePlan;
    if (updates.subscriptionExpiry !== undefined) user.subscriptionExpiry = updates.subscriptionExpiry;
    if (updates.sellerPlan !== undefined) user.sellerPlan = updates.sellerPlan;
    if (updates.buyerPlan !== undefined) user.buyerPlan = updates.buyerPlan;

    user.updatedAt = new Date().toISOString();
    this.persistUsers(user);
    return { success: true, user };
  }

  /**
   * Register a new user enforcing strict mobile and email uniqueness
   */
  public static registerUser(data: {
    name: string;
    email?: string;
    phone?: string;
    password?: string;
    role?: any;
    city?: string;
    state?: string;
  }): { success: boolean; user?: User; error?: string; errorCode?: string } {
    this.init();
    const cleanName = (data.name || '').trim();
    if (!cleanName) {
      return { success: false, error: 'Full name is required.' };
    }

    const cleanEmail = data.email ? String(data.email).trim().toLowerCase() : '';
    if (cleanEmail) {
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
        return { success: false, error: 'Please enter a valid email address.' };
      }
      if (this.isEmailRegisteredByAnother(cleanEmail)) {
        return {
          success: false,
          errorCode: 'EMAIL_ALREADY_REGISTERED',
          error: 'This email address is already registered to another account.'
        };
      }
    }

    const rawPhone = data.phone || '';
    let canonicalPhone = '';
    if (rawPhone) {
      const normalized = normalizeIndianMobile(rawPhone);
      if (!normalized) {
        return { success: false, error: 'Please enter a valid 10-digit Indian mobile number.' };
      }
      canonicalPhone = normalized;
      if (this.isMobileRegisteredByAnother(canonicalPhone)) {
        return {
          success: false,
          errorCode: 'MOBILE_ALREADY_REGISTERED',
          error: 'This phone number is already registered to another account.'
        };
      }
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      fullName: cleanName,
      email: cleanEmail || undefined,
      phone: canonicalPhone || '',
      mobile: canonicalPhone || '',
      normalized_mobile: canonicalPhone || undefined,
      role: data.role || 'Buyer',
      status: 'Active',
      verified: true,
      verified_mobile: Boolean(canonicalPhone),
      verified_email: Boolean(cleanEmail),
      password: data.password || '123456',
      city: data.city,
      state: data.state,
      registeredAt: now,
      lastLogin: now,
      updatedAt: now
    };

    this.usersCache.set(newUser.id, newUser);
    this.persistUsers(newUser);
    return { success: true, user: newUser };
  }

  /**
   * Delete user from canonical database
   */
  public static deleteUser(userId: string): boolean {
    this.init();
    const existed = this.usersCache.delete(userId);
    if (existed) {
      this.writeUsersToDisk();
    }
    return existed;
  }

  /**
   * Update active plan snapshots on user record in database
   */
  public static updateUserPlanSnapshots(
    userId: string,
    buyerPlan?: any,
    sellerPlan?: any
  ): User | null {
    this.init();
    const user = this.findUserById(userId);
    if (!user) return null;

    if (buyerPlan !== undefined) {
      user.buyerPlan = buyerPlan;
      if (buyerPlan) {
        user.activePlan = buyerPlan.name;
        user.subscriptionPlanId = buyerPlan.planId;
        user.subscriptionExpiry = buyerPlan.expiresAt;
      }
    }

    if (sellerPlan !== undefined) {
      user.sellerPlan = sellerPlan;
      if (sellerPlan) {
        user.activePlan = sellerPlan.name;
        user.subscriptionPlanId = sellerPlan.planId;
        user.subscriptionExpiry = sellerPlan.expiresAt;
        if (user.role !== 'Super Admin' && user.role !== 'Admin') {
          user.role = 'Seller';
        }
      }
    }

    user.updatedAt = new Date().toISOString();
    this.persistUsers(user);
    return user;
  }
}
