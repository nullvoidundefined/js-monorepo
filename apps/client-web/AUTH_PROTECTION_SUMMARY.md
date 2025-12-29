# Authentication Protection Measures

This document outlines the protections implemented to prevent redirect loops and excessive API calls to Google's OAuth endpoints.

## ✅ Implemented Protections

### 1. **Throttling Focus Event Handler**

- **Location**: `authGuard.tsx` - `handleFocus` function
- **Protection**: Only checks authentication once per second when window regains focus
- **Implementation**: `FOCUS_CHECK_THROTTLE_MS = 1000` with timestamp tracking
- **Prevents**: Rapid-fire API calls when user switches tabs quickly

### 2. **Concurrent Request Prevention**

- **Location**: `authGuard.tsx` - `isCheckingRef`
- **Protection**: Prevents multiple simultaneous auth checks from running in parallel
- **Implementation**: `useRef` to track if a check is already in progress
- **Prevents**: Multiple overlapping API requests to the backend

### 3. **Response Caching**

- **Location**: `auth.ts` - `getCurrentUser` function
- **Protection**: Caches authentication status for 5 seconds
- **Implementation**: Timestamp-based cache with `AUTH_CACHE_DURATION_MS = 5000`
- **Prevents**: Excessive API calls to backend when multiple components check auth status

### 4. **Request Deduplication**

- **Location**: `auth.ts` - `authCache.promise`
- **Protection**: If a request is in flight, subsequent calls wait for the same promise
- **Implementation**: Stores the pending promise and returns it for concurrent calls
- **Prevents**: Multiple identical API requests from being sent simultaneously

### 5. **Proper useEffect Dependencies**

- **Location**: `authGuard.tsx` - Line 108
- **Protection**: useEffect only runs when `allowed`, `fallbackRoute`, or `router` change
- **Implementation**: Explicit dependency array `[allowed, fallbackRoute, router]`
- **Prevents**: Repeated auth checks on every render

### 6. **Error Handling**

- **Location**: Both `authGuard.tsx` and `auth.ts`
- **Protection**: Graceful error handling with fallback behavior
- **Implementation**: try-catch blocks with safe defaults
- **Prevents**: Infinite loops or crashes when API calls fail

### 7. **Cache Clearing on Auth State Changes**

- **Location**: `auth.ts` - `loginWithGoogle` and `logout` functions
- **Protection**: Clears cache when user logs in or out
- **Implementation**: `clearAuthCache()` calls
- **Prevents**: Stale authentication state after login/logout

## 🔍 What Each Protection Prevents

### Redirect Loop Prevention

- ✅ No `useEffect` without dependency array triggering repeated checks
- ✅ No global `window.location` redirects on every page load
- ✅ Throttling prevents focus event loops
- ✅ Concurrent request prevention stops overlapping redirects

### Excessive API Calls Prevention

- ✅ 5-second cache prevents repeated calls to `/api/auth/user`
- ✅ Request deduplication ensures only one in-flight request
- ✅ Throttling limits focus-triggered checks to once per second
- ✅ Concurrent check prevention stops multiple simultaneous checks

### Rate Limit Protection

With these protections, the maximum rate of API calls is:

- **On mount**: 1 call
- **On focus events**: Maximum 1 call per second (throttled)
- **Cached reads**: 0 calls (uses cached value for 5 seconds)

This means even with aggressive tab switching, you'll never exceed ~60 requests per minute, and in normal usage it will be far fewer (typically 1-5 per minute).

## 📋 Testing Checklist

To verify these protections work:

1. ✅ Open the app and verify auth check happens once on mount
2. ✅ Switch tabs rapidly (10+ times in a few seconds) and verify only 1-2 API calls
3. ✅ Stay on the page for 10 seconds without switching - verify no additional calls
4. ✅ Log out and verify cache is cleared
5. ✅ Check browser console for no infinite loops or errors
6. ✅ Verify no bouncing between localhost and 127.0.0.1

## 🎯 Google OAuth Rate Limits

Google's OAuth endpoints have the following limits:

- **Token endpoint**: ~10 requests per second per user
- **User info endpoint**: ~100 requests per second per user
- **Overall**: ~10,000 requests per day per project

With our protections, you won't come close to these limits even with heavy usage.
