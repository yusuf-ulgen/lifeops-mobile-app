import React, { useState } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, Alert, 
  ActivityIndicator, KeyboardAvoidingView, Platform, 
  ScrollView, StyleSheet, StatusBar 
} from 'react-native';
import { signIn } from '../services/auth';
import { Mail, Lock, ChevronLeft, Eye, EyeOff } from 'lucide-react-native';

export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    /*
    // Auth şimdilik devre dışı bırakıldı
    if (!email || !password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      let message = 'Giriş yapılamadı.';
      const errMessage = err.message || '';

      if (errMessage.includes('Invalid login credentials')) {
        // Kullanıcıya hem email hem şifre kontrolü yapması gerektiğini belirten net bir mesaj
        message = 'Girdiğiniz bilgiler sistemimizdeki kayıtlarla eşleşmiyor. Lütfen e-posta adresinizi ve şifrenizi kontrol edin.';
      } else if (errMessage.includes('Email not confirmed')) {
        message = 'E-posta adresiniz henüz doğrulanmamış.';
      } else {
        message = errMessage;
      }
      
      Alert.alert('Giriş Hatası', message);
    } finally {
      setLoading(false);
    }
    */
    // Direkt içeri alalım
    navigation.navigate('Home');
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={() => navigation.goBack()}
          >
            <ChevronLeft size={28} color="#000" />
          </TouchableOpacity>

          <View style={styles.header}>
            <Text style={styles.headerTitle}>Giriş Yap</Text>
            <Text style={styles.headerSubtitle}>Hesabınıza erişmek için bilgilerinizi girin.</Text>
          </View>

          <View style={styles.card}>
            <View style={styles.inputGroup}>
              <TextInput
                style={styles.input}
                placeholder="E-posta"
                placeholderTextColor="#9ca3af"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputGroup}>
              <View style={styles.passwordContainer}>
                <TextInput
                  style={[styles.input, { flex: 1, borderBottomWidth: 0 }]}
                  placeholder="Şifre"
                  placeholderTextColor="#9ca3af"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={22} color="#9ca3af" /> : <Eye size={22} color="#9ca3af" />}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Şifremi Unuttum</Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.button}
              onPress={handleLogin}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.buttonText}>Giriş Yap</Text>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
              <Text style={styles.footerText}>
                Henüz hesabınız yok mu? <Text style={styles.footerLink}>Kaydolun</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 30,
    paddingTop: 60,
    paddingBottom: 40,
  },
  backButton: {
    marginBottom: 30,
  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginTop: 8,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  inputGroup: {
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  input: {
    height: 60,
    fontSize: 18,
    color: '#1e293b',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  forgotPassword: {
    alignItems: 'flex-end',
    marginBottom: 30,
  },
  forgotPasswordText: {
    color: '#3b82f6',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#3b82f6',
    height: 64,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
  },
  footerText: {
    fontSize: 16,
    color: '#64748b',
  },
  footerLink: {
    color: '#3b82f6',
    fontWeight: 'bold',
  },
});


