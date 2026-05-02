import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { signUp } from '../services/auth';

export default function RegisterScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await signUp(email, password);
      Alert.alert('Başarılı', 'Kayıt başarılı! Şimdi giriş yapabilirsin.');
      navigation.navigate('Login');
    } catch (err: any) {
      Alert.alert('Kayıt Hatası', err.message || 'Bir sorun oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 justify-center px-6 bg-white">
      <Text className="text-3xl font-bold mb-10 text-center text-gray-900">Hesap Oluştur</Text>
      
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
        className="w-full bg-green-600 py-4 rounded-2xl flex items-center justify-center mb-6"
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text className="text-white font-semibold text-lg">Kayıt Ol</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text className="text-center text-gray-600 font-medium text-base">
          Zaten hesabın var mı? Giriş Yap
        </Text>
      </TouchableOpacity>
    </View>
  );
}
