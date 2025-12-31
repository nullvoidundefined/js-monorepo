# WebView Implementation Summary

## What Was Implemented

This implementation creates a fully functional hybrid native/web app with secure authentication handoff and bidirectional communication.

## Key Features

### ✅ Native OAuth Authentication
- Uses `react-native-app-auth` (AppAuth library)
- iOS: ASWebAuthenticationSession
- Android: Custom Tabs
- Authorization Code + PKCE flow (industry standard)
- System browser authentication (most secure)

### ✅ Handoff Code Pattern
- Native completes OAuth in system browser
- Backend generates secure one-time handoff code
- WebView loads handoff URL to establish session
- Backend sets HttpOnly session cookies
- WebView redirects to app with authenticated session

### ✅ Web ↔ Native Message Bridge
- Type-safe message protocol
- Origin validation for security
- Web can request:
  - Open external URLs in system browser
  - Navigate to native screens
  - Logout from native app
- Native can detect navigation patterns

### ✅ Smart Navigation
- Normal web routes handled by Next.js
- `/open-native/*` URLs trigger native navigation
- External domains open in system browser
- Back button works correctly (web history first, then native)

### ✅ Security
- HttpOnly session cookies (XSS protection)
- SameSite cookies (CSRF protection)
- One-time handoff codes (5min TTL)
- Origin validation for messages
- No localStorage token injection

## File Changes

### Backend (apps/server)

**Modified:**
- `src/index.ts` - Added mobile auth router
- `src/route/mobile-auth.ts` - Added handoff code routes

**Routes Added:**
- `POST /api/auth/mobile/handoff` - Generate handoff code
- `GET /api/auth/handoff/verify` - Verify code and set session

### Mobile (apps/client-mobile)

**Modified:**
- `src/services/auth.service.ts` - Added `getHandoffCode()` method
- `src/contexts/AuthContext.tsx` - Exposed handoff code method
- `src/components/WebViewContainer.tsx` - Complete rewrite with:
  - Handoff authentication
  - Message bridge
  - Navigation interception
  - Back button handling

**Created:**
- `src/types/webview-bridge.ts` - Message protocol types
- `documentation/WEBVIEW_GUIDE.md` - Comprehensive guide
- `documentation/IMPLEMENTATION_SUMMARY.md` - This file

### Web (apps/client-web)

**Created:**
- `src/app/auth/handoff/page.tsx` - Handoff landing page
- `src/app/auth/handoff/page.module.scss` - Handoff page styles
- `src/utils/native-bridge.ts` - Native bridge utilities
- `src/component/WebViewBridge.tsx` - Bridge initialization component

### Shared (packages/constant)

**Modified:**
- `src/route.ts` - Added new API and client routes:
  - `ApiRoute.AuthMobileHandoff`
  - `ApiRoute.AuthHandoffVerify`
  - `ApiRoute.AuthMobileVerify`
  - `ApiRoute.AuthMobileUser`
  - `ClientRoute.AuthHandoff`

## How It Works

### Authentication Flow

```mermaid
sequenceDiagram
    participant User
    participant RN as React Native App
    participant Browser as System Browser
    participant Backend
    participant WebView

    User->>RN: Tap "Sign in with Google"
    RN->>Browser: Open OAuth (AppAuth)
    Browser->>User: Google login
    User->>Browser: Authenticate
    Browser->>RN: Auth code + tokens
    RN->>Backend: POST /api/auth/mobile/handoff<br/>{idToken}
    Backend->>Backend: Verify token<br/>Create/update user
    Backend->>Backend: Generate handoff code
    Backend->>RN: {handoffCode}
    RN->>WebView: Load /api/auth/handoff/verify?code=...
    WebView->>Backend: GET /api/auth/handoff/verify
    Backend->>Backend: Verify code (one-time use)
    Backend->>WebView: Set-Cookie: session=...<br/>Return success
    WebView->>WebView: Redirect to app homepage
    WebView->>User: Show authenticated app
```

### Message Flow (Web → Native)

```mermaid
sequenceDiagram
    participant Web as Next.js App
    participant Bridge as Native Bridge
    participant RN as React Native App

    Web->>Bridge: openExternalUrl('https://...')
    Bridge->>Bridge: Validate message
    Bridge->>RN: postMessage({type: 'OPEN_EXTERNAL_URL'})
    RN->>RN: onMessage handler
    RN->>RN: Linking.openURL(...)
```

