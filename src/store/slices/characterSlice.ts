// src/store/slices/characterSlice.ts

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  Character, 
  CharacterSeed, 
  DifficultyLevel, 
  CharacterStats, 
  CharacterSkills, 
  CharacterRelationships,
  EventEffects,
  GameEvent,
  GameHistory
} from '../../types/game';
import {
  createInitialCharacter,
  applyEventEffects,
  ageUpCharacter,
  checkDeathConditions,
  getDeathCause,
  applySkillEffects,
  applyRelationshipEffects,
} from '../../utils/gameLogic';
import { saveCharacter, loadCharacter, saveGameHistory, loadGameHistory } from '../../utils/storage';

interface CharacterState {
  current: Character | null;
  seed: CharacterSeed | null;
  difficulty: DifficultyLevel | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: CharacterState = {
  current: null,
  seed: null,
  difficulty: null,
  isLoading: false,
  error: null,
};

// Async thunks for persistence
export const loadSavedCharacter = createAsyncThunk(
  'character/loadSaved',
  async (_, { rejectWithValue }) => {
    try {
      const character = await loadCharacter();
      return character;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load character');
    }
  }
);

export const saveCharacterData = createAsyncThunk(
  'character/saveData',
  async (character: Character, { rejectWithValue }) => {
    try {
      await saveCharacter(character);
      await saveGameHistory(character.history || []);
      return character;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to save character');
    }
  }
);

export const loadSavedHistory = createAsyncThunk(
  'character/loadHistory',
  async (_, { rejectWithValue }) => {
    try {
      const history = await loadGameHistory();
      return history;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to load history');
    }
  }
);

const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    // Создание персонажа
    createCharacter: (state, action: PayloadAction<{seed: CharacterSeed; difficulty: DifficultyLevel; birthCity?: string}>) => {
      state.isLoading = true;
      state.error = null;
      
      try {
        // Добавляем birthCity в seed если указан
        const enhancedSeed = action.payload.birthCity 
          ? { ...action.payload.seed, birthCity: action.payload.birthCity }
          : action.payload.seed;
          
        state.current = createInitialCharacter(enhancedSeed, action.payload.difficulty);
        state.seed = enhancedSeed;
        state.difficulty = action.payload.difficulty;
        state.isLoading = false;
      } catch (error) {
        state.error = error instanceof Error ? error.message : 'Failed to create character';
        state.isLoading = false;
      }
    },

    // Обновление характеристик
    updateStats: (state, action: PayloadAction<EventEffects>) => {
      if (!state.current || !state.difficulty) return;

      // Применяем эффекты к текущим stats
      const newStats = applyEventEffects(state.current.stats, action.payload);
      state.current.stats = newStats;
      
      // Применяем эффекты к навыкам
      if (action.payload.skills) {
        const newSkills = applySkillEffects(state.current.skills, action.payload);
        state.current.skills = newSkills;
      }
      
      // Применяем эффекты к отношениям
      if (action.payload.relationships) {
        const newRelationships = applyRelationshipEffects(state.current.relationships, action.payload);
        state.current.relationships = newRelationships;
      }
      
      // Применяем профессию
      if (action.payload.profession) {
        state.current.profession = action.payload.profession;
      }
      
      // Применяем образование
      if (action.payload.education) {
        state.current.educationLevel = action.payload.education as any;
      }
      
      // Применяем болезнь
      if (action.payload.disease) {
        state.current.currentDisease = action.payload.disease;
      }
      
      // Проверка условий смерти
      const isDead = checkDeathConditions(
        state.current.stats, 
        action.payload.deathChance || 0,
        state.difficulty
      );

      if (isDead) {
        state.current.isAlive = false;
        state.current.deathCause = getDeathCause(state.current.stats, action.payload.deathChance || 0);
      }

      // Автоматическое сохранение в фоновом режиме (без await)
      if (state.current.isAlive) {
        saveCharacter(state.current).catch(error => {
          console.warn('Background save failed:', error);
        });
      }
    },

    // Увеличение возраста
    ageUp: (state, action: PayloadAction<{years?: number}>) => {
      if (!state.current) return;

      const years = action.payload.years || 1;
      state.current = ageUpCharacter(state.current, years);
    },

