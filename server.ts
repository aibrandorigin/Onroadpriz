import express, { Request, Response } from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import dotenv from 'dotenv';
import { validateRegistrationNumber } from './src/server/vehicleLookup/validator';
import { vehicleLookupProvider } from './src/server/vehicleLookup/provider';
import { lookupLimiterAndCache } from './src/server/vehicleLookup/rateLimiter';
import { SmsService } from './src/server/sms/smsService';
import { AuthService, normalizeIndianMobile } from './src/server/auth/authService';
import { WishlistService } from './src/server/wishlist/wishlistService';
import { PlanService } from './src/server/plans/planService';
import { getUsers, getOrCreateUser } from './src/db/users.ts';
import { DbService } from './src/server/dbService.ts';
import { SecretsManager, REQUIRED_SECRET_KEYS } from './src/server/config/secretsManager';
import { GeminiService } from './src/server/ai/geminiService';
import { INITIAL_CONTACT_SUBMISSIONS } from './src/data/initialData';
import { resolveCanonicalCity } from './src/data/locationData';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = parseInt(process.env.PORT || '3000', 10);

// Hostname canonicalization & production CORS middleware
app.use((req: Request, res: Response, next) => {
  const host = req.headers.host || '';
  // Canonical redirect from www.onroadpriz.com to https://onroadpriz.com
  if (host.startsWith('www.onroadpriz.com')) {
    return res.redirect(301, `https://onroadpriz.com${req.url}`);
  }

  // Configure legitimate CORS headers for production and local environments
  const origin = req.headers.origin;
  const allowedOrigins = [
    'https://onroadpriz.com',
    'https://www.onroadpriz.com',
    process.env.APP_URL
  ].filter(Boolean);

  if (origin && (allowedOrigins.includes(origin) || origin.includes('localhost') || origin.includes('run.app'))) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }
  next();
});

/**
 * GET /api/health
 * Public health check endpoint for uptime monitors, proxies, and load balancers
 */
app.get('/api/health', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  res.json({
    status: 'ok',
    service: 'OnRoadPriz Marketplace API',
    timestamp: new Date().toISOString()
  });
});

