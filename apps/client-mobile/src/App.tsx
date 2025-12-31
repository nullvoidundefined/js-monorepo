import React from 'react';
import {ActivityIndicator, View, StyleSheet, SafeAreaView} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import {APP_COLORS} from './constants/theme';
import HomeScreen from './screens/HomeScreen';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 5000,
    },
  },
});

const AppContent = (): React.JSX.Element => {
  const {isAuthenticated, isLoading} = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color={APP_COLORS.primary} size="large" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {isAuthenticated ? <HomeScreen /> : <LoginScreen />}
    </SafeAreaView>
  );
};

const App = (): React.JSX.Element => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </QueryClientProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: APP_COLORS.background,
    flex: 1,
  },
  loadingContainer: {
    alignItems: 'center',
    backgroundColor: APP_COLORS.background,
    flex: 1,
    justifyContent: 'center',
  },
});

export default App;
