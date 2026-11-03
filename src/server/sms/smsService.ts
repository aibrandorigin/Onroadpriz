import crypto from 'crypto';
import { SecretsManager } from '../config/secretsManager.js';

/**
 * Status states for OTP challenges
 */
export type OtpChallengeStatus = 'PENDING' | 'VERIFIED' | 'EXPIRED' | 'LOCKED';

/**
 * Interface representing an authoritative OTP challenge record
 */
export interface OtpChallenge {
  id: string; // Challenge ID e.g. "otp_a1b2c3d4..."
  mobile: string; // Normalized 10 digits
  otpHash: string; // SHA-256 hash of (OTP + mobile + salt)
  status: OtpChallengeStatus;
  expiresAt: number; // Unix timestamp in ms
  attemptCount: number;
  maxAttempts: number;
  createdAt: string;
  lastSentAt: number;
  verifiedAt?: string;
  hourlySendCount: number;
  hourWindowStart: number;
}

// In-memory challenge store indexed by challenge ID
const challengesById = new Map<string, OtpChallenge>();

// Index to track active challenge ID and rate limiting per mobile number
const activeChallengeByMobile = new Map<string, string>();
const rateLimitByMobile = new Map<string, { lastSentAt: number; hourlyCount: number; hourStart: number }>();

// Periodic cleanup of challenges older than 30 minutes
const cleanupTimer = setInterval(() => {
  const now = Date.now();
  for (const [id, challenge] of challengesById.entries()) {
    if (now > challenge.expiresAt + 15 * 60 * 1000) {
      challengesById.delete(id);
    }
  }
}, 5 * 60 * 1000);
if (cleanupTimer.unref) {
  cleanupTimer.unref();
}

/**
 * Validate and normalize Indian mobile number
 * Accepts formats: 9652663763, +91 9652663763, 09652663763, 919652663763
 * Returns normalized 10-digit number and provider format (91XXXXXXXXXX)
 */
export function normalizeIndianMobile(input: string): {
  isValid: boolean;
  normalized10?: string;
  formattedMobile?: string;
  error?: string;
} {
  if (!input || typeof input !== 'string') {
    return { isValid: false, error: 'Mobile number is required.' };
  }

  // Strip all non-digit characters
  const cleanDigits = input.replace(/\D/g, '');

  let tenDigit = '';
  if (cleanDigits.length === 10) {
    tenDigit = cleanDigits;
  } else if (cleanDigits.length === 11 && cleanDigits.startsWith('0')) {
    tenDigit = cleanDigits.substring(1);
  } else if (cleanDigits.length === 12 && cleanDigits.startsWith('91')) {
    tenDigit = cleanDigits.substring(2);
  } else {
    return {
      isValid: false,
      error: 'Please enter a valid 10-digit Indian mobile number.'
    };
  }

  // Validate Indian mobile starting digit (6, 7, 8, or 9)
  if (!/^[6-9]\d{9}$/.test(tenDigit)) {
    return {
      isValid: false,
      error: 'Invalid Indian mobile number. Must begin with 6, 7, 8, or 9.'
    };
  }

  return {
    isValid: true,
    normalized10: tenDigit,
    formattedMobile: `91${tenDigit}`
  };
}

/**
 * Mask mobile number for secure logging: e.g. ******3763
 */
export function maskMobile(tenDigit: string): string {
  if (!tenDigit || tenDigit.length < 4) return '******';
  return `******${tenDigit.slice(-4)}`;
}

/**
 * Hash an OTP using SHA-256 with mobile and internal salt
 */
function hashOtp(otp: string, mobile: string): string {
  return crypto
    .createHash('sha256')
    .update(`${otp.trim()}:${mobile.trim()}:onroadpriz_otp_salt_v2_authoritative`)
    .digest('hex');
}

/**
 * Generate a cryptographically secure 6-digit random OTP
 */
export function generateSecureOtp(): string {
  const otpNumber = crypto.randomInt(100000, 1000000);
  return otpNumber.toString();
}

