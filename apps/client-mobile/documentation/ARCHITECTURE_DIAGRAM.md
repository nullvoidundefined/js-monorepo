# WebView Architecture Diagram

## System Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    React Native Mobile App                      │
│                                                                 │
│  ┌──────────────┐        ┌─────────────────────────────┐      │
│  │   Login      │        │      Authenticated App       │      │
│  │   Screen     │        │                              │      │
│  │              │        │  ┌────────────────────────┐  │      │
│  │  [Sign in    │        │  │    WebView Container   │  │      │
│  │   with       │───────▶│  │                        │  │      │
│  │   Google]    │        │  │  ┌──────────────────┐ │  │      │
│  │              │        │  │  │   Next.js App    │ │  │      │
│  └──────────────┘        │  │  │  (Authenticated) │ │  │      │
│                          │  │  └──────────────────┘ │  │      │
│                          │  └────────────────────────┘  │      │
│                          └─────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

## Authentication Flow

```
┌──────────┐     ┌─────────────┐     ┌──────────┐     ┌─────────┐
│  Mobile  │     │   System    │     │ Backend  │     │ WebView │
│   App    │     │   Browser   │     │  Server  │     │         │
└────┬─────┘     └──────┬──────┘     └────┬─────┘     └────┬────┘
     │                  │                  │                │
     │ 1. Tap Login     │                  │                │
     ├─────────────────▶│                  │                │
     │                  │                  │                │
     │ 2. OAuth Flow    │                  │                │
     │◀────────────────▶│                  │                │
     │                  │                  │                │
     │ 3. Auth Code     │                  │                │
     │◀─────────────────┤                  │                │
     │                  │                  │                │
     │ 4. POST /api/auth/mobile/handoff   │                │
     │──────────────────────────────────────▶               │
     │                  │                  │                │
     │                  │  5. Verify Token │                │
     │                  │    Create User   │                │
     │                  │   Generate Code  │                │
     │                  │                  │                │
     │ 6. { handoffCode }                 │                │
     │◀──────────────────────────────────────               │
     │                  │                  │                │
     │ 7. Load WebView                    │                │
     │    /api/auth/handoff/verify?code=...                │
     ├─────────────────────────────────────────────────────▶│
     │                  │                  │                │
     │                  │  8. GET /api/auth/handoff/verify │
     │                  │                  │◀───────────────┤
     │                  │                  │                │
     │                  │    9. Verify Code                 │
     │                  │       Set Cookie                  │
     │                  │      Delete Code                  │
     │                  │                  │                │
     │                  │  10. Set-Cookie: session=...      │
     │                  │      Return success               │
     │                  │                  ├───────────────▶│
     │                  │                  │                │
     │                  │  11. Redirect to /                │
     │◀─────────────────────────────────────────────────────┤
     │                  │                  │                │
     │ 12. User sees authenticated app!   │                │
     │                  │                  │                │
```

## Component Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                        Mobile App Layer                        │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌──────────────┐   ┌───────────────┐   ┌─────────────────┐  │
│  │ AuthContext  │   │ AuthService   │   │ WebViewContainer│  │
│  │              │   │               │   │                 │  │
│  │ - login()    │──▶│ - login()     │   │ - Handoff auth  │  │
│  │ - logout()   │   │ - getHandoff()│──▶│ - Message bridge│  │
│  │ - getHandoff │   │ - logout()    │   │ - Navigation    │  │
│  └──────────────┘   └───────────────┘   │ - Back handling │  │
│                                          └─────────────────┘  │
│                                                   │            │
│                          ┌────────────────────────┘            │
│                          │                                     │
│                          ▼                                     │
│                 ┌─────────────────┐                            │
│                 │ Bridge Types    │                            │
│                 │ - WebToNative   │                            │
│                 │ - NativeToWeb   │                            │
│                 │ - Validators    │                            │
│                 └─────────────────┘                            │
│                          │                                     │
└──────────────────────────┼─────────────────────────────────────┘
                           │
                           │ postMessage
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                          ▼                                     │
│                 ┌─────────────────┐                            │
│                 │ Native Bridge   │                            │
│                 │                 │                            │
│                 │ - isInWebView() │                            │
│                 │ - sendMessage() │                            │
│                 │ - openExternal()│                            │
│                 │ - openNative()  │                            │
│                 │ - logout()      │                            │
│                 └─────────────────┘                            │
│                          │                                     │
│                          │                                     │
│  ┌───────────────────────┼──────────────────────────────────┐ │
│  │                       ▼                                  │ │
│  │              ┌──────────────────┐                        │ │
│  │              │  Next.js Pages   │                        │ │
│  │              │                  │                        │ │
│  │              │ - /              │                        │ │
│  │              │ - /auth/handoff  │                        │ │
│  │              │ - /profile       │                        │ │
│  │              │ - etc...         │                        │ │
│  │              └──────────────────┘                        │ │
│  │                                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
│                        Web App Layer                           │
└────────────────────────────────────────────────────────────────┘
                           │
                           │ HTTP + Cookies
                           │
