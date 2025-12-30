# Mobile App Installation & Setup Guide

This guide walks you through setting up the mobile app with native Google OAuth.

## Prerequisites

- Node.js 18+
- iOS: Xcode 14+ and CocoaPods
- Android: Android Studio and JDK 11+
- Google Cloud Console account

---

## Step 1: Install Dependencies

```bash
cd apps/client-mobile
npm install
```

For iOS, also install CocoaPods:

```bash
cd ios
pod install
cd ..
```

---

## Step 2: Google Cloud Console Setup

### Create OAuth Clients for Mobile

You need **three separate** OAuth clients:
1. **Web client** (already exists for your web app)
2. **iOS client** (new)
3. **Android client** (new)

### A. Create iOS OAuth Client

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services → Credentials**
3. Click **Create Credentials → OAuth client ID**
4. Choose **iOS** as application type
5. Name: `Client Mobile iOS`
6. Bundle ID: `com.clientmobile`
7. Click **Create**
8. **Copy the iOS Client ID** - you'll need this!

Example: `123456789-abcdefg.apps.googleusercontent.com`

### B. Create Android OAuth Client

#### Get your SHA-1 fingerprint first:

**For debug builds:**
```bash
cd android
keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
```

**For release builds:**
```bash
# First, create a release keystore if you haven't:
keytool -genkey -v -keystore ~/android-release-key.keystore -alias my-key-alias -keyalg RSA -keysize 2048 -validity 10000

# Then get the SHA-1:
keytool -keystore ~/android-release-key.keystore -list -v -alias my-key-alias
```

**Copy the SHA-1 fingerprint** from the output (looks like: `A1:B2:C3:...`)

#### Now create the Android client:

1. In Google Cloud Console, click **Create Credentials → OAuth client ID**
2. Choose **Android** as application type
3. Name: `Client Mobile Android`
4. Package name: `com.clientmobile`
5. **Paste your SHA-1 fingerprint**
6. Click **Create**
7. **Copy the Android Client ID**

---

## Step 3: Environment Configuration

Create `.env` file in `apps/client-mobile/`:

```bash
# iOS OAuth Client ID (from Step 2A)
GOOGLE_OAUTH_IOS_CLIENT_ID=YOUR-IOS-CLIENT-ID.apps.googleusercontent.com

# Android OAuth Client ID (from Step 2B)
GOOGLE_OAUTH_ANDROID_CLIENT_ID=YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com

# Your backend API URL
API_URL=http://localhost:3001

# Google OAuth issuer (same for all)
GOOGLE_OAUTH_ISSUER=https://accounts.google.com
```

**Example `.env`:**
```bash
GOOGLE_OAUTH_IOS_CLIENT_ID=123456789-abc.apps.googleusercontent.com
GOOGLE_OAUTH_ANDROID_CLIENT_ID=987654321-xyz.apps.googleusercontent.com
API_URL=http://localhost:3001
GOOGLE_OAUTH_ISSUER=https://accounts.google.com
```

---

## Step 4: iOS Configuration

### Update `Info.plist`

Open `ios/ClientMobile/Info.plist` and add **before** the final `</dict>`:

```xml
<key>CFBundleURLTypes</key>
<array>
  <dict>
    <key>CFBundleURLName</key>
    <string>com.clientmobile</string>
    <key>CFBundleURLSchemes</key>
    <array>
      <string>com.googleusercontent.apps.YOUR-IOS-CLIENT-ID</string>
    </array>
  </dict>
</array>
```

**IMPORTANT:** Replace `YOUR-IOS-CLIENT-ID` with just the **first part** of your iOS client ID.

Example:
- If your client ID is: `123456789-abc.apps.googleusercontent.com`
- Use: `com.googleusercontent.apps.123456789-abc`

### Install Pods Again

```bash
cd ios
pod install
cd ..
```

---

## Step 5: Android Configuration

### A. Update `build.gradle`

Edit `android/app/build.gradle`:

Find the `defaultConfig` section and add:

```gradle
defaultConfig {
    applicationId "com.clientmobile"
    minSdkVersion rootProject.ext.minSdkVersion
    targetSdkVersion rootProject.ext.targetSdkVersion
    versionCode 1
    versionName "1.0"
    
    // ADD THIS LINE:
    manifestPlaceholders = [
        appAuthRedirectScheme: 'com.googleusercontent.apps.YOUR-ANDROID-CLIENT-ID'
    ]
}
```

**Replace `YOUR-ANDROID-CLIENT-ID`** with the first part of your Android client ID.

