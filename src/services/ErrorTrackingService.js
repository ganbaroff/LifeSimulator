// ErrorTrackingService.js - Отслеживание ошибок и крашей с Sentry
import * as Sentry from '@sentry/react-native';

class ErrorTrackingService {
  constructor() {
    this.isEnabled = true;
    this.userId = null;
  }

  /**
   * Инициализация (Sentry уже инициализирован в App.js)
   */
  async initialize() {
    try {
      console.log('Error tracking service initialized');
      
      // Sentry уже инициализирован в App.js
      // Здесь можем добавить дополнительную конфигурацию
      
      // Устанавливаем глобальный обработчик необработанных промисов
      if (typeof global !== 'undefined') {
        global.onunhandledrejection = (event) => {
          this.captureError(event.reason, {
            context: 'Unhandled Promise Rejection',
          });
        };
      }
    } catch (error) {
      console.error('Failed to initialize error tracking:', error);
    }
  }

  /**
   * Установка пользователя
   */
  setUser(userId, email = null, username = null) {
    this.userId = userId;

    try {
      Sentry.setUser({
        id: userId,
        email,
        username,
      });
      console.log('User set in Sentry:', userId);
    } catch (error) {
      console.error('Failed to set user:', error);
    }
  }

  /**
   * Логирование ошибки
   */
  captureError(error, context = {}) {
    if (!this.isEnabled) return;

    try {
      console.error('[Error Tracking]', error, context);

      Sentry.captureException(error, {
        extra: context,
      });
    } catch (e) {
      console.error('Failed to capture error:', e);
    }
  }

  /**
   * Логирование сообщения
   */
  captureMessage(message, level = 'info', context = {}) {
    if (!this.isEnabled) return;

    try {
      console.log(`[${level.toUpperCase()}]`, message, context);

      Sentry.captureMessage(message, {
        level,
        extra: context,
      });
    } catch (error) {
      console.error('Failed to capture message:', error);
    }
  }

  /**
   * Добавление breadcrumb (след действий)
   */
  addBreadcrumb(category, message, data = {}) {
    try {
      Sentry.addBreadcrumb({
        category,
        message,
        data,
        level: 'info',
      });

      console.log(`[Breadcrumb] ${category}: ${message}`, data);
    } catch (error) {
      console.error('Failed to add breadcrumb:', error);
    }
  }

  /**
   * Установка тега
   */
  setTag(key, value) {
    try {
      Sentry.setTag(key, value);
    } catch (error) {
      console.error('Failed to set tag:', error);
    }
  }

  /**
   * Установка контекста
   */
  setContext(name, context) {
    try {
      Sentry.setContext(name, context);
    } catch (error) {
      console.error('Failed to set context:', error);
    }
  }

  /**
   * Включение/выключение отслеживания
   */
  setEnabled(enabled) {
    this.isEnabled = enabled;
  }

  /**
   * Очистка пользователя (при выходе)
   */
  clearUser() {
    try {
      Sentry.setUser(null);
      this.userId = null;
      console.log('User cleared from Sentry');
    } catch (error) {
      console.error('Failed to clear user:', error);
    }
  }

  /**
   * Отправка события вручную
   */
  captureEvent(event) {
    try {
      Sentry.captureEvent(event);
    } catch (error) {
      console.error('Failed to capture event:', error);
    }
  }
}

// Singleton instance
const errorTrackingService = new ErrorTrackingService();

export default errorTrackingService;
