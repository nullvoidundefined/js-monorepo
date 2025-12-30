# Setup Checklist

Use this checklist to complete the OAuth setup for the mobile app.

## ✅ Code Implementation (DONE)

- [x] Install react-native-app-auth
- [x] Create auth service
- [x] Implement auth context
- [x] Build login screen
- [x] Build main screen with WebView
- [x] Add backend token verification
- [x] Update package.json dependencies
- [x] Create documentation

## 📋 Configuration Steps (YOU NEED TO DO)

<------- YOU ARE HERE

### 1. Google Cloud Console Setup

- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Navigate to **APIs & Services → Credentials**

#### iOS OAuth Client

- [ ] Click **Create Credentials → OAuth client ID**
- [ ] Select **iOS** application type
- [ ] Name: `Client Mobile iOS`
- [ ] Bundle ID: `com.clientmobile`
- [ ] Click **Create**
- [ ] **Copy the iOS Client ID** ➜ Save it somewhere

#### Android OAuth Client

- [ ] Get SHA-1 fingerprint:

  ```bash
  cd apps/client-mobile/android
  npm run android:sha

  # Or manually:
  # keytool -keystore ~/.android/debug.keystore -list -v -alias androiddebugkey -storepass android -keypass android
  ```

- [ ] Copy the SHA-1 value (looks like `A1:B2:C3:...`)
- [ ] Back in Google Console, click **Create Credentials → OAuth client ID**
- [ ] Select **Android** application type
- [ ] Name: `Client Mobile Android`
- [ ] Package name: `com.clientmobile`
- [ ] Paste your SHA-1 fingerprint
- [ ] Click **Create**
- [ ] **Copy the Android Client ID** ➜ Save it somewhere

### 2. Mobile App Configuration

#### Create .env file

- [ ] In `apps/client-mobile/`, copy `.env.example` to `.env`:
  ```bash
  cd apps/client-mobile
  cp .env.example .env
  ```
- [ ] Edit `.env` and add your client IDs:
  ```bash
  GOOGLE_OAUTH_IOS_CLIENT_ID=YOUR-IOS-CLIENT-ID.apps.googleusercontent.com
  GOOGLE_OAUTH_ANDROID_CLIENT_ID=YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com
  API_URL=http://localhost:3001
  GOOGLE_OAUTH_ISSUER=https://accounts.google.com
  ```

#### iOS Configuration

- [ ] Open `ios/ClientMobile/Info.plist`
- [ ] Add **before** the final `</dict>`:
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
- [ ] Replace `YOUR-IOS-CLIENT-ID` with the **first part** of your iOS client ID
  - Example: If ID is `123456-abc.apps.googleusercontent.com`
  - Use: `com.googleusercontent.apps.123456-abc`
- [ ] Save the file
- [ ] Run: `cd ios && pod install && cd ..`

#### Android Configuration

- [ ] Open `android/app/build.gradle`
- [ ] In `defaultConfig`, add:
  ```gradle
  manifestPlaceholders = [
      appAuthRedirectScheme: 'com.googleusercontent.apps.YOUR-ANDROID-CLIENT-ID'
  ]
  ```
- [ ] Replace `YOUR-ANDROID-CLIENT-ID` with first part of your Android client ID
  - Example: If ID is `987654-xyz.apps.googleusercontent.com`
  - Use: `com.googleusercontent.apps.987654-xyz`
- [ ] Open `android/app/src/main/AndroidManifest.xml`
- [ ] Add inside `<application>` tag:
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

### 3. Backend Configuration

- [ ] Open `apps/server/.env`
- [ ] Add your mobile client IDs:
  ```bash
  GOOGLE_OAUTH_IOS_CLIENT_ID=YOUR-IOS-CLIENT-ID.apps.googleusercontent.com
  GOOGLE_OAUTH_ANDROID_CLIENT_ID=YOUR-ANDROID-CLIENT-ID.apps.googleusercontent.com
  ```
- [ ] Install backend dependency:
  ```bash
  cd apps/server
  npm install
  ```

### 4. Install Dependencies

- [ ] Install mobile dependencies:
  ```bash
  cd apps/client-mobile
  npm install
  ```
- [ ] For iOS, install pods:
  ```bash
  cd ios
  pod install
  cd ..
  ```

## 🧪 Testing

### Start Backend

- [ ] Start the backend server:
  ```bash
  cd apps/server
  npm run dev
  ```

### Test iOS

- [ ] Run the iOS app:
  ```bash
  cd apps/client-mobile
  npm run ios
  ```
- [ ] Tap "Sign in with Google"
- [ ] Verify Safari opens
- [ ] Complete sign in
- [ ] Verify redirect back to app
- [ ] Check profile displays

### Test Android

- [ ] Run the Android app:
  ```bash
  cd apps/client-mobile
  npm run android
  ```
- [ ] Tap "Sign in with Google"
- [ ] Verify Chrome Custom Tab opens
- [ ] Complete sign in
- [ ] Verify redirect back to app
- [ ] Check profile displays

## 🐛 Troubleshooting

If something doesn't work:

### iOS: "Cannot Open Page"

- [ ] Verify `Info.plist` URL scheme matches your client ID
- [ ] Clean build: `cd ios && rm -rf build && pod install`
- [ ] Rebuild the app

### Android: "Redirect Mismatch"

- [ ] Verify SHA-1 in Google Console matches your keystore
- [ ] Clean: `cd android && ./gradlew clean`
- [ ] Rebuild the app

### "Invalid Client" Error

- [ ] Double-check client IDs in `.env`
- [ ] Verify bundle ID (iOS) / package name (Android) is `com.clientmobile`
- [ ] Make sure using correct platform's client ID

### Backend Connection Failed

- [ ] Verify backend is running on port 3001
- [ ] Check `API_URL` in mobile `.env`
- [ ] For Android emulator, try `http://10.0.2.2:3001`

## 📚 Documentation

Need more help? Check:

- [INSTALLATION.md](./INSTALLATION.md) - Detailed setup guide
- [OAUTH_SETUP.md](./OAUTH_SETUP.md) - OAuth architecture
- [SOLUTION_SUMMARY.md](./SOLUTION_SUMMARY.md) - What was changed

## ✨ Done!

Once all checkboxes are checked and tests pass, you're ready to use the app!

The OAuth "disallowed_useragent" error should be completely resolved.
