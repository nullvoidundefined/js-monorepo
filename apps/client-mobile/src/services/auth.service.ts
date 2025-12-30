import {authorize, refresh, revoke} from 'react-native-app-auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {Platform} from 'react-native';
import {
  GOOGLE_OAUTH_IOS_CLIENT_ID,
  GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  GOOGLE_OAUTH_ISSUER,
  API_URL,
} from '@env';

const STORAGE_KEY = '@auth_state';

export interface AuthState {
  accessToken: string;
  accessTokenExpirationDate: string;
  refreshToken?: string;
  idToken: string;
  tokenType: string;
  scopes: string[];
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

// OAuth configuration
const config = {
  issuer: GOOGLE_OAUTH_ISSUER,
  clientId:
    Platform.OS === 'ios'
      ? GOOGLE_OAUTH_IOS_CLIENT_ID
      : GOOGLE_OAUTH_ANDROID_CLIENT_ID,
  redirectUrl:
    Platform.OS === 'ios'
      ? `${GOOGLE_OAUTH_IOS_CLIENT_ID.split('.')[0].split('apps.')[0]}:/oauth2redirect/google`
      : `com.googleusercontent.apps.${GOOGLE_OAUTH_ANDROID_CLIENT_ID.split('.')[0]}:/oauth2redirect/google`,
  scopes: ['openid', 'profile', 'email'],
  serviceConfiguration: {
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth',
    tokenEndpoint: 'https://oauth2.googleapis.com/token',
    revocationEndpoint: 'https://oauth2.googleapis.com/revoke',
  },
};

class AuthService {
  private authState: AuthState | null = null;

  /**
   * Initiate OAuth login flow
   */
  async login(): Promise<AuthState> {
    try {
      const result = await authorize(config);
      this.authState = result;
      await this.saveAuthState(result);
      
      // Optionally sync with backend
      await this.syncWithBackend(result);
      
      return result;
    } catch (error) {
      console.error('OAuth login error:', error);
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
          tokenToRevoke: this.authState.accessToken,
          includeBasicAuth: true,
        });
      }
    } catch (error) {
      console.error('Token revocation error:', error);
    } finally {
      this.authState = null;
      await AsyncStorage.removeItem(STORAGE_KEY);
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
      this.authState = result;
      await this.saveAuthState(result);
      return result;
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
      // Check if token is expired
      const expirationDate = new Date(
        this.authState.accessTokenExpirationDate,
      );
      if (expirationDate > new Date()) {
        return this.authState;
      } else {
        // Try to refresh
        return await this.refreshToken();
      }
    }

    // Try to load from storage
    const stored = await this.loadAuthState();
    if (stored) {
      this.authState = stored;
      // Check expiration and potentially refresh
      const expirationDate = new Date(stored.accessTokenExpirationDate);
      if (expirationDate <= new Date()) {
        return await this.refreshToken();
      }
      return stored;
    }

    return null;
  }

  /**
   * Get user profile from ID token
   */
  getUserProfile(): UserProfile | null {
    if (!this.authState?.idToken) {
      return null;
    }

    try {
      // Decode JWT (ID token is a JWT)
      const base64Url = this.authState.idToken.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      );

      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Error decoding ID token:', error);
      return null;
    }
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

  /**
   * Sync authentication with backend
   * This allows the backend to create a session or validate the user
   */
  private async syncWithBackend(authState: AuthState): Promise<void> {
    try {
      const response = await fetch(`${API_URL}/api/auth/mobile/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authState.idToken}`,
        },
        body: JSON.stringify({
          accessToken: authState.accessToken,
          idToken: authState.idToken,
        }),
      });

      if (!response.ok) {
        console.warn('Backend sync failed:', response.status);
      }
    } catch (error) {
      console.error('Backend sync error:', error);
      // Don't throw - authentication can work without backend sync
    }
  }

  /**
   * Save auth state to AsyncStorage
   */
  private async saveAuthState(authState: AuthState): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(authState));
    } catch (error) {
      console.error('Error saving auth state:', error);
    }
  }

  /**
   * Load auth state from AsyncStorage
   */
  private async loadAuthState(): Promise<AuthState | null> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading auth state:', error);
      return null;
    }
  }
}

export const authService = new AuthService();

