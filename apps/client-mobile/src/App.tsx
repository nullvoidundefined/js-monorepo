import React from 'react';
import {ActivityIndicator, View, StyleSheet, SafeAreaView} from 'react-native';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import MainScreen from './screens/MainScreen';
import {APP_COLORS} from './constants/theme';

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
      {isAuthenticated ? <MainScreen /> : <LoginScreen />}
    </SafeAreaView>
  );
};

const App = (): React.JSX.Element => {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
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

