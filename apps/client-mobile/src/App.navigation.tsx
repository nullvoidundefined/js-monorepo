import React from 'react';
import {StatusBar} from 'react-native';
import {SafeAreaProvider} from 'react-native-safe-area-context';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';
import {enableScreens} from 'react-native-screens';
import HomeScreen from './screens/HomeScreen';
import {APP_COLORS} from './constants/theme';

// Enable screens for better performance
enableScreens();

const Stack = createStackNavigator();

const App = (): React.JSX.Element => {
  return (
    <SafeAreaProvider>
      <StatusBar
        backgroundColor={APP_COLORS.background}
        barStyle="dark-content"
      />
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen
            component={HomeScreen}
            name="Home"
          />
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  );
};

export default App;
