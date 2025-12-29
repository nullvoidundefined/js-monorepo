/**
 * React Query hooks for authentication
 * Replaces the service/auth.ts module with hooks-based approach
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { User } from '@packages/type';
import { ApiRoute } from '@packages/constant';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// Query keys for React Query cache management
export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
};

/**
 * Helper function to initiate Google OAuth login
 * This redirects the user to the backend OAuth endpoint
 */
export function login(): void {
  window.location.href = `${API_URL}/api/auth/google`;
}

/**
 * Legacy function for backwards compatibility
 * Now returns null as we use OAuth
 */
export function getAuthToken(): string | null {
  return null;
}

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
 * if (isLoading) return <div>Loading...</div>;
 * if (!isAuthenticated) return <button onClick={login}>Login</button>;
 *
 * return (
 *   <div>
 *     <p>Welcome, {user?.name}</p>
 *     <button onClick={() => logout()}>Logout</button>
 *   </div>
 * );
 * ```
 */
export function useAuth() {
  const queryClient = useQueryClient();

  // Get current user query
  const {
    data: user,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: authKeys.user(),
    queryFn: async (): Promise<User | null> => {
      try {
        const response = await fetch(`${API_URL}${ApiRoute.AuthUser}`, {
          credentials: 'include', // Important: include cookies for session
        });

        if (!response.ok) {
          return null;
        }

        const data = await response.json();
        return data.user || null;
      } catch (error) {
        console.error('Error fetching current user:', error);
        return null;
      }
    },
    // Cache user data for 5 seconds to prevent excessive API calls
    staleTime: 5000,
  });

  // Logout mutation
  const { mutate: logout, isPending: isLoggingOut } = useMutation({
    mutationFn: async () => {
      const response = await fetch(`${API_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }
    },
    onSuccess: () => {
      // Clear all auth-related queries from the cache
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      // Optionally set the user to null immediately for optimistic UI
      queryClient.setQueryData(authKeys.user(), null);
    },
    onError: error => {
      console.error('Error during logout:', error);
      // Clear cache even on error to be safe
      queryClient.invalidateQueries({ queryKey: authKeys.all });
      queryClient.setQueryData(authKeys.user(), null);
    },
  });

  // Invalidate auth cache function
  const invalidateAuth = () => {
    queryClient.invalidateQueries({ queryKey: authKeys.all });
  };

  return {
    // User data
    isAuthenticated: user !== null,
    isError,
    isLoading,
    user: user ?? null,

    // Actions
    invalidateAuth,
    isLoggingOut,
    login,
    logout,
    refetch,
  };
}
