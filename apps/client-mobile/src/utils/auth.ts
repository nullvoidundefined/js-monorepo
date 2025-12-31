import {authorize, refresh, revoke} from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {
  GOOGLE_OAUTH_IOS_CLIENT_ID,
  GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  GOOGLE_OAUTH_ISSUER,
} from '@env';

import {
  AsyncStorageAdapter,
  AuthStorage,
  extractUserProfile,
  isTokenStateValid,
  shouldRefreshToken,
  type JWTPayload,
} from '@packages/utils';

const STORAGE_KEY = '@auth_state';

/**
 * OAuth authentication state from react-native-app-auth
 *
 * Token purposes:
 * - idToken: Used for authenticating with our backend (contains verified user identity)
 * - accessToken: Used for calling Google APIs directly (not sent to our backend)
 * - refreshToken: Used to refresh the above tokens when they expire
 */
export interface AuthState {
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken?: string;
  idToken: string;
  tokenType: string;
  scopes: string[];
}

export interface UserProfile extends JWTPayload {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

// OAuth configuration
// NOTE: We are currently using the iOS Client ID for both platforms as a workaround for
// Google's "Custom URI scheme is not enabled" error on Android credentials.
// TODO: Rename GOOGLE_OAUTH_ANDROID_CLIENT_ID to something like GOOGLE_OAUTH_SHARED_CLIENT_ID
// to reflect its use across both platforms.
const config = {
  clientId:
    Platform.OS === 'ios'
      ? GOOGLE_OAUTH_IOS_CLIENT_ID
      : GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  issuer: GOOGLE_OAUTH_ISSUER,
  redirectUrl:
    Platform.OS === 'ios'
      ? `com.googleusercontent.apps.${GOOGLE_OAUTH_IOS_CLIENT_ID.split('.')[0]}:/oauth2redirect/google`
      : `com.googleusercontent.apps.${GOOGLE_OAUTH_ANDROID_CLIENT_ID.split('.')[0]}:/oauth2redirect/google`,
  scopes: ['openid', 'profile', 'email'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
  },
};

class AuthService {
  private authState: AuthState | null = null;
  private storage: AuthStorage<AuthState>;

  constructor() {
    // Initialize storage with AsyncStorage adapter
    const adapter = new AsyncStorageAdapter(AsyncStorage);
    this.storage = new AuthStorage(adapter, STORAGE_KEY);
  }

  /**
   * Initiate OAuth login flow
   */
  async login(): Promise<AuthState> {
    try {
      const result = await authorize(config);
      this.authState = result;
      await this.storage.save(result);

      return result;
    } catch (error) {
      console.error(
        '❌ OAuth login error:',
        error instanceof Error ? error.message : 'Unknown error',
      );
      throw error;
    }
  }

  /**
   * Logout and revoke tokens
   */
  async logout(): Promise<void> {
    try {
      if (this.authState?.accessToken) {
        await revoke(config, {
          includeBasicAuth: true,
          tokenToRevoke: this.authState.accessToken,
        });
      }
    } catch (error) {
      console.error('Token revocation error:', error);
    } finally {
      this.authState = null;
      await this.storage.remove();
    }
  }

  /**
   * Refresh the access token
   */
  async refreshToken(): Promise<AuthState | null> {
    if (!this.authState?.refreshToken) {
      return null;
    }

    try {
      const result = await refresh(config, {
        refreshToken: this.authState.refreshToken,
      });
      // refresh() doesn't return scopes, so preserve them from current state
      const refreshedState: AuthState = {
        ...result,
        refreshToken: result.refreshToken ?? undefined,
        scopes: this.authState.scopes,
      };
      this.authState = refreshedState;
      await this.storage.save(refreshedState);
      return refreshedState;
    } catch (error) {
      console.error('Token refresh error:', error);
      // If refresh fails, clear auth state
      await this.logout();
      return null;
    }
  }

  /**
   * Get current auth state
   */
  async getAuthState(): Promise<AuthState | null> {
    if (this.authState) {
      // Check if token is valid using shared utility
      if (isTokenStateValid(this.authState)) {
        // Check if we should proactively refresh
        if (shouldRefreshToken(this.authState)) {
          return (await this.refreshToken()) || this.authState;
        }
        return this.authState;
      } else {
        // Token expired, try to refresh
        return await this.refreshToken();
      }
    }

    // Try to load from storage
    const stored = await this.storage.load();
    if (stored) {
      this.authState = stored;
      // Check validity and potentially refresh
      if (!isTokenStateValid(stored)) {
        return await this.refreshToken();
      }
      return stored;
    }

    return null;
  }

  /**
   * Get user profile from ID token using shared utility
   */
  getUserProfile(): UserProfile | null {
    if (!this.authState?.idToken) {
      return null;
    }

    return extractUserProfile(this.authState.idToken) as UserProfile | null;
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const authState = await this.getAuthState();
    return authState !== null;
  }

  /**
   * Get access token for API calls
   */
  async getAccessToken(): Promise<string | null> {
    const authState = await this.getAuthState();
    return authState?.accessToken || null;
  }
}

export const authService = new AuthService();
