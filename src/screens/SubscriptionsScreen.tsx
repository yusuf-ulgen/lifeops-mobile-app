import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator, StatusBar, StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSubscriptionStore } from '../store/useSubscriptionStore';
import Toast from 'react-native-toast-message';
import { useTranslation } from 'react-i18next';
import { CreditCard, Plus, X, AlertCircle } from 'lucide-react-native';

const DARK_GREEN = '#154c44';
const MINT_BG = '#e8f8f3';
const WHITE = '#ffffff';

import { toastConfig } from '../config/toastConfig';

export default function SubscriptionsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { subscriptions, loadSubscriptions, createSubscription, removeSubscription, isLoading } = useSubscriptionStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly');

  useEffect(() => { loadSubscriptions(); }, []);

  const monthlyTotal = subscriptions.reduce((acc, sub) =>
    acc + (sub.billing_cycle === 'monthly' ? Number(sub.amount) : Number(sub.amount) / 12), 0);

  const yearlyTotal = subscriptions.reduce((acc, sub) =>
    acc + (sub.billing_cycle === 'yearly' ? Number(sub.amount) : Number(sub.amount) * 12), 0);

  const handleAdd = async () => {
    if (!name || !amount) { 
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('common.error_fields') }); 
      return; 
    }
    try {
      const nextDate = new Date();
      nextDate.setMonth(nextDate.getMonth() + 1);
      await createSubscription({ 
        name, 
        amount: parseFloat(amount), 
        billing_cycle: cycle, 
        next_billing_date: nextDate.toISOString().split('T')[0] 
      });
      Toast.show({ type: 'success', text1: t('common.success'), text2: t('subscriptions.success_added') });
      setModalVisible(false); setName(''); setAmount('');
    } catch { 
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('subscriptions.error_failed') }); 
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(t('subscriptions.delete_confirm_title'), t('subscriptions.delete_confirm_desc'), [
      { text: t('common.cancel'), style: 'cancel' },
      { text: t('common.delete'), style: 'destructive', onPress: () => removeSubscription(id) }
    ]);
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={DARK_GREEN} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 24 }]}>
        <Text style={styles.headerTitle}>{t('subscriptions.title')}</Text>
      </View>

      <View style={styles.body}>
        {/* Stats Row */}
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { marginRight: 8 }]}>
            <Text style={styles.statLabel}>{t('subscriptions.monthly_total')}</Text>
            <Text style={styles.statValue}>₺{monthlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
          </View>
          <View style={[styles.statCard, { marginLeft: 8 }]}>
            <Text style={styles.statLabel}>{t('subscriptions.yearly_total')}</Text>
            <Text style={styles.statValue}>₺{yearlyTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Text>
          </View>
        </View>

        {isLoading ? (
          <ActivityIndicator size="large" color={DARK_GREEN} style={{ marginTop: 40 }} />
        ) : (
          <FlatList
            data={subscriptions}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                {/* Credit card illustration area */}
                <View style={styles.emptyIconBg}>
                  <View style={styles.creditCardOuter}>
                    <CreditCard size={60} color={DARK_GREEN} strokeWidth={1.5} />
                  </View>
                  <View style={styles.plusBadge}>
                    <Plus size={20} color={DARK_GREEN} strokeWidth={3} />
                  </View>
                </View>
                <Text style={styles.emptyTitle}>{t('subscriptions.no_subscriptions')}</Text>
                <Text style={styles.emptyDesc}>
                  {t('subscriptions.no_subscriptions_desc')}
                </Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
                  <Text style={styles.primaryBtnText}>{t('subscriptions.add_first')}</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => (
              <View style={styles.listItem}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemSub}>{item.billing_cycle === 'monthly' ? t('subscriptions.monthly') : t('subscriptions.yearly')}</Text>
                </View>
                <Text style={styles.itemAmount}>₺{item.amount}</Text>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
                  <X size={16} color="#ef4444" strokeWidth={2.5} />
                </TouchableOpacity>
              </View>
            )}
            ListFooterComponent={
              subscriptions.length > 0 ? (
                <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => setModalVisible(true)}>
                  <Text style={styles.primaryBtnText}>{t('subscriptions.add_new')}</Text>
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View style={styles.modalContainer}>
          <Toast config={toastConfig} topOffset={10} />
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{t('subscriptions.add_new')}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color={DARK_GREEN} />
            </TouchableOpacity>
          </View>

          <Text style={styles.inputLabel}>{t('subscriptions.name')}</Text>
          <TextInput style={styles.input} placeholder={t('subscriptions.name')} placeholderTextColor="#9ca3af" value={name} onChangeText={setName} />

          <Text style={styles.inputLabel}>{t('subscriptions.amount')}</Text>
          <View style={styles.inputRow}>
            <Text style={styles.currencySymbol}>₺</Text>
            <TextInput style={[styles.input, { flex: 1, borderWidth: 0, paddingHorizontal: 0, marginBottom: 0 }]} placeholder="0.00" placeholderTextColor="#9ca3af" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          </View>

          <Text style={styles.inputLabel}>{t('subscriptions.period')}</Text>
          <View style={styles.segmented}>
            <TouchableOpacity style={[styles.segBtn, cycle === 'monthly' && styles.segBtnActive]} onPress={() => setCycle('monthly')}>
              <Text style={[styles.segBtnText, cycle === 'monthly' && styles.segBtnTextActive]}>{t('subscriptions.monthly')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.segBtn, cycle === 'yearly' && styles.segBtnActive]} onPress={() => setCycle('yearly')}>
              <Text style={[styles.segBtnText, cycle === 'yearly' && styles.segBtnTextActive]}>{t('subscriptions.yearly')}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 'auto', marginBottom: 32 }]} onPress={handleAdd}>
            <Text style={styles.primaryBtnText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f8f3' },
  header: {
    backgroundColor: '#154c44',
    paddingHorizontal: 24,
    paddingBottom: 48,
    borderBottomLeftRadius: 40,
    borderBottomRightRadius: 40,
    alignItems: 'center',
  },
  headerTitle: { color: '#ffffff', fontSize: 20, fontWeight: '700' },
  body: { flex: 1, paddingHorizontal: 16, marginTop: -24 },
  statsRow: { flexDirection: 'row', marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#ffffff', borderRadius: 16, padding: 16,
    minHeight: 100, justifyContent: 'center',
    shadowColor: '#154c44', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  statLabel: { color: '#154c44', fontWeight: '600', fontSize: 13, lineHeight: 20, marginBottom: 8 },
  statValue: { color: '#154c44', fontWeight: '800', fontSize: 22 },
  emptyCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 28,
    alignItems: 'center', marginTop: 8,
    shadowColor: '#154c44', shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#e8f8f3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24, position: 'relative',
  },
  creditCardOuter: { justifyContent: 'center', alignItems: 'center' },
  plusBadge: {
    position: 'absolute', bottom: 8, right: 8,
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#ffffff', borderWidth: 2, borderColor: '#154c44',
    justifyContent: 'center', alignItems: 'center',
  },
  emptyTitle: { color: '#154c44', fontWeight: '700', fontSize: 20, marginBottom: 10 },
  emptyDesc: { color: '#154c44', fontSize: 14, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  primaryBtn: {
    backgroundColor: '#154c44', borderRadius: 16, height: 52,
    justifyContent: 'center', alignItems: 'center', width: '100%',
  },
  primaryBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 15 },
  listItem: {
    backgroundColor: '#ffffff', borderRadius: 16, padding: 16, marginBottom: 10,
    flexDirection: 'row', alignItems: 'center',
    shadowColor: '#154c44', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  itemName: { color: '#154c44', fontWeight: '700', fontSize: 16 },
  itemSub: { color: '#6b7280', fontSize: 12, marginTop: 2 },
  itemAmount: { color: '#154c44', fontWeight: '800', fontSize: 18, marginRight: 12 },
  deleteBtn: { backgroundColor: '#fff0f0', padding: 8, borderRadius: 20 },
  modalContainer: { flex: 1, backgroundColor: '#e8f8f3', paddingHorizontal: 24, paddingTop: 80 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { color: '#154c44', fontSize: 22, fontWeight: '700' },
  inputLabel: { color: '#154c44', fontWeight: '600', fontSize: 14, marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#154c44', fontWeight: '500', marginBottom: 16,
    shadowColor: '#154c44', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  inputRow: {
    backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 16,
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    shadowColor: '#154c44', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  currencySymbol: { color: '#9ca3af', fontWeight: '700', fontSize: 16, marginRight: 8 },
  segmented: { flexDirection: 'row', backgroundColor: '#ffffff', borderRadius: 14, padding: 6, marginBottom: 24 },
  segBtn: { flex: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  segBtnActive: { backgroundColor: '#e8f8f3' },
  segBtnText: { color: '#9ca3af', fontWeight: '600', fontSize: 14 },
  segBtnTextActive: { color: '#154c44', fontWeight: '700' },
});
