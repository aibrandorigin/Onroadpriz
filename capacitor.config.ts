import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'in.brandorigin.onroadpriz',
  appName: 'OnRoadPriz',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    cleartext: false,
    allowNavigation: [
      'onroadpriz.com',
      '*.onroadpriz.com',
      'brandorigin.in',
      '*.run.app'
    ]
  },
  android: {
    buildOptions: {
      keystorePath: undefined,
      releaseType: 'AAB'
    }
  }
};

export default config;
