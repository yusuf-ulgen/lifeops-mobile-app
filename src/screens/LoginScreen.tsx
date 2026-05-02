import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signIn } from '../services/auth';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      Alert.alert('Giriş Hatası', err.message || 'Bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-4xl font-bold mb-10 text-center text-gray-900">LifeOps</Text>
      
      <TextInput
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 mb-4 text-black"
        placeholder="E-posta"
        placeholderTextColor="#9ca3af"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      
      <TextInput
        className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-4 py-4 mb-8 text-black"
        placeholder="Şifre"
        placeholderTextColor="#9ca3af"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        className="w-full bg-blue-600 py-4 rounded-2xl flex items-center justify-center mb-6"
        onPress={handleLogin}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Giriş Yap</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Register')}>
        <Text className="text-center text-blue-600 font-medium text-base">
          Hesabın yok mu? Kayıt Ol
        </Text>
      </TouchableOpacity>
    </View>
  );
}
