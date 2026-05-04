import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { initializeAuthListener } from '../services/auth';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';

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
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f8fafc' }}>
        <ActivityIndicator size="large" color="#3b82f6" />
        <Text style={{ marginTop: 15, color: '#64748b', fontWeight: '600' }}>LifeOps Hazırlanıyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <MainTabs /> : <AuthStack />}
    </NavigationContainer>
  );
};