/**
 * Result of send OTP request
 */
export interface SendOtpResult {
  success: boolean;
  challengeId?: string;
  message: string;
  cooldownSeconds: number;
  expiresIn: number; // in seconds
  error?: string;
  code?: string;
}

/**
 * Result of verify OTP request
 */
export interface VerifyOtpResult {
  success: boolean;
  verified: boolean;
  authenticated?: boolean;
  code: 'VERIFIED' | 'ALREADY_VERIFIED' | 'INVALID_OTP' | 'OTP_EXPIRED' | 'MAX_ATTEMPTS_EXCEEDED' | 'NOT_FOUND' | 'INVALID_FORMAT';
  message: string;
  remainingAttempts?: number;
  error?: string;
}

/**
 * Core Server-side SMS Service using Ultron SMS API
 * - Implements atomic challenges with idempotency to eliminate verification race conditions
 * - Strictly enforces DLT-approved templates and URLSearchParams encoding
 */
export class SmsService {
  private static readonly RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
  private static readonly OTP_EXPIRY_MS = 15 * 60 * 1000; // 15 minutes (900 seconds)
  private static readonly IDEMPOTENCY_WINDOW_MS = 2 * 60 * 1000; // 2 minutes post-verification
  private static readonly MAX_HOURLY_ATTEMPTS = 5;
  private static readonly MAX_VERIFY_ATTEMPTS = 5;

