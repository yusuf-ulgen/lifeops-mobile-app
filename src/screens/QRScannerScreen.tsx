import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
import { Camera, CameraView, useCameraPermissions } from 'expo-camera';
import { X, Zap, ZapOff, QrCode } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

export default function QRScannerScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [torch, setTorch] = useState(false);

  useEffect(() => {
    (async () => {
      if (!permission) {
        await requestPermission();
      }
    })();
  }, []);

  if (!permission) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#154c44" />
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <View style={styles.permissionCard}>
          <View style={styles.permissionIconBg}>
            <QrCode size={60} color="#154c44" strokeWidth={1.5} />
          </View>
          <Text style={styles.permissionTitle}>{t('qr.permission_title')}</Text>
          <Text style={styles.permissionDesc}>{t('qr.permission_desc')}</Text>
          
          <TouchableOpacity 
            style={styles.permissionBtn} 
            onPress={requestPermission}
            activeOpacity={0.8}
          >
            <Text style={styles.permissionBtnText}>{t('qr.request_btn')}</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.closeBtn} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.closeBtnText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const handleBarcodeScanned = ({ type, data }: { type: string; data: string }) => {
    setScanned(true);
    Alert.alert(
      "QR Kod Tarandı",
      `Veri: ${data}`,
      [{ text: "Tamam", onPress: () => setScanned(false) }]
    );
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarcodeScanned}
        enableTorch={torch}
      >
        <SafeAreaView style={styles.overlay}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}>
              <X size={28} color="white" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>QR Tarayıcı</Text>
            <TouchableOpacity onPress={() => setTorch(!torch)} style={styles.iconButton}>
              {torch ? <Zap size={28} color="#fbbf24" /> : <ZapOff size={28} color="white" />}
            </TouchableOpacity>
          </View>

          <View style={styles.scannerArea}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
          </View>

          <View style={styles.footer}>
            <Text style={styles.hintText}>Bir QR kodu çerçevenin içine hizalayın</Text>
            <View style={styles.qrIconBg}>
              <QrCode size={40} color="white" strokeWidth={1.5} />
            </View>
          </View>
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#e8f8f3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#154c44',
    fontWeight: '600',
  },
  permissionContainer: {
    flex: 1,
    backgroundColor: '#e8f8f3',
    justifyContent: 'center',
    padding: 30,
  },
  permissionCard: {
    backgroundColor: 'white',
    borderRadius: 30,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#154c44',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
  },
  permissionIconBg: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e8f8f3',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  permissionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#154c44',
    marginBottom: 10,
    textAlign: 'center',
  },
  permissionDesc: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionBtn: {
    backgroundColor: '#154c44',
    width: '100%',
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  permissionBtnText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 10,
  },
  closeBtnText: {
    color: '#64748b',
    fontSize: 14,
    fontWeight: '600',
  },
  overlay: {
    flex: 1,
    justifyContent: 'space-between',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  headerTitle: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  iconButton: {
    padding: 10,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 20,
  },
  scannerArea: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute', top: 0, left: 0, width: 40, height: 40,
    borderTopWidth: 4, borderLeftWidth: 4, borderColor: '#10b981',
  },
  cornerTopRight: {
    position: 'absolute', top: 0, right: 0, width: 40, height: 40,
    borderTopWidth: 4, borderRightWidth: 4, borderColor: '#10b981',
  },
  cornerBottomLeft: {
    position: 'absolute', bottom: 0, left: 0, width: 40, height: 40,
    borderBottomWidth: 4, borderLeftWidth: 4, borderColor: '#10b981',
  },
  cornerBottomRight: {
    position: 'absolute', bottom: 0, right: 0, width: 40, height: 40,
    borderBottomWidth: 4, borderRightWidth: 4, borderColor: '#10b981',
  },
  footer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  hintText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 15,
    paddingVertical: 5,
    borderRadius: 10,
  },
  qrIconBg: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(21, 76, 68, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#10b981',
  },
});
