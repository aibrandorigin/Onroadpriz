import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';

/**
 * Canonical global master logo for OnRoadPriz
 * Single source of truth across desktop, mobile, admin, footer, and auth
 */
export const CANONICAL_BRAND_LOGO = '/branding/onroadpriz-logo.png';

export interface BrandLogoProps {
  /**
   * Logo display target:
   * - 'header': Desktop & top navbar header (responsive 38-50px)
   * - 'mobile': Mobile drawer / compact viewport header (34-40px)
   * - 'admin': Admin portal header / staff login / admin dashboard
   * - 'footer': Website footer
   * - 'auth': Login, Signup, Forgot password, checkout payment modals
   * - 'website': General public marketplace branding
   */
  variant?: 'header' | 'mobile' | 'admin' | 'footer' | 'auth' | 'website';
  /**
   * Compact mode for collapsed admin sidebar: shows supported compact brand mark icon
   */
  compact?: boolean;
  /**
   * Tailwind class for the rendered <img> element
   */
  className?: string;
  /**
   * Optional wrapper container class
   */
  containerClassName?: string;
  /**
   * Size presets (optional override)
   */
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'custom';
  /**
   * Optional legacy compatibility props
   */
  showText?: boolean;
  showTagline?: boolean;
  badgeType?: 'direct' | 'admin' | 'none';
  /**
   * Click handler
   */
  onClick?: () => void;
  /**
   * Custom alt text
   */
  alt?: string;
}

/**
 * Utility to generate cache-busting versioned asset URL
 * Example: /branding/onroadpriz-logo.png?v=4
 */
export function getVersionedAssetUrl(url?: string, version: number = 1): string {
  if (!url || typeof url !== 'string') return '';
  const cleanUrl = url.trim();
  if (!cleanUrl) return '';
  if (cleanUrl.startsWith('data:') || cleanUrl.startsWith('blob:')) return cleanUrl;
  const separator = cleanUrl.includes('?') ? '&' : '?';
  return `${cleanUrl}${separator}v=${version || 1}`;
}

/**
 * Global DOM helper to dynamically update browser favicon across all tabs and browsers
 */
