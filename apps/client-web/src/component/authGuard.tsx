'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { ClientRoute } from '@packages/constant';
import { AuthenticationStatus } from '@client-web/constant/authentication';

import { useAuth } from 'src/state/hook/useAuth';

import styles from './authGuard.module.scss';

type AuthGuardProps = {
  allowed: AuthenticationStatus;
  children: React.ReactNode;
  fallbackRoute: ClientRoute;
};

export function AuthGuard({ children, allowed, fallbackRoute }: AuthGuardProps) {
  const router = useRouter();
  const { isAuthenticated, isLoading, refetch } = useAuth();

  // Throttle focus handler to prevent rapid-fire API calls
  const lastFocusCheckRef = useRef(0);
  const FOCUS_CHECK_THROTTLE_MS = 1000; // Only check once per second on focus

  // Check if user is authorized based on authentication status
  const shouldBeAuthorized = (authenticated: boolean) => {
    return (
      (allowed === AuthenticationStatus.Authenticated && authenticated) ||
      (allowed === AuthenticationStatus.Unauthenticated && !authenticated)
    );
  };

  const isAuthorized = shouldBeAuthorized(isAuthenticated);

  useEffect(() => {
    // Only redirect if we have a definitive answer (not loading)
    if (!isLoading && !isAuthorized) {
      router.push(fallbackRoute);
    }
  }, [isLoading, isAuthorized, fallbackRoute, router]);

  useEffect(() => {
    const handleFocus = async () => {
      // Throttle: only check if enough time has passed since last check
      const now = Date.now();
      if (now - lastFocusCheckRef.current < FOCUS_CHECK_THROTTLE_MS) {
        return;
      }
      lastFocusCheckRef.current = now;

      // Refetch auth data from the server
      const { data: user } = await refetch();
      const freshIsAuthenticated = user !== null;
      const freshIsAuthorized =
        (allowed === AuthenticationStatus.Authenticated && freshIsAuthenticated) ||
        (allowed === AuthenticationStatus.Unauthenticated && !freshIsAuthenticated);

      // Redirect if auth status changed
      if (!freshIsAuthorized) {
        router.push(fallbackRoute);
      }
    };

    // Add focus listener to check auth when user returns to the tab
    window.addEventListener('focus', handleFocus);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [allowed, refetch, fallbackRoute, router]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

AuthGuard.displayName = 'AuthGuard';
