import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, RefreshControl, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useReturnStore } from '../store/useReturnStore';
import { calculateDaysRemaining } from '../utils/dateUtils';
import { signOutUser } from '../services/auth';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { subscriptions, loadSubscriptions, isLoading: subLoading } = useSubscriptionStore();
  const { returns, loadReturns, isLoading: retLoading } = useReturnStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    await Promise.all([loadSubscriptions(), loadReturns()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const monthlyTotal = subscriptions.reduce((acc, sub) => {
    return acc + (sub.billing_cycle === 'monthly' ? Number(sub.amount) : Number(sub.amount) / 12);
  }, 0);

  const urgentReturns = returns.filter((item) => {
    const days = calculateDaysRemaining(item.purchase_date, item.return_window_days);
    return days >= 0 && days <= 5;
  });

  const displayName = user?.email?.split('@')[0] || 'Kullanıcı';

  return (
    <ScrollView 
      className="flex-1 bg-gray-50"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View className="px-6 pt-10 pb-6 bg-white rounded-b-[40px] shadow-sm mb-6">
        <View className="flex-row justify-between items-center mb-6">
          <View>
            <Text className="text-gray-400 font-medium text-sm">Tekrar Merhaba,</Text>
            <Text className="text-2xl font-bold text-gray-900 capitalize">{displayName}</Text>
          </View>
          <TouchableOpacity 
             onPress={signOutUser}
             className="bg-gray-100 p-3 rounded-2xl"
          >
            <Text className="text-gray-600 font-bold text-xs">Çıkış</Text>
          </TouchableOpacity>
        </View>

        <View className="bg-blue-600 rounded-3xl p-6 shadow-md shadow-blue-300">
          <Text className="text-blue-100 font-medium text-xs mb-1">AYLIK SABİT GİDER</Text>
          <Text className="text-white font-bold text-4xl">₺{monthlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}</Text>
          <View className="mt-4 flex-row items-center">
             <Text className="text-blue-200 text-xs font-medium">{subscriptions.length} aktif abonelik</Text>
          </View>
        </View>
      </View>

      <View className="px-6 mb-8">
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-xl font-bold text-gray-900">Kritik İadeler</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Returns')}>
             <Text className="text-blue-600 font-bold text-xs">Tümünü Gör</Text>
          </TouchableOpacity>
        </View>

        {retLoading ? (
           <ActivityIndicator color="#2563eb" />
        ) : urgentReturns.length === 0 ? (
          <View className="bg-white p-6 rounded-3xl items-center border border-gray-100">
            <Text className="text-gray-400 text-center font-medium">Şu an acil bir iade bulunmuyor. 🎉</Text>
          </View>
        ) : (
          urgentReturns.map((item) => {
            const days = calculateDaysRemaining(item.purchase_date, item.return_window_days);
            return (
              <View key={item.id} className="bg-white p-4 rounded-3xl mb-3 flex-row items-center border border-gray-100 shadow-sm">
                <View className="bg-red-50 w-12 h-12 rounded-2xl items-center justify-center mr-4">
                   <Text className="text-red-500 font-bold text-xs">{days}G</Text>
                </View>
                <View className="flex-1">
                   <Text className="font-bold text-gray-900">{item.product_name}</Text>
                   <Text className="text-gray-400 text-xs">{item.store_name}</Text>
                </View>
                <Text className="font-bold text-gray-900">₺{item.price}</Text>
              </View>
            );
          })
        )}
      </View>
      
      <View className="h-20" />
    </ScrollView>
  );
}
