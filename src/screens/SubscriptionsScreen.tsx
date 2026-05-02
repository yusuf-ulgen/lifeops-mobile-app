import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import Toast from 'react-native-toast-message';

export default function SubscriptionsScreen() {
  const { subscriptions, loadSubscriptions, createSubscription, removeSubscription, isLoading } = useSubscriptionStore();
  const [modalVisible, setModalVisible] = useState(false);
  
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    return acc + (sub.billing_cycle === 'monthly' ? Number(sub.amount) : Number(sub.amount) / 12);
  }, 0);

  const yearlyTotal = subscriptions.reduce((acc, sub) => {
    return acc + (sub.billing_cycle === 'yearly' ? Number(sub.amount) : Number(sub.amount) * 12);
  }, 0);

  const handleAdd = async () => {
    if (!name || !amount) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    try {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);

      await createSubscription({
        name,
        amount: parseFloat(amount),
        billing_cycle: cycle,
        next_billing_date: nextDate.toISOString().split('T')[0], 
      });
      
      Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Abonelik eklendi.' });
      setModalVisible(false);
      setName('');
      setAmount('');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Ekleme başarısız.' });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Sil', 'Bu aboneliği silmek istediğinize emin misiniz?', [
      { text: 'İptal', style: 'cancel' },
      { text: 'Sil', style: 'destructive', onPress: () => removeSubscription(id) }
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4">
        {/* Özet Kartı */}
        <View className="bg-blue-600 rounded-3xl p-6 mb-6 shadow-sm">
          <Text className="text-blue-100 font-medium text-xs mb-1">AYLIK TOPLAM GİDER</Text>
          <Text className="text-white font-bold text-3xl mb-4">₺{monthlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
          
          <View className="flex-row justify-between border-t border-blue-500 pt-4">
            <View>
              <Text className="text-blue-100 text-[10px] font-medium mb-1">YILLIK TAHMİNİ</Text>
              <Text className="text-white font-semibold text-base">₺{yearlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
            </View>
            <TouchableOpacity 
              className="bg-white/20 px-4 py-2 rounded-xl"
              onPress={() => setModalVisible(true)}
            >
              <Text className="text-white font-bold">+ Ekle</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
      ) : (
        <FlatList
          data={subscriptions}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-5xl mb-4">💸</Text>
              <Text className="text-gray-900 font-bold text-lg">Abonelik Yok</Text>
              <Text className="text-gray-500 text-center mt-2 px-10">Henüz bir abonelik eklemediniz. Giderlerinizi takip etmek için bir tane ekleyin.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-2xl mb-3 flex-row justify-between items-center border border-gray-100 shadow-sm">
              <View className="flex-1">
                <Text className="font-bold text-gray-900 text-base">{item.name}</Text>
                <Text className="text-gray-400 text-xs mt-1 capitalize">
                  {item.billing_cycle === 'monthly' ? 'Aylık' : 'Yıllık'} Ödeme
                </Text>
              </View>
              <View className="flex-row items-center">
                <Text className="font-bold text-gray-900 text-lg mr-4">₺{item.amount}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)}>
                  <Text className="text-red-500 font-bold">X</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Ekleme Modalı */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white px-6 pt-8">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Yeni Abonelik</Text>
          
          <TextInput
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 mb-4 text-black"
            placeholder="Abonelik Adı (Netflix, iCloud vb.)"
            placeholderTextColor="#9ca3af"
            value={name}
            onChangeText={setName}
          />

          <TextInput
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 mb-6 text-black"
            placeholder="Tutar (₺)"
            placeholderTextColor="#9ca3af"
            value={amount}
            onChangeText={setAmount}
            keyboardType="numeric"
          />

          <Text className="text-gray-900 font-bold mb-4 ml-1">Ödeme Periyodu</Text>
          <View className="flex-row mb-10">
            <TouchableOpacity 
              className={`flex-1 py-4 rounded-2xl border ${cycle === 'monthly' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
              onPress={() => setCycle('monthly')}
            >
              <Text className={`text-center font-bold ${cycle === 'monthly' ? 'text-white' : 'text-gray-500'}`}>Aylık</Text>
            </TouchableOpacity>
            <View className="w-3" />
            <TouchableOpacity 
              className={`flex-1 py-4 rounded-2xl border ${cycle === 'yearly' ? 'bg-blue-600 border-blue-600' : 'bg-white border-gray-200'}`}
              onPress={() => setCycle('yearly')}
            >
              <Text className={`text-center font-bold ${cycle === 'yearly' ? 'text-white' : 'text-gray-500'}`}>Yıllık</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            className="w-full bg-blue-600 py-4 rounded-2xl flex items-center mb-4"
            onPress={handleAdd}
          >
            <Text className="text-white font-bold text-lg">Kaydet</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-2 flex items-center"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-gray-400 font-medium text-base">İptal Et</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
