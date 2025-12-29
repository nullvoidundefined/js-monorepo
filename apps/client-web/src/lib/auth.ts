/**
 * Authentication utilities for Google OAuth integration
 */

import { User } from '@packages/type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Check if user is authenticated by fetching current user from backend
 */
export async function isAuthenticated(): Promise<boolean> {
  try {
    const user = await getCurrentUser();
    return user !== null;
  } catch {
    return false;
  }
}

/**
 * Get the current authenticated user from the backend
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const response = await fetch(`${API_URL}/api/auth/user`, {
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
}

/**
 * Initiate Google OAuth login
 * This redirects the user to the backend OAuth endpoint
 */
export function loginWithGoogle(): void {
  window.location.href = `${API_URL}/api/auth/google`;
}

/**
 * Logout user by calling the backend logout endpoint
 */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/api/auth/logout`, {
      method: 'POST',
      credentials: 'include',
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Legacy function for backwards compatibility
 * Now returns false as we use OAuth
 */
export function getAuthToken(): string | null {
  return null;
}
