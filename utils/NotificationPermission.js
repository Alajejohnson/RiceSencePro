// Function to request notification permissionsFunction to request notification permissions

// NotificationPermission.js
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export const registerForPushNotifications = async () => {
  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('Notification permissions not granted!');
      return false;
    }

    return true;
  } else {
    alert('Must use physical device for notifications');
    return false;
  }
};
