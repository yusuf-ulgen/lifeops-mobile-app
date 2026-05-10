import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { initializeAuthListener } from '../services/auth';
import { Home, Repeat, Package } from 'lucide-react-native';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import WelcomeScreen from '../screens/WelcomeScreen';
import HomeScreen from '../screens/HomeScreen';
import SubscriptionsScreen from '../screens/SubscriptionsScreen';
import ReturnsScreen from '../screens/ReturnsScreen';
import QRScannerScreen from '../screens/QRScannerScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const DARK_GREEN = '#154c44';
const GRAY = '#9ca3af';

const MainTabs = () => {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 60 + (insets.bottom > 0 ? insets.bottom : 12);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: DARK_GREEN,
        tabBarInactiveTintColor: GRAY,
        tabBarStyle: {
          height: tabBarHeight,
          paddingBottom: insets.bottom > 0 ? insets.bottom : 12,
          paddingTop: 8,
          backgroundColor: '#ffffff',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#000',
          shadowOpacity: 0.08,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: -4 },
        },
        tabBarIcon: ({ color, focused }) => {
          if (route.name === 'Home') return <Home size={24} color={color} strokeWidth={focused ? 2.5 : 1.8} />;
          if (route.name === 'Subs') return <Repeat size={24} color={color} strokeWidth={focused ? 2.5 : 1.8} />;
          if (route.name === 'Returns') return <Package size={24} color={color} strokeWidth={focused ? 2.5 : 1.8} />;
        },
        tabBarLabel: ({ focused, color }) => {
          const labels: Record<string, string> = { Home: 'Genel Bakış', Subs: 'Abonelikler', Returns: 'İadeler' };
          return (
            <View style={{ alignItems: 'center' }}>
              <Text style={{ color, fontSize: 11, fontWeight: focused ? '700' : '500', marginTop: 4 }}>
                {labels[route.name]}
              </Text>
              {focused && (
                <View style={{ width: 20, height: 2.5, backgroundColor: DARK_GREEN, marginTop: 3, borderRadius: 2 }} />
              )}
            </View>
          );
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Subs" component={SubscriptionsScreen} />
      <Tab.Screen name="Returns" component={ReturnsScreen} />
    </Tab.Navigator>
  );
};

const AuthStack = () => (
  <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Welcome">
    <Stack.Screen name="Welcome" component={WelcomeScreen} />
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

export const AppNavigator = () => {
  const { isLoading, user } = useAuthStore();

  useEffect(() => {
    const subscription = initializeAuthListener();
    return () => { subscription.unsubscribe(); };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={DARK_GREEN} />
        <Text style={styles.loadingText}>LifeOps Yükleniyor...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!user ? (
          <Stack.Screen name="Auth" component={AuthStack} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="QRScanner" component={QRScannerScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#e8f8f3' },
  loadingText: { marginTop: 16, color: '#154c44', fontWeight: '700', fontSize: 15 },
});
