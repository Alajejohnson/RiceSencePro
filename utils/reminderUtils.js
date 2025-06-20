// Functions to schedule notifications
// reminderUtils.js
import * as Notifications from 'expo-notifications';

export const scheduleFertilizerReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '🌾 Time to Apply Fertilizer',
      body: 'Today is a good day to fertilize your rice crops!',
      sound: true,
    },
    trigger: {
      hour: 7,
      minute: 0,
      repeats: true, // daily
    },
  });
};

export const scheduleWateringReminder = async () => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💧 Water Your Crops',
      body: 'Make sure your rice gets the water it needs today!',
      sound: true,
    },
    trigger: {
      hour: 6,
      minute: 0,
      repeats: true, // daily
    },
  });
};
