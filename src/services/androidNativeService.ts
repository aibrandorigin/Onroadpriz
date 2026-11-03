import { App as CapApp } from '@capacitor/app';
import { StatusBar, Style } from '@capacitor/status-bar';
import { Network, ConnectionStatus } from '@capacitor/network';
import { Camera, CameraResultType, CameraSource, PermissionStatus } from '@capacitor/camera';
import { Geolocation, Position } from '@capacitor/geolocation';
import { Capacitor } from '@capacitor/core';

export interface AndroidNativeConfig {
  onBackPress?: () => boolean; // return true if handled, false to perform default
  onDeepLink?: (url: string) => void;
  onNetworkChange?: (status: ConnectionStatus) => void;
}

export class AndroidNativeService {
  private static isInitialized = false;
  private static currentConfig: AndroidNativeConfig = {};

  public static async init(config: AndroidNativeConfig = {}) {
    this.currentConfig = config;
    if (this.isInitialized) return;
    this.isInitialized = true;

    if (!Capacitor.isNativePlatform()) {
      return;
    }

    try {
      // 1. Status Bar Setup
      await StatusBar.setStyle({ style: Style.Dark });
      await StatusBar.setBackgroundColor({ color: '#77101F' });
      await StatusBar.setOverlaysWebView({ overlay: false });
    } catch (err) {
      console.warn('[AndroidNative] StatusBar error:', err);
    }

    try {
      // 2. Hardware Back Button Handling
      CapApp.addListener('backButton', ({ canGoBack }) => {
        if (this.currentConfig.onBackPress && this.currentConfig.onBackPress()) {
          // Handled by active modal or sub-navigation
          return;
        }

        if (canGoBack) {
          window.history.back();
        } else {
          // Exit or minimize app on root screen
          CapApp.exitApp();
        }
      });
    } catch (err) {
      console.warn('[AndroidNative] Back button setup error:', err);
    }

    try {
      // 3. Deep Link Handling
      CapApp.addListener('appUrlOpen', (event) => {
        console.log('[AndroidNative] Deep link opened:', event.url);
        if (this.currentConfig.onDeepLink) {
          this.currentConfig.onDeepLink(event.url);
        }
      });
    } catch (err) {
      console.warn('[AndroidNative] Deep link setup error:', err);
    }

    try {
      // 4. Network Status Monitoring
      Network.addListener('networkStatusChange', (status) => {
        if (this.currentConfig.onNetworkChange) {
          this.currentConfig.onNetworkChange(status);
        }
      });
    } catch (err) {
      console.warn('[AndroidNative] Network status error:', err);
    }
  }

  /**
   * Capture photo using native Camera or select from Gallery
   */
  public static async captureImage(source: 'camera' | 'photos' = 'camera'): Promise<string | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.DataUrl,
        source: source === 'camera' ? CameraSource.Camera : CameraSource.Photos,
        width: 1600,
        correctOrientation: true
      });

      return image.dataUrl || null;
    } catch (err: any) {
      if (err.message && !err.message.includes('cancelled') && !err.message.includes('User cancelled')) {
        console.error('[AndroidNative] Camera error:', err);
      }
      return null;
    }
  }

  /**
   * Request precise location via Android Native Geolocation
   */
  public static async getCurrentCoordinates(): Promise<{ latitude: number; longitude: number; accuracy: number } | null> {
    if (!Capacitor.isNativePlatform()) {
      return null;
    }

    try {
      const perm = await Geolocation.checkPermissions();
      if (perm.location !== 'granted') {
        const req = await Geolocation.requestPermissions({ permissions: ['location'] });
        if (req.location !== 'granted') {
          return null;
        }
      }

      const position: Position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0
      });

      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy
      };
    } catch (err) {
      console.warn('[AndroidNative] Native geolocation error:', err);
      return null;
    }
  }

  /**
   * Check current network connectivity
   */
  public static async getNetworkStatus(): Promise<ConnectionStatus> {
    try {
      return await Network.getStatus();
    } catch {
      return { connected: true, connectionType: 'unknown' };
    }
  }
}
