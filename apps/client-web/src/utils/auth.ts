/**
 * Web-specific authentication utilities
 * Wraps shared utilities with web-specific configuration and OAuth handling
 */

import { fetchCurrentUser as fetchCurrentUserShared, logout as logoutShared } from '@packages/utils';
import { ApiRoute } from '@packages/constant';
import type { User } from '@packages/type';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

/**
 * Gets the Google OAuth URL for web-based login
 * Web uses server-side OAuth flow, redirecting to backend endpoint
 */
export function getGoogleOAuthUrl(): string {
  return `${API_URL}${ApiRoute.AuthGoogle}`;
}

/**
 * Fetches the current authenticated user using session cookies
 */
export async function fetchCurrentUser(): Promise<User | null> {
  return fetchCurrentUserShared(API_URL, { 
    credentials: 'include' 
  });
}

/**
 * Logs out by calling the backend logout endpoint
 * Uses session cookies for authentication
 */
export async function logout(): Promise<boolean> {
  return logoutShared(API_URL, { 
    credentials: 'include' 
  });
}

/**
 * Helper to initiate Google OAuth login
 * Redirects the user to the backend OAuth endpoint
 */
export function initiateLogin(): void {
  window.location.href = getGoogleOAuthUrl();
}

/**
 * Web authentication utilities object for convenience
 */
export const webAuthUtils = {
  getGoogleOAuthUrl,
  fetchCurrentUser,
  logout,
  initiateLogin,
} as const;

