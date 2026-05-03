// Expo Go SDK 53/54 hatasını aşmak için bildirimleri geçici olarak devre dışı bırakıyoruz.
// Gerçek cihazda 'Development Build' alındığında bu dosya eski haline getirilebilir.

export const requestNotificationPermissions = async () => {
  console.log('Bildirim izinleri (Geliştirme modunda devre dışı)');
  return true; 
};

export const scheduleReturnNotification = async (
  productName: string, 
  purchaseDate: string, 
  returnWindowDays: number
) => {
  console.log(`Bildirim zamanlandı (SİMÜLE): ${productName} için ${returnWindowDays} gün süresi var.`);
};
