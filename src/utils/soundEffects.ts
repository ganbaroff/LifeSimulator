// Система звуковых эффектов
import { Audio } from 'expo-av';

export class SoundManager {
  private static instance: SoundManager;
  private sounds: Map<string, Audio.Sound> = new Map();
  private _isMuted = false;

  get isMuted(): boolean {
    return this._isMuted;
  }

  static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  async loadSounds() {
    try {
      // В реальном приложении здесь будут загружаться аудиофайлы
      // Сейчас используем vibration API для обратной связи
      console.log('🔊 Sound effects loaded');
    } catch (error) {
      console.error('❌ Error loading sounds:', error);
    }
  }

  async playSound(soundName: string) {
    if (this._isMuted) return;

    try {
      // Используем vibration для тактильной обратной связи
      switch (soundName) {
        case 'button_click':
          await this.vibrate([10]);
          break;
        case 'choice_selected':
          await this.vibrate([15, 5, 15]);
          break;
        case 'achievement':
          await this.vibrate([20, 10, 20, 10, 20]);
          break;
        case 'error':
          await this.vibrate([30, 20, 30]);
          break;
        case 'level_up':
          await this.vibrate([10, 10, 10, 10, 10]);
          break;
        case 'game_over':
          await this.vibrate([50, 30, 50]);
          break;
        default:
          await this.vibrate([10]);
      }
    } catch (error) {
      console.error('❌ Error playing sound:', error);
    }
  }

  private async vibrate(pattern: number[]) {
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }

  setMuted(muted: boolean) {
    this._isMuted = muted;
  }

  toggleMute(): boolean {
    this._isMuted = !this._isMuted;
    return this._isMuted;
  }

  async cleanup() {
    // Очистка всех звуков
    for (const sound of this.sounds.values()) {
      await sound.unloadAsync();
    }
    this.sounds.clear();
  }
}

// Хуки для использования в компонентах
export const useSoundEffects = () => {
  const soundManager = SoundManager.getInstance();

  return {
    playButton: () => soundManager.playSound('button_click'),
    playChoice: () => soundManager.playSound('choice_selected'),
    playAchievement: () => soundManager.playSound('achievement'),
    playError: () => soundManager.playSound('error'),
    playLevelUp: () => soundManager.playSound('level_up'),
    playGameOver: () => soundManager.playSound('game_over'),
    toggleMute: () => soundManager.toggleMute(),
    isMuted: soundManager.isMuted,
  };
};
