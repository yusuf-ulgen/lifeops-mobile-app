import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const requestNotificationPermissions = async () => {
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
  
  if (finalStatus !== 'granted') return false;
  return true;
};

export const scheduleReturnNotification = async (
  productName: string, 
  purchaseDate: string, 
  returnWindowDays: number
) => {
  const hasPermission = await requestNotificationPermissions();
  if (!hasPermission) return;

  const deadline = new Date(purchaseDate);
  deadline.setDate(deadline.getDate() + returnWindowDays);
  
  // 3 gün öncesine alarm kur
  const triggerDate = new Date(deadline);
  triggerDate.setDate(triggerDate.getDate() - 3);
  triggerDate.setHours(10, 0, 0, 0); 
  
  const today = new Date();
  if (triggerDate <= today) return;

  await Notifications.scheduleNotificationAsync({
    content: {
      title: 'İade Uyarısı 🚨',
      body: `${productName} iadesi için son 3 gün! Fişinizi kontrol edin.`,
      sound: true,
    },
    trigger: triggerDate,
  });
};