// Increase request size limit for image uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Ensure upload, branding, and data directories exist
const uploadsDir = path.resolve(__dirname, 'public', 'uploads', 'branding');
const brandingDir = path.resolve(__dirname, 'public', 'branding');
const dataDir = path.resolve(__dirname, 'data');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(brandingDir)) {
  fs.mkdirSync(brandingDir, { recursive: true });
}
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Serve permanent uploaded branding assets with explicit cache headers
app.use('/uploads', express.static(path.resolve(__dirname, 'public', 'uploads'), {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Serve canonical master branding assets
app.use('/branding', express.static(brandingDir, {
  maxAge: '1d',
  setHeaders: (res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
  }
}));

// Path to authoritative global site settings database
const SETTINGS_FILE_PATH = path.resolve(dataDir, 'site-settings.json');
const CONTACT_SUBMISSIONS_FILE_PATH = path.resolve(dataDir, 'contact-submissions.json');

// Default global site settings if file not present
const DEFAULT_GLOBAL_SETTINGS = {
  id: 'site_settings_global',
  siteName: 'OnRoadPriz',
  tagline: 'Buy & Sell Used Vehicles Directly From Owners',
  primaryColor: '#77101F',
  currencySymbol: '₹',
  currencyCode: 'INR',
  supportPhone: '+91 891 278 4590',
  supportEmail: 'support@onroadpriz.com',
  headquartersTitle: 'Operational Center',
  headquartersAddress: 'OnRoadPriz Towers, VIP Road, Siripuram, Visakhapatnam, AP 530003',
  supportHours: 'Monday – Saturday, 9:00 AM – 8:00 PM IST',
  gstRatePercent: 18,
  maintenanceMode: false,
  autoApproveVerifiedSellers: false,
  metaTitle: 'OnRoadPriz - Direct Owner-to-Buyer Used Vehicles Marketplace in India',
  metaDescription: 'Buy and sell second hand cars, bikes, commercial trucks, buses, tractors and heavy equipment directly with verified owners. No dealer commission.',
  websiteLogo: '/branding/onroadpriz-logo.png',
  mobileLogo: '',
  adminLogo: '',
  favicon: '/favicon.svg',
  logoVersion: 1,
  mobileLogoVersion: 1,
  adminLogoVersion: 1,
  faviconVersion: 1,
  brandingUpdatedAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  updatedBy: 'system',
  logoUrl: '/branding/onroadpriz-logo.png',
  faviconUrl: '/favicon.svg',
  logo_url: '/branding/onroadpriz-logo.png',
  favicon_url: '/favicon.svg',
  logo_version: 1,
  favicon_version: 1
};

// Helper: Read authoritative site settings
function readSiteSettings(): any {
  try {
    if (fs.existsSync(SETTINGS_FILE_PATH)) {
      const content = fs.readFileSync(SETTINGS_FILE_PATH, 'utf-8');
      return { ...DEFAULT_GLOBAL_SETTINGS, ...JSON.parse(content) };
    }
  } catch (err) {
    console.error('[SiteSettings] Error reading settings file:', err);
  }
  return { ...DEFAULT_GLOBAL_SETTINGS };
}

// Helper: Write authoritative site settings atomically
function writeSiteSettings(newSettings: any): boolean {
  try {
    const tempPath = `${SETTINGS_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(newSettings, null, 2), 'utf-8');
    fs.renameSync(tempPath, SETTINGS_FILE_PATH);
    DbService.saveSiteSettings(newSettings).catch(() => {});
    broadcastDataChange('settings', 'UPDATE', newSettings);
    return true;
  } catch (err) {
    console.error('[SiteSettings] Error writing settings file:', err);
    return false;
  }
}

// Helper: Read & Write Contact Submissions (Help Center Inquiries)
function readContactSubmissions(): any[] {
  try {
    if (fs.existsSync(CONTACT_SUBMISSIONS_FILE_PATH)) {
      const content = fs.readFileSync(CONTACT_SUBMISSIONS_FILE_PATH, 'utf-8');
      const parsed = JSON.parse(content);
      if (Array.isArray(parsed)) return parsed;
    } else {
      fs.writeFileSync(CONTACT_SUBMISSIONS_FILE_PATH, JSON.stringify(INITIAL_CONTACT_SUBMISSIONS, null, 2), 'utf-8');
    }
  } catch (err) {
    console.error('[ContactSubmissions] Error reading file:', err);
  }
  return [...INITIAL_CONTACT_SUBMISSIONS];
}

function writeContactSubmissions(submissions: any[]): boolean {
  try {
    const tempPath = `${CONTACT_SUBMISSIONS_FILE_PATH}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(submissions, null, 2), 'utf-8');
    fs.renameSync(tempPath, CONTACT_SUBMISSIONS_FILE_PATH);
    DbService.saveContactSubmissions(submissions).catch(() => {});
    return true;
  } catch (err) {
    console.error('[ContactSubmissions] Error writing file:', err);
    return false;
  }
}

// Helper: Convert base64 dataUrl into permanent unique disk asset (Reject blob/data URLs in DB)
function saveDataUrlToFile(dataUrl: string, prefix: string = 'logo'): string | null {
  if (!dataUrl || typeof dataUrl !== 'string') return null;
  const matches = dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
  if (!matches || matches.length !== 3) return null;

  const mimeType = matches[1].toLowerCase();
  const base64Data = matches[2];

  let extension = 'png';
  if (mimeType.includes('jpeg') || mimeType.includes('jpg')) extension = 'jpg';
  else if (mimeType.includes('png')) extension = 'png';
  else if (mimeType.includes('webp')) extension = 'webp';
  else if (mimeType.includes('svg')) extension = 'svg';
  else if (mimeType.includes('icon') || mimeType.includes('ico')) extension = 'ico';

  const cleanPrefix = prefix.replace(/[^a-z0-9_-]/gi, '') || 'logo';
  const uniqueSuffix = `${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
  const newFilename = `${cleanPrefix}-${uniqueSuffix}.${extension}`;
  const destinationPath = path.join(uploadsDir, newFilename);

  try {
    const buffer = Buffer.from(base64Data, 'base64');
    fs.writeFileSync(destinationPath, buffer);

    // Mirror to dist if dist exists
    const distUploadsDir = path.resolve(__dirname, 'dist', 'uploads', 'branding');
    if (fs.existsSync(distUploadsDir)) {
      try {
        fs.writeFileSync(path.join(distUploadsDir, newFilename), buffer);
      } catch (_) {}
    }

    const permanentUrl = `/uploads/branding/${newFilename}`;
    DbService.saveBrandingAsset(permanentUrl, dataUrl).catch(() => {});
    console.log(`[Branding] Saved asset permanently: ${permanentUrl} (${buffer.length} bytes)`);
    return permanentUrl;
  } catch (err) {
    console.error('[Branding] Failed to save asset to disk:', err);
    return null;
  }
}

// -------------------------------------------------------------
// GLOBAL SITE SETTINGS & BRANDING ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/public/site-settings
 * Authoritative global site configuration endpoint consumed by all browsers & devices
 */
app.get('/api/public/site-settings', (_req: Request, res: Response) => {
  // Prevent any intermediary or browser from caching mutable site settings
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');

  const raw = readSiteSettings();
  const logoUrl = raw.logoUrl || raw.websiteLogo || '';
  const faviconUrl = raw.faviconUrl || raw.favicon || '';
  const mobileLogoUrl = raw.mobileLogoUrl || raw.mobileLogo || '';
  const adminLogoUrl = raw.adminLogoUrl || raw.adminLogo || '';
  const logoVersion = raw.logoVersion || raw.logo_version || 1;
  const mobileLogoVersion = raw.mobileLogoVersion || 1;
  const adminLogoVersion = raw.adminLogoVersion || 1;
  const faviconVersion = raw.faviconVersion || raw.favicon_version || 1;
  const updatedAt = raw.updatedAt || raw.updated_at || new Date().toISOString();
  const updatedBy = raw.updatedBy || raw.updated_by || 'system';

  const consolidatedSettings = {
    ...raw,
    logoUrl,
    faviconUrl,
    mobileLogoUrl,
    adminLogoUrl,
    websiteLogo: logoUrl,
    favicon: faviconUrl,
    mobileLogo: mobileLogoUrl,
    adminLogo: adminLogoUrl,
    logoVersion,
    faviconVersion,
    mobileLogoVersion,
    adminLogoVersion,
    logo_url: logoUrl,
    favicon_url: faviconUrl,
    logo_version: logoVersion,
    favicon_version: faviconVersion,
    updatedAt,
    updated_at: updatedAt,
    updatedBy,
    updated_by: updatedBy,
  };

  res.json({
    success: true,
    siteName: raw.siteName || 'OnRoadPriz',
    branding: {
      logoUrl: logoUrl || '/branding/onroadpriz-logo.png',
      logoVersion,
      faviconUrl: faviconUrl || '/favicon.svg',
      faviconVersion,
      mobileLogoUrl,
      adminLogoUrl,
      mobileLogoVersion,
      adminLogoVersion
    },
    logoUrl: logoUrl || '/branding/onroadpriz-logo.png',
    faviconUrl: faviconUrl || '/favicon.svg',
    logoVersion,
    faviconVersion,
    updatedAt,
    updatedBy,
    // snake_case aliases per specification
    logo_url: logoUrl || '/branding/onroadpriz-logo.png',
    favicon_url: faviconUrl || '/favicon.svg',
    logo_version: logoVersion,
    favicon_version: faviconVersion,
    updated_at: updatedAt,
    updated_by: updatedBy,
    mobileLogoUrl,
    adminLogoUrl,
    mobileLogoVersion,
    adminLogoVersion,
    brandingUpdatedAt: raw.brandingUpdatedAt || updatedAt,
    settings: consolidatedSettings
  });
});

/**
 * POST /api/admin/branding/upload
 * Permanent server storage for branding assets (Logo, Mobile Logo, Admin Logo, Favicon)
 * Generates unique timestamped files, prevents blob/data URL persistence, busts caches.
 */
app.post('/api/admin/branding/upload', async (req: Request, res: Response) => {
  try {
    const { dataUrl, filename: originalFilename, type = 'logo' } = req.body || {};

    if (!dataUrl || typeof dataUrl !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Invalid file payload. Data URL is required.'
      });
    }

    const permanentUrl = saveDataUrlToFile(dataUrl, type);
    if (!permanentUrl) {
      return res.status(400).json({
        success: false,
        error: 'Failed to decode and save image to permanent storage. Ensure valid image format.'
      });
    }

    const filename = path.basename(permanentUrl);
    const destinationPath = path.join(uploadsDir, filename);
    const stat = fs.existsSync(destinationPath) ? fs.statSync(destinationPath) : null;

    console.log(`[Branding] Upload endpoint successfully generated permanent asset: ${permanentUrl}`);

    return res.json({
      success: true,
      url: permanentUrl,
      logoUrl: permanentUrl,
      filename,
      size: stat ? stat.size : 0,
      uploadedAt: new Date().toISOString()
    });
  } catch (err: any) {
    console.error('[Branding] Upload error:', err);
    return res.status(500).json({
      success: false,
      error: `Server failed to store branding asset: ${err.message || 'Unknown error'}`
    });
  }
});

/**
 * POST /api/admin/site-settings
 * Authoritative global site settings update endpoint
 * Detects logo/favicon changes and automatically increments versions for global cache busting
 */
app.post('/api/admin/site-settings', (req: Request, res: Response) => {
  try {
    const { settings: updates, updatedBy = 'Super Admin' } = req.body || {};

    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({
        success: false,
        error: 'Invalid settings payload.'
      });
    }

    const current = readSiteSettings();
    const sanitizedUpdates = { ...updates };

    // Disallow and convert any data: URLs into permanent server-side files
    if (typeof sanitizedUpdates.websiteLogo === 'string' && sanitizedUpdates.websiteLogo.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.websiteLogo, 'logo');
      if (permanent) sanitizedUpdates.websiteLogo = permanent;
    }
    if (typeof sanitizedUpdates.logoUrl === 'string' && sanitizedUpdates.logoUrl.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.logoUrl, 'logo');
      if (permanent) sanitizedUpdates.logoUrl = permanent;
    }
    if (typeof sanitizedUpdates.mobileLogo === 'string' && sanitizedUpdates.mobileLogo.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.mobileLogo, 'mobile-logo');
      if (permanent) sanitizedUpdates.mobileLogo = permanent;
    }
    if (typeof sanitizedUpdates.adminLogo === 'string' && sanitizedUpdates.adminLogo.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.adminLogo, 'admin-logo');
      if (permanent) sanitizedUpdates.adminLogo = permanent;
    }
    if (typeof sanitizedUpdates.favicon === 'string' && sanitizedUpdates.favicon.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.favicon, 'favicon');
      if (permanent) sanitizedUpdates.favicon = permanent;
    }
    if (typeof sanitizedUpdates.faviconUrl === 'string' && sanitizedUpdates.faviconUrl.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.faviconUrl, 'favicon');
      if (permanent) sanitizedUpdates.faviconUrl = permanent;
    }

    // Never save temporary blob URLs
    ['websiteLogo', 'logoUrl', 'mobileLogo', 'adminLogo', 'favicon', 'faviconUrl'].forEach(key => {
      if (typeof sanitizedUpdates[key] === 'string' && sanitizedUpdates[key].startsWith('blob:')) {
        delete sanitizedUpdates[key];
      }
    });

    // Check what changed for version increments
    let logoVersion = current.logoVersion || current.logo_version || 1;
    let mobileLogoVersion = current.mobileLogoVersion || 1;
    let adminLogoVersion = current.adminLogoVersion || 1;
    let faviconVersion = current.faviconVersion || current.favicon_version || 1;
    let brandingChanged = false;

    const newLogo = sanitizedUpdates.websiteLogo ?? sanitizedUpdates.logoUrl;
    const oldLogo = current.websiteLogo ?? current.logoUrl;
    if (newLogo !== undefined && newLogo !== oldLogo) {
      logoVersion += 1;
      brandingChanged = true;
    }

    if (sanitizedUpdates.mobileLogo !== undefined && sanitizedUpdates.mobileLogo !== current.mobileLogo) {
      mobileLogoVersion += 1;
      brandingChanged = true;
    }
    if (sanitizedUpdates.adminLogo !== undefined && sanitizedUpdates.adminLogo !== current.adminLogo) {
      adminLogoVersion += 1;
      brandingChanged = true;
    }

    const newFavicon = sanitizedUpdates.favicon ?? sanitizedUpdates.faviconUrl;
    const oldFavicon = current.favicon ?? current.faviconUrl;
    if (newFavicon !== undefined && newFavicon !== oldFavicon) {
      faviconVersion += 1;
      brandingChanged = true;
    }

    const nowIso = new Date().toISOString();

    const merged = {
      ...current,
      ...sanitizedUpdates,
      websiteLogo: newLogo !== undefined ? newLogo : (current.websiteLogo || ''),
      logoUrl: newLogo !== undefined ? newLogo : (current.logoUrl || current.websiteLogo || ''),
      favicon: newFavicon !== undefined ? newFavicon : (current.favicon || ''),
      faviconUrl: newFavicon !== undefined ? newFavicon : (current.faviconUrl || current.favicon || ''),
      logo_url: newLogo !== undefined ? newLogo : (current.logoUrl || current.websiteLogo || ''),
      favicon_url: newFavicon !== undefined ? newFavicon : (current.faviconUrl || current.favicon || ''),
      logoVersion,
      mobileLogoVersion,
      adminLogoVersion,
      faviconVersion,
      logo_version: logoVersion,
      favicon_version: faviconVersion,
      updatedAt: nowIso,
      updated_at: nowIso,
      updatedBy: updatedBy || current.updatedBy || 'Super Admin',
      updated_by: updatedBy || current.updatedBy || 'Super Admin',
      brandingUpdatedAt: brandingChanged ? nowIso : (current.brandingUpdatedAt || nowIso)
    };

    const saved = writeSiteSettings(merged);
    if (!saved) {
      return res.status(500).json({
        success: false,
        error: 'Failed to write global site settings to server storage.'
      });
    }

    console.log(`[SiteSettings] Global settings updated by ${updatedBy}. LogoVersion: ${logoVersion}, FaviconVersion: ${faviconVersion}`);

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.json({
      success: true,
      settings: merged,
      branding: {
        logoUrl: merged.logoUrl || merged.websiteLogo || '',
        faviconUrl: merged.faviconUrl || merged.favicon || '',
        mobileLogoUrl: merged.mobileLogo || '',
        adminLogoUrl: merged.adminLogo || '',
        logoVersion,
        mobileLogoVersion,
        adminLogoVersion,
        faviconVersion,
        logo_url: merged.logoUrl || merged.websiteLogo || '',
        favicon_url: merged.faviconUrl || merged.favicon || '',
        logo_version: logoVersion,
        favicon_version: faviconVersion,
        updatedAt: nowIso,
        updated_at: nowIso
      }
    });
  } catch (err: any) {
    console.error('[SiteSettings] Error saving settings:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to save global settings: ${err.message}`
    });
  }
});

/**
 * PUT /api/admin/settings/branding
 * Dedicated endpoint for updating branding configuration per specification
 */
