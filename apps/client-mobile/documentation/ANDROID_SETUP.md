# Android Development Setup Guide

This guide will help you set up Android development for the React Native mobile app.

## Prerequisites

You need the following installed on your Mac:
- ✅ Node.js (already installed)
- ✅ Java JDK 25 (installed, but need JDK 17)
- ❌ Android Studio
- ❌ Android SDK
- ❌ Android Emulator

## Step-by-Step Setup

### 1. Install JDK 17 (Required for Android)

Android requires JDK 17-20, but you currently have JDK 25. Install JDK 17:

```bash
brew install --cask temurin@17
```

After installation, verify:
```bash
/usr/libexec/java_home -v 17
```

### 2. Install Android Studio

1. **Download Android Studio**:
   - Visit: https://developer.android.com/studio
   - Download Android Studio for Mac (Apple Silicon)

2. **Install**:
   - Open the downloaded `.dmg` file
   - Drag Android Studio to Applications folder
   - Launch Android Studio
   - Follow the setup wizard
   - Choose "Standard" installation
   - This will install:
     - Android SDK
     - Android SDK Platform
     - Android Virtual Device (AVD)

### 3. Install Android SDK Components

In Android Studio:
1. Go to: **Settings/Preferences → Appearance & Behavior → System Settings → Android SDK**
2. In the **SDK Platforms** tab:
   - ✅ Check **Android 14.0 (UpsideDownCake)** - API Level 34
   - Click **Apply** to install

3. In the **SDK Tools** tab, ensure these are checked:
   - ✅ Android SDK Build-Tools
   - ✅ Android SDK Command-line Tools
   - ✅ Android Emulator
   - ✅ Android SDK Platform-Tools
   - Click **Apply**

### 4. Set Environment Variables

Add these to your `~/.zshrc` (or `~/.bashrc` if using bash):

```bash
# Android Development
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$ANDROID_HOME/emulator:$PATH
export PATH=$ANDROID_HOME/platform-tools:$PATH
export PATH=$ANDROID_HOME/tools:$PATH

# Java (use JDK 17 for Android)
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

**Apply changes**:
```bash
source ~/.zshrc
```

**Verify**:
```bash
echo $ANDROID_HOME
echo $JAVA_HOME
```

### 5. Generate Gradle Wrapper

The Gradle wrapper files are missing. Generate them:

```bash
cd apps/client-mobile/android

# Install Gradle if needed
brew install gradle

# Generate wrapper
gradle wrapper --gradle-version=8.8
chmod +x gradlew
```

### 6. Create an Android Emulator

1. Open Android Studio
2. Go to: **Tools → Device Manager** (or click the device icon in toolbar)
3. Click **Create Device**
4. Choose a device definition (recommended: **Pixel 8**)
5. Click **Next**
6. Select a system image:
   - Choose **UpsideDownCake** (API 34)
   - If not downloaded, click **Download**
7. Click **Next**
8. Name your AVD (e.g., "Pixel_8_API_34")
9. Click **Finish**

### 7. Verify Setup

Run the automated setup script:
```bash
npm run android:setup
```

Or manually verify:
```bash
npx react-native doctor
```

### 8. Get Android SHA1 for OAuth

After building the app at least once, get your SHA1 fingerprint:

```bash
npm run android:sha
```

## Quick Start

Once everything is set up:

1. **Start Metro bundler**:
   ```bash
   npm start
   ```

2. **In a new terminal, run the app**:
   ```bash
   npm run android
   ```

   This will:
   - Start the Android emulator (if not running)
   - Build and install the app
   - Launch the app on the emulator

## Troubleshooting

### "Unable to locate a Java Runtime"
- Make sure JDK 17 is installed: `brew install --cask temurin@17`
- Set JAVA_HOME: `export JAVA_HOME=$(/usr/libexec/java_home -v 17)`

### "ANDROID_HOME not set"
- Add to `~/.zshrc`: `export ANDROID_HOME=$HOME/Library/Android/sdk`
- Run: `source ~/.zshrc`

### "No emulators found"
- Create an emulator in Android Studio (see Step 6)
- Or start an existing emulator: `emulator -avd Pixel_8_API_34`

### "gradlew: command not found"
- Run: `cd android && gradle wrapper --gradle-version=8.8`
- Make executable: `chmod +x gradlew`

### "SDK location not found"
- Create `android/local.properties`:
  ```
  sdk.dir=/Users/YOUR_USERNAME/Library/Android/sdk
  ```

## Useful Commands

```bash
# List available emulators
emulator -list-avds

# Start specific emulator
emulator -avd Pixel_8_API_34

# List connected devices
adb devices

# Clear app data
adb shell pm clear com.clientmobile

# View logs
adb logcat | grep ReactNative
```

## Resources

- [React Native Environment Setup](https://reactnative.dev/docs/environment-setup)
- [Android Studio](https://developer.android.com/studio)
- [Adoptium JDK](https://adoptium.net/)

