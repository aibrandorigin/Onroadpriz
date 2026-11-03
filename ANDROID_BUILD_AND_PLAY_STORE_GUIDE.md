# OnRoadPriz Android Application (`in.brandorigin.onroadpriz`) — Build & Play Store Release Guide

## 1. Application Metadata & Configuration
- **Application Name**: `OnRoadPriz`
- **Package Name / Application ID**: `in.brandorigin.onroadpriz`
- **Production Backend URL**: `https://onroadpriz.com`
- **Version Code**: `1`
- **Version Name**: `1.0.0`
- **Minimum SDK**: `24` (Android 7.0)
- **Target & Compile SDK**: `35` (Android 15)
- **Brand Theme**: White (`#FFFFFF`) & Maroon (`#77101F`)

---

## 2. Synchronizing Web Assets into the Android Project
Whenever frontend changes are made, build the production web bundle and synchronize Capacitor native plugins and assets:

```bash
npm run build
npx cap sync android
```

This populates `android/app/src/main/assets/public` and updates `android/app/src/main/assets/capacitor.config.json` and `android/app/src/main/assets/capacitor.plugins.json`.

---

## 3. Owner-Controlled Release Signing Setup (Zero Exposed Keys)
No private keystore file (`.jks`) or hardcoded passwords are stored in the repository.

### Step 3.1: Generate Your Private Upload Keystore (if you do not already have one)
Run the following `keytool` command locally inside the `android/app/` directory (keep the generated `.jks` file backed up securely):

```bash
keytool -genkeypair -v \
  -keystore android/app/upload-keystore.jks \
  -alias onroadpriz-upload \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

### Step 3.2: Configure `android/keystore.properties` (Git-Ignored)
Copy `android/keystore.properties.example` to `android/keystore.properties` (which is ignored by Git) and fill in your private credentials:

```properties
storeFile=upload-keystore.jks
storePassword=YOUR_PRIVATE_STORE_PASSWORD
keyAlias=onroadpriz-upload
keyPassword=YOUR_PRIVATE_KEY_PASSWORD
```

*(Alternatively, you can pass `RELEASE_STORE_FILE`, `RELEASE_STORE_PASSWORD`, `RELEASE_KEY_ALIAS`, and `RELEASE_KEY_PASSWORD` as environment variables in CI/CD.)*

---

## 4. Building `app-release.apk` and `app-release.aab`
Ensure **JDK 21** (bundled with Android Studio Ladybug / Meerkat or installed via OpenJDK 21) and the **Android SDK (API 35)** are installed on your build machine.

From the `android/` directory:

```bash
cd android

# 1. Build Installable Signed Release APK
./gradlew assembleRelease

# 2. Build Signed Android App Bundle (AAB) for Google Play Console
./gradlew bundleRelease
```

### Generated Output Paths:
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`
- **Release AAB**: `android/app/build/outputs/bundle/release/app-release.aab`

### Verifying Signature Validity:
```bash
# Verify APK signature
apksigner verify --verbose android/app/build/outputs/apk/release/app-release.apk

# Verify AAB signature
jarsigner -verify -verbose -certs android/app/build/outputs/bundle/release/app-release.aab
```

---

## 5. Google Play Payments Policy Review (Buyer & Seller Plans)
- **Seller Plans (Classified Listing Packages)**: Listing fees for physical goods (cars, bikes, commercial trucks, buses, tractors, heavy machinery) allow sellers to advertise real-world physical vehicles for sale. However, Google Play's Payments Policy treats in-app paid classified listing placements and digital contact-unlock passes ("Buyer Plans" / Owner Access unlocks consumed inside the app) carefully.
- **Compliance Options for Google Play Console (India)**:
  1. **Google Play Billing / User Choice Billing (India)**: In India, Google Play supports alternative billing systems alongside Play Billing under the **User Choice Billing (UCB)** program, or standard Google Play Billing (`com.android.billingclient:billing`) for digital membership tiers.
  2. **Account-Level Web Subscription Sync**: Because OnRoadPriz synchronizes user accounts, Buyer Plans, and Seller Plans in real time via the production database (`https://onroadpriz.com`), any plan purchased on the web (`https://onroadpriz.com`) is immediately active inside the Android app until its actual expiry timestamp (`expiresAt`).