app.put('/api/admin/settings/branding', (req: Request, res: Response) => {
  try {
    const rawUpdates = req.body?.branding || req.body || {};
    const updatedBy = req.body?.updatedBy || 'Super Admin';
    const current = readSiteSettings();
    const sanitizedUpdates: any = { ...rawUpdates };

    if (typeof sanitizedUpdates.websiteLogo === 'string' && sanitizedUpdates.websiteLogo.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.websiteLogo, 'logo');
      if (permanent) sanitizedUpdates.websiteLogo = permanent;
    }
    if (typeof sanitizedUpdates.logoUrl === 'string' && sanitizedUpdates.logoUrl.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.logoUrl, 'logo');
      if (permanent) sanitizedUpdates.logoUrl = permanent;
    }
    if (typeof sanitizedUpdates.mobileLogo === 'string' && sanitizedUpdates.mobileLogo.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.mobileLogo, 'mobile-logo');
      if (permanent) sanitizedUpdates.mobileLogo = permanent;
    }
    if (typeof sanitizedUpdates.adminLogo === 'string' && sanitizedUpdates.adminLogo.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.adminLogo, 'admin-logo');
      if (permanent) sanitizedUpdates.adminLogo = permanent;
    }
    if (typeof sanitizedUpdates.favicon === 'string' && sanitizedUpdates.favicon.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.favicon, 'favicon');
      if (permanent) sanitizedUpdates.favicon = permanent;
    }
    if (typeof sanitizedUpdates.faviconUrl === 'string' && sanitizedUpdates.faviconUrl.startsWith('data:')) {
      const permanent = saveDataUrlToFile(sanitizedUpdates.faviconUrl, 'favicon');
      if (permanent) sanitizedUpdates.faviconUrl = permanent;
    }

    let logoVersion = current.logoVersion || current.logo_version || 1;
    let mobileLogoVersion = current.mobileLogoVersion || 1;
    let adminLogoVersion = current.adminLogoVersion || 1;
    let faviconVersion = current.faviconVersion || current.favicon_version || 1;

    const newLogo = sanitizedUpdates.websiteLogo ?? sanitizedUpdates.logoUrl;
    const oldLogo = current.websiteLogo ?? current.logoUrl;
    if (newLogo !== undefined && newLogo !== oldLogo) {
      logoVersion += 1;
    }
    if (sanitizedUpdates.mobileLogo !== undefined && sanitizedUpdates.mobileLogo !== current.mobileLogo) {
      mobileLogoVersion += 1;
    }
    if (sanitizedUpdates.adminLogo !== undefined && sanitizedUpdates.adminLogo !== current.adminLogo) {
      adminLogoVersion += 1;
    }
    const newFavicon = sanitizedUpdates.favicon ?? sanitizedUpdates.faviconUrl;
    const oldFavicon = current.favicon ?? current.faviconUrl;
    if (newFavicon !== undefined && newFavicon !== oldFavicon) {
      faviconVersion += 1;
    }

    const nowIso = new Date().toISOString();
    const merged = {
      ...current,
      ...sanitizedUpdates,
      websiteLogo: newLogo !== undefined ? newLogo : (current.websiteLogo || '/branding/onroadpriz-logo.png'),
      logoUrl: newLogo !== undefined ? newLogo : (current.logoUrl || '/branding/onroadpriz-logo.png'),
      favicon: newFavicon !== undefined ? newFavicon : (current.favicon || '/favicon.svg'),
      faviconUrl: newFavicon !== undefined ? newFavicon : (current.faviconUrl || '/favicon.svg'),
      logo_url: newLogo !== undefined ? newLogo : (current.logoUrl || '/branding/onroadpriz-logo.png'),
      favicon_url: newFavicon !== undefined ? newFavicon : (current.faviconUrl || '/favicon.svg'),
      logoVersion,
      mobileLogoVersion,
      adminLogoVersion,
      faviconVersion,
      logo_version: logoVersion,
      favicon_version: faviconVersion,
      updatedAt: nowIso,
      updated_at: nowIso,
      updatedBy,
      updated_by: updatedBy,
      brandingUpdatedAt: nowIso
    };

    const saved = writeSiteSettings(merged);
    if (!saved) {
      return res.status(500).json({ success: false, error: 'Failed to write settings' });
    }

    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.json({
      success: true,
      branding: {
        logoUrl: merged.logoUrl,
        logoVersion,
        faviconUrl: merged.faviconUrl,
        faviconVersion,
        mobileLogoUrl: merged.mobileLogo || '',
        adminLogoUrl: merged.adminLogo || '',
        mobileLogoVersion,
        adminLogoVersion,
        updatedAt: nowIso
      },
      settings: merged
    });
  } catch (err: any) {
    console.error('[Branding] Error updating branding settings:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// -------------------------------------------------------------
// ADMIN SECRETS & INTEGRATION CONFIGURATION ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/admin/secrets-config
 * Read configuration status and metadata for all 9 secret fields
 * Strictly restricted to authorized administrators.
 * Masks all secret values by default.
 */
app.get('/api/admin/secrets-config', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const auth = requireAdminUser(req);
  if (!auth.authorized) {
    return res.status(auth.status || 401).json({ success: false, error: auth.error });
  }

  const fields = SecretsManager.getAllPublicMeta();
  const configuredCount = fields.filter(f => f.isConfigured).length;
  const missingCount = fields.filter(f => !f.isConfigured).length;

  return res.json({
    success: true,
    fields,
    summary: {
      total: fields.length,
      configured: configuredCount,
      missing: missingCount,
      allConfigured: missingCount === 0
    }
  });
});

/**
 * PUT /api/admin/secrets-config
 * Update configuration fields securely
 * Preserves untouched/blank fields. Validates formats.
 */
app.put('/api/admin/secrets-config', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const auth = requireAdminUser(req);
  if (!auth.authorized) {
    return res.status(auth.status || 401).json({ success: false, error: auth.error });
  }

  try {
    const rawUpdates = req.body?.secrets || req.body || {};
    const adminEmail = auth.user?.email || auth.user?.name || 'Administrator';
    const result = await SecretsManager.updateSecrets(rawUpdates, adminEmail);

    if (!result.success && result.errors && result.errors.length > 0) {
      return res.status(400).json({
        success: false,
        error: result.errors[0],
        errors: result.errors
      });
    }

    const fields = SecretsManager.getAllPublicMeta();
    const configuredCount = fields.filter(f => f.isConfigured).length;
    const missingCount = fields.filter(f => !f.isConfigured).length;

    return res.json({
      success: true,
      message: `Successfully saved configuration. ${result.updatedKeys.length} field${result.updatedKeys.length === 1 ? '' : 's'} updated.`,
      updatedKeys: result.updatedKeys,
      fields,
      summary: {
        total: fields.length,
        configured: configuredCount,
        missing: missingCount,
        allConfigured: missingCount === 0
      }
    });
  } catch (err: any) {
    console.error('[AdminSecrets] Error updating secrets:', err);
    return res.status(500).json({
      success: false,
      error: `Failed to save configuration settings: ${err.message}`
    });
  }
});

/**
 * POST /api/admin/secrets-config/reveal
 * Reveal a specific configured secret value for authorized admin copy/view
 */
app.post('/api/admin/secrets-config/reveal', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const auth = requireAdminUser(req);
  if (!auth.authorized) {
    return res.status(auth.status || 401).json({ success: false, error: auth.error });
  }

  const { key } = req.body || {};
  if (!key || !(REQUIRED_SECRET_KEYS as readonly string[]).includes(key)) {
    return res.status(400).json({ success: false, error: 'Invalid or missing configuration key.' });
  }

  const value = SecretsManager.getPlainSecret(key);
  return res.json({
    success: true,
    key,
    value: value || ''
  });
});

/**
 * POST /api/admin/integrations/test-gemini
 * Safely verify Gemini AI connectivity without returning or leaking the key
 */
app.post('/api/admin/integrations/test-gemini', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const auth = requireAdminUser(req);
  if (!auth.authorized) {
    return res.status(auth.status || 401).json({ success: false, error: auth.error });
  }

  try {
    const result = await GeminiService.testConnection();
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      configured: SecretsManager.isConfigured('GEMINI_API_KEY'),
      model: 'gemini-3.8-flash',
      error: err.message || 'Gemini connectivity check failed',
      timestamp: new Date().toISOString()
    });
  }
});

/**
 * POST /api/admin/integrations/test-sms
 * Safely verify SMS gateway parameters and reachability (dry-run or authorized live test)
 */
app.post('/api/admin/integrations/test-sms', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const auth = requireAdminUser(req);
  if (!auth.authorized) {
    return res.status(auth.status || 401).json({ success: false, error: auth.error });
  }

  try {
    const { sendRealSms = false, testMobile } = req.body || {};
    const result = await SmsService.testSmsConnection({
      sendRealSms: Boolean(sendRealSms),
      testMobile,
      adminEmail: auth.user?.email || auth.user?.name || 'Admin'
    });
    return res.json(result);
  } catch (err: any) {
    return res.status(500).json({
      success: false,
      mode: req.body?.sendRealSms ? 'live-dispatch' : 'dry-run',
      latencyMs: 0,
      message: `SMS test error: ${err.message}`,
      error: err.message
    });
  }
});


// -------------------------------------------------------------
// OTP & SMS VERIFICATION ENDPOINTS (Ultron SMS DLT-Compliant)
// -------------------------------------------------------------

/**
 * POST /api/auth/send-otp
 * Secure server-side OTP generation and DLT-approved SMS dispatch
 * Returns challengeId and cooldown details
 */
app.post('/api/auth/send-otp', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  try {
    const { mobile } = req.body || {};
    if (!mobile) {
      return res.status(400).json({
        success: false,
        error: 'Mobile number is required.',
        message: 'Please enter a valid 10-digit Indian mobile number.'
      });
    }

    const result = await SmsService.sendOtp(String(mobile));
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error,
        code: result.code,
        message: result.message,
        cooldownSeconds: result.cooldownSeconds
      });
    }

    return res.json({
      success: true,
      challengeId: result.challengeId,
      message: result.message,
      cooldownSeconds: result.cooldownSeconds,
      expiresIn: result.expiresIn
    });
  } catch (err: any) {
    console.error('[SMS API] Error in send-otp:', err);
    return res.status(500).json({
      success: false,
      error: 'Failed to process OTP request.',
      message: 'Temporary server error sending verification code. Please try again shortly.'
    });
  }
});

/**
 * Helper to extract session token from Authorization Bearer header, x-auth-token, or cookie
 */
function extractAuthToken(req: Request): string | undefined {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers['x-auth-token'];
  if (typeof customHeader === 'string' && customHeader.trim()) {
    return customHeader.trim();
  }
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const match = cookieHeader.match(/(?:^|;\s*)orp_session=([^;]*)/);
    if (match) return decodeURIComponent(match[1]);
  }
  return undefined;
}

/**
 * Verify whether request is issued by an authorized administrator (Admin or Super Admin)
 */
function requireAdminUser(req: Request): { authorized: boolean; user?: any; error?: string; status?: number } {
  const token = extractAuthToken(req);
  if (!token) {
    return { authorized: false, error: 'Authentication required. No session token provided.', status: 401 };
  }
  const user = AuthService.getUserFromSession(token);
  if (!user) {
    return { authorized: false, error: 'Invalid or expired session. Please log in again.', status: 401 };
  }
  const role = (user.role || '').toLowerCase();
  if (role !== 'admin' && role !== 'super admin') {
    return { authorized: false, error: 'Access denied. Administrator privileges required.', status: 403 };
  }
  return { authorized: true, user };
}