  /**
   * Send OTP via Ultron SMS DLT-approved template
   */
  public static async sendOtp(mobileInput: string): Promise<SendOtpResult> {
    const validation = normalizeIndianMobile(mobileInput);
    if (!validation.isValid || !validation.normalized10 || !validation.formattedMobile) {
      return {
        success: false,
        message: validation.error || 'Invalid mobile number',
        cooldownSeconds: 0,
        expiresIn: 0,
        error: validation.error,
        code: 'INVALID_MOBILE'
      };
    }

    const { normalized10, formattedMobile } = validation;
    const masked = maskMobile(normalized10);
    const now = Date.now();

    const isPlayReviewerNumber = normalized10 === '9999999999';

    // Check rate limit state (skip rate limit for dedicated Google Play Reviewer number)
    let rateState = rateLimitByMobile.get(normalized10);
    if (!rateState) {
      rateState = { lastSentAt: 0, hourlyCount: 0, hourStart: now };
      rateLimitByMobile.set(normalized10, rateState);
    }

    // 1. Check 60-second resend cooldown
    if (!isPlayReviewerNumber && now - rateState.lastSentAt < this.RESEND_COOLDOWN_MS) {
      const waitRemaining = Math.ceil((this.RESEND_COOLDOWN_MS - (now - rateState.lastSentAt)) / 1000);
      return {
        success: false,
        message: `Please wait ${waitRemaining} seconds before requesting a new OTP.`,
        cooldownSeconds: waitRemaining,
        expiresIn: Math.ceil(this.OTP_EXPIRY_MS / 1000),
        error: `Resend cooldown active. Please wait ${waitRemaining}s.`,
        code: 'RESEND_COOLDOWN'
      };
    }

    // 2. Check hourly rate limit
    if (!isPlayReviewerNumber && now - rateState.hourStart < 60 * 60 * 1000) {
      if (rateState.hourlyCount >= this.MAX_HOURLY_ATTEMPTS) {
        console.warn(`[SMS OTP] -> ${masked} -> RATE LIMITED (Hourly limit of ${this.MAX_HOURLY_ATTEMPTS} exceeded)`);
        return {
          success: false,
          message: 'Maximum 5 OTP requests allowed per hour. Please try again later.',
          cooldownSeconds: 60,
          expiresIn: 0,
          error: 'Hourly rate limit exceeded.',
          code: 'RATE_LIMIT_EXCEEDED'
        };
      }
      rateState.hourlyCount += 1;
    } else {
      rateState.hourStart = now;
      rateState.hourlyCount = 1;
    }
    rateState.lastSentAt = now;

    // 3. Invalidate previous pending challenge for this mobile if exists
    const previousChallengeId = activeChallengeByMobile.get(normalized10);
    if (previousChallengeId) {
      const prev = challengesById.get(previousChallengeId);
      if (prev && prev.status === 'PENDING') {
        prev.status = 'EXPIRED';
      }
    }

    // 4. Generate secure random 6-digit OTP & Challenge ID (fixed 123456 for Play Reviewer number)
    const rawOtp = isPlayReviewerNumber ? '123456' : generateSecureOtp();
    const challengeId = `otp_${crypto.randomBytes(12).toString('hex')}`;
    const otpHashed = hashOtp(rawOtp, normalized10);
    const expiresAt = now + this.OTP_EXPIRY_MS;

    // 5. Build exact DLT-approved SMS template
    // Template: "Trussets www.onroadpriz.com ,Your verification code is {OTP}. Valid for 15 minutes. Do not share this code with anyone"
    const message = `Trussets www.onroadpriz.com ,Your verification code is ${rawOtp}. Valid for 15 minutes. Do not share this code with anyone`;

    // 6. Read server environment variables via SecretsManager
    const baseUrl = (SecretsManager.get('SMS_BASE_URL') || 'https://ultronsms.com/api/mt/SendSMS').trim();
    const user = SecretsManager.get('SMS_USER').trim();
    const password = SecretsManager.get('SMS_PASSWORD').trim();
    const senderId = (SecretsManager.get('SMS_SENDER_ID') || 'TRSSET').trim();
    const channel = (SecretsManager.get('SMS_CHANNEL') || 'Trans').trim();
    const route = (SecretsManager.get('SMS_ROUTE') || '02').trim();
    const peid = (SecretsManager.get('SMS_PE_ID') || '1701177943584895129').trim();
    const dltTemplateId = (SecretsManager.get('SMS_DLT_TEMPLATE_ID') || '1707178132876719605').trim();

    const hasLiveCredentials = user.length > 0 && password.length > 0;

    if (hasLiveCredentials) {
      try {
        // Safe encoding via URLSearchParams: automatic URL encoding, no trailing spaces
        const params = new URLSearchParams({
          user,
          password,
          senderid: senderId,
          channel,
          DCS: '0',
          flashsms: '0',
          number: formattedMobile,
          text: message,
          route,
          peid,
          DLTTemplateId: dltTemplateId
        });

        const targetUrl = `${baseUrl}?${params.toString()}`;

        const response = await fetch(targetUrl, {
          method: 'GET',
          headers: { 'Accept': '*/*' }
        });

        const responseText = await response.text();
        let isProviderSuccess = response.ok;

        try {
          const parsed = JSON.parse(responseText);
          if (parsed.ErrorCode === '000' || parsed.ErrorMessage?.toLowerCase() === 'done' || parsed.JobId) {
            isProviderSuccess = true;
          } else if (parsed.ErrorCode && parsed.ErrorCode !== '000') {
            isProviderSuccess = false;
          }
        } catch {
          if (responseText.toLowerCase().includes('fail') || responseText.toLowerCase().includes('invalid')) {
            isProviderSuccess = false;
          }
        }

        if (isProviderSuccess) {
          console.log(`[SMS OTP] -> ${masked} -> SENT (Provider Status: ${response.status}, Challenge: ${challengeId})`);
        } else {
          console.warn(`[SMS OTP] -> ${masked} -> PROVIDER ISSUE (Status: ${response.status}, Details: ${responseText.slice(0, 100)})`);
        }
      } catch (networkErr: any) {
        console.error(`[SMS OTP] -> ${masked} -> NETWORK FAILURE:`, networkErr?.message || networkErr);
      }
    } else {
      console.warn(`[SMS OTP] -> ${masked} -> SMS credentials not configured in environment variables.`);
      console.log(`[SMS OTP AUTH] Testing verification code for ${normalized10}: ${rawOtp} (Challenge: ${challengeId})`);
    }

    // 7. Store new challenge atomically
    const newChallenge: OtpChallenge = {
      id: challengeId,
      mobile: normalized10,
      otpHash: otpHashed,
      status: 'PENDING',
      expiresAt,
      attemptCount: 0,
      maxAttempts: this.MAX_VERIFY_ATTEMPTS,
      createdAt: new Date().toISOString(),
      lastSentAt: now,
      hourlySendCount: rateState.hourlyCount,
      hourWindowStart: rateState.hourStart
    };

    challengesById.set(challengeId, newChallenge);
    activeChallengeByMobile.set(normalized10, challengeId);

    return {
      success: true,
      challengeId,
      message: `Verification code sent to +91 ${normalized10}. Valid for 15 minutes.`,
      cooldownSeconds: 60,
      expiresIn: 900
    };
  }

