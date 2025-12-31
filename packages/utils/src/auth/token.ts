/**
 * Token management utilities
 */

import { isTokenExpired, getTokenExpiration } from './jwt';

export interface TokenState {
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken?: string;
  idToken?: string;
  tokenType?: string;
}

/**
 * Checks if a token state is valid and not expired
 */
export function isTokenStateValid(tokenState: TokenState | null): boolean {
  if (!tokenState || !tokenState.accessToken) {
    return false;
  }

  // Check expiration date if provided
  if (tokenState.accessTokenExpirationDate) {
    const expirationDate = new Date(tokenState.accessTokenExpirationDate);
    return expirationDate > new Date();
  }

  // Fallback to JWT expiration check
  return !isTokenExpired(tokenState.accessToken);
}

/**
 * Checks if a token needs to be refreshed (expires within threshold)
 * 
 * @param tokenState - The token state to check
 * @param thresholdMinutes - Minutes before expiration to trigger refresh (default: 5)
 * @returns true if token should be refreshed
 */
export function shouldRefreshToken(
  tokenState: TokenState | null,
  thresholdMinutes: number = 5
): boolean {
  if (!tokenState || !tokenState.accessToken) {
    return false;
  }

  const expirationDate = tokenState.accessTokenExpirationDate
    ? new Date(tokenState.accessTokenExpirationDate)
    : getTokenExpiration(tokenState.accessToken);

  if (!expirationDate) {
    return false;
  }

  const now = new Date();
  const threshold = new Date(now.getTime() + thresholdMinutes * 60 * 1000);

  return expirationDate <= threshold;
}

/**
 * Gets the time remaining until token expiration in milliseconds
 */
export function getTokenTimeRemaining(tokenState: TokenState | null): number | null {
  if (!tokenState || !tokenState.accessToken) {
    return null;
  }

  const expirationDate = tokenState.accessTokenExpirationDate
    ? new Date(tokenState.accessTokenExpirationDate)
    : getTokenExpiration(tokenState.accessToken);

  if (!expirationDate) {
    return null;
  }

  return expirationDate.getTime() - Date.now();
}

/**
 * Creates an authorization header from token state
 */
export function createAuthHeader(tokenState: TokenState | null): string | null {
  if (!tokenState || !tokenState.accessToken) {
    return null;
  }

  const tokenType = tokenState.tokenType || 'Bearer';
  return `${tokenType} ${tokenState.accessToken}`;
}

