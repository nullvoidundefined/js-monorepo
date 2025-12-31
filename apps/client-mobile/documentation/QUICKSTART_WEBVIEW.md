# WebView Quick Start

Get the WebView integration up and running in 5 minutes.

## Prerequisites

- ✅ Backend server running
- ✅ Next.js web app running  
- ✅ React Native app configured with OAuth
- ✅ Environment variables set

## Step 1: Rebuild Packages (IMPORTANT!)

The route constants have been updated. Rebuild them:

```bash
cd /Users/iangreenough/Desktop/code/personal/js-monorepo
npm run build
```

Or just the constant package:

```bash
cd packages/constant
npm run build
```

## Step 2: Start Backend

Make sure your backend has the required environment variables:

```bash
# apps/server/.env
GOOGLE_OAUTH_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_OAUTH_ANDROID_CLIENT_ID=your-android-client-id
SESSION_SECRET=your-secret-key
CLIENT_URL=http://localhost:3000
```

Start the server:

```bash
cd apps/server
npm run dev
```

## Step 3: Start Web App

```bash
cd apps/client-web
npm run dev
```

The handoff page will be available at: `http://localhost:3000/auth/handoff`

## Step 4: Test Mobile App

```bash
cd apps/client-mobile

# iOS
npm run ios

# Android
npm run android
```

## Step 5: Test the Flow

1. **Login**: Tap "Sign in with Google" in the mobile app
2. **Authenticate**: Complete OAuth in the system browser
3. **Verify WebView**: After login, the WebView should load automatically
4. **Check Authentication**: The WebView should show the authenticated home page

### Expected Console Output

**Mobile App Console:**
```
🔐 Starting OAuth login...
✅ OAuth login successful
🔐 Initializing WebView with handoff authentication
✅ WebView loaded: http://localhost:3000/api/auth/handoff/verify?code=...
🔄 Redirecting to app after handoff...
✅ WebView loaded: http://localhost:3000/
```

**Backend Console:**
```
POST /api/auth/mobile/handoff - 200
GET /api/auth/handoff/verify?code=... - 200
```

## Step 6: Add WebView Bridge to Web App (Optional)

To enable web-to-native communication, add the bridge component:

```tsx
// apps/client-web/src/app/layout.tsx
import { WebViewBridge } from '@/component/WebViewBridge';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <WebViewBridge />
        {children}
      </body>
    </html>
  );
}
```

## Testing Features

### Test External Links

Add this to any web page:

```tsx
import { openExternalUrl } from '@/utils/native-bridge';

<button onClick={() => openExternalUrl('https://google.com')}>
  Open Google (System Browser)
</button>
```

Should open in Safari/Chrome, not the WebView.

### Test Native Screen Navigation

Add this to the WebView container:

```tsx
// apps/client-mobile/src/screens/HomeScreen.tsx
const handleNavigateNative = (screen: string, params?: any) => {
  console.log('Navigate to:', screen, params);
  Alert.alert('Native Navigation', `Screen: ${screen}`);
};

<WebViewContainer
  url={`${WEB_APP_BASE_URL}/`}
  onNavigateNative={handleNavigateNative}
/>
```

Then in web:

```tsx
import { openNativeScreen } from '@/utils/native-bridge';

<button onClick={() => openNativeScreen('Profile')}>
  Open Native Profile
</button>
```

### Test Back Button

**iOS**: Swipe from left edge → should go back in web history  
**Android**: Press back button → should go back in web history, then exit

### Test Logout

```tsx
import { requestNativeLogout, isInWebView } from '@/utils/native-bridge';

const handleLogout = async () => {
  await fetch('/api/auth/logout', { method: 'POST' });
  
  if (isInWebView()) {
    requestNativeLogout();
  } else {
    window.location.href = '/login';
  }
};
```

Should logout both web session and native app.

## Troubleshooting

### "Failed to get handoff code"

**Check:**
- Backend is running
- `API_URL` in mobile `.env` is correct
- Backend has valid Google OAuth credentials
- Check backend console for errors

### WebView shows login page

**Check:**
- Session cookies are being set by backend
- `sharedCookiesEnabled={true}` in WebView
- CORS is configured correctly
- Domain matches between web and backend

### "Network request failed"

**Android Emulator:**
- Use `10.0.2.2` instead of `localhost` in `API_URL`
- The auth service automatically handles this

**iOS Simulator:**
- Use `localhost` or your Mac's IP address

### Back button exits immediately

**Check:**
- `BackHandler` is set up in WebViewContainer
- `handleBackPress` is returning `true` when `canGoBack` is true

## Verify It's Working

✅ **Native OAuth**: System browser opens for Google login  
✅ **Handoff**: WebView loads without showing login  
✅ **Session**: Refresh WebView → still authenticated  
✅ **Navigation**: Web routing works normally  
✅ **External Links**: Open in system browser  
✅ **Back Button**: Goes through web history first  
✅ **Logout**: Logs out both native and web  

## Next Steps

- Read `WEBVIEW_GUIDE.md` for complete documentation
- Implement native screen navigation
- Add web-to-native messages
- Set up production environment (Redis, HTTPS)

## Common Issues

### iOS Build Errors

If you get build errors related to AppAuth:

```bash
cd ios
pod install
cd ..
```

### Android Build Errors

Make sure you have the correct redirect URI in Google Console:

```
com.googleusercontent.apps.{YOUR_CLIENT_ID}:/oauth2redirect/google
```

Get your SHA-1 fingerprint:

```bash
npm run android:sha
```

### Session Not Persisting

Check cookie settings in `apps/server/src/index.ts`:

```typescript
cookie: {
  secure: false, // Set to false for local development
  httpOnly: true,
  maxAge: 24 * 60 * 60 * 1000,
  sameSite: 'lax',
}
```

## Production Checklist

Before deploying:

- [ ] Replace in-memory handoff codes with Redis
- [ ] Enable HTTPS everywhere
- [ ] Set `secure: true` for cookies
- [ ] Add rate limiting to handoff endpoints
- [ ] Set up monitoring
- [ ] Test on real devices (not just simulators)
- [ ] Verify deep linking works
- [ ] Test with slow network

## Resources

- **WEBVIEW_GUIDE.md** - Complete guide
- **IMPLEMENTATION_SUMMARY.md** - Architecture overview
- **AppAuth Documentation** - https://appauth.io/
- **React Native WebView** - https://github.com/react-native-webview/react-native-webview

