/**
 * JWT utilities for token parsing and validation
 */

export interface JWTPayload {
  id?: string;
  sub?: string;
  email?: string;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
  exp?: number;
  iat?: number;
  [key: string]: unknown;
}

/**
 * Decodes a JWT token and returns its payload
 * Works in both browser and React Native environments
 * 
 * @param token - The JWT token to decode
 * @returns The decoded payload or null if invalid
 */
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const base64Url = token.split('.')[1];
    if (!base64Url) {
      return null;
    }

    // Replace URL-safe characters
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    
    // Add padding if needed
    const padding = base64.length % 4 === 0 ? '' : '='.repeat(4 - (base64.length % 4));
    const paddedBase64 = base64 + padding;

    // Decode based on environment
    let jsonPayload: string;
    
    if (typeof window !== 'undefined' && typeof window.atob === 'function') {
      // Browser environment
      jsonPayload = decodeURIComponent(
        atob(paddedBase64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
    } else if (typeof Buffer !== 'undefined') {
      // Node.js / React Native environment with Buffer
      jsonPayload = Buffer.from(paddedBase64, 'base64').toString('utf-8');
    } else {
      // Fallback for environments without Buffer or atob
      // This should work in React Native with base-64 polyfill
      const decoded = paddedBase64
        .split('')
        .map(c => String.fromCharCode(c.charCodeAt(0)))
        .join('');
      jsonPayload = decodeURIComponent(escape(decoded));
    }

    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

/**
 * Checks if a JWT token is expired
 * 
 * @param token - The JWT token to check
 * @returns true if expired, false otherwise
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }

  // exp is in seconds, Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

/**
 * Gets the expiration date of a JWT token
 * 
 * @param token - The JWT token
 * @returns Date object or null if no expiration
 */
export function getTokenExpiration(token: string): Date | null {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return null;
  }

  return new Date(payload.exp * 1000);
}

/**
 * Extracts user profile information from an ID token
 * 
 * @param idToken - The ID token (JWT)
 * @returns User profile or null
 */
export function extractUserProfile(idToken: string): JWTPayload | null {
  return decodeJWT(idToken);
}

