import React from 'react';
import {StatusBar, StyleSheet} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {enableScreens} from 'react-native-screens';
import HomeScreen from './screens/HomeScreen';
import {APP_COLORS} from './constants/theme';

// Enable screens for better performance
enableScreens();

const Tab = createBottomTabNavigator();

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={APP_COLORS.background}
        barStyle="dark-content"
      />
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: APP_COLORS.primary,
            tabBarInactiveTintColor: APP_COLORS.textSecondary,
            tabBarStyle: styles.tabBar,
          }}>
          <Tab.Screen
            component={HomeScreen}
            name="Home"
            options={{
              tabBarLabel: 'Home',
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
    height: 60,
    paddingBottom: 5,
    paddingTop: 5,
  },
});

export default App;
