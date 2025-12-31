/**
 * API utilities for authentication
 */

import { ApiRoute } from '@packages/constant';
import type { User } from '@packages/type';

export interface FetchOptions extends RequestInit {
  token?: string;
  baseUrl?: string;
}

/**
 * Creates fetch options with authentication headers
 */
export function createAuthenticatedFetchOptions(
  token: string | null,
  options: RequestInit = {}
): RequestInit {
  const headers = new Headers(options.headers);

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return {
    ...options,
    headers,
  };
}

/**
 * Fetches the current authenticated user
 */
export async function fetchCurrentUser(
  baseUrl: string,
  options: { token?: string; credentials?: RequestCredentials } = {}
): Promise<User | null> {
  try {
    const fetchOptions: RequestInit = {
      credentials: options.credentials || 'include',
    };

    if (options.token) {
      Object.assign(fetchOptions, createAuthenticatedFetchOptions(options.token, fetchOptions));
    }

    const response = await fetch(`${baseUrl}${ApiRoute.AuthUser}`, fetchOptions);

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
 * Logs out by calling the backend logout endpoint
 */
export async function logout(
  baseUrl: string,
  options: { token?: string; credentials?: RequestCredentials } = {}
): Promise<boolean> {
  try {
    const fetchOptions: RequestInit = {
      method: 'POST',
      credentials: options.credentials || 'include',
    };

    if (options.token) {
      Object.assign(fetchOptions, createAuthenticatedFetchOptions(options.token, fetchOptions));
    }

    const response = await fetch(`${baseUrl}/api/auth/logout`, fetchOptions);
    return response.ok;
  } catch (error) {
    console.error('Logout error:', error);
    return false;
  }
}
