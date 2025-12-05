// AudioService.js - Управление музыкой и звуковыми эффектами
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';

class AudioService {
  constructor() {
    this.backgroundMusic = null;
    this.soundEffects = {};
    this.isMusicEnabled = true;
    this.isSoundEnabled = true;
    this.musicVolume = 0.3;
    this.soundVolume = 0.7;
  }

  /**
   * Инициализация аудио системы
   */
  async initialize() {
    try {
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: true,
      });
    } catch (error) {
      console.error('Failed to initialize audio:', error);
    }
  }

  /**
   * Загрузка фоновой музыки
   */
  async loadBackgroundMusic(musicFile) {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
      }

      const { sound } = await Audio.Sound.createAsync(musicFile, {
        isLooping: true,
        volume: this.musicVolume,
      });

      this.backgroundMusic = sound;
    } catch (error) {
      console.error('Failed to load background music:', error);
    }
  }

  /**
   * Воспроизведение фоновой музыки
   */
  async playBackgroundMusic() {
    try {
      if (this.backgroundMusic && this.isMusicEnabled) {
        await this.backgroundMusic.playAsync();
      }
    } catch (error) {
      console.error('Failed to play background music:', error);
    }
  }

  /**
   * Остановка фоновой музыки
   */
  async stopBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.stopAsync();
      }
    } catch (error) {
      console.error('Failed to stop background music:', error);
    }
  }

  /**
   * Пауза фоновой музыки
   */
  async pauseBackgroundMusic() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.pauseAsync();
      }
    } catch (error) {
      console.error('Failed to pause background music:', error);
    }
  }

  /**
   * Загрузка звукового эффекта
   */
  async loadSoundEffect(name, soundFile) {
    try {
      const { sound } = await Audio.Sound.createAsync(soundFile, {
        volume: this.soundVolume,
      });
      this.soundEffects[name] = sound;
    } catch (error) {
      console.error(`Failed to load sound effect ${name}:`, error);
    }
  }

  /**
   * Воспроизведение звукового эффекта
   */
  async playSoundEffect(name, withHaptic = false) {
    try {
      if (this.isSoundEnabled && this.soundEffects[name]) {
        await this.soundEffects[name].replayAsync();
      }

      // Тактильная обратная связь
      if (withHaptic) {
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error(`Failed to play sound effect ${name}:`, error);
    }
  }

  /**
   * Установка громкости музыки
   */
  async setMusicVolume(volume) {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    if (this.backgroundMusic) {
      await this.backgroundMusic.setVolumeAsync(this.musicVolume);
    }
  }

  /**
   * Установка громкости звуков
   */
  setSoundVolume(volume) {
    this.soundVolume = Math.max(0, Math.min(1, volume));
  }

  /**
   * Включение/выключение музыки
   */
  async toggleMusic(enabled) {
    this.isMusicEnabled = enabled;
    if (enabled) {
      await this.playBackgroundMusic();
    } else {
      await this.pauseBackgroundMusic();
    }
  }

  /**
   * Включение/выключение звуков
   */
  toggleSound(enabled) {
    this.isSoundEnabled = enabled;
  }

  /**
   * Очистка ресурсов
   */
  async cleanup() {
    try {
      if (this.backgroundMusic) {
        await this.backgroundMusic.unloadAsync();
      }

      for (const sound of Object.values(this.soundEffects)) {
        await sound.unloadAsync();
      }

      this.soundEffects = {};
    } catch (error) {
      console.error('Failed to cleanup audio:', error);
    }
  }

  /**
   * Тактильная обратная связь
   */
  async hapticFeedback(type = 'light') {
    try {
      switch (type) {
        case 'light':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'success':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'warning':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'error':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        default:
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    } catch (error) {
      console.error('Haptic feedback failed:', error);
    }
  }
}

// Singleton instance
const audioService = new AudioService();

export default audioService;
