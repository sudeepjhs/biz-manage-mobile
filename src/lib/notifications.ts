import messaging from '@react-native-firebase/messaging';
import { Platform, Alert } from 'react-native';
import { API_ENDPOINTS } from '../config/API';
import apiClient from './api-client';

export const requestUserPermission = async () => {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Authorization status:', authStatus);
    return true;
  }
  return false;
};

export const getDeviceToken = async () => {
  try {
    const token = await messaging().getToken();
    if (token) {
      console.log('FCM Device Token:', token);
      return token;
    }
  } catch (error) {
    console.error('Error getting FCM token:', error);
  }
  return null;
};

export const registerDeviceWithBackend = async (userId: string) => {
  try {
    const token = await getDeviceToken();
    if (!token) return;

    const platform = Platform.OS.toUpperCase(); // 'ANDROID' | 'IOS'
    
    await apiClient.post(API_ENDPOINTS.NOTIFICATIONS.REGISTER_DEVICE, {
      token,
      platform,
    });
    
    console.log('Device registered with backend');
  } catch (error) {
    console.error('Failed to register device with backend:', error);
  }
};

export const setupNotificationListeners = () => {
  // Foreground listener
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('A new FCM message arrived!', JSON.stringify(remoteMessage));
    
    Alert.alert(
      remoteMessage.notification?.title || 'Notification',
      remoteMessage.notification?.body || 'New message received'
    );
  });

  // Handle message when app is opened from a notification (background state)
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log(
      'Notification caused app to open from background state:',
      remoteMessage.notification,
    );
  });

  // Check if app was opened from a notification (quit state)
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log(
          'Notification caused app to open from quit state:',
          remoteMessage.notification,
        );
      }
    });

  return unsubscribe;
};

// Background handler (must be called in index.js)
export const setBackgroundMessageHandler = () => {
  messaging().setBackgroundMessageHandler(async remoteMessage => {
    console.log('Message handled in the background!', remoteMessage);
  });
};
