import React, {createContext, useContext, useEffect, useState} from 'react';
import {authService, AuthState, UserProfile} from '../services/auth.service';

interface AuthContextType {
  authState: AuthState | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [authState, setAuthState] = useState<AuthState | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setIsLoading(true);
      const state = await authService.getAuthState();
      setAuthState(state);
      
      if (state) {
        const profile = authService.getUserProfile();
        setUserProfile(profile);
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async () => {
    try {
      setIsLoading(true);
      const state = await authService.login();
      setAuthState(state);
      
      const profile = authService.getUserProfile();
      setUserProfile(profile);
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await authService.logout();
      setAuthState(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    authState,
    userProfile,
    isLoading,
    isAuthenticated: authState !== null,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

