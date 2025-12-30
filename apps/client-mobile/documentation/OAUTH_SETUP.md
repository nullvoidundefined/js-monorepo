# Mobile OAuth Setup Guide

## Overview

This guide explains how to set up native Google OAuth for the React Native mobile app, which is **required** because Google blocks OAuth in WebViews.

## Why Native OAuth?

Google's security policies require OAuth flows to happen in:

- **iOS**: SFSafariViewController or system browser
- **Android**: Chrome Custom Tabs or system browser

WebView-based authentication is blocked with error: `disallowed_useragent`

## Solution: AppAuth Protocol

We use `react-native-app-auth` which implements the **AppAuth protocol** - the industry standard for native mobile OAuth.

## Setup Steps

### 1. Create Google OAuth Credentials for Mobile

You need **separate** OAuth clients for iOS and Android (different from your web client).

#### Go to [Google Cloud Console](https://console.cloud.google.com/)

#### Create iOS OAuth Client

1. Navigate to **APIs & Services → Credentials**
2. Click **Create Credentials → OAuth client ID**
3. Application type: **iOS**
4. Name: `Client Mobile iOS`
5. Bundle ID: `com.clientmobile` (matches your iOS app)
6. Click **Create**
7. **Save the Client ID** (you'll need it)

#### Create Android OAuth Client

1. Click **Create Credentials → OAuth client ID** again
2. Application type: **Android**
3. Name: `Client Mobile Android`
4. Package name: `com.clientmobile` (matches your Android app)
5. **Get SHA-1 Certificate Fingerprint:**

   **For Debug:**

   ```bash
   cd android
   keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
   ```

   **For Release:**

   ```bash
   # After creating your release keystore
   keytool -keystore /path/to/your-release-key.keystore -list -v -alias your-key-alias
   ```

6. Paste the **SHA-1** into the form
7. Click **Create**
8. **Save the Client ID**

### 2. Environment Configuration

Create `apps/client-mobile/.env`:

```bash
# iOS OAuth Client ID
GOOGLE_OAUTH_IOS_CLIENT_ID=your-ios-client-id.apps.googleusercontent.com

# Android OAuth Client ID
GOOGLE_OAUTH_ANDROID_CLIENT_ID=your-android-client-id.apps.googleusercontent.com

# Backend API URL
API_URL=http://localhost:3001

# Google OAuth issuer (same for all)
GOOGLE_OAUTH_ISSUER=https://accounts.google.com
```

### 3. Install Dependencies

```bash
cd apps/client-mobile
npm install react-native-app-auth
npm install react-native-dotenv --save-dev
npm install @react-native-async-storage/async-storage
```

### 4. iOS Configuration

#### Install CocoaPods dependencies:

```bash
cd ios
pod install
cd ..
```

#### Update `ios/ClientMobile/Info.plist`:

Add URL scheme for OAuth redirect. Add this before the final `</dict>`:

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

**Replace** `YOUR-IOS-CLIENT-ID` with the part **before** `.apps.googleusercontent.com`

Example: If client ID is `123456-abc.apps.googleusercontent.com`, use `123456-abc`

### 5. Android Configuration

#### Update `android/app/build.gradle`:

Add this in the `defaultConfig` section:

```gradle
defaultConfig {
    // ... existing config
    manifestPlaceholders = [
        appAuthRedirectScheme: 'com.googleusercontent.apps.YOUR-ANDROID-CLIENT-ID'
    ]
}
```

#### Update `android/app/src/main/AndroidManifest.xml`:

Add this inside `<application>` tag:

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

### 6. Backend Updates (Optional but Recommended)

To validate Google tokens on the backend, install:

```bash
cd apps/server
npm install google-auth-library
```

This allows the backend to verify tokens from the mobile app.

## Testing

### iOS Simulator:

```bash
npm run ios
```

### Android Emulator:

```bash
npm run android
```

### Troubleshooting

#### iOS: "No application can handle this URL"

- Verify the URL scheme in `Info.plist` matches your client ID
- Clean build: `cd ios && rm -rf build && pod install && cd ..`

#### Android: OAuth redirect fails

- Verify SHA-1 certificate is correctly added to Google Console
- Check `manifestPlaceholders` in `build.gradle`
- For release builds, use your release keystore's SHA-1

#### "invalid_client" error

- Verify you're using the correct client ID for the platform
- Ensure bundle ID (iOS) / package name (Android) matches Google Console

## Security Notes

- **Never commit `.env` file** - add to `.gitignore`
- Store tokens securely using `@react-native-async-storage/async-storage`
- Use refresh tokens to maintain sessions
- Implement token expiration handling

## Resources

- [react-native-app-auth Documentation](https://github.com/FormidableLabs/react-native-app-auth)
- [Google OAuth for Mobile Apps](https://developers.google.com/identity/protocols/oauth2/native-app)
- [AppAuth Protocol](https://appauth.io/)