    // Добавление события в историю
    addToHistory: (state, action: PayloadAction<{
      event: GameEvent;
      choice: 'A' | 'B' | 'C';
      effects: EventEffects;
    }>) => {
      if (!state.current) return;

      state.current.history.push({
        event: action.payload.event,
        choice: action.payload.choice,
        effects: action.payload.effects,
        timestamp: Date.now(),
      });
    },

    // Обновление профессии
    updateProfession: (state, action: PayloadAction<string>) => {
      if (!state.current) return;
      state.current.profession = action.payload;
    },

    // Обновление образования
    updateEducation: (state, action: PayloadAction<string>) => {
      if (!state.current) return;
      state.current.educationLevel = action.payload as any;
    },

    // Обновление навыков
    updateSkills: (state, action: PayloadAction<Partial<CharacterSkills>>) => {
      if (!state.current) return;
      const newSkills = applySkillEffects(state.current.skills, { skills: action.payload });
      state.current.skills = newSkills;
    },

    // Обновление отношений
    updateRelationships: (state, action: PayloadAction<Partial<CharacterRelationships>>) => {
      if (!state.current) return;
      const newRelationships = applyRelationshipEffects(state.current.relationships, { relationships: action.payload });
      state.current.relationships = newRelationships;
    },

    // Обновление болезни
    updateDisease: (state, action: PayloadAction<string | null>) => {
      if (!state.current) return;
      state.current.currentDisease = action.payload;
    },

    // Обновление персонажа (универсальное)
    updateCharacter: (state, action: PayloadAction<Partial<Character>>) => {
      if (!state.current) return;
      state.current = { ...state.current, ...action.payload };
    },

    // Установка состояния жизни
    setIsAlive: (state, action: PayloadAction<boolean>) => {
      if (!state.current) return;
      state.current.isAlive = action.payload;
    },

    // Установка причины смерти
    setDeathCause: (state, action: PayloadAction<string>) => {
      if (!state.current) return;
      state.current.deathCause = action.payload;
    },

    // Сброс персонажа
    resetCharacter: (state) => {
      state.current = null;
      state.seed = null;
      state.difficulty = null;
      state.error = null;
      state.isLoading = false;
    },

    // Установка ошибки
    setError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.isLoading = false;
    },

    // Очистка ошибки
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // loadSavedCharacter
    builder
      .addCase(loadSavedCharacter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSavedCharacter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload;
        state.error = null;
      })
      .addCase(loadSavedCharacter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // saveCharacterData
    builder
      .addCase(saveCharacterData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(saveCharacterData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
      })
      .addCase(saveCharacterData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

    // loadSavedHistory
    builder
      .addCase(loadSavedHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loadSavedHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        if (state.current && action.payload) {
          state.current.history = action.payload;
        }
        state.error = null;
      })
      .addCase(loadSavedHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export const characterActions = characterSlice.actions;
export const characterReducer = characterSlice.reducer;

// Selectors
export const selectCurrentCharacter = (state: {character: CharacterState}) => state.character.current;
export const selectCharacterStats = (state: {character: CharacterState}) => state.character.current?.stats;
export const selectCharacterSkills = (state: {character: CharacterState}) => state.character.current?.skills;
export const selectCharacterRelationships = (state: {character: CharacterState}) => state.character.current?.relationships;
export const selectCharacterProfession = (state: {character: CharacterState}) => state.character.current?.profession;
export const selectCharacterEducation = (state: {character: CharacterState}) => state.character.current?.educationLevel;
export const selectCharacterDisease = (state: {character: CharacterState}) => state.character.current?.currentDisease;
export const selectCharacterAge = (state: {character: CharacterState}) => state.character.current?.age || 0;
export const selectCharacterHistory = (state: {character: CharacterState}) => state.character.current?.history || [];
export const selectIsCharacterAlive = (state: {character: CharacterState}) => state.character.current?.isAlive ?? false;
export const selectCharacterLoading = (state: {character: CharacterState}) => state.character.isLoading;
export const selectCharacterError = (state: {character: CharacterState}) => state.character.error;

export default characterSlice.reducer;
