import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import SplashScreen from '../screens/SplashScreen';
import HomeScreen from '../screens/HomeScreen';
import CookedScreen from '../screens/CookedScreen';
import VibeCheckScreen from '../screens/VibeCheckScreen';
import HypeUpScreen from '../screens/HypeUpScreen';
import GhostWriterScreen from '../screens/GhostWriterScreen';
import RoastMyFriendScreen from '../screens/RoastMyFriendScreen';
import SettingsScreen from '../screens/SettingsScreen';

const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#0A0A0F' },
        gestureEnabled: true,
      }}
    >
      <Stack.Screen name="Splash" component={SplashScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Home" component={HomeScreen} options={{ gestureEnabled: false }} />
      <Stack.Screen name="Cooked" component={CookedScreen} />
      <Stack.Screen name="VibeCheck" component={VibeCheckScreen} />
      <Stack.Screen name="HypeUp" component={HypeUpScreen} />
      <Stack.Screen name="GhostWriter" component={GhostWriterScreen} />
      <Stack.Screen name="RoastMyFriend" component={RoastMyFriendScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
    </Stack.Navigator>
  );
}
