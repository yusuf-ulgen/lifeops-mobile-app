import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AppNavigator } from './src/navigation/AppNavigator';
import Toast from 'react-native-toast-message';
import './src/i18n';

// Global styles (NativeWind setup için gerekebilir)
import "./global.css";

import { toastConfig } from './src/config/toastConfig';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AppNavigator />
      <Toast config={toastConfig} />
    </SafeAreaProvider>
  );
}
