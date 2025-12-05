// MonetizationService.js - Adapty интеграция для IAP (Rewind)
// Free tier для монетизации через in-app purchases

// ⚠️ ВСТАВЬТЕ ВАШ ADAPTY PUBLIC KEY ЗДЕСЬ
// Получить ключ: https://app.adapty.io/
const ADAPTY_PUBLIC_KEY = 'YOUR_ADAPTY_PUBLIC_KEY_HERE';

// Импорт Adapty SDK (требует установки: npm install react-native-adapty)
import { adapty } from 'react-native-adapty';

// Пакеты Rewind (цены в USD)
export const REWIND_PACKAGES = {
  REWIND_SMALL: {
    id: 'rewind_small',
    name: 'Mini Rewind',
    steps: 5,
    price: 0.99,
    adaptyId: 'rewind_small',
  },
  REWIND_MEDIUM: {
    id: 'rewind_medium',
    name: 'Standard Rewind',
    steps: 10,
    price: 1.99,
    adaptyId: 'rewind_medium',
  },
  REWIND_LARGE: {
    id: 'rewind_large',
    name: 'Major Rewind',
    steps: 20,
    price: 4.99,
    adaptyId: 'rewind_large',
  },
};

// Кристаллы альтернатива для Rewind
export const CRYSTAL_REWIND_COST = 50; // 50 кристаллов = 5 шагов назад

/**
 * ФУНКЦИЯ: Инициализация Adapty SDK
 * Вызывается при запуске приложения
 */
export const initializeAdapty = async () => {
  try {
    if (ADAPTY_PUBLIC_KEY === 'YOUR_ADAPTY_PUBLIC_KEY_HERE') {
      console.warn('Adapty not configured, IAP disabled');
      return false;
    }

    // Интеграция реального Adapty SDK
    await adapty.activate(ADAPTY_PUBLIC_KEY);

    console.log('Adapty initialized successfully');
    return true;
  } catch (error) {
    console.error('Adapty initialization failed:', error);
    return false;
  }
};

/**
 * ФУНКЦИЯ: Получить доступные IAP продукты
 * @returns {Promise<Array>} - Список доступных покупок
 */
export const getAvailableProducts = async () => {
  try {
    // Реальный запрос к Adapty
    const paywalls = await adapty.getPaywalls();
    return paywalls[0].products;
  } catch (error) {
    console.error('Failed to fetch products:', error);
    // Fallback к mock данным
    return Object.values(REWIND_PACKAGES);
  }
};

/**
 * ФУНКЦИЯ: Покупка Rewind через IAP
 * @param {string} packageId - ID пакета
 * @param {Function} onSuccess - Callback при успешной покупке
 * @param {Function} onError - Callback при ошибке
 */
export const purchaseRewind = async (packageId, onSuccess, onError) => {
  try {
    const package_ = REWIND_PACKAGES[packageId];

    if (!package_) {
      throw new Error('Invalid package ID');
    }

    // Реальная покупка через Adapty
    const result = await adapty.makePurchase(package_.adaptyId);

    if (onSuccess) {
      onSuccess({
        packageId,
        steps: package_.steps,
        price: package_.price,
      });
    }

    return {
      success: true,
      steps: package_.steps,
    };
  } catch (error) {
    console.error('Purchase failed:', error);
    if (onError) {
      onError(error);
    }
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ФУНКЦИЯ: Rewind за кристаллы (альтернатива IAP)
 * @param {number} crystals - Доступные кристаллы
 * @returns {Object} - Результат с возможностью Rewind
 */
export const rewindWithCrystals = (crystals) => {
  if (crystals < CRYSTAL_REWIND_COST) {
    return {
      success: false,
      error: `Not enough crystals. Need ${CRYSTAL_REWIND_COST}, have ${crystals}`,
    };
  }

  return {
    success: true,
    steps: 5, // 5 шагов за 50 кристаллов
    cost: CRYSTAL_REWIND_COST,
  };
};

/**
 * ФУНКЦИЯ: Восстановление покупок
 * Восстанавливает предыдущие покупки пользователя
 */
export const restorePurchases = async () => {
  try {
    // TODO: Реальное восстановление через Adapty
    // const result = await adapty.restorePurchases();

    console.log('Purchases restored (mock)');
    return {
      success: true,
      purchases: [],
    };
  } catch (error) {
    console.error('Restore failed:', error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * ФУНКЦИЯ: Проверка подписки/премиум статуса
 * @returns {Promise<boolean>} - Есть ли премиум
 */
export const checkPremiumStatus = async () => {
  try {
    // TODO: Проверка через Adapty
    // const profile = await adapty.getProfile();
    // return profile.accessLevels.premium?.isActive || false;

    return false; // По умолчанию нет премиума
  } catch (error) {
    console.error('Premium check failed:', error);
    return false;
  }
};

/**
 * ФУНКЦИЯ: Логирование события для аналитики
 * @param {string} eventName - Название события
 * @param {Object} params - Параметры события
 */
export const logEvent = (eventName, params = {}) => {
  try {
    // TODO: Интеграция с аналитикой (Adapty, Firebase, etc.)
    console.log(`Event: ${eventName}`, params);
  } catch (error) {
    console.error('Event logging failed:', error);
  }
};

export default {
  initializeAdapty,
  getAvailableProducts,
  purchaseRewind,
  rewindWithCrystals,
  restorePurchases,
  checkPremiumStatus,
  logEvent,
  REWIND_PACKAGES,
  CRYSTAL_REWIND_COST,
};
