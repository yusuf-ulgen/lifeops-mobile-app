import React, { useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  RefreshControl, ActivityIndicator, StatusBar, StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuthStore } from '../store/useAuthStore';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import { useReturnStore } from '../store/useReturnStore';
import { calculateDaysRemaining } from '../utils/dateUtils';
import { signOutUser } from '../services/auth';
import { LogOut, Package } from 'lucide-react-native';

const DARK_GREEN = '#154c44';
const MINT_BG = '#e8f8f3';
const WHITE = '#ffffff';

export default function HomeScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { user } = useAuthStore();
  const { subscriptions, loadSubscriptions } = useSubscriptionStore();
  const { returns, loadReturns, isLoading: retLoading } = useReturnStore();
  const [refreshing, setRefreshing] = React.useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    await Promise.all([loadSubscriptions(), loadReturns()]);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const monthlyTotal = subscriptions.reduce((acc, sub) =>
    acc + (sub.billing_cycle === 'monthly' ? Number(sub.amount) : Number(sub.amount) / 12), 0);

  const urgentReturns = returns.filter((item) => {
    const days = calculateDaysRemaining(item.purchase_date, item.return_window_days);
    return days >= 0 && days <= 5;
  });

  const initials = user?.email?.substring(0, 2).toUpperCase() || 'UK';

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <View>
          <Text style={styles.headerTitle}>Genel Bakış</Text>
          <Text style={styles.headerSubtitle}>Merhaba, Kullanıcı</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initials}</Text>
          </View>
          <TouchableOpacity onPress={signOutUser} style={styles.logoutBtn}>
            <LogOut size={22} color={WHITE} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={DARK_GREEN} />}
      >
        {/* Abonelikler Kartı */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Abonelikler</Text>
          <Text style={styles.cardAmount}>
            €{monthlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 0 })}
          </Text>
          <Text style={styles.cardSub}>{subscriptions.length} Aktif Abonelik</Text>
        </View>

        {/* Kritik İadeler Kartı */}
        <View style={styles.card}>
          <View style={styles.cardRowHeader}>
            <Text style={styles.cardLabel}>Kritik İadeler</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Returns')}>
              <Text style={styles.seeAll}>Tümünü Gör</Text>
            </TouchableOpacity>
          </View>

          {retLoading ? (
            <ActivityIndicator color={DARK_GREEN} style={{ marginVertical: 24 }} />
          ) : urgentReturns.length === 0 ? (
            <View style={styles.emptyInner}>
              <Package size={48} color={DARK_GREEN} strokeWidth={1.5} />
              <Text style={styles.emptyTitle}>Harika!</Text>
              <Text style={styles.emptyDesc}>Şu an acil bir iade bulunmuyor.</Text>
            </View>
          ) : (
            urgentReturns.map((item) => {
              const days = calculateDaysRemaining(item.purchase_date, item.return_window_days);
              return (
                <View key={item.id} style={styles.returnRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.returnName}>{item.product_name}</Text>
                    <Text style={styles.returnStore}>{item.store_name}</Text>
                  </View>
                  <View style={styles.daysBadge}>
                    <Text style={styles.daysText}>{days} GÜN</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f8f3' },
  header: {
    backgroundColor: '#154c44',
    paddingHorizontal: 24,
    paddingBottom: 32,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerTitle: { color: '#ffffff', fontSize: 28, fontWeight: '800' },
  headerSubtitle: { color: '#a7d9c8', fontSize: 15, marginTop: 4 },
  headerRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  avatar: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: '#a7d9c8',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { color: '#154c44', fontWeight: '700', fontSize: 15 },
  logoutBtn: { padding: 6 },
  scroll: { flex: 1 },
  scrollContent: { padding: 16, paddingTop: 20, paddingBottom: 40 },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#154c44',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardLabel: { color: '#154c44', fontWeight: '700', fontSize: 16, marginBottom: 8 },
  cardAmount: { color: '#154c44', fontWeight: '800', fontSize: 44, marginBottom: 4 },
  cardSub: { color: '#6b7280', fontSize: 14 },
  cardRowHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  seeAll: { color: '#6b7280', fontSize: 13 },
  emptyInner: { alignItems: 'center', paddingVertical: 24 },
  emptyTitle: { color: '#154c44', fontWeight: '700', fontSize: 18, marginTop: 12 },
  emptyDesc: { color: '#154c44', fontSize: 14, marginTop: 4, textAlign: 'center' },
  returnRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1, borderTopColor: '#f0faf5',
  },
  returnName: { color: '#154c44', fontWeight: '600', fontSize: 15 },
  returnStore: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  daysBadge: { backgroundColor: '#e8f8f3', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  daysText: { color: '#154c44', fontWeight: '700', fontSize: 12 },
});
