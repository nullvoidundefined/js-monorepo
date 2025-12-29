# React Query Migration

## Overview

The authentication service has been migrated from a manual caching implementation to React Query hooks for better state management, automatic refetching, and improved developer experience.

## Changes

### New Files Created

1. **`src/provider/queryProvider.tsx`**: QueryClient provider component that wraps the app
2. **`src/hook/useAuth.ts`**: React Query-based authentication hooks

### Files Modified

1. **`src/app/layout.tsx`**: Added `QueryProvider` wrapper
2. **`src/component/authGuard.tsx`**: Updated to use `useIsAuthenticated()` hook
3. **`src/app/login/page.tsx`**: Updated to use `login()` from hooks
4. **`src/app/page.tsx`**: Updated to use `useCurrentUser()` and `useLogout()` hooks
5. **`tsconfig.json`**: Added path aliases for `@client-web/hook/*` and `@client-web/provider/*`

### Old Files (Deprecated)

- **`src/service/auth.ts`**: Replaced by `src/hook/useAuth.ts` - can be deleted

## API Reference

### Main Hook

#### `useAuth()`

Unified authentication hook that provides all auth-related functionality.

```typescript
const {
  user,
  isLoading,
  isError,
  isAuthenticated,
  logout,
  isLoggingOut,
  login,
  invalidateAuth,
  refetch,
} = useAuth();
```

**Returns:**

- `user`: `User | null` - The current user or null if not authenticated
- `isLoading`: `boolean` - Loading state for user query
- `isError`: `boolean` - Error state for user query
- `isAuthenticated`: `boolean` - Whether user is authenticated
- `logout`: `(options?) => void` - Function to logout the user
- `isLoggingOut`: `boolean` - Loading state for logout mutation
- `login`: `() => void` - Function to initiate Google OAuth
- `invalidateAuth`: `() => void` - Function to force refresh auth state
- `refetch`: `() => void` - Function to manually refetch user data

**Example Usage:**

```typescript
import { useAuth } from 'src/state/hook/useAuth';

function MyComponent() {
  const { user, isLoading, isAuthenticated, logout, login } = useAuth();

  if (isLoading) return <div>Loading...</div>;

  if (!isAuthenticated) {
    return <button onClick={login}>Login with Google</button>;
  }

  return (
    <div>
      <p>Welcome, {user?.name}</p>
      <button onClick={() => logout()}>Logout</button>
    </div>
  );
}
```

### Helper Functions

#### `login()`

Also exported as a standalone function if needed outside of React components.

```typescript
import { login } from 'src/state/hook/useAuth';

login();
```

#### `getAuthToken()`

Legacy function (returns null as we use OAuth).

```typescript
import { getAuthToken } from 'src/state/hook/useAuth';
```

## Benefits of React Query

1. **Automatic Caching**: React Query handles caching automatically with configurable stale times
2. **Background Refetching**: Automatically refetches data in the background to keep it fresh
3. **Request Deduplication**: Multiple components can use the same query without duplicate requests
4. **Loading/Error States**: Built-in state management for loading and error states
5. **Optimistic Updates**: Easy to implement optimistic UI updates
6. **DevTools**: React Query DevTools available for debugging
7. **SSR Support**: Better Next.js App Router support

## Configuration

The QueryClient is configured with the following defaults:

- **Stale Time**: 5 seconds (auth data is considered fresh for 5 seconds)
- **GC Time**: 5 minutes (unused data is garbage collected after 5 minutes)
- **Refetch on Window Focus**: Disabled globally (handled manually in AuthGuard)
- **Retry**: Disabled for auth queries (auth failures are usually intentional)

## Migration Guide for Other Components

If you have other components using the old `service/auth` module, update them as follows:

### Before:

```typescript
import { getCurrentUser, isAuthenticated, logout } from '@client-web/service/auth';

const [user, setUser] = useState<User | null>(null);
const [isLoading, setIsLoading] = useState(true);

useEffect(() => {
  const fetchUser = async () => {
    const user = await getCurrentUser();
    setUser(user);
    setIsLoading(false);
  };
  fetchUser();
}, []);

const handleLogout = async () => {
  await logout();
  router.push('/login');
};
```

### After:

```typescript
import { useAuth } from 'src/state/hook/useAuth';

const { user, isLoading, logout } = useAuth();

const handleLogout = () => {
  logout(undefined, {
    onSuccess: () => router.push('/login'),
  });
};
```

### Common Patterns

#### Checking Authentication Status

```typescript
const { isAuthenticated, isLoading } = useAuth();

if (isLoading) return <LoadingSpinner />;
if (!isAuthenticated) return <LoginPrompt />;
```

#### Displaying User Info

```typescript
const { user } = useAuth();

return <div>Welcome, {user?.name}!</div>;
```

#### Logout with Redirect

```typescript
const { logout } = useAuth();
const router = useRouter();

const handleLogout = () => {
  logout(undefined, {
    onSuccess: () => router.push('/login'),
  });
};
```

#### Force Refresh Auth State

```typescript
const { invalidateAuth } = useAuth();

// After some action that might affect auth
invalidateAuth();
```

## Testing

All existing functionality remains the same:

- Authentication checking
- Google OAuth login
- Logout
- Session management
- Window focus revalidation (in AuthGuard)

The implementation is now more declarative and easier to maintain.
