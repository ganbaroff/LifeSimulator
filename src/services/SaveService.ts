import AsyncStorage from '@react-native-async-storage/async-storage';
import { Character, GameState, defaultGameState } from '../types';
import { SaveDataSchema, SaveData } from '../types/schemas';
import errorTrackingService from './ErrorTrackingService';

const SAVE_PREFIX = 'lifesim_save_';
const CURRENT_VERSION = 1;
const MAX_SLOTS = 3;

class SaveService {
  private currentVersion = CURRENT_VERSION;
  private maxSlots = MAX_SLOTS;

  /**
   * Сохранить игру в указанный слот (полное сохранение)
   */
  async save(slotId: number, character: Character, gameState: GameState): Promise<boolean> {
    try {
      if (slotId < 0 || slotId >= this.maxSlots) {
        throw new Error(`Invalid slot ID: ${slotId}`);
      }

      const data: SaveData = {
        version: this.currentVersion,
        character,
        gameState,
        timestamp: Date.now(),
      };

      const jsonString = JSON.stringify(data);
      await AsyncStorage.setItem(`${SAVE_PREFIX}${slotId}`, jsonString);
      
      console.log(`Game saved successfully to slot ${slotId}`);
      return true;
    } catch (error) {
      console.error('Failed to save game:', error);
      errorTrackingService.captureError(error, { context: 'SaveService.save', slotId });
      return false;
    }
  }

  /**
   * Сохранить только персонажа (частичное обновление)
   */
  async saveCharacter(slotId: number, characterUpdates: Partial<Character>): Promise<boolean> {
    try {
      const currentSave = await this.load(slotId);
      if (!currentSave) {
        console.warn('No existing save found. Creating new save with default game state.');
        const newCharacter: Character = {
          ...characterUpdates as Character,
          // Ensure required fields are set with defaults if not provided
          name: characterUpdates.name || 'New Player',
          age: characterUpdates.age || 0,
          health: characterUpdates.health ?? 100,
          happiness: characterUpdates.happiness ?? 50,
          wealth: characterUpdates.wealth ?? 0,
          skills: characterUpdates.skills ?? 0,
          country: characterUpdates.country || 'Unknown',
          birthYear: characterUpdates.birthYear || new Date().getFullYear(),
          profession: characterUpdates.profession ?? null,
          isAlive: characterUpdates.isAlive ?? true,
          deathCause: characterUpdates.deathCause || null,
          avatarUrl: characterUpdates.avatarUrl || null,
          history: characterUpdates.history || [],
          lifeGoal: characterUpdates.lifeGoal || 'hedonist',
          assets: characterUpdates.assets || [],
          relationships: characterUpdates.relationships || [],
          flags: characterUpdates.flags || [],
        };
        return await this.save(slotId, newCharacter, defaultGameState);
      }

      // Merge existing character with updates
      const updatedCharacter: Character = {
        ...currentSave.character,
        ...characterUpdates,
      } as Character;

      return await this.save(slotId, updatedCharacter, currentSave.gameState as GameState);
    } catch (error) {
      console.error('Failed to save character:', error);
      errorTrackingService.captureError(error, { context: 'SaveService.saveCharacter', slotId });
      return false;
    }
  }

  /**
   * Сохранить только состояние игры (частичное обновление)
   */
  async saveGameState(slotId: number, gameState: GameState): Promise<boolean> {
    try {
      const currentSave = await this.load(slotId);
      if (!currentSave) {
        console.warn('No existing save found. Cannot update gameState only.');
        return false;
      }

      return await this.save(slotId, currentSave.character as Character, gameState);
    } catch (error) {
      console.error('Failed to save game state:', error);
      errorTrackingService.captureError(error, { context: 'SaveService.saveGameState', slotId });
      return false;
    }
  }

  /**
   * Загрузить игру из указанного слота
   */
  async load(slotId: number): Promise<SaveData | null> {
    try {
      if (slotId < 0 || slotId >= this.maxSlots) {
        throw new Error(`Invalid slot ID: ${slotId}`);
      }

      const raw = await AsyncStorage.getItem(`${SAVE_PREFIX}${slotId}`);
      if (!raw) return null;

      const data = JSON.parse(raw);
      
      // Миграция данных если версия старая
      const migratedData = this.migrate(data);

      // Валидация данных
      try {
        const validatedData = SaveDataSchema.parse(migratedData);
        return validatedData;
      } catch (validationError) {
        console.error('Save data validation failed:', validationError);
        errorTrackingService.captureError(validationError, { 
          context: 'SaveService.load.validation', 
          slotId 
        });
        
        // В случае ошибки валидации пробуем вернуть то что есть, 
        // или null если данные критически повреждены.
        // Пока возвращаем мигрированные данные с риском
        return migratedData as SaveData;
      }
    } catch (error) {
      console.error('Failed to load game:', error);
      errorTrackingService.captureError(error, { context: 'SaveService.load', slotId });
      return null;
    }
  }

  /**
   * Миграция данных между версиями
   */
  private migrate(data: any): any {
    if (!data.version) {
      data.version = 0;
    }

    // Пример миграции с v0 на v1
    if (data.version < 1) {
      // Добавляем новые поля если их нет
      if (!data.gameState.achievements) {
        data.gameState.achievements = [];
      }
      data.version = 1;
    }

    // Будущие миграции
    // if (data.version < 2) { ... }

    return data;
  }

  /**
   * Получить список всех сохранений (метаданные)
   */
  async listSaves(): Promise<Array<{ slotId: number; timestamp: number; characterName: string; level: string }>> {
    const saves = [];
    for (let i = 0; i < this.maxSlots; i++) {
      try {
        const raw = await AsyncStorage.getItem(`${SAVE_PREFIX}${i}`);
        if (raw) {
          const data = JSON.parse(raw);
          saves.push({
            slotId: i,
            timestamp: data.timestamp,
            characterName: data.character?.name || 'Unknown',
            level: data.gameState?.currentLevel || 'Unknown',
          });
        }
      } catch (e) {
        console.warn(`Failed to read save slot ${i}`, e);
      }
    }
    return saves;
  }

  /**
   * Удалить сохранение
   */
  async deleteSave(slotId: number): Promise<void> {
    try {
      await AsyncStorage.removeItem(`${SAVE_PREFIX}${slotId}`);
    } catch (error) {
      console.error('Failed to delete save:', error);
      errorTrackingService.captureError(error, { context: 'SaveService.deleteSave', slotId });
    }
  }

  /**
   * Экспорт сохранения в строку (для бэкапа)
   */
  async exportSave(slotId: number): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(`${SAVE_PREFIX}${slotId}`);
    } catch (error) {
      console.error('Failed to export save:', error);
      return null;
    }
  }

  /**
   * Импорт сохранения из строки
   */
  async importSave(slotId: number, jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      
      // Проверяем структуру через валидацию
      SaveDataSchema.parse(data);
      
      // Если ок, сохраняем
      await AsyncStorage.setItem(`${SAVE_PREFIX}${slotId}`, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      errorTrackingService.captureError(error, { context: 'SaveService.importSave' });
      return false;
    }
  }
}

export default new SaveService();
