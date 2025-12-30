import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
import {useAuth} from '../contexts/AuthContext';
import {APP_COLORS, APP_SPACING} from '../constants/theme';

const LoginScreen: React.FC = () => {
  const {login} = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);
      await login();
    } catch (error: any) {
      setIsLoading(false);
      
      // Handle user cancellation gracefully
      if (error.message?.includes('User cancelled')) {
        return; // Don't show error for cancellation
      }
      
      Alert.alert(
        'Authentication Error',
        'Failed to sign in with Google. Please try again.',
        [{text: 'OK'}],
      );
      console.error('Login error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <Text style={styles.logo}>📱</Text>
          <Text style={styles.appName}>Client Mobile</Text>
        </View>

        <View style={styles.welcomeContainer}>
          <Text style={styles.welcomeTitle}>Welcome</Text>
          <Text style={styles.welcomeSubtitle}>
            Sign in to access your account
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}
          disabled={isLoading}>
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <>
              <View style={styles.googleIconContainer}>
                <Text style={styles.googleIcon}>G</Text>
              </View>
              <Text style={styles.googleButtonText}>Sign in with Google</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.infoContainer}>
          <Text style={styles.infoText}>
            By signing in, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: APP_COLORS.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: APP_SPACING.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: APP_SPACING.xl * 2,
  },
  logo: {
    fontSize: 80,
    marginBottom: APP_SPACING.md,
  },
  appName: {
    fontSize: 28,
    fontWeight: '700',
    color: APP_COLORS.text,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: APP_SPACING.xl * 2,
  },
  welcomeTitle: {
    fontSize: 32,
    fontWeight: '700',
    color: APP_COLORS.text,
    marginBottom: APP_SPACING.sm,
  },
  welcomeSubtitle: {
    fontSize: 16,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
  },
  googleButton: {
    backgroundColor: '#4285F4',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: APP_SPACING.md + 4,
    paddingHorizontal: APP_SPACING.xl,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  googleIconContainer: {
    width: 24,
    height: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: APP_SPACING.md,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  infoContainer: {
    marginTop: APP_SPACING.xl * 2,
    paddingHorizontal: APP_SPACING.md,
  },
  infoText: {
    fontSize: 12,
    color: APP_COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default LoginScreen;

