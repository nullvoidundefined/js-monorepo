/**
 * Hook for protecting routes based on authentication status (Web version)
 *
 * This provides more flexibility than a component wrapper, allowing
 * each page to customize its loading and unauthorized behavior.
 */

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ClientRoute, AuthenticationStatus } from '@packages/constant';
import { useAuth } from './useAuth';

export interface UseAuthGuardOptions {
  /**
   * What authentication status is allowed for this page
   */
  allowed: AuthenticationStatus;

  /**
   * Where to redirect if user is not authorized
   */
  redirectTo?: ClientRoute;

  /**
   * Whether to automatically redirect on unauthorized
   * Set to false if you want to handle redirects manually
   * @default true
   */
  autoRedirect?: boolean;
}

/**
 * Hook to protect routes based on authentication status
 *
 * @example
 * ```tsx
 * function ProtectedPage() {
 *   useAuthGuard({
 *     allowed: AuthenticationStatus.Authenticated,
 *     redirectTo: ClientRoute.Login,
 *   });
 *
 *   return <div>Protected Content</div>;
 * }
 * ```
 */
export function useAuthGuard(options: UseAuthGuardOptions): void {
  const { allowed, redirectTo = ClientRoute.Home, autoRedirect = true } = options;

  const router = useRouter();
  const { isAuthenticated, isLoading, refetch } = useAuth();

  // Throttle focus handler to prevent rapid-fire API calls
  const lastFocusCheckRef = useRef(0);
  const FOCUS_CHECK_THROTTLE_MS = 1000;

  // Check if user is authorized based on authentication status
  const isAuthorized =
    (allowed === AuthenticationStatus.Authenticated && isAuthenticated) ||
    (allowed === AuthenticationStatus.Unauthenticated && !isAuthenticated);

  // Auto redirect on unauthorized
  useEffect(() => {
    if (!autoRedirect) {
      return;
    }

    if (!isLoading && !isAuthorized) {
      router.push(redirectTo);
    }
  }, [isLoading, isAuthorized, redirectTo, router, autoRedirect]);

  // Check auth on window focus
  useEffect(() => {
    const handleFocus = async () => {
      const now = Date.now();
      if (now - lastFocusCheckRef.current < FOCUS_CHECK_THROTTLE_MS) {
        return;
      }
      lastFocusCheckRef.current = now;

      const { data: freshUser } = await refetch();
      const freshIsAuthenticated = freshUser !== null;
      const freshIsAuthorized =
        (allowed === AuthenticationStatus.Authenticated && freshIsAuthenticated) ||
        (allowed === AuthenticationStatus.Unauthenticated && !freshIsAuthenticated);

      if (autoRedirect && !freshIsAuthorized) {
        router.push(redirectTo);
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [allowed, refetch, redirectTo, router, autoRedirect]);
}
