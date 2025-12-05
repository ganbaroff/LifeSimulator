// NotificationService.js - Push уведомления
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Настройка поведения уведомлений
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

class NotificationService {
  constructor() {
    this.expoPushToken = null;
    this.notificationListener = null;
    this.responseListener = null;
  }

  /**
   * Инициализация и запрос разрешений
   */
  async initialize() {
    try {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('Notification permissions not granted');
        return false;
      }

      // Получение Expo Push Token
      const token = await Notifications.getExpoPushTokenAsync();
      this.expoPushToken = token.data;
      console.log('Expo Push Token:', this.expoPushToken);

      // Настройка канала для Android
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF231F7C',
        });
      }

      return true;
    } catch (error) {
      console.error('Failed to initialize notifications:', error);
      return false;
    }
  }

  /**
   * Установка слушателей уведомлений
   */
  setupListeners(onNotificationReceived, onNotificationResponse) {
    // Слушатель входящих уведомлений
    this.notificationListener =
      Notifications.addNotificationReceivedListener(onNotificationReceived);

    // Слушатель нажатий на уведомления
    this.responseListener =
      Notifications.addNotificationResponseReceivedListener(onNotificationResponse);
  }

  /**
   * Удаление слушателей
   */
  removeListeners() {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  /**
   * Отправка локального уведомления
   */
  async sendLocalNotification(title, body, data = {}, delaySeconds = 0) {
    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title,
          body,
          data,
          sound: true,
        },
        trigger: delaySeconds > 0 ? { seconds: delaySeconds } : null,
      });
    } catch (error) {
      console.error('Failed to send local notification:', error);
    }
  }

  /**
   * Планирование ежедневного напоминания
   */
  async scheduleDailyReminder(hour = 20, minute = 0) {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🎮 Your life awaits!',
          body: 'Continue your journey in LifeSim GSL',
          data: { type: 'daily_reminder' },
          sound: true,
        },
        trigger: {
          hour,
          minute,
          repeats: true,
        },
      });

      console.log(`Daily reminder scheduled for ${hour}:${minute}`);
    } catch (error) {
      console.error('Failed to schedule daily reminder:', error);
    }
  }

  /**
   * Отмена всех уведомлений
   */
  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel notifications:', error);
    }
  }

  /**
   * Получение запланированных уведомлений
   */
  async getScheduledNotifications() {
    try {
      return await Notifications.getAllScheduledNotificationsAsync();
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  /**
   * Установка значка (badge) приложения
   */
  async setBadgeCount(count) {
    try {
      await Notifications.setBadgeCountAsync(count);
    } catch (error) {
      console.error('Failed to set badge count:', error);
    }
  }

  /**
   * Получение Expo Push Token
   */
  getExpoPushToken() {
    return this.expoPushToken;
  }
}

// Singleton instance
const notificationService = new NotificationService();

export default notificationService;