┌──────────────────────────┼─────────────────────────────────────┐
│                          ▼                                     │
│                 ┌─────────────────┐                            │
│                 │  Backend Server │                            │
│                 │                 │                            │
│                 │ Routes:         │                            │
│                 │ ├─ /auth/mobile/verify                       │
│                 │ ├─ /auth/mobile/handoff                      │
│                 │ ├─ /auth/handoff/verify                      │
│                 │ ├─ /auth/user                                │
│                 │ └─ /auth/logout                              │
│                 │                 │                            │
│                 │ Storage:        │                            │
│                 │ ├─ Handoff Codes (In-Memory/Redis)           │
│                 │ ├─ Sessions (express-session)                │
│                 │ └─ Users (Database)                          │
│                 └─────────────────┘                            │
│                        Backend Layer                           │
└────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                           User Action                           │
└───────────────────────────┬─────────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │   Native App Login    │
                │  (System Browser)     │
                └───────────┬───────────┘
                            │
                            │ ID Token
                            ▼
                ┌───────────────────────┐
                │   Request Handoff     │
                │   POST /handoff       │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │  Backend Validates    │
                │   Creates User        │
                │  Generates Code       │
                └───────────┬───────────┘
                            │
                            │ handoffCode (5min TTL)
                            ▼
                ┌───────────────────────┐
                │  WebView Loads With   │
                │    Handoff Code       │
                └───────────┬───────────┘
                            │
                ┌───────────▼───────────┐
                │  Backend Verifies     │
                │   Sets Session Cookie │
                │   Deletes Code        │
                └───────────┬───────────┘
                            │
                            │ Set-Cookie: session=...; HttpOnly
                            ▼
                ┌───────────────────────┐
                │   WebView Redirects   │
                │      to App (/)       │
                └───────────┬───────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  Authenticated User!  │
                │  (Session persists)   │
                └───────────────────────┘
```

## Message Bridge Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Web → Native                             │
└─────────────────────────────────────────────────────────────────┘

Web Page (Next.js)
    │
    │ Call: openExternalUrl('https://...')
    ▼
Native Bridge Utils
    │
    │ Create: { type: 'OPEN_EXTERNAL_URL', payload: { url } }
    ▼
window.ReactNativeWebView.postMessage(JSON.stringify(message))
    │
    │ Cross WebView boundary
    ▼
WebViewContainer.onMessage
    │
    │ Parse & Validate
    ▼
Message Handler (switch/case)
    │
    ├─ LOGOUT ──────────▶ authService.logout()
    │
    ├─ OPEN_EXTERNAL_URL ▶ Linking.openURL(url)
    │
    ├─ OPEN_NATIVE_SCREEN ▶ navigation.navigate(screen)
    │
    └─ READY ───────────▶ console.log('WebView ready')

┌─────────────────────────────────────────────────────────────────┐
│                        Navigation Handling                       │
└─────────────────────────────────────────────────────────────────┘

User clicks link in WebView
    │
    ▼
onNavigationStateChange
    │
    ├─ URL matches /open-native/* ?
    │   YES ───▶ Extract screen name
    │            │
    │            ├─ Call onNavigateNative(screen, params)
    │            └─ webView.goBack() (prevent actual navigation)
    │
    ├─ URL is external domain?
    │   YES ───▶ Linking.openURL(url)
    │            └─ Return false (prevent WebView navigation)
    │
    └─ URL is same origin?
        YES ───▶ Allow WebView to navigate normally
```

