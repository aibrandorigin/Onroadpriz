import { Capacitor } from '@capacitor/core';

/**
 * OnRoadPriz Production API Configuration
 * Single Source of Truth for Web & Android
 */
export const PRODUCTION_API_URL = 'https://onroadpriz.com';

export function isNativeAndroid(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android';
}

export function getApiBaseUrl(): string {
  // If explicitly overridden via Vite env
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }

  // Inside Capacitor native Android container, routes must hit production backend
  if (Capacitor.isNativePlatform()) {
    return PRODUCTION_API_URL;
  }

  // Web SPA in browser uses relative paths
  return '';
}

/**
 * Normalizes any relative or absolute API URL
 */
export function resolveApiUrl(path: string): string {
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }

  const base = getApiBaseUrl();
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${base}${cleanPath}`;
}

/**
 * Installs transparent global fetch proxy on Android native startup
 * Guarantees that all legacy and future `fetch('/api/...')` calls
 * route directly to the production backend https://onroadpriz.com
 */
export function initNativeNetworkProxy(): void {
  if (typeof window === 'undefined') return;

  // Crucial: Only attempt to proxy fetch on native mobile platforms (Android/iOS)
  // In standard web browser environments, window.fetch must never be modified
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    const originalFetch = window.fetch.bind(window);

    const proxyFetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
      let urlString = typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url;

      if (urlString.startsWith('/api') || urlString.startsWith('/uploads') || urlString.startsWith('/branding')) {
        urlString = resolveApiUrl(urlString);
        if (typeof input === 'string' || input instanceof URL) {
          input = urlString;
        } else {
          input = new Request(urlString, init || input);
        }
      }

      return originalFetch(input, init);
    };

    try {
      Object.defineProperty(window, 'fetch', {
        value: proxyFetch,
        writable: true,
        configurable: true
      });
    } catch {
      try {
        (window as any).fetch = proxyFetch;
      } catch {
        // If window.fetch cannot be overwritten, fail gracefully without crashing
      }
    }

    console.log(`[OnRoadPriz] Native network proxy initialized. Platform: ${Capacitor.getPlatform()}, Base API: ${getApiBaseUrl()}`);
  } catch (err) {
    console.warn('[OnRoadPriz] Failed to initialize native network proxy:', err);
  }
}
