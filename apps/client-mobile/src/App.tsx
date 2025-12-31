import React, {useState} from 'react';
import {
  ActivityIndicator,
  View,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {enableScreens} from 'react-native-screens';
import {AuthProvider, useAuth} from './contexts/AuthContext';
import LoginScreen from './screens/LoginScreen';
import {APP_COLORS} from './constants/theme';
import HomeScreen from './screens/HomeScreen';

// Enable screens for better performance
enableScreens();

const Stack = createStackNavigator();

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
      <StatusBar
        backgroundColor={APP_COLORS.background}
        barStyle="dark-content"
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          {isAuthenticated ? (
            <Stack.Screen component={HomeScreen} name="Home" />
          ) : (
            <Stack.Screen component={LoginScreen} name="Login" />
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaView>
  );
};

const App = (): React.JSX.Element => {
  // Create QueryClient inside the component with useState to ensure it persists
  // across Fast Refresh and re-renders properly
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1,
            staleTime: 5000,
          },
        },
      }),
  );

  return (
    <SafeAreaProvider>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppContent />
        </AuthProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
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
