import React, { useEffect } from 'react';
import { View, Button, Text } from 'react-native';
import { scheduleFertilizerReminder, scheduleWateringReminder } from '../utils/reminderUtils    ';
import { registerForPushNotifications } from '../utils/NotificationPermission   ';

export default function ReminderScreen() {
  useEffect(() => {
    registerForPushNotifications();
  }, []);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Set Up Your Rice Farming Reminders</Text>

      <Button title="Fertilizer Reminder" onPress={scheduleFertilizerReminder} />
      <Button title="Watering Reminder" onPress={scheduleWateringReminder} />
    </View>
  );
}
