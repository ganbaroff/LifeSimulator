// src/utils/storage.ts

import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys
const STORAGE_KEYS = {
  CHARACTER: '@life_simulator_character',
  GAME_STATE: '@life_simulator_game_state',
  GAME_HISTORY: '@life_simulator_history',
  SETTINGS: '@life_simulator_settings',
} as const;

// Character storage
export const saveCharacter = async (character: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(character);
    await AsyncStorage.setItem(STORAGE_KEYS.CHARACTER, jsonValue);
    console.log('✅ Character saved to storage');
  } catch (error) {
    console.error('❌ Error saving character:', error);
  }
};

export const loadCharacter = async (): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.CHARACTER);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('❌ Error loading character:', error);
    return null;
  }
};

export const removeCharacter = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.CHARACTER);
    console.log('✅ Character removed from storage');
  } catch (error) {
    console.error('❌ Error removing character:', error);
  }
};

// Game state storage
export const saveGameState = async (gameState: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(gameState);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_STATE, jsonValue);
    console.log('✅ Game state saved to storage');
  } catch (error) {
    console.error('❌ Error saving game state:', error);
  }
};

export const loadGameState = async (): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('❌ Error loading game state:', error);
    return null;
  }
};

export const removeGameState = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_STATE);
    console.log('✅ Game state removed from storage');
  } catch (error) {
    console.error('❌ Error removing game state:', error);
  }
};

// Game history storage
export const saveGameHistory = async (history: any[]): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(history);
    await AsyncStorage.setItem(STORAGE_KEYS.GAME_HISTORY, jsonValue);
    console.log('✅ Game history saved to storage');
  } catch (error) {
    console.error('❌ Error saving game history:', error);
  }
};

export const loadGameHistory = async (): Promise<any[] | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.GAME_HISTORY);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('❌ Error loading game history:', error);
    return null;
  }
};

export const removeGameHistory = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(STORAGE_KEYS.GAME_HISTORY);
    console.log('✅ Game history removed from storage');
  } catch (error) {
    console.error('❌ Error removing game history:', error);
  }
};

// Settings storage
export const saveSettings = async (settings: any): Promise<void> => {
  try {
    const jsonValue = JSON.stringify(settings);
    await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, jsonValue);
    console.log('✅ Settings saved to storage');
  } catch (error) {
    console.error('❌ Error saving settings:', error);
  }
};

export const loadSettings = async (): Promise<any | null> => {
  try {
    const jsonValue = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
    return jsonValue != null ? JSON.parse(jsonValue) : null;
  } catch (error) {
    console.error('❌ Error loading settings:', error);
    return null;
  }
};

// Clear all data
export const clearAllData = async (): Promise<void> => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.CHARACTER,
      STORAGE_KEYS.GAME_STATE,
      STORAGE_KEYS.GAME_HISTORY,
      STORAGE_KEYS.SETTINGS,
    ]);
    console.log('✅ All data cleared from storage');
  } catch (error) {
    console.error('❌ Error clearing all data:', error);
  }
};

// Check if data exists
export const hasSavedData = async (): Promise<boolean> => {
  try {
    const character = await AsyncStorage.getItem(STORAGE_KEYS.CHARACTER);
    const gameState = await AsyncStorage.getItem(STORAGE_KEYS.GAME_STATE);
    return character !== null || gameState !== null;
  } catch (error) {
    console.error('❌ Error checking saved data:', error);
    return false;
  }
};

// Get storage info
export const getStorageInfo = async (): Promise<{ [key: string]: string | null }> => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const result: { [key: string]: string | null } = {};
    
    for (const key of keys) {
      if (key.startsWith('@life_simulator_')) {
        const value = await AsyncStorage.getItem(key);
        result[key] = value;
      }
    }
    
    return result;
  } catch (error) {
    console.error('❌ Error getting storage info:', error);
    return {};
  }
};
