import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {enableScreens} from 'react-native-screens';
import HomeScreen from './screens/HomeScreen';
import ProfileScreen from './screens/ProfileScreen';
import {APP_COLORS} from './constants/theme';

// Enable screens for better performance
enableScreens();

const Tab = createBottomTabNavigator();

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor={APP_COLORS.background} />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarStyle: styles.tabBar,
            tabBarActiveTintColor: APP_COLORS.primary,
            tabBarInactiveTintColor: APP_COLORS.textSecondary,
          }}>
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{
              tabBarLabel: 'Home',
            }}
          />
          <Tab.Screen
            name="Profile"
            component={ProfileScreen}
            options={{
              tabBarLabel: 'Profile',
            }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: APP_COLORS.background,
    borderTopColor: APP_COLORS.border,
    borderTopWidth: 1,
    paddingBottom: 5,
    paddingTop: 5,
    height: 60,
  },
});

export default App;

