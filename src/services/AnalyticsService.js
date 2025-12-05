// AnalyticsService.js - Аналитика и отслеживание событий
// NOTE: Для полной работы нужно настроить Firebase в app.json

class AnalyticsService {
  constructor() {
    this.isEnabled = true;
    this.userId = null;
  }

  /**
   * Инициализация аналитики
   */
  async initialize(userId = null) {
    try {
      this.userId = userId;
      // TODO: Добавить Firebase Analytics после настройки
      // await analytics().setUserId(userId);
      console.log('Analytics initialized for user:', userId);
    } catch (error) {
      console.error('Failed to initialize analytics:', error);
    }
  }

  /**
   * Логирование события
   */
  async logEvent(eventName, params = {}) {
    if (!this.isEnabled) return;

    try {
      const eventData = {
        ...params,
        timestamp: Date.now(),
        userId: this.userId,
      };

      // TODO: Добавить Firebase Analytics
      // await analytics().logEvent(eventName, eventData);

      console.log(`[Analytics] ${eventName}:`, eventData);
    } catch (error) {
      console.error('Failed to log event:', error);
    }
  }

  /**
   * Отслеживание экрана
   */
  async logScreenView(screenName, screenClass = null) {
    await this.logEvent('screen_view', {
      screen_name: screenName,
      screen_class: screenClass || screenName,
    });
  }

  /**
   * Игровые события
   */
  async logGameStart(levelId, characterData) {
    await this.logEvent('game_start', {
      level_id: levelId,
      character_name: characterData.name,
      character_country: characterData.country,
      character_profession: characterData.profession,
      birth_year: characterData.birthYear,
    });
  }

  async logGameEnd(success, finalAge, finalWealth, crystalsEarned) {
    await this.logEvent('game_end', {
      success,
      final_age: finalAge,
      final_wealth: finalWealth,
      crystals_earned: crystalsEarned,
    });
  }

  async logEventChoice(eventId, choice, effects) {
    await this.logEvent('event_choice', {
      event_id: eventId,
      choice,
      health_change: effects.health || 0,
      happiness_change: effects.happiness || 0,
      wealth_change: effects.wealth || 0,
      skills_change: effects.skills || 0,
    });
  }

  async logDeath(cause, age, level) {
    await this.logEvent('character_death', {
      death_cause: cause,
      age,
      level,
    });
  }

  async logRewind(crystalsSpent) {
    await this.logEvent('rewind_used', {
      crystals_spent: crystalsSpent,
    });
  }

  /**
   * Монетизация
   */
  async logPurchase(productId, price, currency = 'USD') {
    await this.logEvent('purchase', {
      product_id: productId,
      price,
      currency,
    });
  }

  async logAdView(adType, rewarded = false) {
    await this.logEvent('ad_view', {
      ad_type: adType,
      rewarded,
    });
  }

  /**
   * Достижения
   */
  async logAchievementUnlocked(achievementId, reward) {
    await this.logEvent('achievement_unlocked', {
      achievement_id: achievementId,
      reward,
    });
  }

  /**
   * Социальные события
   */
  async logShare(method, contentType) {
    await this.logEvent('share', {
      method,
      content_type: contentType,
    });
  }

  /**
   * Установка свойств пользователя
   */
  async setUserProperties(properties) {
    if (!this.isEnabled) return;

    try {
      // TODO: Добавить Firebase Analytics
      // await analytics().setUserProperties(properties);
      console.log('[Analytics] User properties:', properties);
    } catch (error) {
      console.error('Failed to set user properties:', error);
    }
  }

  /**
   * Включение/выключение аналитики
   */
  async setEnabled(enabled) {
    this.isEnabled = enabled;
    // TODO: Добавить Firebase Analytics
    // await analytics().setAnalyticsCollectionEnabled(enabled);
  }
}

// Singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