## Usage Examples

### In Mobile App

```tsx
import WebViewContainer from '../components/WebViewContainer';

function MyScreen() {
  const handleNavigateNative = (screen: string, params?: any) => {
    // Use your navigation library
    navigation.navigate(screen, params);
  };

  return (
    <WebViewContainer
      url="https://your-app.com"
      onNavigateNative={handleNavigateNative}
    />
  );
}
```

### In Web App

```tsx
import { openExternalUrl, requestNativeLogout, isInWebView } from '@/utils/native-bridge';

function MyComponent() {
  const handleLogout = () => {
    if (isInWebView()) {
      requestNativeLogout();
    } else {
      // Regular web logout
      window.location.href = '/login';
    }
  };

  return (
    <div>
      <button onClick={handleLogout}>Logout</button>
      <a onClick={(e) => {
        e.preventDefault();
        openExternalUrl('https://google.com');
      }}>
        Open Google
      </a>
    </div>
  );
}
```

## Testing Checklist

- [ ] Native OAuth login works (system browser)
- [ ] WebView loads authenticated session
- [ ] Navigation within web app works
- [ ] External links open in system browser
- [ ] `/open-native/*` URLs trigger native screens
- [ ] Back button goes through web history first
- [ ] Back button pops native stack when web at first page
- [ ] Logout from web also logs out native
- [ ] Session persists across WebView reloads
- [ ] Handoff codes expire after 5 minutes
- [ ] Handoff codes are one-time use

## Next Steps

1. **Build the packages:**
   ```bash
   cd packages/constant
   npm run build
   ```

2. **Test the mobile app:**
   ```bash
   cd apps/client-mobile
   npm run ios
   # or
   npm run android
   ```

3. **Test the web handoff:**
   - Login via mobile app
   - Verify WebView loads authenticated
   - Check browser dev tools for cookies

4. **Add to web layout:**
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

5. **Production setup:**
   - Replace in-memory handoff codes with Redis
   - Enable HTTPS for all services
   - Add rate limiting to handoff endpoints
   - Set up monitoring for handoff success rate

## Benefits Over Previous Approach

### Before (Token Injection)
❌ Tokens in localStorage (XSS vulnerable)  
❌ SSR can't access tokens  
❌ Fragile JavaScript injection  
❌ Timing issues with injection  
❌ Can't use HttpOnly cookies  

### After (Handoff Code)
✅ HttpOnly session cookies (XSS protected)  
✅ SSR has full session access  
✅ Clean, standard web sessions  
✅ No timing issues  
✅ Works with middleware  

## Architecture Principles

1. **Separation of Concerns**
   - Native handles platform-specific OAuth
   - Backend handles session management
   - Web is just a normal authenticated site

2. **Security First**
   - One-time codes
   - Short expiration
   - HttpOnly cookies
   - Origin validation
   - No token exposure to JavaScript

3. **User Experience**
   - Native OAuth (familiar system browser)
   - Seamless web integration
   - Smart back button
   - External URLs open properly

4. **Developer Experience**
   - Type-safe message protocol
   - Clear separation of concerns
   - Well-documented
   - Easy to test

## Common Patterns

### Opening External Links
```tsx
<a onClick={(e) => {
  e.preventDefault();
  openExternalUrl(href);
}}>Link</a>
```

### Conditional Logout
```tsx
if (isInWebView()) {
  requestNativeLogout();
} else {
  await fetch('/api/auth/logout', { method: 'POST' });
  router.push('/login');
}
```

### Native Screen Navigation
```tsx
<button onClick={() => openNativeScreen('Profile', { userId: '123' })}>
  Open Profile
</button>
```

## Resources

- **AppAuth**: https://appauth.io/
- **PKCE**: https://oauth.net/2/pkce/
- **React Native WebView**: https://github.com/react-native-webview/react-native-webview
- **Session Cookies**: https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies

## Support

For questions or issues, see:
- `WEBVIEW_GUIDE.md` - Complete usage guide
- `src/types/webview-bridge.ts` - Message protocol reference
- `src/components/WebViewContainer.tsx` - Implementation reference