/**
 * POST /api/auth/verify-otp
 * Atomic OTP verification with challenge-based idempotency & session creation
 * Safe against double-clicks and concurrent network retries
 */
app.post('/api/auth/verify-otp', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  try {
    const { mobile, otp, challengeId, fullName } = req.body || {};
    if (!mobile || !otp) {
      return res.status(400).json({
        success: false,
        verified: false,
        code: 'INVALID_FORMAT',
        error: 'Mobile number and 6-digit OTP are required.',
        message: 'Please provide both mobile number and verification code.'
      });
    }

    const result = SmsService.verifyOtp(
      String(mobile),
      String(otp),
      challengeId ? String(challengeId) : undefined
    );

    if (!result.success || !result.verified) {
      return res.status(400).json({
        success: false,
        verified: false,
        code: result.code,
        error: result.error,
        message: result.message,
        remainingAttempts: result.remainingAttempts
      });
    }

    // Provision or retrieve user and create session
    const authResult = AuthService.authenticateWithOtp(String(mobile), fullName);
    if (!authResult.success || !authResult.user) {
      return res.status(400).json({
        success: false,
        error: authResult.error || 'Failed to authenticate user.'
      });
    }
    const session = AuthService.createSession(authResult.user.id);

    // Set secure cross-environment session cookie
    res.setHeader('Set-Cookie', `orp_session=${encodeURIComponent(session.token)}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`);

    const userObj = authResult.user;
    const activeBuyerPlan = PlanService.getActiveBuyerSubscription(userObj.id, userObj);
    const activeSellerPlan = PlanService.getActiveSellerSubscription(userObj.id, userObj);
    const planHistory = PlanService.getUserSubscriptions(userObj.id);

    return res.status(200).json({
      success: true,
      verified: true,
      authenticated: true,
      code: result.code,
      message: result.message,
      token: session.token,
      isNewUser: authResult.isNewUser,
      user: userObj,
      activeBuyerPlan,
      activeSellerPlan,
      planHistory
    });
  } catch (err: any) {
    console.error('[SMS API] Error in verify-otp:', err);
    return res.status(500).json({
      success: false,
      verified: false,
      code: 'SERVER_ERROR',
      error: 'Verification service error.',
      message: 'Temporary server error verifying code. Please try again.'
    });
  }
});

/**
 * POST /api/auth/login
 * Email & password authentication endpoint
 * Authenticates Super Admin (onroadpriz@admin.com / 111111), staff, and registered users
 */
app.post('/api/auth/login', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  try {
    const { email, password } = req.body || {};
    const cleanEmail = String(email || '').trim().toLowerCase();
    const cleanPassword = String(password || '').trim();

    if (!cleanEmail || !cleanPassword) {
      return res.status(400).json({
        success: false,
        authenticated: false,
        error: 'Email and password are required.'
      });
    }

    await AuthService.ensureSyncedWithDb();

    // 1. First attempt: check in-memory / AuthService cache
    let authResult = AuthService.authenticateWithEmail(cleanEmail, cleanPassword);

    // 2. If not found in cache, check Cloud SQL PostgreSQL database!
    if (!authResult.success) {
      try {
        const dbUser = await DbService.getUserByEmail(cleanEmail);
        if (dbUser) {
          if (dbUser.status === 'Blocked' || (dbUser.status as any) === 'Suspended') {
            return res.status(403).json({
              success: false,
              authenticated: false,
              error: 'Your account is suspended. Please contact support.'
            });
          }

          // Check password strictly against stored password
          if (dbUser.password && dbUser.password !== cleanPassword) {
            return res.status(401).json({
              success: false,
              authenticated: false,
              error: 'Invalid email or password. Please check your credentials and try again.'
            });
          }

          // Register in AuthService cache for ongoing session validity
          AuthService.saveUser(dbUser);
          authResult = { success: true, user: dbUser };
        }
      } catch (dbErr) {
        console.warn('[CloudSQL] Error querying user during login:', dbErr);
      }
    }

    if (!authResult.success || !authResult.user) {
      return res.status(401).json({
        success: false,
        authenticated: false,
        error: authResult.error || 'Invalid email or password. Please check your credentials and try again.'
      });
    }

    const userObj = authResult.user;
    const session = AuthService.createSession(userObj.id);
    res.setHeader('Set-Cookie', `orp_session=${encodeURIComponent(session.token)}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`);
    const activeBuyerPlan = PlanService.getActiveBuyerSubscription(userObj.id, userObj);
    const activeSellerPlan = PlanService.getActiveSellerSubscription(userObj.id, userObj);
    const planHistory = PlanService.getUserSubscriptions(userObj.id);

    return res.status(200).json({
      success: true,
      authenticated: true,
      token: session.token,
      user: userObj,
      activeBuyerPlan,
      activeSellerPlan,
      planHistory,
      message: 'Signed in successfully.'
    });
  } catch (err: any) {
    console.error('[Auth API] Error in login:', err);
    return res.status(500).json({
      success: false,
      authenticated: false,
      error: 'Server error processing sign in.'
    });
  }
});

/**
 * POST /api/auth/register
 * Enforces NO TWO USERS CAN HAVE THE SAME PHONE NUMBER OR SAME EMAIL.
 */
app.post('/api/auth/register', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  try {
    const { name, email, phone, password, role, city, state } = req.body || {};
    const regResult = AuthService.registerUser({
      name: String(name || ''),
      email: email ? String(email) : undefined,
      phone: phone ? String(phone) : undefined,
      password: password ? String(password) : undefined,
      role: role || 'Buyer',
      city: city ? String(city) : undefined,
      state: state ? String(state) : undefined,
    });

    if (!regResult.success || !regResult.user) {
      return res.status(400).json({
        success: false,
        errorCode: regResult.errorCode,
        error: regResult.error || 'Failed to register account.'
      });
    }

    // Persist to Cloud SQL immediately
    try {
      await DbService.upsertUser(regResult.user);
    } catch (dbErr) {
      console.warn('[CloudSQL] Error saving registered user to DB:', dbErr);
    }

    const session = AuthService.createSession(regResult.user.id);
    res.setHeader('Set-Cookie', `orp_session=${encodeURIComponent(session.token)}; Path=/; Max-Age=${30 * 24 * 60 * 60}; HttpOnly; SameSite=Lax`);
    broadcastDataChange('users', 'CREATE', regResult.user);

    return res.status(201).json({
      success: true,
      authenticated: true,
      token: session.token,
      user: regResult.user,
      message: 'Account registered successfully.'
    });
  } catch (err: any) {
    console.error('[Auth API] Error in registration:', err);
    return res.status(500).json({
      success: false,
      error: err.message || 'Server error processing registration.'
    });
  }
});

/**
 * GET /api/me & GET /api/auth/me
 * Authoritative centralized profile, location, wishlist, and plans synchronization
 */
async function handleGetMe(req: Request, res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  await AuthService.ensureSyncedWithDb();

  const token = extractAuthToken(req);
  if (!token) {
    return res.json({
      success: true,
      authenticated: false,
      user: null,
      profile: null,
      location: null,
      wishlist: [],
      wishlistCount: 0,
      activeBuyerPlan: null,
      activeSellerPlan: null,
      planHistory: []
    });
  }

  const user = AuthService.getUserFromSession(token);
  if (!user) {
    return res.json({
      success: true,
      authenticated: false,
      user: null,
      profile: null,
      location: null,
      wishlist: [],
      wishlistCount: 0,
      activeBuyerPlan: null,
      activeSellerPlan: null,
      planHistory: []
    });
  }

  const wishlist = WishlistService.getUserWishlist(user.id);
  const activeBuyerPlan = PlanService.getActiveBuyerSubscription(user.id, user);
  const activeSellerPlan = PlanService.getActiveSellerSubscription(user.id, user);
  const planHistory = PlanService.getUserSubscriptions(user.id);
  const payments = PlanService.getUserPayments(user.id);

  // Sync snapshot to user if updated
  if (activeBuyerPlan && (!user.buyerPlan || user.buyerPlan.status !== 'active')) {
    user.buyerPlan = {
      planId: activeBuyerPlan.planId,
      name: activeBuyerPlan.planName,
      price: activeBuyerPlan.baseAmount,
      validityDays: Math.round((new Date(activeBuyerPlan.expiresAt).getTime() - new Date(activeBuyerPlan.activatedAt).getTime()) / (24 * 60 * 60 * 1000)),
      listingViewsAllowed: activeBuyerPlan.viewsAllowed,
      listingViewsRemaining: activeBuyerPlan.viewsRemaining,
      startedAt: activeBuyerPlan.activatedAt,
      expiresAt: activeBuyerPlan.expiresAt,
      status: 'active'
    };
  } else if (!activeBuyerPlan && user.buyerPlan && user.buyerPlan.status === 'active') {
    user.buyerPlan.status = 'expired';
  }

  if (activeSellerPlan && (!user.sellerPlan || user.sellerPlan.status !== 'active')) {
    user.sellerPlan = {
      planId: activeSellerPlan.planId,
      name: activeSellerPlan.planName,
      price: activeSellerPlan.baseAmount,
      validityDays: Math.round((new Date(activeSellerPlan.expiresAt).getTime() - new Date(activeSellerPlan.activatedAt).getTime()) / (24 * 60 * 60 * 1000)),
      listingsAllowed: activeSellerPlan.listingsAllowed,
      listingsRemaining: activeSellerPlan.listingsRemaining,
      startedAt: activeSellerPlan.activatedAt,
      expiresAt: activeSellerPlan.expiresAt,
      status: 'active'
    };
  } else if (!activeSellerPlan && user.sellerPlan && user.sellerPlan.status === 'active') {
    user.sellerPlan.status = 'expired';
  }

  return res.json({
    success: true,
    authenticated: true,
    user,
    profile: {
      id: user.id,
      name: user.name,
      fullName: user.fullName || user.name,
      email: user.email,
      phone: user.phone,
      mobile: user.mobile || user.phone,
      role: user.role,
      verified: user.verified,
      status: user.status,
      city: user.city || '',
      state: user.state || '',
      location: user.location || '',
      location_name: user.location_name || user.location || '',
      location_source: user.location_source || 'MANUAL',
      location_updated_at: user.location_updated_at,
      registeredAt: user.registeredAt || user.joinedDate
    },
    location: (user.city || user.formatted_address) ? {
      city: user.city || '',
      state: user.state || '',
      area: user.area || user.locality || '',
      locality: user.locality || user.area || '',
      premise: user.premise || '',
      street: user.street || '',
      district: user.district || '',
      postal_code: user.postal_code || '',
      country: user.country || 'India',
      formatted_address: user.formatted_address || user.location || '',
      location_name: user.location_name || user.location || `${user.city}${user.state ? ', ' + user.state : ''}`,
      latitude: user.latitude,
      longitude: user.longitude,
      location_accuracy_meters: user.location_accuracy_meters,
      location_source: user.location_source || 'MANUAL',
      location_confirmed_at: user.location_confirmed_at,
      location_updated_at: user.location_updated_at
    } : null,
    wishlist,
    wishlistCount: wishlist.length,
    activeBuyerPlan,
    activeSellerPlan,
    planHistory,
    payments
  });
}

