import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useReturnStore } from '../store/useReturnStore';
import { calculateDaysRemaining, formatDate } from '../utils/dateUtils';
import Toast from 'react-native-toast-message';

export default function ReturnsScreen() {
  const { returns, loadReturns, createReturn, completeReturn, isLoading } = useReturnStore();
  const [modalVisible, setModalVisible] = useState(false);
  
  const [productName, setProductName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnWindow, setReturnWindow] = useState('14');

  useEffect(() => {
    loadReturns();
  }, []);

  const handleAdd = async () => {
    if (!productName || !storeName || !price || !returnWindow) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurun.');
      return;
    }
    
    try {
      await createReturn({
        product_name: productName,
        store_name: storeName,
        price: parseFloat(price),
        purchase_date: purchaseDate,
        return_window_days: parseInt(returnWindow, 10),
      });
      
      Toast.show({ type: 'success', text1: 'Başarılı', text2: 'Ürün takibe alındı.' });
      setModalVisible(false);
      setProductName('');
      setStoreName('');
      setPrice('');
      setReturnWindow('14');
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Hata', text2: 'Ekleme başarısız.' });
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-4 flex-row justify-between items-center mb-4">
        <Text className="text-xl font-bold text-gray-900">İade Bekleyenler</Text>
        <TouchableOpacity 
          className="bg-blue-600 px-4 py-2 rounded-xl"
          onPress={() => setModalVisible(true)}
        >
          <Text className="text-white font-bold">+ Yeni</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#2563eb" className="mt-10" />
      ) : (
        <FlatList
          data={returns}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 20 }}
          ListEmptyComponent={
            <View className="items-center mt-10">
              <Text className="text-5xl mb-4">📦</Text>
              <Text className="text-gray-900 font-bold text-lg">İade Takibi Yok</Text>
              <Text className="text-gray-500 text-center mt-2 px-10">Aldığınız ürünlerin iade sürelerini buradan takip edebilirsiniz.</Text>
            </View>
          }
          renderItem={({ item }) => {
            const daysRemaining = calculateDaysRemaining(item.purchase_date, item.return_window_days);
            const isCritical = daysRemaining <= 3;
            const isExpired = daysRemaining < 0;

            return (
              <View className="bg-white p-5 rounded-2xl mb-4 border border-gray-100 shadow-sm">
                <View className="flex-row justify-between items-start mb-3">
                  <View className="flex-1">
                    <Text className="font-bold text-lg text-gray-900">{item.product_name}</Text>
                    <Text className="text-gray-400 text-sm mt-0.5">{item.store_name} • ₺{item.price}</Text>
                  </View>
                  <View className={`px-3 py-1.5 rounded-full ${isExpired ? 'bg-gray-100' : (isCritical ? 'bg-red-50' : 'bg-green-50')}`}>
                    <Text className={`font-bold text-xs ${isExpired ? 'text-gray-400' : (isCritical ? 'text-red-600' : 'text-green-600')}`}>
                      {isExpired ? 'Süre Doldu' : `${daysRemaining} Gün`}
                    </Text>
                  </View>
                </View>

                <View className="flex-row justify-between items-center pt-3 border-t border-gray-50">
                  <Text className="text-gray-400 text-[10px]">Alış: {formatDate(item.purchase_date)}</Text>
                  <TouchableOpacity 
                    className="bg-gray-50 px-4 py-2 rounded-xl"
                    onPress={() => completeReturn(item.id)}
                  >
                    <Text className="text-gray-600 font-bold text-xs">İade Ettim</Text>
                  </TouchableOpacity>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white px-6 pt-8">
          <Text className="text-2xl font-bold text-gray-900 mb-6">İade Takibi Başlat</Text>
          
          <TextInput
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 mb-4 text-black"
            placeholder="Ürün Adı"
            placeholderTextColor="#9ca3af"
            value={productName}
            onChangeText={setProductName}
          />

          <TextInput
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 mb-4 text-black"
            placeholder="Mağaza"
            placeholderTextColor="#9ca3af"
            value={storeName}
            onChangeText={setStoreName}
          />

          <View className="flex-row mb-4">
             <TextInput
              className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black"
              placeholder="Fiyat (₺)"
              placeholderTextColor="#9ca3af"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <View className="w-3" />
            <TextInput
              className="flex-1 bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 text-black"
              placeholder="İade Süresi (Gün)"
              placeholderTextColor="#9ca3af"
              value={returnWindow}
              onChangeText={setReturnWindow}
              keyboardType="numeric"
            />
          </View>

          <Text className="text-gray-400 text-xs mb-2 ml-1">Satın Alınma Tarihi (YYYY-AA-GG)</Text>
          <TextInput
            className="w-full bg-gray-50 border border-gray-100 rounded-2xl px-4 py-4 mb-10 text-black"
            placeholder="2023-10-24"
            placeholderTextColor="#9ca3af"
            value={purchaseDate}
            onChangeText={setPurchaseDate}
          />

          <TouchableOpacity
            className="w-full bg-blue-600 py-4 rounded-2xl flex items-center mb-4"
            onPress={handleAdd}
          >
            <Text className="text-white font-bold text-lg">Takibi Başlat</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="w-full py-2 flex items-center"
            onPress={() => setModalVisible(false)}
          >
            <Text className="text-gray-400 font-medium text-base">Vazgeç</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}