Example:
- If your client ID is: `987654321-xyz.apps.googleusercontent.com`
- Use: `com.googleusercontent.apps.987654321-xyz`

### B. Update `AndroidManifest.xml`

Edit `android/app/src/main/AndroidManifest.xml`:

Add this **inside** the `<application>` tag, after your `MainActivity`:

```xml
<activity
    android:name="net.openid.appauth.RedirectUriReceiverActivity"
    android:exported="true">
    <intent-filter>
        <action android:name="android.intent.action.VIEW"/>
        <category android:name="android.intent.category.DEFAULT"/>
        <category android:name="android.intent.category.BROWSABLE"/>
        <data android:scheme="${appAuthRedirectScheme}"/>
    </intent-filter>
</activity>
```

---

## Step 6: Backend Configuration

### Update Server Environment

Add to `apps/server/.env`:

```bash
# Add your mobile OAuth client IDs
GOOGLE_OAUTH_IOS_CLIENT_ID=YOUR-IOS-CLIENT-ID.apps.googleusercontent.com
GOOGLE_OAUTH_ANDROID_CLIENT_ID=YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com
```

### Install Google Auth Library

```bash
cd apps/server
npm install google-auth-library
```

---

## Step 7: Run the App

### iOS

```bash
# From apps/client-mobile/
npm run ios
```

Or open in Xcode:
```bash
open ios/ClientMobile.xcworkspace
```

### Android

```bash
# From apps/client-mobile/
npm run android
```

Or open in Android Studio:
```bash
open -a "Android Studio" android/
```

---

## Testing the OAuth Flow

1. Launch the app
2. You should see a **Login Screen**
3. Tap **"Sign in with Google"**
4. A **browser window** should open (Safari on iOS, Chrome Custom Tab on Android)
5. Sign in with your Google account
6. Grant permissions
7. You should be redirected back to the app
8. The app should show your profile and load the WebView

---

## Troubleshooting

### iOS: "Cannot Open Page" or "Invalid Scheme"

**Problem:** URL scheme not configured correctly

**Solution:**
1. Verify `Info.plist` has the correct reversed client ID
2. Clean build: `cd ios && rm -rf build && pod install`
3. Make sure it matches exactly: `com.googleusercontent.apps.XXXXXX`

### Android: "Redirect URI Mismatch"

**Problem:** SHA-1 fingerprint mismatch

**Solution:**
1. Get your current SHA-1: `keytool -keystore ~/.android/debug.keystore -list -v`
2. Verify it matches what's in Google Cloud Console
3. For release builds, use the release keystore's SHA-1
4. Clean rebuild: `cd android && ./gradlew clean`

### "Error: invalid_client"

**Problem:** Wrong client ID for the platform

**Solution:**
1. Verify you're using the **iOS** client ID in `.env` for iOS
2. Verify you're using the **Android** client ID in `.env` for Android
3. Check that bundle ID (iOS) and package name (Android) match Google Console

### "User cancelled the flow"

This is **normal** - it means the user closed the browser without completing sign-in.

### Network Error

**Problem:** Cannot reach backend

**Solution:**
1. Make sure backend is running: `cd apps/server && npm run dev`
2. For iOS simulator: `http://localhost:3001` works
3. For Android emulator: Use `http://10.0.2.2:3001` instead
4. For physical devices: Use your computer's IP address

---

## Production Deployment

### iOS App Store

1. Create production OAuth client in Google Console
2. Update `.env` with production values
3. Build release: `npm run build:ios`
4. Submit to App Store Connect

### Android Play Store

1. Create production OAuth client with **release keystore SHA-1**
2. Update `.env` with production values
3. Generate signed APK/AAB: `npm run build:android`
4. Upload to Google Play Console

---

## Security Notes

- ✅ **Never commit `.env` file** - it's in `.gitignore`
- ✅ **Use different OAuth clients** for dev/staging/production
- ✅ **Rotate secrets** if they're ever exposed
- ✅ **Verify tokens on backend** - never trust client-side auth alone

---

## Additional Resources

- [React Native App Auth Documentation](https://github.com/FormidableLabs/react-native-app-auth)
- [Google OAuth for Mobile](https://developers.google.com/identity/protocols/oauth2/native-app)
- [iOS OAuth Setup](https://developers.google.com/identity/sign-in/ios/start)
- [Android OAuth Setup](https://developers.google.com/identity/sign-in/android/start)

---

## Need Help?

Check the main setup guide: `OAUTH_SETUP.md`

Common issues are documented in the Troubleshooting section above.