app.get('/api/me', handleGetMe);
app.get('/api/auth/me', handleGetMe);

/**
 * PUT/PATCH /api/me/profile
 * Update authenticated user's profile details with database-level uniqueness validation
 */
const handleUpdateProfile = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  await AuthService.ensureSyncedWithDb();

  const token = extractAuthToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.status(401).json({ success: false, error: 'Session expired' });

  const result = AuthService.updateUserProfile(user.id, req.body || {});
  if (!result.success || !result.user) {
    return res.status(400).json({
      success: false,
      errorCode: result.errorCode,
      error: result.error || 'Failed to update profile'
    });
  }
  try {
    await DbService.upsertUser(result.user);
  } catch (err) {
    console.warn('[CloudSQL] Error syncing profile update to DB:', err);
  }
  broadcastDataChange('users', 'UPDATE', result.user);
  return res.json({ success: true, user: result.user });
};

app.put('/api/me/profile', handleUpdateProfile);
app.patch('/api/me/profile', handleUpdateProfile);

/**
 * POST /api/me/mobile/request-otp
 * Step 1 of mobile number change: normalize, verify uniqueness against database, and issue OTP
 */
app.post('/api/me/mobile/request-otp', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.status(401).json({ success: false, error: 'Session expired' });

  const { newMobile } = req.body || {};
  const canonical = normalizeIndianMobile(newMobile);
  if (!canonical) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  // Database level uniqueness check: prevent claiming an existing account's number
  if (AuthService.isMobileRegisteredByAnother(canonical, user.id)) {
    return res.status(400).json({
      success: false,
      errorCode: 'MOBILE_ALREADY_REGISTERED',
      error: 'This mobile number is already registered. Please log in or use a different mobile number.'
    });
  }

  const sent = await SmsService.sendOtp(canonical);
  if (!sent.success) {
    return res.status(400).json({ success: false, error: sent.error || 'Failed to send verification code.' });
  }

  return res.json({
    success: true,
    message: sent.message || `OTP sent successfully to ${canonical}.`,
    devOtp: (sent as any).devOtp,
    challengeId: sent.challengeId
  });
});

/**
 * POST /api/me/mobile/verify-otp
 * Step 2 of mobile number change: verify OTP and update the SAME user record with uniqueness guarantee
 */
app.post('/api/me/mobile/verify-otp', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.status(401).json({ success: false, error: 'Session expired' });

  const { newMobile, otp } = req.body || {};
  const canonical = normalizeIndianMobile(newMobile);
  if (!canonical) {
    return res.status(400).json({ success: false, error: 'Please enter a valid 10-digit Indian mobile number.' });
  }

  const otpResult = SmsService.verifyOtp(canonical, String(otp || ''));
  if (!otpResult.success) {
    return res.status(400).json({ success: false, error: otpResult.error || 'Invalid OTP. Please check and try again.' });
  }

  const result = AuthService.changeUserMobile(user.id, canonical);
  if (!result.success || !result.user) {
    return res.status(400).json({
      success: false,
      errorCode: result.errorCode,
      error: result.error || 'Failed to update mobile number.'
    });
  }

  DbService.upsertUser(result.user).catch(err => {
    console.warn('[CloudSQL] Error syncing mobile change to DB:', err);
  });

  return res.json({
    success: true,
    user: result.user,
    message: 'Mobile number updated and verified successfully.'
  });
});

/**
 * GET /api/admin/users
 * Returns authoritative user records directly from canonical database
 */
app.get('/api/admin/users', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const list = await DbService.getUsers();
    return res.json({ success: true, users: list });
  } catch {
    const users = AuthService.getAllUsers();
    return res.json({ success: true, users });
  }
});

/**
 * POST /api/admin/users
 * Create a new Admin / Staff / User account from the Admin Portal
 */
app.post('/api/admin/users', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const { name, email, phone, password, role, city, state } = req.body || {};
  const result = AuthService.registerUser({
    name,
    email,
    phone,
    password: password || 'admin123',
    role: role || 'Admin',
    city,
    state
  });
  if (!result.success || !result.user) {
    return res.status(400).json({
      success: false,
      errorCode: result.errorCode,
      error: result.error || 'Failed to create account.'
    });
  }
  if (city || state) {
    result.user.location = `${city || ''}${city && state ? ', ' : ''}${state || ''}`.trim();
    result.user.location_name = result.user.location;
  }
  DbService.upsertUser(result.user).catch(err => {
    console.warn('[CloudSQL] Error syncing new admin user to DB:', err);
  });
  broadcastDataChange('users', 'CREATE', result.user);
  return res.json({ success: true, user: result.user });
});

/**
 * PUT/PATCH /api/admin/users/:id
 * Admin update of user status, role, verification, location, etc.
 */
const handleAdminUpdateUser = async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  await AuthService.ensureSyncedWithDb();
  const userId = req.params.id;
  const result = AuthService.adminUpdateUser(userId, req.body || {});
  if (!result.success || !result.user) {
    return res.status(400).json({
      success: false,
      errorCode: result.errorCode,
      error: result.error || 'Failed to update user'
    });
  }
  // Mirror to Cloud SQL database immediately
  try {
    await DbService.upsertUser(result.user);
  } catch (err) {
    console.warn('[CloudSQL] Error syncing user update to DB:', err);
  }
  broadcastDataChange('users', 'UPDATE', result.user);
  return res.json({ success: true, user: result.user });
};

app.put('/api/admin/users/:id', handleAdminUpdateUser);
app.patch('/api/admin/users/:id', handleAdminUpdateUser);

/**
 * DELETE /api/admin/users/:id
 * Admin immediate deletion of user record from database & cache
 */
app.delete('/api/admin/users/:id', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const userId = req.params.id;
  const deleted = AuthService.deleteUser(userId);
  try {
    await DbService.deleteUser(userId);
  } catch (dbErr) {
    console.warn('[CloudSQL] Error deleting user from Cloud SQL DB:', dbErr);
  }
  broadcastDataChange('users', 'DELETE', { id: userId });
  return res.json({ success: true, deleted });
});

/**
 * POST /api/me/location
 * Update authenticated user's confirmed high-precision location in database
 */
app.post('/api/me/location', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  await AuthService.ensureSyncedWithDb();

  const token = extractAuthToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.status(401).json({ success: false, error: 'Session expired' });

  const {
    city,
    state,
    area,
    locality,
    premise,
    street,
    district,
    postal_code,
    country,
    formatted_address,
    location_name,
    latitude,
    longitude,
    location_accuracy_meters,
    location_source,
    location_confirmed_at
  } = req.body || {};

  const updated = AuthService.updateUserLocation(user.id, {
    city,
    state,
    area: area || locality,
    locality: locality || area,
    premise,
    street,
    district,
    postal_code,
    country,
    formatted_address,
    location_name,
    latitude: typeof latitude === 'number' ? latitude : undefined,
    longitude: typeof longitude === 'number' ? longitude : undefined,
    location_accuracy_meters: typeof location_accuracy_meters === 'number' ? location_accuracy_meters : undefined,
    location_source: location_source || 'DEVICE_GEOLOCATION',
    location_confirmed_at: location_confirmed_at || new Date().toISOString()
  });

  if (updated) {
    try {
      await DbService.upsertUser(updated);
    } catch (err) {
      console.warn('[CloudSQL] Error syncing location update to DB:', err);
    }
    broadcastDataChange('users', 'UPDATE', updated);
  }

  return res.json({ success: true, user: updated });
});

/**
 * POST /api/location/detect
 * Reverse geocode high-precision coordinates to detailed reliable address components.
 * CRITICAL: Zero guessing, zero hardcoded city fallbacks (never default to Hyderabad).
 */
