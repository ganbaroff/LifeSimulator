// AdService.js - Google AdMob интеграция
// NOTE: Требует настройки AdMob аккаунта и получения Ad Unit IDs

import { Platform } from 'react-native';

// TODO: После настройки AdMob раскомментировать:
import {
  InterstitialAd,
  RewardedAd,
  BannerAd,
  TestIds,
  AdEventType,
  RewardedAdEventType,
} from 'react-native-google-mobile-ads';

class AdService {
  constructor() {
    this.isInitialized = false;
    this.rewardedAd = null;
    this.interstitialAd = null;

    // Test Ad Unit IDs (заменить на реальные после настройки AdMob)
    this.adUnitIds = {
      rewarded: Platform.select({
        ios: 'ca-app-pub-3940256099942544/1712485313',
        android: 'ca-app-pub-3940256099942544/5224354917',
      }),
      interstitial: Platform.select({
        ios: 'ca-app-pub-3940256099942544/4411468910',
        android: 'ca-app-pub-3940256099942544/1033173712',
      }),
      banner: Platform.select({
        ios: 'ca-app-pub-3940256099942544/2934735716',
        android: 'ca-app-pub-3940256099942544/6300978111',
      }),
    };
  }

  /**
   * Инициализация AdMob
   */
  async initialize() {
    try {
      // TODO: Раскомментировать после добавления react-native-google-mobile-ads
      // await MobileAds().initialize();

      this.isInitialized = true;
      console.log('AdMob initialized');

      // Предзагрузка рекламы
      await this.loadRewardedAd();
      await this.loadInterstitialAd();
    } catch (error) {
      console.error('Failed to initialize AdMob:', error);
    }
  }

  /**
   * Загрузка rewarded video
   */
  async loadRewardedAd() {
    try {
      // TODO: Раскомментировать после добавления библиотеки
      // this.rewardedAd = RewardedAd.createForAdRequest(this.adUnitIds.rewarded);

      // this.rewardedAd.addAdEventListener(RewardedAdEventType.LOADED, () => {
      //   console.log('Rewarded ad loaded');
      // });

      // this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      //   console.log('User earned reward:', reward);
      // });

      // this.rewardedAd.load();

      console.log('Rewarded ad loading...');
    } catch (error) {
      console.error('Failed to load rewarded ad:', error);
    }
  }

  /**
   * Показ rewarded video
   */
  async showRewardedAd(onReward) {
    try {
      // TODO: Раскомментировать после добавления библиотеки
      // if (this.rewardedAd && this.rewardedAd.loaded) {
      //   this.rewardedAd.show();
      //
      //   this.rewardedAd.addAdEventListener(RewardedAdEventType.EARNED_REWARD, (reward) => {
      //     if (onReward) {
      //       onReward(reward.amount);
      //     }
      //   });
      //
      //   // Перезагрузка после показа
      //   this.rewardedAd.addAdEventListener(AdEventType.CLOSED, () => {
      //     this.loadRewardedAd();
      //   });
      // } else {
      //   console.log('Rewarded ad not ready');
      //   return false;
      // }

      // MOCK: Симуляция награды для тестирования
      console.log('Showing rewarded ad (mock)');
      setTimeout(() => {
        if (onReward) {
          onReward(10); // 10 кристаллов за просмотр
        }
      }, 2000);

      return true;
    } catch (error) {
      console.error('Failed to show rewarded ad:', error);
      return false;
    }
  }

  /**
   * Проверка доступности rewarded ad
   */
  isRewardedAdReady() {
    // TODO: Раскомментировать после добавления библиотеки
    // return this.rewardedAd && this.rewardedAd.loaded;

    // MOCK
    return true;
  }

  /**
   * Загрузка interstitial ad
   */
  async loadInterstitialAd() {
    try {
      // TODO: Раскомментировать после добавления библиотеки
      // this.interstitialAd = InterstitialAd.createForAdRequest(this.adUnitIds.interstitial);

      // this.interstitialAd.addAdEventListener(AdEventType.LOADED, () => {
      //   console.log('Interstitial ad loaded');
      // });

      // this.interstitialAd.load();

      console.log('Interstitial ad loading...');
    } catch (error) {
      console.error('Failed to load interstitial ad:', error);
    }
  }

  /**
   * Показ interstitial ad
   */
  async showInterstitialAd() {
    try {
      // TODO: Раскомментировать после добавления библиотеки
      // if (this.interstitialAd && this.interstitialAd.loaded) {
      //   this.interstitialAd.show();
      //
      //   // Перезагрузка после показа
      //   this.interstitialAd.addAdEventListener(AdEventType.CLOSED, () => {
      //     this.loadInterstitialAd();
      //   });
      // } else {
      //   console.log('Interstitial ad not ready');
      //   return false;
      // }

      // MOCK
      console.log('Showing interstitial ad (mock)');
      return true;
    } catch (error) {
      console.error('Failed to show interstitial ad:', error);
      return false;
    }
  }

  /**
   * Получение Banner Ad Unit ID
   */
  getBannerAdUnitId() {
    return this.adUnitIds.banner;
  }
}

// Singleton instance
const adService = new AdService();

export default adService;
