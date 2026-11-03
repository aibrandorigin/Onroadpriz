import { ConfirmedLocation, LocationAccuracyTier } from '../types';
import { Capacitor } from '@capacitor/core';
import { AndroidNativeService } from './androidNativeService';

export interface GeolocationResult {
  status: 'granted' | 'denied' | 'unavailable' | 'timeout' | 'unsupported';
  latitude?: number;
  longitude?: number;
  accuracy?: number; // In meters
  accuracyTier?: LocationAccuracyTier;
  timestamp?: number;
  error?: string;
}

export interface ReverseGeocodeResponse {
  success: boolean;
  city?: string;
  state?: string;
  locality?: string;
  area?: string;
  premise?: string;
  street?: string;
  district?: string;
  postal_code?: string;
  country?: string;
  formatted_address?: string;
  location_name?: string;
  short_display?: string;
  source?: string;
  error?: string;
}

export const ACCURACY_THRESHOLDS = {
  HIGH_MAX: 25,    // <= 25m: HIGH accuracy
  MEDIUM_MAX: 100  // 26m - 100m: MEDIUM accuracy, > 100m: LOW accuracy
};

export function classifyAccuracy(meters: number): LocationAccuracyTier {
  if (meters <= ACCURACY_THRESHOLDS.HIGH_MAX) return 'HIGH';
  if (meters <= ACCURACY_THRESHOLDS.MEDIUM_MAX) return 'MEDIUM';
  return 'LOW';
}

/**
 * Request high-precision device location using Native Android Geolocation (when inside Capacitor)
 * or the standard Browser Geolocation API.
 * Follows strict production guidelines:
 * - enableHighAccuracy: true, timeout: 15000, maximumAge: 0
 * - If initial reading has poor accuracy (>25m), temporarily uses watchPosition to refine reading
 * - Always clears watch after reading completes (no continuous background tracking)
 * - Returns exact device-reported accuracy in meters
 */
export async function getHighAccuracyDeviceLocation(
  onProgress?: (message: string) => void
): Promise<GeolocationResult> {
  onProgress?.('Requesting device location permission...');

  // If running inside Capacitor Android app, trigger native Android runtime location permission first
  if (Capacitor.isNativePlatform()) {
    const nativeCoords = await AndroidNativeService.getCurrentCoordinates();
    if (nativeCoords) {
      const accuracy = Math.round(nativeCoords.accuracy || 15);
      return {
        status: 'granted',
        latitude: nativeCoords.latitude,
        longitude: nativeCoords.longitude,
        accuracy,
        accuracyTier: classifyAccuracy(accuracy),
        timestamp: Date.now()
      };
    }
  }

  if (typeof window === 'undefined' || !('geolocation' in navigator)) {
    return {
      status: 'unsupported',
      error: 'Browser geolocation is not supported on this device. Please select your location manually.'
    };
  }

  return new Promise((resolve) => {
    let watchId: number | null = null;
    let watchTimeoutId: any = null;
    let bestCoords: GeolocationCoordinates | null = null;
    let bestTimestamp: number = Date.now();
    let isSettled = false;

    const cleanupWatch = () => {
      if (watchTimeoutId) {
        clearTimeout(watchTimeoutId);
        watchTimeoutId = null;
      }
      if (watchId !== null) {
        try {
          navigator.geolocation.clearWatch(watchId);
        } catch {
          // ignore
        }
        watchId = null;
      }
    };

    const finishWithCoords = (coords: GeolocationCoordinates, timestamp: number) => {
      if (isSettled) return;
      isSettled = true;
      cleanupWatch();

      const accuracy = Math.round(coords.accuracy);
      const tier = classifyAccuracy(accuracy);

      resolve({
        status: 'granted',
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy,
        accuracyTier: tier,
        timestamp
      });
    };

    // 1. Initial high-accuracy one-shot reading
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = position.coords;
        bestCoords = coords;
        bestTimestamp = position.timestamp;

        // If accuracy is already <= 25m (HIGH accuracy), use it immediately!
        if (coords.accuracy <= ACCURACY_THRESHOLDS.HIGH_MAX) {
          finishWithCoords(coords, position.timestamp);
          return;
        }

        // If accuracy is > 25m, temporarily start watchPosition to refine reading
        onProgress?.(`Initial accuracy: ±${Math.round(coords.accuracy)}m. Refining GPS signal...`);

        try {
          watchId = navigator.geolocation.watchPosition(
            (watchPos) => {
              const currentCoords = watchPos.coords;
              if (!bestCoords || currentCoords.accuracy < bestCoords.accuracy) {
                bestCoords = currentCoords;
                bestTimestamp = watchPos.timestamp;
                onProgress?.(`Refined accuracy: ±${Math.round(currentCoords.accuracy)}m`);
              }

              // Stop as soon as high accuracy threshold is reached
              if (currentCoords.accuracy <= ACCURACY_THRESHOLDS.HIGH_MAX) {
                finishWithCoords(currentCoords, watchPos.timestamp);
              }
            },
            (watchError) => {
              // Ignore watch errors, fall back to best initial reading
              console.warn('[Geolocation Watch] Non-fatal error:', watchError.message);
            },
            {
              enableHighAccuracy: true,
              timeout: 8000,
              maximumAge: 0
            }
          );

          // Stop watching after 6 seconds maximum to avoid battery drain or delay
          watchTimeoutId = setTimeout(() => {
            if (!isSettled && bestCoords) {
              finishWithCoords(bestCoords, bestTimestamp);
            }
          }, 6000);
        } catch {
          // If watchPosition fails, settle with initial position
          finishWithCoords(coords, position.timestamp);
        }
      },
      (error) => {
        cleanupWatch();
        isSettled = true;

        if (error.code === error.PERMISSION_DENIED) {
          resolve({
            status: 'denied',
            error: 'Location permission required for precise location.'
          });
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          resolve({
            status: 'unavailable',
            error: 'Location information is unavailable on this device.'
          });
        } else if (error.code === error.TIMEOUT) {
          resolve({
            status: 'timeout',
            error: 'Location request timed out. Please try again or select manually.'
          });
        } else {
          resolve({
            status: 'unavailable',
            error: error.message || 'Unable to retrieve location.'
          });
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      }
    );
  });
}

/**
 * Send coordinates to backend production reverse geocoder
 */
export async function reverseGeocodeCoordinates(
  latitude: number,
  longitude: number,
  accuracy?: number
): Promise<ReverseGeocodeResponse> {
  try {
    const res = await fetch('/api/location/detect', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude,
        longitude,
        accuracy: typeof accuracy === 'number' ? accuracy : undefined
      })
    });

    const data = await res.json();
    if (!res.ok || !data.success) {
      return {
        success: false,
        error: data.error || 'Failed to reverse geocode coordinates.'
      };
    }

    return {
      success: true,
      city: data.city,
      state: data.state,
      locality: data.locality,
      area: data.area || data.locality,
      premise: data.premise,
      street: data.street,
      district: data.district,
      postal_code: data.postal_code,
      country: data.country || 'India',
      formatted_address: data.formatted_address,
      location_name: data.location_name,
      short_display: data.short_display,
      source: data.source || 'DEVICE_GEOLOCATION'
    };
  } catch (err: any) {
    return {
      success: false,
      error: err.message || 'Network error while contacting reverse geocoding service.'
    };
  }
}
