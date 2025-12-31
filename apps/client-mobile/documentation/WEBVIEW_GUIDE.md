# WebView Integration Guide

This guide explains how the React Native app integrates with the Next.js web app using WebViews with proper authentication and communication.

## Architecture Overview

The mobile app uses a **handoff code pattern** to establish authenticated web sessions in WebViews. This is the cleanest and most secure approach for hybrid native/web apps.

### Authentication Flow

```
1. User opens mobile app
2. Native app performs OAuth login via system browser (Google OAuth with PKCE)
   - iOS: Uses ASWebAuthenticationSession
   - Android: Uses Custom Tabs
3. After successful login, native app receives auth tokens
4. Native app calls backend: POST /api/auth/mobile/handoff
5. Backend verifies token and returns one-time handoff code (5min TTL)
6. Native app loads WebView to: /api/auth/handoff/verify?code=...
7. Backend verifies handoff code and sets HttpOnly session cookie
8. WebView redirects to the actual app page
9. User is now authenticated with a normal web session!
```

### Why This Approach?

✅ **Secure**: Session cookies are HttpOnly and SameSite protected  
✅ **SSR-friendly**: Next.js middleware and SSR can access the session  
✅ **No token injection**: Avoids brittle localStorage token injection  
✅ **One-time codes**: Handoff codes expire quickly and are single-use  
✅ **Native standards**: Uses platform-standard OAuth (AppAuth)

## Components

### 1. Backend (Server)

**File**: `apps/server/src/route/mobile-auth.ts`

Routes:
- `POST /api/auth/mobile/verify` - Verify Google ID token (creates/updates user)
- `POST /api/auth/mobile/handoff` - Generate handoff code for WebView
- `GET /api/auth/handoff/verify?code=...` - Verify handoff code and set session cookie

The handoff codes are stored in-memory with a 5-minute TTL. For production, use Redis.

### 2. Mobile App (React Native)

**Auth Service**: `apps/client-mobile/src/services/auth.service.ts`

Methods:
- `login()` - Performs OAuth login via system browser
- `getHandoffCode()` - Gets a handoff code for WebView authentication
- `logout()` - Revokes tokens and clears session

**WebView Container**: `apps/client-mobile/src/components/WebViewContainer.tsx`

Features:
- Automatic handoff authentication on load
- Web ↔ Native message bridge
- Navigation interception for native screens
- Back button handling
- External URL handling

**Bridge Types**: `apps/client-mobile/src/types/webview-bridge.ts`

Defines message protocol between web and native.

### 3. Web App (Next.js)

**Handoff Page**: `apps/client-web/src/app/auth/handoff/page.tsx`

Landing page for handoff authentication flow.

**Native Bridge**: `apps/client-web/src/utils/native-bridge.ts`

Helper utilities for web to communicate with native:
- `isInWebView()` - Detect if running in WebView
- `sendMessageToNative()` - Send messages to native app
- `openExternalUrl()` - Open URLs in system browser
- `openNativeScreen()` - Navigate to native screen
- `requestNativeLogout()` - Logout from native app

## Message Bridge

### Web → Native Messages

```typescript
// Open external URL in system browser
openExternalUrl('https://google.com');

// Open a native screen
openNativeScreen('Profile', { userId: '123' });

// Request logout
requestNativeLogout();

// Notify ready
notifyNativeReady();
```

### Native → Web Messages

Native can send messages to web (not yet implemented, but structure is ready):
- `NAVIGATE` - Navigate to a URL within WebView
- `AUTH_LOGOUT` - Notify web of logout
- `THEME` - Pass theme preference to web

## Navigation

### Web Routes (Handled by WebView)

All normal Next.js routes are handled by the WebView:
- `/` - Home page
- `/profile` - Profile page
- `/settings` - Settings page
- etc.

### Native Screen Interception

Special URL patterns trigger native navigation:

```typescript
// If web navigates to /open-native/profile
// Native will intercept and open native Profile screen
window.location.href = '/open-native/profile';
```

Pattern: `/open-native/{screenName}`

This is configured in `NATIVE_URL_PATTERNS` in the bridge types.

### External URLs

Links to external domains automatically open in the system browser, not the WebView.

```typescript
// Web code - this will open in system browser
<a href="https://google.com">Google</a>

// Or programmatically
openExternalUrl('https://google.com');
```

### Back Button Handling

The WebView implements smart back button handling:

**iOS**: Swipe gesture to go back works automatically  
**Android**: Hardware back button handled:
- If WebView can go back → Goes back in web history
- If WebView at first page → Pops native navigation stack (exits WebView)

This prevents the "back button exits app" problem.

## Usage Examples

### Using WebView in a Native Screen

```tsx
// apps/client-mobile/src/screens/HomeScreen.tsx
import React from 'react';
import {SafeAreaView, StyleSheet} from 'react-native';
import WebViewContainer from '../components/WebViewContainer';
import {WEB_APP_BASE_URL} from '../constants/urls';

const HomeScreen = () => {
  const handleNavigateNative = (screen: string, params?: any) => {
    // Handle navigation to native screens
    console.log('Navigate to native screen:', screen, params);
    // Use your navigation library here (e.g., React Navigation)
  };

  return (
    <SafeAreaView style={styles.container}>
      <WebViewContainer
        url={`${WEB_APP_BASE_URL}/`}
        onNavigateNative={handleNavigateNative}
      />
    </SafeAreaView>
  );
};
```