  /**
   * Verify an OTP submitted by the user
   * Handles idempotency: concurrent or repeated requests for an already verified challenge return success
   */
  public static verifyOtp(
    mobileInput: string,
    submittedOtp: string,
    challengeIdInput?: string
  ): VerifyOtpResult {
    const validation = normalizeIndianMobile(mobileInput);
    if (!validation.isValid || !validation.normalized10) {
      return {
        success: false,
        verified: false,
        code: 'INVALID_FORMAT',
        message: validation.error || 'Invalid mobile number',
        error: validation.error
      };
    }

    const { normalized10 } = validation;
    const masked = maskMobile(normalized10);
    const cleanOtp = (submittedOtp || '').trim();

    if (!/^\d{6}$/.test(cleanOtp)) {
      return {
        success: false,
        verified: false,
        code: 'INVALID_FORMAT',
        message: 'Please enter a valid 6-digit verification code.',
        error: 'Invalid OTP format. Must be 6 digits.'
      };
    }

    // Dedicated Google Play Console Reviewer test account (9999999999 / OTP: 123456)
    if (normalized10 === '9999999999' && cleanOtp === '123456') {
      console.log(`[SMS OTP] -> ${masked} -> GOOGLE PLAY REVIEWER VERIFIED`);
      return {
        success: true,
        verified: true,
        authenticated: true,
        code: 'VERIFIED',
        message: 'Mobile number verified successfully.'
      };
    }

    const now = Date.now();

    // 1. Locate challenge: first by challengeIdInput, or fallback to active challenge for mobile
    let challenge: OtpChallenge | undefined = undefined;
    if (challengeIdInput && typeof challengeIdInput === 'string' && challengeIdInput.startsWith('otp_')) {
      challenge = challengesById.get(challengeIdInput);
    }
    if (!challenge) {
      const activeId = activeChallengeByMobile.get(normalized10);
      if (activeId) {
        challenge = challengesById.get(activeId);
      }
    }

    if (!challenge || challenge.mobile !== normalized10) {
      return {
        success: false,
        verified: false,
        code: 'NOT_FOUND',
        message: 'No active verification code found for this mobile number. Please request a new code.',
        error: 'Challenge not found.'
      };
    }

    // 2. IDEMPOTENCY CHECK: If already verified within the last 2 minutes for this challenge
    if (challenge.status === 'VERIFIED') {
      const timeSinceVerified = challenge.verifiedAt ? now - new Date(challenge.verifiedAt).getTime() : 0;
      if (timeSinceVerified < this.IDEMPOTENCY_WINDOW_MS) {
        // Confirm hash matches the verified challenge
        const submittedHash = hashOtp(cleanOtp, normalized10);
        if (submittedHash === challenge.otpHash) {
          console.log(`[SMS OTP] -> ${masked} -> IDEMPOTENT VERIFY SUCCESS (Challenge ${challenge.id} already verified)`);
          return {
            success: true,
            verified: true,
            authenticated: true,
            code: 'ALREADY_VERIFIED',
            message: 'Verification successful.'
          };
        }
      }
    }

    // 3. Check account lockout
    if (challenge.status === 'LOCKED' || challenge.attemptCount >= challenge.maxAttempts) {
      challenge.status = 'LOCKED';
      console.warn(`[SMS OTP] -> ${masked} -> LOCKED (Maximum ${challenge.maxAttempts} attempts exceeded)`);
      return {
        success: false,
        verified: false,
        code: 'MAX_ATTEMPTS_EXCEEDED',
        message: 'Maximum verification attempts exceeded. Please request a new code.',
        error: 'Account locked due to too many failed attempts.'
      };
    }

    // 4. Check expiry
    if (now > challenge.expiresAt || challenge.status === 'EXPIRED') {
      challenge.status = 'EXPIRED';
      console.log(`[SMS OTP] -> ${masked} -> EXPIRED (Challenge ${challenge.id})`);
      return {
        success: false,
        verified: false,
        code: 'OTP_EXPIRED',
        message: 'Verification code has expired. Please request a new code.',
        error: 'OTP expired.'
      };
    }

    // 5. Compare OTP hashes in constant time to prevent timing attacks
    const submittedHash = hashOtp(cleanOtp, normalized10);
    const isMatch = crypto.timingSafeEqual(
      Buffer.from(submittedHash, 'hex'),
      Buffer.from(challenge.otpHash, 'hex')
    );

    if (!isMatch) {
      challenge.attemptCount += 1;
      const remaining = challenge.maxAttempts - challenge.attemptCount;
      console.warn(`[SMS OTP] -> ${masked} -> INCORRECT OTP (${remaining} attempts remaining)`);

      if (remaining <= 0) {
        challenge.status = 'LOCKED';
        return {
          success: false,
          verified: false,
          code: 'MAX_ATTEMPTS_EXCEEDED',
          remainingAttempts: 0,
          message: 'Incorrect code. Maximum verification attempts reached. Please request a new code.',
          error: 'Maximum attempts reached.'
        };
      }

      return {
        success: false,
        verified: false,
        code: 'INVALID_OTP',
        remainingAttempts: remaining,
        message: `Invalid verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        error: 'Invalid verification code.'
      };
    }

    // 6. Successful verification: transition status to VERIFIED atomically
    challenge.status = 'VERIFIED';
    challenge.verifiedAt = new Date().toISOString();
    // Do NOT erase otpHash immediately so idempotent repeat requests in the next 2 minutes succeed!

    console.log(`[SMS OTP] -> ${masked} -> VERIFIED SUCCESSFULLY (Challenge: ${challenge.id})`);

    return {
      success: true,
      verified: true,
      authenticated: true,
      code: 'VERIFIED',
      message: 'Mobile number verified successfully.'
    };
  }

  /**
   * Check if a mobile number was verified recently (within 30 minutes)
   */
  public static isMobileVerified(mobileInput: string): boolean {
    const validation = normalizeIndianMobile(mobileInput);
    if (!validation.isValid || !validation.normalized10) return false;
    const activeId = activeChallengeByMobile.get(validation.normalized10);
    if (!activeId) return false;
    const challenge = challengesById.get(activeId);
    if (!challenge || challenge.status !== 'VERIFIED' || !challenge.verifiedAt) return false;
    const verifiedTime = new Date(challenge.verifiedAt).getTime();
    return Date.now() - verifiedTime < 30 * 60 * 1000;
  }

  /**
   * Validate full SMS gateway configuration fields
   */
  public static validateConfiguration(): {
    isValid: boolean;
    errors: string[];
    missingFields: string[];
    fieldStatus: Record<string, boolean>;
  } {
    const errors: string[] = [];
    const missingFields: string[] = [];

    const baseUrl = SecretsManager.get('SMS_BASE_URL').trim();
    const peid = SecretsManager.get('SMS_PE_ID').trim();
    const user = SecretsManager.get('SMS_USER').trim();
    const password = SecretsManager.get('SMS_PASSWORD').trim();
    const dltTemplateId = SecretsManager.get('SMS_DLT_TEMPLATE_ID').trim();
    const channel = SecretsManager.get('SMS_CHANNEL').trim();
    const senderId = SecretsManager.get('SMS_SENDER_ID').trim();
    const route = SecretsManager.get('SMS_ROUTE').trim();

    const fieldStatus: Record<string, boolean> = {
      SMS_BASE_URL: Boolean(baseUrl),
      SMS_PE_ID: Boolean(peid),
      SMS_USER: Boolean(user),
      SMS_PASSWORD: Boolean(password),
      SMS_DLT_TEMPLATE_ID: Boolean(dltTemplateId),
      SMS_CHANNEL: Boolean(channel),
      SMS_SENDER_ID: Boolean(senderId),
      SMS_ROUTE: Boolean(route),
    };

    for (const [key, configured] of Object.entries(fieldStatus)) {
      if (!configured) {
        missingFields.push(key);
      }
    }

    if (!baseUrl) {
      errors.push('SMS_BASE_URL is missing.');
    } else {
      try {
        const u = new URL(baseUrl);
        if (u.protocol !== 'http:' && u.protocol !== 'https:') {
          errors.push('SMS_BASE_URL must use HTTP or HTTPS protocol.');
        }
      } catch {
        errors.push('SMS_BASE_URL is not a valid URL.');
      }
    }

    if (!user) errors.push('SMS_USER (username) is missing.');
    if (!password) errors.push('SMS_PASSWORD (password) is missing.');
    if (!peid) errors.push('SMS_PE_ID (Principal Entity ID) is missing.');
    if (!dltTemplateId) errors.push('SMS_DLT_TEMPLATE_ID is missing.');
    if (!senderId) errors.push('SMS_SENDER_ID is missing.');

    return {
      isValid: errors.length === 0,
      errors,
      missingFields,
      fieldStatus,
    };
  }

  /**
   * Safe administrator-only SMS test function
   * - By default (sendRealSms: false): Runs a safe dry-run validation and endpoint ping without sending any real SMS.
   * - If authorized (sendRealSms: true): Requires destination phone number, sends 1 test SMS using DLT template.
   */
  public static async testSmsConnection(options: {
    sendRealSms?: boolean;
    testMobile?: string;
    adminEmail?: string;
  }): Promise<{
    success: boolean;
    mode: 'dry-run' | 'live-dispatch';
    latencyMs: number;
    message: string;
    details?: any;
    error?: string;
  }> {
    const startTime = Date.now();
    const validation = this.validateConfiguration();

    if (!options.sendRealSms) {
      // SAFE DRY RUN: Verify configuration & reachability without dispatching SMS
      const baseUrl = SecretsManager.get('SMS_BASE_URL').trim();
      let endpointReachable = false;
      let reachabilityStatus = 0;

      try {
        const pingUrl = new URL(baseUrl);
        // Ping provider origin/path with HEAD or GET timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 6000);

        const pingRes = await fetch(pingUrl.toString(), {
          method: 'GET',
          headers: { 'User-Agent': 'OnRoadPriz-HealthCheck/1.0' },
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        reachabilityStatus = pingRes.status;
        endpointReachable = pingRes.status < 500;
      } catch (pingErr: any) {
        reachabilityStatus = 0;
        // Network or DNS error
      }

      const latencyMs = Date.now() - startTime;

      if (!validation.isValid) {
        return {
          success: false,
          mode: 'dry-run',
          latencyMs,
          message: `Configuration incomplete: ${validation.errors.join(' ')}`,
          details: {
            fieldStatus: validation.fieldStatus,
            missingFields: validation.missingFields,
            endpointReachable,
            reachabilityStatus,
          },
          error: validation.errors[0],
        };
      }

      return {
        success: true,
        mode: 'dry-run',
        latencyMs,
        message: 'SMS gateway parameters and endpoint reachability successfully validated. No SMS was dispatched.',
        details: {
          fieldStatus: validation.fieldStatus,
          endpointReachable,
          reachabilityStatus,
          senderId: SecretsManager.get('SMS_SENDER_ID'),
          channel: SecretsManager.get('SMS_CHANNEL'),
          route: SecretsManager.get('SMS_ROUTE'),
        },
      };
    }

    // AUTHORIZED LIVE TEST SMS DISPATCH
    if (!options.testMobile) {
      return {
        success: false,
        mode: 'live-dispatch',
        latencyMs: Date.now() - startTime,
        message: 'Destination mobile number required for live SMS test.',
        error: 'Missing testMobile parameter.',
      };
    }

    const mobileNorm = normalizeIndianMobile(options.testMobile);
    if (!mobileNorm.isValid || !mobileNorm.formattedMobile) {
      return {
        success: false,
        mode: 'live-dispatch',
        latencyMs: Date.now() - startTime,
        message: 'Invalid 10-digit Indian mobile number format.',
        error: 'Invalid phone format.',
      };
    }

    const baseUrl = SecretsManager.get('SMS_BASE_URL').trim();
    const user = SecretsManager.get('SMS_USER').trim();
    const password = SecretsManager.get('SMS_PASSWORD').trim();
    const senderId = (SecretsManager.get('SMS_SENDER_ID') || 'TRSSET').trim();
    const channel = (SecretsManager.get('SMS_CHANNEL') || 'Trans').trim();
    const route = (SecretsManager.get('SMS_ROUTE') || '02').trim();
    const peid = (SecretsManager.get('SMS_PE_ID') || '1701177943584895129').trim();
    const dltTemplateId = (SecretsManager.get('SMS_DLT_TEMPLATE_ID') || '1707178132876719605').trim();

    if (!user || !password) {
      return {
        success: false,
        mode: 'live-dispatch',
        latencyMs: Date.now() - startTime,
        message: 'SMS credentials (SMS_USER or SMS_PASSWORD) are not configured.',
        error: 'Credentials missing.',
      };
    }

    const testOtp = generateSecureOtp();
    const testMessage = `Trussets www.onroadpriz.com ,Your verification code is ${testOtp}. Valid for 15 minutes. Do not share this code with anyone`;

    try {
      const params = new URLSearchParams({
        user,
        password,
        senderid: senderId,
        channel,
        DCS: '0',
        flashsms: '0',
        number: mobileNorm.formattedMobile,
        text: testMessage,
        route,
        peid,
        DLTTemplateId: dltTemplateId,
      });

      const targetUrl = `${baseUrl}?${params.toString()}`;

      const response = await fetch(targetUrl, {
        method: 'GET',
        headers: { 'Accept': '*/*' },
      });

      const responseText = await response.text();
      const latencyMs = Date.now() - startTime;
      let isSuccess = response.ok;

      try {
        const parsed = JSON.parse(responseText);
        if (parsed.ErrorCode === '000' || parsed.ErrorMessage?.toLowerCase() === 'done' || parsed.JobId) {
          isSuccess = true;
        } else if (parsed.ErrorCode && parsed.ErrorCode !== '000') {
          isSuccess = false;
        }
      } catch {
        if (responseText.toLowerCase().includes('fail') || responseText.toLowerCase().includes('invalid')) {
          isSuccess = false;
        }
      }

      console.log(`[SMS Test] Admin ${options.adminEmail || 'Admin'} triggered test SMS to ${mobileNorm.formattedMobile.slice(0, 4)}XXXXXX. Success: ${isSuccess}`);

      return {
        success: isSuccess,
        mode: 'live-dispatch',
        latencyMs,
        message: isSuccess
          ? `Test SMS dispatched successfully via ${senderId}. Provider Status: ${response.status}`
          : `Provider rejected dispatch with status ${response.status}: ${responseText.slice(0, 100)}`,
        details: {
          httpStatus: response.status,
          senderId,
          recipient: `${mobileNorm.formattedMobile.slice(0, 4)}XXXXXX`,
        },
      };
    } catch (err: any) {
      return {
        success: false,
        mode: 'live-dispatch',
        latencyMs: Date.now() - startTime,
        message: `Network failure connecting to SMS gateway: ${err.message}`,
        error: err.message,
      };
    }
  }
}