export function updateDocumentFavicon(faviconUrl?: string, faviconVersion: number = 1): void {
  if (typeof document === 'undefined') return;
  const targetUrl = faviconUrl 
    ? getVersionedAssetUrl(faviconUrl, faviconVersion)
    : `/favicon.svg?v=${faviconVersion || 1}`;

  const rels = ['icon', 'alternate icon', 'shortcut icon', 'apple-touch-icon'];
  rels.forEach(rel => {
    let link: HTMLLinkElement | null = document.querySelector(`link[rel='${rel}']`);
    if (!link) {
      link = document.createElement('link');
      link.rel = rel;
      document.head.appendChild(link);
    }
    link.href = targetUrl;
  });
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'header',
  compact = false,
  className = '',
  containerClassName = '',
  size,
  showText = false,
  showTagline = false,
  badgeType = 'none',
  onClick,
  alt
}) => {
  const { settings } = useApp();
  const [customImageFailed, setCustomImageFailed] = useState(false);
  const [canonicalFailed, setCanonicalFailed] = useState(false);

  // If in collapsed admin sidebar, render supported compact brand mark (do not crop or squash full logo)
  if (compact) {
    return (
      <div 
        className={`w-10 h-10 rounded-xl bg-[#77101F] text-white flex items-center justify-center font-black text-sm tracking-tight shadow-xs select-none shrink-0 transition-transform active:scale-95 ${containerClassName}`}
        onClick={onClick}
        title="OnRoadPriz"
        role={onClick ? 'button' : undefined}
      >
        ORP
      </div>
    );
  }

  // 1. Resolve configured logo from authoritative global site settings
  let configuredLogo = '';
  let logoVersion = 1;

  if (variant === 'mobile' && settings?.mobileLogo) {
    configuredLogo = settings.mobileLogo;
    logoVersion = settings.mobileLogoVersion || settings.logoVersion || 1;
  } else if (variant === 'admin' && settings?.adminLogo) {
    configuredLogo = settings.adminLogo;
    logoVersion = settings.adminLogoVersion || settings.logoVersion || 1;
  } else {
    configuredLogo = settings?.logoUrl || settings?.websiteLogo || settings?.logo_url || '';
    logoVersion = settings?.logoVersion || settings?.logo_version || 1;
  }

  // Fallback to canonical master logo if not configured
  const effectiveLogoUrl = (configuredLogo && configuredLogo.trim()) 
    ? configuredLogo.trim() 
    : CANONICAL_BRAND_LOGO;

  // Cache-busted versioned URL
  const currentLogoUrl = customImageFailed 
    ? getVersionedAssetUrl(CANONICAL_BRAND_LOGO, 1) 
    : getVersionedAssetUrl(effectiveLogoUrl, logoVersion);

  // Reset failures when configured logo or version changes
  useEffect(() => {
    setCustomImageFailed(false);
    setCanonicalFailed(false);
  }, [effectiveLogoUrl, logoVersion]);

  // Dimensions per variant according to display rules
  // - Wide horizontal aspect ratio preserved with object-fit: contain
  // - Never stretch, never squash, never cover
  // - Header: Laptop screen scaled up (lg:h-[58px] xl:h-[64px]), Mobile 34-40px (h-[38px])
  let variantDimensionClass = 'h-[38px] sm:h-[46px] md:h-[50px] lg:h-[58px] xl:h-[64px] w-auto max-w-[175px] sm:max-w-[220px] md:max-w-[260px] lg:max-w-[320px] xl:max-w-[360px] object-contain transition-all duration-200';

  if (variant === 'header') {
    variantDimensionClass = 'h-[18px] max-h-[20px] sm:h-[48px] sm:max-h-none md:h-[54px] lg:h-[64px] xl:h-[72px] w-auto max-w-[75px] sm:max-w-[240px] md:max-w-[280px] lg:max-w-[350px] xl:max-w-[400px] object-contain transition-all duration-200 shrink-0';
  } else if (variant === 'mobile') {
    variantDimensionClass = 'h-[30px] max-h-[34px] w-auto max-w-[125px] sm:max-w-[160px] object-contain';
  } else if (variant === 'admin') {
    variantDimensionClass = 'h-[42px] sm:h-[46px] w-auto max-w-[220px] object-contain';
  } else if (variant === 'footer') {
    variantDimensionClass = 'h-[44px] sm:h-[48px] w-auto max-w-[230px] object-contain';
  } else if (variant === 'auth') {
    variantDimensionClass = 'h-[44px] sm:h-[48px] w-auto max-w-[230px] object-contain';
  } else if (variant === 'website') {
    variantDimensionClass = 'h-[42px] sm:h-[48px] w-auto max-w-[240px] object-contain';
  }

  // Size override if explicitly specified
  if (size === 'sm') variantDimensionClass = 'h-7 max-h-8 w-auto object-contain';
  else if (size === 'md') variantDimensionClass = 'h-10 max-h-12 w-auto object-contain';
  else if (size === 'lg') variantDimensionClass = 'h-12 max-h-14 w-auto object-contain';
  else if (size === 'xl') variantDimensionClass = 'h-16 max-h-20 w-auto object-contain';

  const finalImgClass = className ? `${className} object-contain` : variantDimensionClass;
  const siteTitle = settings?.siteName || 'OnRoadPriz';

  // If primary or canonical logo loads
  if (!canonicalFailed) {
    return (
      <div 
        className={`inline-flex items-center select-none ${containerClassName}`}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
      >
        <img
          src={currentLogoUrl}
          alt={alt || siteTitle}
          className={finalImgClass}
          loading="eager"
          decoding="async"
          onError={() => {
            if (!customImageFailed && effectiveLogoUrl !== CANONICAL_BRAND_LOGO) {
              console.warn(`[BrandLogo] Custom logo failed (${effectiveLogoUrl}), falling back to master brand asset.`);
              setCustomImageFailed(true);
            } else {
              console.warn('[BrandLogo] Canonical asset offline, activating vector fallback.');
              setCanonicalFailed(true);
            }
          }}
        />
        {/* Optional supplemental badge for admin views */}
        {badgeType === 'admin' && (
          <span className="ml-2 text-[9px] font-black uppercase tracking-wider bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-mono">
            ADMIN
          </span>
        )}
      </div>
    );
  }

  // Emergency Vector Fallback if offline
  return (
    <div 
      className={`inline-flex items-center gap-2 select-none ${containerClassName}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
    >
      <div className={`rounded-xl bg-[#77101F] text-white flex items-center justify-center font-black shadow-xs shrink-0 ${
        variant === 'header' ? 'w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-xs sm:text-sm lg:text-base' : 'w-10 h-10 text-sm'
      }`}>
        ORP
      </div>
      <div className="flex flex-col text-left">
        <span className={`font-black text-[#77101F] tracking-tight font-display leading-tight ${
          variant === 'header' ? 'text-base sm:text-2xl lg:text-3xl' : 'text-xl sm:text-2xl'
        }`}>
          {siteTitle}
        </span>
        <span className={`font-bold text-[#667085] tracking-widest uppercase ${
          variant === 'header' ? 'text-[8px] sm:text-[9px] lg:text-[10px]' : 'text-[9px]'
        }`}>
          0% BROKERAGE MARKETPLACE
        </span>
      </div>
    </div>
  );
};
