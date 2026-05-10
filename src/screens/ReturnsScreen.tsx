import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, Modal,
  TextInput, Alert, ActivityIndicator, StatusBar, StyleSheet
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useReturnStore } from '../store/useReturnStore';
import { calculateDaysRemaining, formatDate } from '../utils/dateUtils';
import Toast from 'react-native-toast-message';
import { Package, Clock, X, Calendar, ShoppingBag, ImagePlus, Sparkles } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';
import * as ImagePicker from 'expo-image-picker';
import { analyzeOrderScreenshot } from '../services/aiService';

const DARK_GREEN = '#154c44';
const MINT_BG = '#e8f8f3';
const WHITE = '#ffffff';

import { toastConfig } from '../config/toastConfig';

export default function ReturnsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { returns, loadReturns, createReturn, completeReturn, isLoading } = useReturnStore();
  const [modalVisible, setModalVisible] = useState(false);
  const [productName, setProductName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [price, setPrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [returnWindow, setReturnWindow] = useState('14');

  useEffect(() => { loadReturns(); }, []);

  const handleAdd = async () => {
    if (!productName || !storeName || !price || !returnWindow) { 
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('common.error_fields') }); 
      return; 
    }
    try {
      await createReturn({ product_name: productName, store_name: storeName, price: parseFloat(price), purchase_date: purchaseDate, return_window_days: parseInt(returnWindow, 10) });
      Toast.show({ type: 'success', text1: t('common.success'), text2: t('returns.success_added') || 'Ürün takibe alındı.' });
      setModalVisible(false); setProductName(''); setStoreName(''); setPrice(''); setReturnWindow('14');
    } catch { 
      Toast.show({ type: 'error', text1: t('common.error'), text2: t('subscriptions.error_failed') }); 
    }
  };

  const handleAIAnalysis = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (!result.canceled && result.assets[0].base64) {
      setLoadingAI(true);
      try {
        const data = await analyzeOrderScreenshot(result.assets[0].base64);
        if (data.product_name) setProductName(data.product_name);
        if (data.store_name) setStoreName(data.store_name);
        if (data.price) setPrice(data.price.toString());
        if (data.purchase_date) setPurchaseDate(data.purchase_date);
        if (data.return_window) setReturnWindow(data.return_window.toString());
        
        Toast.show({ 
          type: 'success', 
          text1: t('common.great'), 
          text2: t('returns.ai_success') || 'Bilgiler başarıyla dolduruldu!' 
        });
      } catch (err) {
        Toast.show({ type: 'error', text1: t('common.error'), text2: 'Analiz başarısız oldu.' });
      } finally {
        setLoadingAI(false);
      }
    }
  };

  const [loadingAI, setLoadingAI] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={MINT_BG} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 16 }]}>
        <Text style={styles.headerTitle}>{t('returns.title') || 'İadelerim'}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.addBtnText}>+ {t('common.add') || 'Ekle'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {isLoading ? (
          <View style={styles.centered}>
            <ActivityIndicator size="large" color={DARK_GREEN} />
          </View>
        ) : (
          <FlatList
            data={returns}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 120 }}
            ListEmptyComponent={
              <View style={styles.emptyCard}>
                <View style={styles.emptyIconBg}>
                  <Package size={64} color={DARK_GREEN} strokeWidth={1.5} />
                  <View style={styles.clockBadge}>
                    <Clock size={20} color={DARK_GREEN} strokeWidth={2.5} />
                  </View>
                </View>
                <Text style={styles.emptyTitle}>{t('returns.no_tracking_title') || 'İade Takibi Yok'}</Text>
                <Text style={styles.emptyDesc}>
                  {t('returns.no_tracking_desc') || 'Aldığınız ürünlerin iade sürelerini kaçırmamak için hemen bir takip başlatın.'}
                </Text>
                <TouchableOpacity style={styles.primaryBtn} onPress={() => setModalVisible(true)}>
                  <Text style={styles.primaryBtnText}>{t('returns.add_first') || 'İlk İadeyi Ekle'}</Text>
                </TouchableOpacity>
              </View>
            }
            renderItem={({ item }) => {
              const daysRemaining = calculateDaysRemaining(item.purchase_date, item.return_window_days);
              const isCritical = daysRemaining <= 3 && daysRemaining >= 0;
              const isExpired = daysRemaining < 0;
              return (
                <View style={styles.listItem}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.itemName} numberOfLines={1}>{item.product_name}</Text>
                    <View style={styles.itemStoreRow}>
                      <ShoppingBag size={12} color={DARK_GREEN} />
                      <Text style={styles.itemStore}> {item.store_name}</Text>
                    </View>
                    <Text style={styles.itemPrice}>₺{item.price}</Text>
                  </View>
                  <View>
                    <View style={[styles.daysBadge, isExpired ? styles.expiredBadge : isCritical ? styles.criticalBadge : styles.normalBadge]}>
                      <Text style={[styles.daysText, isExpired ? styles.expiredText : isCritical ? styles.criticalText : styles.normalText]}>
                        {isExpired ? (t('returns.expired') || 'SÜRE DOLDU') : `${daysRemaining} ${t('common.days') || 'GÜN'}`}
                      </Text>
                    </View>
                    <TouchableOpacity style={styles.doneBtn} onPress={() => completeReturn(item.id)}>
                      <Text style={styles.doneBtnText}>{t('returns.returned_btn') || 'İade Edildi'}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
            ListFooterComponent={
              returns.length > 0 ? (
                <TouchableOpacity style={[styles.primaryBtn, { marginTop: 16 }]} onPress={() => setModalVisible(true)}>
                  <Text style={styles.primaryBtnText}>{t('returns.add_new') || 'Yeni İade Takibi Ekle'}</Text>
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
            <Text style={styles.modalTitle}>{t('returns.add_new') || 'İade Takibi Başlat'}</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <X size={24} color={DARK_GREEN} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.aiButton} 
            onPress={handleAIAnalysis}
            disabled={loadingAI}
          >
            {loadingAI ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Sparkles size={20} color="white" />
                <Text style={styles.aiButtonText}>{t('common.add_from_image')}</Text>
              </>
            )}
          </TouchableOpacity>

          <Text style={styles.inputLabel}>{t('returns.product_name') || 'Ürün Adı'}</Text>
          <TextInput style={styles.input} placeholder={t('returns.product_name_placeholder') || 'Örn: Siyah Kazak'} placeholderTextColor="#9ca3af" value={productName} onChangeText={setProductName} />

          <Text style={styles.inputLabel}>{t('returns.store_name') || 'Mağaza'}</Text>
          <TextInput style={styles.input} placeholder={t('returns.store_name_placeholder') || 'Örn: Trendyol'} placeholderTextColor="#9ca3af" value={storeName} onChangeText={setStoreName} />

          <View style={{ flexDirection: 'row' }}>
            <View style={{ flex: 1, marginRight: 8 }}>
              <Text style={styles.inputLabel}>{t('subscriptions.amount')}</Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencySymbol}>₺</Text>
                <TextInput style={[styles.input, { flex: 1, borderWidth: 0, paddingHorizontal: 0, marginBottom: 0 }]} placeholder="0.00" placeholderTextColor="#9ca3af" value={price} onChangeText={setPrice} keyboardType="numeric" />
              </View>
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={styles.inputLabel}>{t('returns.window') || 'İade Süresi'}</Text>
              <View style={styles.inputRow}>
                <TextInput style={[styles.input, { flex: 1, borderWidth: 0, paddingHorizontal: 0, marginBottom: 0 }]} placeholder="14" placeholderTextColor="#9ca3af" value={returnWindow} onChangeText={setReturnWindow} keyboardType="numeric" />
                <Text style={styles.unitText}>{t('common.days') || 'GÜN'}</Text>
              </View>
            </View>
          </View>

          <Text style={[styles.inputLabel, { marginTop: 16 }]}>{t('returns.purchase_date') || 'Satın Alınma Tarihi'}</Text>
          <View style={styles.inputRow}>
            <Calendar size={20} color={DARK_GREEN} />
            <TextInput style={[styles.input, { flex: 1, borderWidth: 0, marginBottom: 0, paddingHorizontal: 12 }]} placeholder="2023-10-24" placeholderTextColor="#9ca3af" value={purchaseDate} onChangeText={setPurchaseDate} />
          </View>

          <TouchableOpacity style={[styles.primaryBtn, { marginTop: 'auto', marginBottom: 32 }]} onPress={handleAdd}>
            <Text style={styles.primaryBtnText}>{t('returns.start_tracking') || 'Takibi Başlat'}</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#e8f8f3' },
  header: {
    paddingHorizontal: 24,
    paddingBottom: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: { color: '#154c44', fontSize: 26, fontWeight: '800' },
  addBtn: { backgroundColor: '#154c44', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  addBtnText: { color: '#ffffff', fontWeight: '700', fontSize: 14 },
  body: { flex: 1, paddingHorizontal: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  emptyCard: {
    backgroundColor: '#ffffff', borderRadius: 24, padding: 28, alignItems: 'center',
    marginTop: 8, shadowColor: '#154c44', shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 }, elevation: 3,
  },
  emptyIconBg: {
    width: 120, height: 120, borderRadius: 60, backgroundColor: '#e8f8f3',
    justifyContent: 'center', alignItems: 'center', marginBottom: 24, position: 'relative',
  },
  clockBadge: {
    position: 'absolute', top: 8, right: 8,
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
    flexDirection: 'row', alignItems: 'flex-start',
    shadowColor: '#154c44', shadowOpacity: 0.06, shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 }, elevation: 2,
  },
  itemName: { color: '#154c44', fontWeight: '700', fontSize: 16, marginBottom: 4 },
  itemStoreRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  itemStore: { color: '#6b7280', fontSize: 12 },
  itemPrice: { color: '#154c44', fontWeight: '800', fontSize: 16 },
  daysBadge: { paddingHorizontal: 10, paddingVertical: 5, borderRadius: 10, alignSelf: 'flex-end', marginBottom: 8 },
  normalBadge: { backgroundColor: '#e8f8f3' },
  criticalBadge: { backgroundColor: '#fff0f0' },
  expiredBadge: { backgroundColor: '#f3f4f6' },
  daysText: { fontWeight: '700', fontSize: 11 },
  normalText: { color: '#154c44' },
  criticalText: { color: '#ef4444' },
  expiredText: { color: '#9ca3af' },
  doneBtn: { backgroundColor: '#e8f8f3', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  doneBtnText: { color: '#154c44', fontWeight: '700', fontSize: 11 },
  modalContainer: { flex: 1, backgroundColor: '#e8f8f3', paddingHorizontal: 24, paddingTop: 80 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 },
  modalTitle: { color: '#154c44', fontSize: 22, fontWeight: '700' },
  aiButton: {
    backgroundColor: '#10b981',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    borderRadius: 14,
    marginBottom: 24,
    gap: 10,
    shadowColor: '#10b981',
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  aiButtonText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 15,
  },
  inputLabel: { color: '#154c44', fontWeight: '600', fontSize: 14, marginBottom: 8, marginLeft: 4 },
  input: {
    backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: '#154c44', fontWeight: '500', marginBottom: 16,
    shadowColor: '#154c44', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  inputRow: {
    backgroundColor: '#ffffff', borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', marginBottom: 16,
    shadowColor: '#154c44', shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1,
  },
  currencySymbol: { color: '#9ca3af', fontWeight: '700', fontSize: 16, marginRight: 8 },
  unitText: { color: '#9ca3af', fontWeight: '700', fontSize: 12 },
});