### Web Component Using Bridge

```tsx
// apps/client-web/src/components/ExternalLink.tsx
'use client';

import { openExternalUrl, isInWebView } from '@/utils/native-bridge';

export function ExternalLink({ href, children }) {
  const handleClick = (e: React.MouseEvent) => {
    if (isInWebView()) {
      e.preventDefault();
      openExternalUrl(href);
    }
    // Otherwise let the browser handle it normally
  };

  return (
    <a href={href} onClick={handleClick} target="_blank" rel="noopener">
      {children}
    </a>
  );
}
```

### Logout from Web

```tsx
// apps/client-web/src/components/LogoutButton.tsx
'use client';

import { requestNativeLogout, isInWebView } from '@/utils/native-bridge';

export function LogoutButton() {
  const handleLogout = async () => {
    // Logout from web session
    await fetch('/api/auth/logout', { method: 'POST' });

    if (isInWebView()) {
      // Also logout from native
      requestNativeLogout();
    } else {
      // Regular web logout
      window.location.href = '/login';
    }
  };

  return <button onClick={handleLogout}>Logout</button>;
}
```

## Environment Configuration

### Backend (.env)

```bash
# Google OAuth credentials
GOOGLE_OAUTH_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_OAUTH_ANDROID_CLIENT_ID=your-android-client-id

# Session secret
SESSION_SECRET=your-secret-key

# Client URL (for CORS)
CLIENT_URL=http://localhost:3000
```

### Mobile (.env)

```bash
# Google OAuth credentials
GOOGLE_OAUTH_IOS_CLIENT_ID=your-ios-client-id
GOOGLE_OAUTH_ANDROID_CLIENT_ID=your-android-client-id
GOOGLE_OAUTH_ISSUER=https://accounts.google.com

# Backend API URL
API_URL=http://localhost:3001
```

## Security Considerations

### Session Cookies

Session cookies are configured with:
- `httpOnly: true` - Cannot be accessed by JavaScript
- `secure: true` (production) - Only sent over HTTPS
- `sameSite: 'lax'` - CSRF protection

### Handoff Codes

- **One-time use**: Deleted after verification
- **Short TTL**: 5 minutes expiration
- **Cryptographically secure**: Generated with `crypto.randomBytes(32)`

### Message Validation

All messages from web to native are validated:
- Type checking with TypeScript
- Origin validation
- Structure validation via type guards

### Token Storage

- Native tokens stored in AsyncStorage (encrypted on device)
- Web session in HttpOnly cookies (never exposed to JavaScript)
- No tokens in localStorage (vulnerable to XSS)

## Testing

### Test Native OAuth

1. Run the mobile app
2. Click "Sign in with Google"
3. Complete OAuth flow in system browser
4. Verify you're redirected back to app
5. Check console for auth state

### Test WebView Handoff

1. After login, app should load WebView
2. Check console for "Initializing WebView with handoff authentication"
3. WebView should load without requiring login
4. Navigate around the web app - session should persist

### Test Message Bridge

Add this to your web page to test:

```javascript
// Check if in WebView
console.log('In WebView:', window.ReactNativeWebView !== undefined);

// Send test message
if (window.ReactNativeWebView) {
  window.ReactNativeWebView.postMessage(JSON.stringify({
    type: 'READY'
  }));
}
```

## Troubleshooting

### WebView shows login page

**Problem**: WebView loads but shows login page instead of authenticated content.

**Solutions**:
- Check backend logs for handoff code verification
- Verify session cookies are being set
- Check CORS and cookie domain settings
- Ensure `sharedCookiesEnabled={true}` in WebView

### Back button exits app immediately

**Problem**: Android back button exits instead of going back in web history.

**Solutions**:
- Verify `BackHandler` is set up in WebViewContainer
- Check `handleBackPress` is returning `true` when web can go back

### Messages not received by native

**Problem**: Web sends messages but native doesn't respond.

**Solutions**:
- Check `onMessage` prop is set on WebView
- Verify message format matches TypeScript types
- Check origin validation isn't blocking messages
- Look for console errors in native app

### External links open in WebView

**Problem**: External links stay in WebView instead of opening in browser.

**Solutions**:
- Implement `onShouldStartLoadWithRequest` handler
- Use `openExternalUrl()` helper in web code
- Check URL origin comparison logic

## Production Considerations

### Use Redis for Handoff Codes

Replace the in-memory Map with Redis:

```typescript
import Redis from 'ioredis';

const redis = new Redis(process.env.REDIS_URL);

// Store handoff code
await redis.setex(`handoff:${code}`, 300, userId);

// Retrieve and delete
const userId = await redis.get(`handoff:${code}`);
await redis.del(`handoff:${code}`);
```

### Enable HTTPS

- Use HTTPS for backend in production
- Use HTTPS for web app in production
- Set `secure: true` for session cookies

### Rate Limiting

Handoff endpoints should have rate limiting:

```typescript
const handoffLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many handoff requests',
});

app.use(ApiRoute.AuthMobileHandoff, handoffLimiter);
```

### Monitor Handoff Success Rate

Track handoff verification success/failure rates to detect issues.

## Future Enhancements

- [ ] Native → Web message sending
- [ ] Deep linking support
- [ ] Offline mode handling
- [ ] Biometric authentication for WebView re-entry
- [ ] Push notification handling from web
- [ ] File upload/download bridge
- [ ] Camera/media access bridge

