import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
          disabled={isLoading}
          style={[styles.googleButton, isLoading && styles.buttonDisabled]}
          onPress={handleLogin}>
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
  appName: {
    color: APP_COLORS.text,
    fontSize: 28,
    fontWeight: '700',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  container: {
    backgroundColor: APP_COLORS.background,
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: APP_SPACING.xl,
  },
  googleButton: {
    alignItems: 'center',
    backgroundColor: '#4285F4',
    borderRadius: 8,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
    paddingHorizontal: APP_SPACING.xl,
    paddingVertical: APP_SPACING.md + 4,
    shadowColor: '#000',
    shadowOffset: {
      height: 2,
      width: 0,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  googleButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  googleIcon: {
    color: '#4285F4',
    fontSize: 18,
    fontWeight: '700',
  },
  googleIconContainer: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
    height: 24,
    justifyContent: 'center',
    marginRight: APP_SPACING.md,
    width: 24,
  },
  infoContainer: {
    marginTop: APP_SPACING.xl * 2,
    paddingHorizontal: APP_SPACING.md,
  },
  infoText: {
    color: APP_COLORS.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
  },
  logo: {
    fontSize: 80,
    marginBottom: APP_SPACING.md,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: APP_SPACING.xl * 2,
  },
  welcomeContainer: {
    alignItems: 'center',
    marginBottom: APP_SPACING.xl * 2,
  },
  welcomeSubtitle: {
    color: APP_COLORS.textSecondary,
    fontSize: 16,
    textAlign: 'center',
  },
  welcomeTitle: {
    color: APP_COLORS.text,
    fontSize: 32,
    fontWeight: '700',
    marginBottom: APP_SPACING.sm,
  },
});

export default LoginScreen;
