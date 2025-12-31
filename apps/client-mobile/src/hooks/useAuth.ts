/**
 * React Query hook for authentication (React Native version)
 * Uses mobile-specific auth utilities
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@packages/type';
import { API_URL } from '@env';
import { useAuth as useAuthContext } from '../contexts/AuthContext';

/**
 * Main authentication hook that provides all auth-related functionality
 *
 * @returns Object containing:
 * - user: Current authenticated user or null
 * - isLoading: Loading state for user query
 * - isError: Error state for user query
 * - isAuthenticated: Boolean indicating if user is logged in
 * - logout: Function to logout the user
 * - isLoggingOut: Loading state for logout mutation
 * - login: Function to initiate Google OAuth
 * - invalidateAuth: Function to force refresh auth state
 * - refetch: Function to manually refetch user data
 *
 * @example
 * ```tsx
 * const { user, isLoading, isAuthenticated, logout, login } = useAuth();
 *
 * if (isLoading) return <ActivityIndicator />;
 * if (!isAuthenticated) return <Button onPress={login} title="Login" />;
 *
 * return (
 *   <View>
 *     <Text>Welcome, {user?.name}</Text>
 *     <Button onPress={() => logout()} title="Logout" />
 *   </View>
 * );
 * ```
 */
export function useAuth() {
  const queryClient = useQueryClient();
  const authContext = useAuthContext();

  // Query keys for React Query cache management
  const authKeys = {
    all: ['auth'] as const,
    user: () => [...authKeys.all, 'user'] as const,
  };

  // Fetch current user from API
  const fetchCurrentUser = async (): Promise<User | null> => {
    try {
      const authState = await authContext.authState;
      if (!authState?.idToken) {
        return null;
      }

      const response = await fetch(`${API_URL}/api/auth/user`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${authState.idToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          return null;
        }
        throw new Error('Failed to fetch user');
      }

      return response.json();
    } catch (error) {
      console.error('Error fetching user:', error);
      return null;
    }
  };

  // Get current user query
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: fetchCurrentUser,
    enabled: authContext.isAuthenticated,
    // Cache user data for 5 seconds to prevent excessive API calls
    staleTime: 5000,
  });

  // Logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      await authContext.logout();
    },
    onSuccess: () => {
      // Clear all auth-related queries from the cache
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      // Set the user to null immediately for optimistic UI
      queryClient.setQueryData(authKeys.user(), null);
    },
    onError: error => {
      console.error('Error during logout:', error);
      // Clear cache even on error to be safe
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
    },
  });

  // Login mutation
  const { mutate: login, isPending: isLoggingIn } = useMutation({
    mutationFn: async () => {
      await authContext.login();
    },
    onSuccess: () => {
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: authKeys.all });
    },
    onError: error => {
      console.error('Error during login:', error);
    },
  });

  // Invalidate auth cache function
  const invalidateAuth = () => {
    queryClient.invalidateQueries({ queryKey: authKeys.all });
  };

  return {
    // User data
    isAuthenticated: authContext.isAuthenticated && user !== null,
    isError,
    isLoading: authContext.isLoading || isLoading,
    user: user ?? null,

    // Actions
    invalidateAuth,
    isLoggingIn,
    isLoggingOut,
    login,
    logout,
    refetch,
  };
}

