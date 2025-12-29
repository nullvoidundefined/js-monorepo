'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ClientRoute } from '@packages/constant';
import { AuthenticationStatus } from '@client-web/constant/authentication';

import { isAuthenticated } from 'src/service/auth';

import styles from './authGuard.module.scss';

type AuthGuardProps = {
  allowed: AuthenticationStatus;
  children: React.ReactNode;
  fallbackRoute: ClientRoute;
};

export function AuthGuard({ children, allowed, fallbackRoute }: AuthGuardProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if user is authorized based on authentication status
    const shouldBeAuthorized = (authenticated: boolean) => {
      return (
        (allowed === AuthenticationStatus.Authenticated && authenticated) ||
        (allowed === AuthenticationStatus.Unauthenticated && !authenticated)
      );
    };

    const checkAuth = async () => {
      const authenticated = await isAuthenticated();
      const authorized = shouldBeAuthorized(authenticated);

      if (authorized) {
        setIsAuthorized(true);
      } else {
        router.push(fallbackRoute);
      }
      setIsChecking(false);
    };

    const handleFocus = async () => {
      const authenticated = await isAuthenticated();

      if (!shouldBeAuthorized(authenticated)) {
        router.push(fallbackRoute);
      }
    };

    // Check auth on mount
    checkAuth();

    // Add focus listener to check auth when user returns to the tab
    window.addEventListener('focus', handleFocus);

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowed, fallbackRoute, router]);

  if (isChecking) {
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
