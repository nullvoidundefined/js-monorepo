# Client Mobile App

React Native mobile application with native Google OAuth authentication.

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# iOS
npm run ios

# Android
npm run android
```

## ⚠️ Important: OAuth Setup Required

This app uses **native Google OAuth** which requires additional setup. 

**The app will NOT work** until you complete the OAuth configuration.

👉 **[Follow the Installation Guide](./INSTALLATION.md)** 👈

## Why Native OAuth?

Google blocks OAuth authentication in WebViews for security reasons. This app implements the **proper solution** using:

- ✅ **AppAuth protocol** (industry standard)
- ✅ **SFSafariViewController** (iOS) / **Chrome Custom Tabs** (Android)
- ✅ **Complies with Google's security policies**

## Features

- 🔐 Native Google OAuth 2.0 authentication
- 👤 User profile display
- 🌐 WebView integration with authenticated sessions
- 📱 iOS and Android support
- 🔄 Token refresh and session management
- 🎨 Modern UI with React Navigation

## Project Structure

```
src/
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── screens/
│   ├── LoginScreen.tsx       # Login interface
│   └── MainScreen.tsx        # Main app screen
├── services/
│   └── auth.service.ts       # OAuth service (AppAuth)
├── components/
│   └── WebViewContainer.tsx  # WebView with auth injection
└── App.tsx                   # Root component
```

## Documentation

- **[Installation Guide](./INSTALLATION.md)** - Complete setup instructions
- **[OAuth Setup](./OAUTH_SETUP.md)** - OAuth configuration details
- **[Quick Start](./QUICKSTART.md)** - Basic usage guide

## Requirements

- Node.js 18+
- iOS: Xcode 14+, CocoaPods
- Android: Android Studio, JDK 11+
- Google Cloud Console account (for OAuth setup)

## Scripts

```bash
npm run android       # Run on Android
npm run ios          # Run on iOS
npm run start        # Start Metro bundler
npm run test         # Run tests
npm run lint         # Lint code
```

## Environment Variables

Create `.env` file:

```bash
GOOGLE_OAUTH_IOS_CLIENT_ID=your-ios-client.apps.googleusercontent.com
GOOGLE_OAUTH_ANDROID_CLIENT_ID=your-android-client.apps.googleusercontent.com
API_URL=http://localhost:3001
GOOGLE_OAUTH_ISSUER=https://accounts.google.com
```

See [Installation Guide](./INSTALLATION.md) for details on obtaining these values.

## Technology Stack

- **React Native** 0.74.1
- **react-native-app-auth** - OAuth authentication
- **@react-native-async-storage** - Token storage
- **react-native-webview** - Web content display
- **TypeScript** - Type safety

## Troubleshooting

### "disallowed_useragent" Error

This error occurs when OAuth is attempted in a WebView. This app solves it by using **native OAuth**.

Ensure you've completed the setup in [INSTALLATION.md](./INSTALLATION.md).

### OAuth Redirect Issues

**iOS:** Check `Info.plist` has the correct URL scheme
**Android:** Verify SHA-1 fingerprint in Google Console

See detailed troubleshooting in [INSTALLATION.md](./INSTALLATION.md#troubleshooting).

## Security

- OAuth tokens stored securely in AsyncStorage
- Session management with auto-refresh
- Backend token verification
- HTTPS enforced in production

## Contributing

1. Follow the TypeScript style guide
2. Run `npm run lint` before committing
3. Add tests for new features
4. Update documentation

## License

Private - Part of js-monorepo

## Support

For issues related to:
- **OAuth setup**: See [INSTALLATION.md](./INSTALLATION.md)
- **General usage**: See [QUICKSTART.md](./QUICKSTART.md)
- **Architecture**: See [OAUTH_SETUP.md](./OAUTH_SETUP.md)
