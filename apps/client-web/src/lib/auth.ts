/**
 * Simple authentication utilities
 * In a production app, you'd want to use a proper auth solution like NextAuth.js
 */

const AUTH_TOKEN_KEY = 'auth_token';

export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY) !== null;
}

export function login(email: string, password: string): boolean {
  // Simple mock authentication - replace with real API call
  if (email && password.length >= 6) {
    localStorage.setItem(AUTH_TOKEN_KEY, 'mock_token_' + Date.now());
    return true;
  }
  return false;
}

export function logout(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }
}

export function getAuthToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

