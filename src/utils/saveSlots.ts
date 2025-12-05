// Система сохранения нескольких персонажей
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, GameState } from '../types/game';

export interface SaveSlot {
  id: string;
  characterName: string;
  age: number;
  wealth: number;
  profession: string | null;
  playTime: number; // в минутах
  createdAt: string;
  lastPlayed: string;
  screenshot?: string; // base64 изображения
  difficulty: string;
  country: string;
  birthYear: number;
}

export interface SaveData {
  character: Character;
  gameState: GameState;
  metadata: SaveSlot;
}

const STORAGE_KEYS = {
  SAVE_SLOTS: '@life_simulator_save_slots',
  SAVE_PREFIX: '@life_simulator_save_',
} as const;

// Получение всех слотов сохранения
export const getSaveSlots = async (): Promise<SaveSlot[]> => {
  try {
    const slotsJson = await AsyncStorage.getItem(STORAGE_KEYS.SAVE_SLOTS);
    if (!slotsJson) return [];
    
    const slots: SaveSlot[] = JSON.parse(slotsJson);
    
    // Сортируем по последнему времени игры
    return slots.sort((a, b) => 
      new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime()
    );
  } catch (error) {
    console.error('❌ Error loading save slots:', error);
    return [];
  }
};

// Создание нового сохранения
export const createSaveSlot = async (
  character: Character,
  gameState: GameState,
  slotName: string
): Promise<SaveSlot> => {
  try {
    const slots = await getSaveSlots();
    
    const newSlot: SaveSlot = {
      id: `save_${Date.now()}`,
      characterName: character.name,
      age: character.age,
      wealth: character.stats?.wealth || 0,
      profession: character.profession || null,
      playTime: 0,
      createdAt: new Date().toISOString(),
      lastPlayed: new Date().toISOString(),
      difficulty: gameState.difficulty?.id || 'medium',
      country: character.country || 'USA',
      birthYear: character.birthYear || 2000,
    };
    
    // Сохраняем данные персонажа и игры
    const saveData: SaveData = {
      character,
      gameState,
      metadata: newSlot
    };
    
    await AsyncStorage.setItem(
      `${STORAGE_KEYS.SAVE_PREFIX}${newSlot.id}`,
      JSON.stringify(saveData)
    );
    
    // Обновляем список слотов
    slots.push(newSlot);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(slots));
    
    console.log('✅ Save slot created:', newSlot.id);
    return newSlot;
  } catch (error) {
    console.error('❌ Error creating save slot:', error);
    throw error;
  }
};

// Загрузка сохранения
export const loadSaveSlot = async (slotId: string): Promise<SaveData | null> => {
  try {
    const saveJson = await AsyncStorage.getItem(`${STORAGE_KEYS.SAVE_PREFIX}${slotId}`);
    if (!saveJson) return null;
    
    const saveData: SaveData = JSON.parse(saveJson);
    
    // Обновляем время последней игры
    saveData.metadata.lastPlayed = new Date().toISOString();
    await updateSaveSlot(saveData.metadata);
    
    console.log('✅ Save slot loaded:', slotId);
    return saveData;
  } catch (error) {
    console.error('❌ Error loading save slot:', error);
    return null;
  }
};

// Обновление слота сохранения
export const updateSaveSlot = async (metadata: SaveSlot): Promise<void> => {
  try {
    const slots = await getSaveSlots();
    const slotIndex = slots.findIndex(slot => slot.id === metadata.id);
    
    if (slotIndex !== -1) {
      slots[slotIndex] = metadata;
      await AsyncStorage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(slots));
    }
  } catch (error) {
    console.error('❌ Error updating save slot:', error);
  }
};

// Удаление слота сохранения
export const deleteSaveSlot = async (slotId: string): Promise<void> => {
  try {
    // Удаляем данные сохранения
    await AsyncStorage.removeItem(`${STORAGE_KEYS.SAVE_PREFIX}${slotId}`);
    
    // Удаляем из списка слотов
    const slots = await getSaveSlots();
    const filteredSlots = slots.filter(slot => slot.id !== slotId);
    await AsyncStorage.setItem(STORAGE_KEYS.SAVE_SLOTS, JSON.stringify(filteredSlots));
    
    console.log('✅ Save slot deleted:', slotId);
  } catch (error) {
    console.error('❌ Error deleting save slot:', error);
  }
};

// Автосохранение в текущий слот
export const autoSave = async (
  character: Character,
  gameState: GameState,
  currentSlotId: string | null
): Promise<void> => {
  if (!currentSlotId) return;
  
  try {
    const slots = await getSaveSlots();
    const currentSlot = slots.find(slot => slot.id === currentSlotId);
    
    if (currentSlot) {
      // Обновляем метаданные
      currentSlot.age = character.age;
      currentSlot.wealth = character.stats?.wealth || 0;
      currentSlot.profession = character.profession || null;
      currentSlot.lastPlayed = new Date().toISOString();
      
      const saveData: SaveData = {
        character,
        gameState,
        metadata: currentSlot
      };
      
      await AsyncStorage.setItem(
        `${STORAGE_KEYS.SAVE_PREFIX}${currentSlotId}`,
        JSON.stringify(saveData)
      );
      
      await updateSaveSlot(currentSlot);
      console.log('✅ Auto-saved to slot:', currentSlotId);
    }
  } catch (error) {
    console.error('❌ Error auto-saving:', error);
  }
};

// Получение статистики сохранений
export const getSaveStats = async (): Promise<{
  totalSaves: number;
  totalPlayTime: number;
  oldestSave: string | null;
  newestSave: string | null;
}> => {
  try {
    const slots = await getSaveSlots();
    
    return {
      totalSaves: slots.length,
      totalPlayTime: slots.reduce((total, slot) => total + slot.playTime, 0),
      oldestSave: slots.length > 0 ? slots[slots.length - 1].createdAt : null,
      newestSave: slots.length > 0 ? slots[0].createdAt : null,
    };
  } catch (error) {
    console.error('❌ Error getting save stats:', error);
    return {
      totalSaves: 0,
      totalPlayTime: 0,
      oldestSave: null,
      newestSave: null,
    };
  }
};