app.post('/api/location/detect', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  try {
    const { latitude, longitude, accuracy } = req.body || {};
    if (typeof latitude !== 'number' || typeof longitude !== 'number' || isNaN(latitude) || isNaN(longitude)) {
      return res.status(400).json({ success: false, error: 'Valid latitude and longitude numbers are required' });
    }

    if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) {
      return res.status(400).json({ success: false, error: 'Coordinates out of valid bounds' });
    }

    // 1. Primary provider: OpenStreetMap Nominatim reverse geocode (high-detail address components)
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`;
      const resp = await fetch(nominatimUrl, {
        headers: {
          'User-Agent': 'OnRoadPriz-LocationDetection/2.0 (contact@onroadpriz.com)'
        },
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const addr = data.address || {};

        const premise = addr.building || addr.house_name || addr.office || addr.commercial || addr.amenity || '';
        const streetNumber = addr.house_number || '';
        const streetName = addr.road || addr.street || addr.footway || addr.path || '';
        const street = [streetNumber, streetName].filter(Boolean).join(' ').trim();
        const area = addr.suburb || addr.neighbourhood || addr.residential || addr.subdistrict || '';
        const locality = addr.neighbourhood || addr.suburb || addr.city_district || addr.locality || '';
        const rawCity = addr.city || addr.town || addr.village || addr.municipality || addr.hamlet || addr.county || '';
        const district = addr.county || addr.state_district || '';
        const state = addr.state || '';
        const postalCode = addr.postcode || '';
        const country = addr.country || 'India';
        const city = resolveCanonicalCity(rawCity, district, area, locality, data.display_name) || rawCity || area;

        if (city || area || state) {
          // Construct detailed readable location without fabricating missing parts
          // Example: Building/Street, Area, City, State PIN
          const addressParts: string[] = [];
          if (premise) addressParts.push(premise);
          if (street && street !== premise) addressParts.push(street);
          if (area && area !== city) addressParts.push(area);
          if (city) addressParts.push(city);
          if (state) addressParts.push(postalCode ? `${state} ${postalCode}` : state);

          const formattedAddress = addressParts.length > 0
            ? addressParts.join(', ')
            : (data.display_name || `${city}, ${state}`);

          const shortDisplay = city || area || 'Current Location';

          return res.json({
            success: true,
            latitude,
            longitude,
            accuracy: typeof accuracy === 'number' ? accuracy : undefined,
            city,
            state,
            area: area || locality,
            locality: locality || area,
            premise,
            street,
            district,
            postal_code: postalCode,
            country,
            formatted_address: formattedAddress,
            location_name: shortDisplay,
            short_display: shortDisplay,
            source: 'DEVICE_GEOLOCATION'
          });
        }
      }
    } catch (nomErr: any) {
      console.warn('[Location API] Nominatim reverse geocode attempt failed, trying fallback provider:', nomErr.message);
    }

    // 2. Fallback provider: BigDataCloud Reverse Geocoding Client
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);

      const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
      const resp = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (resp.ok) {
        const data = await resp.json();
        const rawCity = data.city || data.locality || data.principalSubdivisionCity || '';
        const state = data.principalSubdivision || '';
        const locality = data.locality || '';
        const postalCode = data.postcode || '';
        const country = data.countryName || 'India';
        const city = resolveCanonicalCity(rawCity, locality, data.principalSubdivisionCity) || rawCity || locality;

        if (city || locality || state) {
          const parts = [locality && locality !== city ? locality : '', city, state, postalCode].filter(Boolean);
          const formattedAddress = parts.join(', ');
          const shortDisplay = city || locality || 'Current Location';

          return res.json({
            success: true,
            latitude,
            longitude,
            accuracy: typeof accuracy === 'number' ? accuracy : undefined,
            city,
            state,
            area: locality,
            locality,
            postal_code: postalCode,
            country,
            formatted_address: formattedAddress,
            location_name: shortDisplay,
            short_display: shortDisplay,
            source: 'DEVICE_GEOLOCATION'
          });
        }
      }
    } catch (bdcErr: any) {
      console.warn('[Location API] BigDataCloud fallback failed:', bdcErr.message);
    }

    // CRITICAL: NEVER default to Hyderabad or guess nearest city.
    // If coordinates cannot be reverse-geocoded, explicitly report error and prompt manual selection.
    return res.status(422).json({
      success: false,
      error: 'Could not reverse-geocode coordinates. Please select your location manually.'
    });
  } catch (err: any) {
    console.error('[Location API] Fatal error in detect:', err);
    return res.status(500).json({ success: false, error: 'Location detection service error' });
  }
});

/**
 * GET /api/me/wishlist
 * Retrieve authenticated user's wishlist
 */
app.get('/api/me/wishlist', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) return res.json({ success: true, wishlist: [] });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.json({ success: true, wishlist: [] });

  const wishlist = WishlistService.getUserWishlist(user.id);
  return res.json({ success: true, wishlist, count: wishlist.length });
});

/**
 * POST /api/me/wishlist/toggle
 * Add or remove vehicle from authenticated user's wishlist in database
 */
app.post('/api/me/wishlist/toggle', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Please log in to save vehicles to your wishlist.' });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.status(401).json({ success: false, error: 'Session expired. Please log in again.' });

  const { vehicleId } = req.body || {};
  if (!vehicleId) return res.status(400).json({ success: false, error: 'vehicleId is required' });

  const result = WishlistService.toggleWishlistItem(user.id, String(vehicleId));
  return res.json({ success: true, wishlist: result.wishlist, count: result.wishlist.length, added: result.added });
});

/**
 * DELETE /api/me/wishlist
 * Clear authenticated user's wishlist
 */
app.delete('/api/me/wishlist', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.status(401).json({ success: false, error: 'Session expired' });

  const cleared = WishlistService.clearWishlist(user.id);
  return res.json({ success: true, wishlist: cleared, count: 0 });
});

/**
 * GET /api/public/plans
 * Authoritative public plans catalog (Buyer Plans & Seller Plans)
 */
app.get('/api/public/plans', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-cache, must-revalidate');
  return res.json({
    success: true,
    buyerPlans: PlanService.getPublicBuyerPlans(),
    sellerPlans: PlanService.getPublicSellerPlans()
  });
});

/**
 * DELETE /api/admin/plans/buyer/:id
 */
app.delete('/api/admin/plans/buyer/:id', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const deleted = PlanService.deleteBuyerPlan(req.params.id);
  broadcastDataChange('plans', 'DELETE', { type: 'buyer', id: req.params.id });
  return res.json({ success: deleted });
});

/**
 * DELETE /api/admin/plans/seller/:id
 */
app.delete('/api/admin/plans/seller/:id', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');
  const deleted = PlanService.deleteSellerPlan(req.params.id);
  broadcastDataChange('plans', 'DELETE', { type: 'seller', id: req.params.id });
  return res.json({ success: deleted });
});

/**
 * GET /api/me/plans
 * Retrieve authenticated user's active buyer & seller plans and historical subscriptions
 */
app.get('/api/me/plans', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) return res.status(401).json({ success: false, error: 'Authentication required' });
  const user = AuthService.getUserFromSession(token);
  if (!user) return res.status(401).json({ success: false, error: 'Session expired' });

  return res.json({
    success: true,
    activeBuyerPlan: PlanService.getActiveBuyerSubscription(user.id),
    activeSellerPlan: PlanService.getActiveSellerSubscription(user.id),
    planHistory: PlanService.getUserSubscriptions(user.id)
  });
});

/**
 * POST /api/orders/create
 * Create an order for plan purchase - requires authentication
 */
app.post('/api/orders/create', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) {
    return res.status(401).json({ 
      success: false, 
      error: 'Please sign in or register to purchase a membership plan.' 
    });
  }

  const user = AuthService.getUserFromSession(token);
  if (!user) {
    return res.status(401).json({ 
      success: false, 
      error: 'Session expired. Please sign in again to continue.' 
    });
  }

  const { planId, paymentMethod = 'UPI' } = req.body || {};
  if (!planId) {
    return res.status(400).json({ success: false, error: 'planId is required' });
  }

  const result = PlanService.createOrder(
    user.id,
    user.name || user.fullName || 'Member',
    user.email || `${user.phone}@onroadpriz.com`,
    String(planId),
    String(paymentMethod)
  );

  if (!result.success) {
    return res.status(400).json({ success: false, error: result.error });
  }

  return res.json({ success: true, order: result.order });
});

/**
 * POST /api/orders/verify
 * Server-verified payment activation - creates authoritative UserSubscription in database
 */
app.post('/api/orders/verify', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (!token) {
    return res.status(401).json({ success: false, error: 'Authentication required' });
  }

  const user = AuthService.getUserFromSession(token);
  if (!user) {
    return res.status(401).json({ success: false, error: 'Session expired' });
  }

  const { planId, orderId, paymentId, paymentMethod = 'UPI' } = req.body || {};
  if (!planId) {
    return res.status(400).json({ success: false, error: 'planId is required' });
  }

  const result = PlanService.verifyAndActivatePlan(
    user.id,
    user.name || user.fullName || 'Member',
    user.email || '',
    String(planId),
    orderId ? String(orderId) : undefined,
    paymentId ? String(paymentId) : undefined,
    String(paymentMethod)
  );

  if (!result.success || !result.subscription) {
    return res.status(400).json({ success: false, error: result.error || 'Failed to verify and activate plan.' });
  }

  // Update user snapshot in database
  const updatedUser = AuthService.updateUserPlanSnapshots(
    user.id,
    result.subscription.planType === 'buyer' ? result.snapshot : undefined,
    result.subscription.planType === 'seller' ? result.snapshot : undefined
  );

  return res.json({
    success: true,
    subscription: result.subscription,
    snapshot: result.snapshot,
    payment: result.payment,
    user: updatedUser,
    message: `${result.subscription.planName} has been activated successfully.`
  });
});

/**
 * POST /api/auth/logout
 * Authoritative session termination endpoint
 */
app.post('/api/auth/logout', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  res.setHeader('Pragma', 'no-cache');

  const token = extractAuthToken(req);
  if (token) {
    AuthService.destroySession(token);
  }

  res.setHeader('Set-Cookie', 'orp_session=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; HttpOnly; SameSite=Lax');
  return res.json({
    success: true,
    message: 'Signed out successfully.'
  });
});

/**
 * GET /api/auth/otp-status
 * Health check on SMS provider setup
 */
app.get('/api/auth/otp-status', (_req: Request, res: Response) => {
  const isConfigured = Boolean(SecretsManager.get('SMS_USER') && SecretsManager.get('SMS_PASSWORD'));
  res.json({
    configured: isConfigured,
    provider: 'Ultron SMS (DLT Approved)',
    senderId: (SecretsManager.get('SMS_SENDER_ID') || 'TRSSET').trim(),
    dltTemplateId: (SecretsManager.get('SMS_DLT_TEMPLATE_ID') || '1707178132876719605').trim()
  });
});

// -------------------------------------------------------------
// 1. VEHICLE LOOKUP ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/vehicle/provider-status
 * Health check on whether external VAHAN provider credentials are configured on the server
 */
app.get('/api/vehicle/provider-status', (_req: Request, res: Response) => {
  res.json({
    providerConfigured: vehicleLookupProvider.isConfigured(),
    providerName: vehicleLookupProvider.name,
    timestamp: new Date().toISOString(),
  });
});

/**
 * POST /api/vehicle/lookup
 * Secure backend endpoint to lookup vehicle details by Indian Registration Number
 * - Normalizes input
 * - Validates format
 * - Enforces rate limiting
 * - Queries provider adapter
 * - Strips personal owner PII
 */
app.post('/api/vehicle/lookup', async (req: Request, res: Response) => {
  const clientIp = (req.headers['x-forwarded-for'] as string)?.split(',')[0] || req.socket.remoteAddress || '127.0.0.1';
  const { registrationNumber } = req.body || {};

  // Step 1: Input validation & normalization
  if (!registrationNumber || typeof registrationNumber !== 'string') {
    return res.status(400).json({
      success: false,
      providerConfigured: vehicleLookupProvider.isConfigured(),
      registrationNumber: '',
      error: 'Please provide a valid vehicle registration number.',
      errorCode: 'INVALID_REGISTRATION',
    });
  }

  const validation = validateRegistrationNumber(registrationNumber);
  if (!validation.isValid) {
    return res.status(400).json({
      success: false,
      providerConfigured: vehicleLookupProvider.isConfigured(),
      registrationNumber: validation.normalized,
      error: validation.error || 'Invalid registration number format.',
      errorCode: 'INVALID_REGISTRATION',
    });
  }

  const normalizedReg = validation.normalized;

  // Step 2: Rate Limiting
  const rateLimit = lookupLimiterAndCache.checkRateLimit(clientIp);
  res.setHeader('X-RateLimit-Remaining', rateLimit.remaining);

  if (!rateLimit.allowed) {
    console.warn(`[VehicleLookup] Rate limit exceeded for IP ${clientIp} on ${normalizedReg}`);
    return res.status(429).json({
      success: false,
      providerConfigured: vehicleLookupProvider.isConfigured(),
      registrationNumber: normalizedReg,
      error: `Too many lookup attempts. Please wait ${rateLimit.resetInSec} seconds before trying again.`,
      errorCode: 'RATE_LIMITED',
    });
  }

  // Step 3: In-memory cache check
  const cached = lookupLimiterAndCache.getCached(normalizedReg);
  if (cached) {
    console.log(`[VehicleLookup] Cache hit for ${normalizedReg}`);
    return res.json(cached);
  }

  // Step 4: Provider Lookup
  console.log(`[VehicleLookup] Performing lookup for ${normalizedReg} via ${vehicleLookupProvider.name}`);
  try {
    const result = await vehicleLookupProvider.lookup(normalizedReg);

    if (result.success && result.vehicle) {
      lookupLimiterAndCache.setCached(normalizedReg, result);
      console.log(`[VehicleLookup] Successfully resolved vehicle details for ${normalizedReg} (${result.vehicle.manufacturer} ${result.vehicle.model})`);
    } else {
      console.log(`[VehicleLookup] Lookup unfulfilled for ${normalizedReg}: ${result.error || result.errorCode}`);
    }

    return res.json(result);
  } catch (err: any) {
    console.error(`[VehicleLookup] Unexpected server error during lookup for ${normalizedReg}:`, err.message);
    return res.status(500).json({
      success: false,
      providerConfigured: vehicleLookupProvider.isConfigured(),
      registrationNumber: normalizedReg,
      error: 'Internal server error while processing vehicle verification.',
      errorCode: 'SERVER_ERROR',
    });
  }
});

// -------------------------------------------------------------
// CLOUD SQL DATABASE USER ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/users
 * Returns users list directly from Cloud SQL PostgreSQL
 */
app.get('/api/users', async (_req: Request, res: Response) => {
  try {
    const users = await getUsers();
    return res.json({ success: true, users });
  } catch (error: any) {
    console.error('Failed to fetch users from Cloud SQL:', error);
    return res.status(500).json({ error: error.message || 'Failed to fetch users' });
  }
});

/**
 * POST /api/users/sync
 * Upserts user directly into Cloud SQL PostgreSQL database
 */
app.post('/api/users/sync', async (req: Request, res: Response) => {
  try {
    const { id, uid, email, name, phone } = req.body || {};
    const userId = id || uid;

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' });
    }

    const user = await getOrCreateUser(userId, email || '', name || '', phone || '');
    return res.json({ success: true, user });
  } catch (error: any) {
    console.error('Failed to sync user to Cloud SQL:', error);
    return res.status(500).json({ error: error.message || 'Failed to sync user' });
  }
});

// -------------------------------------------------------------
// REAL-TIME MULTI-BROWSER EVENT STREAM (Server-Sent Events)
// -------------------------------------------------------------
const activeSyncClients = new Set<Response>();

app.get('/api/live-sync', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders?.();

  res.write(`data: ${JSON.stringify({ type: 'CONNECTED', timestamp: Date.now() })}\n\n`);

  activeSyncClients.add(res);

  const heartbeat = setInterval(() => {
    try {
      res.write(`data: ${JSON.stringify({ type: 'HEARTBEAT' })}\n\n`);
    } catch {
      clearInterval(heartbeat);
      activeSyncClients.delete(res);
    }
  }, 15000);

  req.on('close', () => {
    clearInterval(heartbeat);
    activeSyncClients.delete(res);
  });
});

export function broadcastDataChange(entity: string, action: string, data?: any) {
  const payload = JSON.stringify({ type: 'DATA_CHANGED', entity, action, data, timestamp: Date.now() });
  for (const client of activeSyncClients) {
    try {
      client.write(`data: ${payload}\n\n`);
    } catch {
      activeSyncClients.delete(client);
    }
  }
}

// -------------------------------------------------------------
// CLOUD SQL COMPLETE MARKETPLACE PERSISTENCE ENDPOINTS
// -------------------------------------------------------------

/**
 * GET /api/vehicles
 * Returns all marketplace vehicles from Cloud SQL
 */
app.get('/api/vehicles', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  try {
    const list = await DbService.getVehicles();
    return res.json({ success: true, vehicles: list });
  } catch (err: any) {
    console.error('Failed to get vehicles from Cloud SQL:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/vehicles/:id
 * Returns single vehicle by ID from Cloud SQL
 */
app.get('/api/vehicles/:id', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const vehicle = await DbService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    return res.json({ success: true, vehicle });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/vehicles
 * Creates or updates vehicle in Cloud SQL
 */
app.post('/api/vehicles', async (req: Request, res: Response) => {
  try {
    const vehicle = req.body;
    if (!vehicle || !vehicle.id) {
      return res.status(400).json({ success: false, error: 'Vehicle payload with ID is required' });
    }
    const saved = await DbService.upsertVehicle(vehicle);
    broadcastDataChange('vehicles', 'CREATE', saved);
    return res.json({ success: true, vehicle: saved });
  } catch (err: any) {
    console.error('Failed to save vehicle in Cloud SQL:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PUT /api/vehicles/:id
 * Updates vehicle in Cloud SQL
 */
app.put('/api/vehicles/:id', async (req: Request, res: Response) => {
  try {
    const vehicle = { ...req.body, id: req.params.id };
    const saved = await DbService.upsertVehicle(vehicle);
    broadcastDataChange('vehicles', 'UPDATE', saved);
    return res.json({ success: true, vehicle: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH /api/vehicles/:id/status
 * Updates status of vehicle in Cloud SQL
 */
app.patch('/api/vehicles/:id/status', async (req: Request, res: Response) => {
  try {
    const { status } = req.body;
    const vehicle = await DbService.getVehicleById(req.params.id);
    if (!vehicle) return res.status(404).json({ success: false, error: 'Vehicle not found' });
    vehicle.status = status;
    const saved = await DbService.upsertVehicle(vehicle);
    broadcastDataChange('vehicles', 'UPDATE', saved);
    return res.json({ success: true, vehicle: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/vehicles/:id
 * Deletes vehicle from Cloud SQL
 */
app.delete('/api/vehicles/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await DbService.deleteVehicle(req.params.id);
    broadcastDataChange('vehicles', 'DELETE', { id: req.params.id });
    return res.json({ success: deleted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/wishlist
 * Returns user's wishlist from Cloud SQL
 */
app.get('/api/wishlist', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const token = extractAuthToken(req);
    const userId = (req.query.userId as string) || (token ? AuthService.getUserFromSession(token)?.id : null);
    if (!userId) return res.json({ success: true, wishlist: [] });
    const list = await DbService.getUserWishlist(userId);
    return res.json({ success: true, wishlist: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/wishlist/toggle
 * Toggles vehicle in user's wishlist in Cloud SQL
 */
app.post('/api/wishlist/toggle', async (req: Request, res: Response) => {
  try {
    const { userId, vehicleId } = req.body;
    if (!userId || !vehicleId) return res.status(400).json({ success: false, error: 'userId and vehicleId required' });
    const list = await DbService.toggleWishlist(userId, vehicleId);
    broadcastDataChange('wishlist', 'TOGGLE', { userId, vehicleId, wishlist: list });
    return res.json({ success: true, wishlist: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/enquiries
 * Returns enquiries from Cloud SQL
 */
app.get('/api/enquiries', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const sellerId = req.query.sellerId as string;
    const buyerId = req.query.buyerId as string;
    const list = await DbService.getEnquiries(sellerId, buyerId);
    return res.json({ success: true, enquiries: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/enquiries
 * Submits enquiry to Cloud SQL
 */
app.post('/api/enquiries', async (req: Request, res: Response) => {
  try {
    const saved = await DbService.createEnquiry(req.body);
    broadcastDataChange('enquiries', 'CREATE', saved);
    return res.json({ success: true, enquiry: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/blogs
 * Returns blogs from Cloud SQL
 */
app.get('/api/blogs', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const list = await DbService.getBlogs();
    return res.json({ success: true, blogs: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/blogs
 * Upserts blog in Cloud SQL
 */
app.post('/api/blogs', async (req: Request, res: Response) => {
  try {
    const saved = await DbService.upsertBlog(req.body);
    broadcastDataChange('blogs', 'UPSERT', saved);
    return res.json({ success: true, blog: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/blogs/:id
 * Deletes blog from Cloud SQL
 */
app.delete('/api/blogs/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await DbService.deleteBlog(req.params.id);
    broadcastDataChange('blogs', 'DELETE', { id: req.params.id });
    return res.json({ success: deleted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/banners
 * Returns banners from Cloud SQL
 */
app.get('/api/banners', async (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const list = await DbService.getBanners();
    return res.json({ success: true, banners: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/banners
 * Upserts banner in Cloud SQL
 */
app.post('/api/banners', async (req: Request, res: Response) => {
  try {
    const saved = await DbService.upsertBanner(req.body);
    broadcastDataChange('banners', 'UPSERT', saved);
    return res.json({ success: true, banner: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * DELETE /api/banners/:id
 * Deletes banner from Cloud SQL
 */
app.delete('/api/banners/:id', async (req: Request, res: Response) => {
  try {
    const deleted = await DbService.deleteBanner(req.params.id);
    broadcastDataChange('banners', 'DELETE', { id: req.params.id });
    return res.json({ success: deleted });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * GET /api/orders
 * Returns orders from Cloud SQL
 */
app.get('/api/orders', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const userId = req.query.userId as string;
    const list = await DbService.getOrders(userId);
    return res.json({ success: true, orders: list });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/orders
 * Creates order in Cloud SQL
 */
app.post('/api/orders', async (req: Request, res: Response) => {
  try {
    const saved = await DbService.createOrder(req.body);
    broadcastDataChange('orders', 'CREATE', saved);
    return res.json({ success: true, order: saved });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


/**
 * GET /api/contact-submissions
 * Returns all Help Center / Contact inquiries
 */
app.get('/api/contact-submissions', (_req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  try {
    const submissions = readContactSubmissions();
    return res.json({ success: true, submissions });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * POST /api/contact-submissions
 * Submits a new inquiry from the Help Center contact form and broadcasts to Admin Portal
 */
app.post('/api/contact-submissions', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const body = req.body || {};
    const newSubmission = {
      id: body.id || `cnt-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: String(body.name || 'Visitor').trim(),
      email: String(body.email || 'Not provided').trim(),
      phone: String(body.phone || '').trim(),
      subject: String(body.subject || 'General Inquiry').trim(),
      message: String(body.message || '').trim(),
      status: body.status || 'new',
      assignedTo: body.assignedTo || 'Support Desk',
      adminNotes: body.adminNotes || '',
      createdAt: body.createdAt || new Date().toISOString()
    };

    const current = readContactSubmissions();
    const updated = [newSubmission, ...current.filter(c => c.id !== newSubmission.id)];
    writeContactSubmissions(updated);
    broadcastDataChange('contacts', 'CREATE', newSubmission);

    return res.status(201).json({ success: true, submission: newSubmission, submissions: updated });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});

