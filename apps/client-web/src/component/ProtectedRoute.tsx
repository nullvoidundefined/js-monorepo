'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { ClientRoute } from '@packages/constant';

import { isAuthenticated } from 'src/service/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authenticated = await isAuthenticated();

      if (!authenticated) {
        router.push(ClientRoute.Login);
      } else {
        setIsAuthorized(true);
      }
      setIsChecking(false);
    };

    const handleFocus = async () => {
      const authenticated = await isAuthenticated();
      if (!authenticated) {
        router.push(ClientRoute.Login);
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
  }, [router]);

  if (isChecking) {
    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <p>Loading...</p>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}

ProtectedRoute.displayName = 'ProtectedRoute';