## Security Layers

```
┌─────────────────────────────────────────────────────────────────┐
│                        Security Stack                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Layer 1: OAuth + PKCE                                          │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Authorization Code Flow                                │  │
│  │ - PKCE (Proof Key for Code Exchange)                     │  │
│  │ - System browser (not WebView)                           │  │
│  │ - Google as identity provider                            │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  Layer 2: Handoff Codes                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - One-time use only                                      │  │
│  │ - 5 minute expiration                                    │  │
│  │ - Cryptographically secure (32 random bytes)            │  │
│  │ - Server-side validation                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  Layer 3: Session Cookies                                       │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - HttpOnly (no JavaScript access)                        │  │
│  │ - Secure (HTTPS only in prod)                            │  │
│  │ - SameSite=Lax (CSRF protection)                         │  │
│  │ - Server-side session store                              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  Layer 4: Message Validation                                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - Origin validation                                       │  │
│  │ - Type checking (TypeScript)                             │  │
│  │ - Structure validation (type guards)                     │  │
│  │ - Whitelist of allowed message types                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│  Layer 5: Network Security                                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ - HTTPS in production                                     │  │
│  │ - CORS configuration                                      │  │
│  │ - Rate limiting                                           │  │
│  │ - Helmet security headers                                │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## File Structure

```
js-monorepo/
├── apps/
│   ├── server/
│   │   └── src/
│   │       ├── index.ts ──────────────────── [Router integration]
│   │       └── route/
│   │           └── mobile-auth.ts ─────────── [Handoff endpoints]
│   │
│   ├── client-mobile/
│   │   └── src/
│   │       ├── components/
│   │       │   └── WebViewContainer.tsx ──── [Main WebView]
│   │       ├── contexts/
│   │       │   └── AuthContext.tsx ────────── [Auth state]
│   │       ├── services/
│   │       │   └── auth.service.ts ────────── [Auth logic]
│   │       └── types/
│   │           └── webview-bridge.ts ──────── [Message types]
│   │
│   └── client-web/
│       └── src/
│           ├── app/
│           │   └── auth/
│           │       └── handoff/
│           │           ├── page.tsx ──────── [Handoff page]
│           │           └── page.module.scss
│           ├── component/
│           │   └── WebViewBridge.tsx ──────── [Bridge init]
│           └── utils/
│               └── native-bridge.ts ────────── [Bridge utils]
│
└── packages/
    └── constant/
        └── src/
            └── route.ts ────────────────────── [Route definitions]
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Production                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  App Stores                                                     │
│  ┌──────────────┐              ┌──────────────┐               │
│  │  App Store   │              │ Play Store   │               │
│  │     iOS      │              │   Android    │               │
│  └──────┬───────┘              └──────┬───────┘               │
│         │                             │                        │
│         └──────────────┬──────────────┘                        │
│                        │                                       │
│                        ▼                                       │
│              ┌──────────────────┐                              │
│              │  Mobile Devices  │                              │
│              │  (Native App)    │                              │
│              └────────┬─────────┘                              │
│                       │                                        │
│  ┌────────────────────┼────────────────────────────────────┐  │
│  │ HTTPS              │                                    │  │
│  └────────────────────┼────────────────────────────────────┘  │
│                       │                                        │
│         ┌─────────────┴─────────────┐                          │
│         │                           │                          │
│         ▼                           ▼                          │
│  ┌──────────────┐          ┌──────────────┐                   │
│  │   Next.js    │          │   Backend    │                   │
│  │   Vercel     │◀────────▶│   Railway    │                   │
│  │              │   API    │              │                   │
│  └──────────────┘          └──────┬───────┘                   │
│         │                         │                            │
│         │ (WebView)              │                            │
│         │                         ▼                            │
│         │                  ┌──────────────┐                   │
│         │                  │   Redis      │                   │
│         │                  │  (Handoff)   │                   │
│         │                  └──────────────┘                   │
│         │                         │                            │
│         │                         ▼                            │
│         │                  ┌──────────────┐                   │
│         └─────────────────▶│  PostgreSQL  │                   │
│                            │  (Users)     │                   │
│                            └──────────────┘                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

This architecture provides a secure, scalable, and maintainable solution for hybrid native/web apps.

