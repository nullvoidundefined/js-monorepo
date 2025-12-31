/**
 * Hook for protecting routes based on authentication status (React Native version)
 *
 * This provides more flexibility than a component wrapper, allowing
 * each screen to customize its loading and unauthorized behavior.
 */

import {useEffect, useRef} from 'react';
import {AppState, AppStateStatus} from 'react-native';
import {ClientRoute, AuthenticationStatus} from '@packages/constant';

export interface UseAuthGuardOptions {
  /**
   * What authentication status is allowed for this screen
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
 * Hook to protect screens based on authentication status
 *
 * @example
 * ```tsx
 * function ProtectedScreen({ navigation }) {
 *   useAuthGuard({
 *     allowed: AuthenticationStatus.Authenticated,
 *     redirectTo: ClientRoute.Login,
 *   }, useAuth, navigation);
 *
 *   return <View>Protected Content</View>;
 * }
 * ```
 */
export function useAuthGuard(
  options: UseAuthGuardOptions,
  useAuthHook: () => {
    isAuthenticated: boolean;
    isLoading: boolean;
    refetch?: () => Promise<any>;
  },
  navigation: any,
): void {
  const {allowed, redirectTo = ClientRoute.Home, autoRedirect = true} = options;

  const {isAuthenticated, isLoading, refetch} = useAuthHook();

  // Throttle app state handler to prevent rapid-fire API calls
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
      navigation.replace(redirectTo);
    }
  }, [isLoading, isAuthorized, redirectTo, navigation, autoRedirect]);

  // Check auth on app state change (when app comes to foreground)
  useEffect(() => {
    const handleAppStateChange = async (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active' && refetch) {
        const now = Date.now();
        if (now - lastFocusCheckRef.current < FOCUS_CHECK_THROTTLE_MS) {
          return;
        }
        lastFocusCheckRef.current = now;

        await refetch();
      }
    };

    const subscription = AppState.addEventListener(
      'change',
      handleAppStateChange,
    );
    return () => {
      subscription.remove();
    };
  }, [allowed, refetch, redirectTo, navigation, autoRedirect]);
}