/**
 * PATCH/PUT /api/contact-submissions/:id
 * Updates status or adminNotes of a Help Center inquiry in Admin Portal
 */
const handleUpdateContactSubmission = (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const { id } = req.params;
    const updates = req.body || {};
    const current = readContactSubmissions();
    let updatedItem: any = null;
    const nextList = current.map(item => {
      if (item.id === id) {
        updatedItem = {
          ...item,
          ...updates,
          ...(updates.status === 'resolved' || updates.status === 'read' ? { readAt: new Date().toISOString() } : {})
        };
        return updatedItem;
      }
      return item;
    });

    if (!updatedItem) {
      return res.status(404).json({ success: false, error: 'Inquiry not found' });
    }

    writeContactSubmissions(nextList);
    broadcastDataChange('contacts', 'UPDATE', updatedItem);
    return res.json({ success: true, submission: updatedItem, submissions: nextList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

app.patch('/api/contact-submissions/:id', handleUpdateContactSubmission);
app.put('/api/contact-submissions/:id', handleUpdateContactSubmission);

/**
 * DELETE /api/contact-submissions/:id
 * Deletes a Help Center inquiry from Admin Portal
 */
app.delete('/api/contact-submissions/:id', (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
  try {
    const { id } = req.params;
    const current = readContactSubmissions();
    const nextList = current.filter(item => item.id !== id);
    writeContactSubmissions(nextList);
    broadcastDataChange('contacts', 'DELETE', { id });
    return res.json({ success: true, submissions: nextList });
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err.message });
  }
});


/**
 * POST /api/account-deletion
 * Google Play Account & Data Deletion Compliance Endpoint
 * Records and processes account deletion requests both from inside the Android app and via https://onroadpriz.com/account-deletion
 */
app.post('/api/account-deletion', async (req: Request, res: Response) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, private');
  try {
    const { mobileNumber, reason } = req.body || {};
    const canonicalMobile = normalizeIndianMobile(mobileNumber);
    if (!canonicalMobile) {
      return res.status(400).json({
        success: false,
        error: 'Please enter a valid 10-digit registered Indian mobile number.'
      });
    }

    await AuthService.ensureSyncedWithDb();
    const token = extractAuthToken(req);
    const sessionUser = token ? AuthService.getUserFromSession(token) : null;
    const matchedUser = AuthService.findUserByMobile(canonicalMobile);

    // Log deletion request in Admin Help Center / Compliance registry
    const deletionTicket = {
      id: `del-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: matchedUser?.name || sessionUser?.name || `Account Holder (${canonicalMobile})`,
      email: matchedUser?.email || sessionUser?.email || 'Not provided',
      phone: canonicalMobile,
      subject: 'Account & Data Deletion Request (Play Store Compliance)',
      message: `Account deletion requested for registered mobile ${canonicalMobile}. Reason: ${reason || 'User requested account termination'}.`,
      status: 'new',
      assignedTo: 'Compliance & Data Protection Officer',
      adminNotes: matchedUser ? `Matched User ID: ${matchedUser.id}` : 'Submitted via public deletion portal',
      createdAt: new Date().toISOString()
    };

    const currentSubmissions = readContactSubmissions();
    const updatedSubmissions = [deletionTicket, ...currentSubmissions];
    writeContactSubmissions(updatedSubmissions);
    broadcastDataChange('contacts', 'CREATE', deletionTicket);

    // If the authenticated user matches the mobile number being deleted, immediately terminate session and remove user account
    if (sessionUser && matchedUser && sessionUser.id === matchedUser.id && sessionUser.role !== 'Super Admin') {
      AuthService.destroySession(token!);
      AuthService.deleteUser(matchedUser.id);
      try {
        await DbService.deleteUser(matchedUser.id);
      } catch (dbErr) {
        console.warn('[CloudSQL] Error removing deleted user from DB:', dbErr);
      }
      broadcastDataChange('users', 'DELETE', { id: matchedUser.id });
    }

    return res.status(200).json({
      success: true,
      requestId: deletionTicket.id,
      mobileNumber: canonicalMobile,
      immediateDeletion: Boolean(sessionUser && matchedUser && sessionUser.id === matchedUser.id),
      message: 'Your account and personal data deletion request has been registered and processed.'
    });
  } catch (err: any) {
    console.error('[AccountDeletion] Error processing request:', err);
    return res.status(500).json({
      success: false,
      error: 'Unable to process account deletion request at this time. Please contact support@onroadpriz.com.'
    });
  }
});

// -------------------------------------------------------------
// ANDROID RELEASE ARTIFACTS DOWNLOAD ENDPOINTS (AAB / APK / KEYSTORE)
// -------------------------------------------------------------
app.get(['/api/download/aab', '/OnRoadPriz-v1.0.0-release.aab', '/app-release.aab'], (_req: Request, res: Response) => {
  const candidates = [
    path.resolve(__dirname, 'android', 'app', 'build', 'outputs', 'bundle', 'release', 'app-release.aab'),
    path.resolve(__dirname, 'public', 'downloads', 'OnRoadPriz-v1.0.0-release.aab')
  ];
  const found = candidates.find(p => fs.existsSync(p));
  if (!found) {
    return res.status(404).json({ error: 'Signed AAB file is still compiling or not found.' });
  }
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="OnRoadPriz-v1.0.0-release.aab"');
  return res.sendFile(found);
});

app.get(['/api/download/apk', '/OnRoadPriz-v1.0.0-release.apk', '/app-release.apk'], (_req: Request, res: Response) => {
  const candidates = [
    path.resolve(__dirname, 'android', 'app', 'build', 'outputs', 'apk', 'release', 'app-release.apk'),
    path.resolve(__dirname, 'public', 'downloads', 'OnRoadPriz-v1.0.0-release.apk')
  ];
  const found = candidates.find(p => fs.existsSync(p));
  if (!found) {
    return res.status(404).json({ error: 'Signed APK file is still compiling or not found.' });
  }
  res.setHeader('Content-Type', 'application/vnd.android.package-archive');
  res.setHeader('Content-Disposition', 'attachment; filename="OnRoadPriz-v1.0.0-release.apk"');
  return res.sendFile(found);
});

app.get('/api/download/keystore', (_req: Request, res: Response) => {
  const keystorePath = path.resolve(__dirname, 'android', 'app', 'upload-keystore.jks');
  if (!fs.existsSync(keystorePath)) {
    return res.status(404).json({ error: 'Upload keystore not found.' });
  }
  res.setHeader('Content-Type', 'application/octet-stream');
  res.setHeader('Content-Disposition', 'attachment; filename="onroadpriz-upload-keystore.jks"');
  return res.sendFile(keystorePath);
});

// -------------------------------------------------------------
// 2. VITE MIDDLEWARE (DEV) / STATIC SERVING (PROD)
// -------------------------------------------------------------

async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: process.env.DISABLE_HMR !== 'true',
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`[OnRoadPriz] Enterprise Server running at http://0.0.0.0:${port}`);
    console.log(`[OnRoadPriz] Vehicle Verification Provider: ${vehicleLookupProvider.name} (Configured: ${vehicleLookupProvider.isConfigured()})`);

    // Run Cloud SQL seeding and state restoration asynchronously so port 3000 is available immediately
    (async () => {
      try {
        await DbService.seedIfEmpty();
        await AuthService.syncFromDatabase();
        await SecretsManager.init();

        // Always restore authoritative site settings from Cloud SQL so republishing never reverts admin settings
        const dbSettings = await DbService.getSiteSettings();
        if (dbSettings && typeof dbSettings === 'object') {
          fs.writeFileSync(
            SETTINGS_FILE_PATH,
            JSON.stringify({ ...DEFAULT_GLOBAL_SETTINGS, ...dbSettings }, null, 2),
            'utf-8'
          );
        }

        // Always restore contact submissions from Cloud SQL
        const dbContacts = await DbService.getContactSubmissions();
        if (Array.isArray(dbContacts)) {
          fs.writeFileSync(
            CONTACT_SUBMISSIONS_FILE_PATH,
            JSON.stringify(dbContacts, null, 2),
            'utf-8'
          );
        }

        // Restore any uploaded branding assets from Cloud SQL into uploadsDir
        const brandingAssets = await DbService.getBrandingAssets();
        for (const [assetPath, dataUrl] of Object.entries(brandingAssets)) {
          const matches = typeof dataUrl === 'string' ? dataUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/) : null;
          if (matches && matches.length === 3) {
            const filename = path.basename(assetPath);
            const dest = path.join(uploadsDir, filename);
            if (!fs.existsSync(dest)) {
              fs.writeFileSync(dest, Buffer.from(matches[2], 'base64'));
            }
          }
        }
        console.log('[OnRoadPriz] Cloud SQL Database: Active and Connected');
      } catch (seedErr) {
        console.error('[CloudSQL] Pre-boot seeding warning:', seedErr);
      }
    })();
  });
}

startServer().catch(err => {
  console.error('[OnRoadPriz] Failed to start server:', err);
  process.exit(1);
});
