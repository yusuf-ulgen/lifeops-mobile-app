import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { initializeAuthListener } from '../services/auth';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';

import HomeScreen from '../screens/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import ReturnsScreen from '../screens/ReturnsScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => (
  <Tab.Navigator screenOptions={{ 
    headerShown: true, 
    tabBarActiveTintColor: '#2563eb',
    headerTitleStyle: { fontWeight: 'bold' }
  }}>
    <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Genel Bakış' }} />
    <Tab.Screen name="Subs" component={SubscriptionsScreen} options={{ title: 'Abonelikler' }} />
    <Tab.Screen name="Returns" component={ReturnsScreen} options={{ title: 'İadeler' }} />
  </Tab.Navigator>
);

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { session, isLoading } = useAuthStore();

  useEffect(() => {
    const subscription = initializeAuthListener();
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#2563eb" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
