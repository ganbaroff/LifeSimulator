// 🎮 Game Slice - Unified State Management
// Создано: Developer (Agile Team)
// Версия: 3.0.0

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { GameState, GameSettings, GameStatistics, Character } from '../../../types/unified';

// Async thunks
export const startNewGame = createAsyncThunk(
  'game/start',
  async (difficulty: GameState['difficulty']) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newGame: Partial<GameState> = {
      id: `game_${Date.now()}`,
      difficulty,
      currentYear: 2024,
      currentAge: 0,
      isPlaying: true,
      isPaused: false,
      gameSpeed: 1,
      settings: {
        autoSave: true,
        notifications: true,
        soundEnabled: true,
        musicEnabled: true,
        language: 'en',
        theme: 'system',
        gameSpeed: 1,
      },
      statistics: {
        totalPlayTime: 0,
        sessionsPlayed: 1,
        charactersCreated: 1,
        achievementsUnlocked: 0,
        eventsExperienced: 0,
        choicesMade: 0,
        longestGame: 0,
      },
    };
    
    return newGame;
  }
);

export const saveGame = createAsyncThunk(
  'game/save',
  async (gameState: GameState) => {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Simulate saving to backend
    console.log('Saving game:', gameState.id);
    return gameState;
  }
);

export const loadGame = createAsyncThunk(
  'game/load',
  async (gameId: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    // Simulate loading from backend
    throw new Error('Game not found');
  }
);

// State interface
interface GameSliceState {
  currentGame: GameState | null;
  loading: boolean;
  error?: string;
  lastSaved?: number;
  autoSaveEnabled: boolean;
}

// Initial state
const initialState: GameSliceState = {
  currentGame: null,
  loading: false,
  autoSaveEnabled: true,
};

// Slice
const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Game control
    pauseGame: (state) => {
      if (state.currentGame) {
        state.currentGame.isPaused = true;
      }
    },
    
    resumeGame: (state) => {
      if (state.currentGame) {
        state.currentGame.isPaused = false;
      }
    },
    
    stopGame: (state) => {
      if (state.currentGame) {
        state.currentGame.isPlaying = false;
        state.currentGame.isPaused = true;
      }
    },
    
    // Time management
    updateGameTime: (state) => {
      if (state.currentGame && state.currentGame.isPlaying && !state.currentGame.isPaused) {
        state.currentGame.currentYear += state.currentGame.gameSpeed;
        if (state.currentGame.character) {
          state.currentGame.currentAge += state.currentGame.gameSpeed;
          state.currentGame.character.info.age = state.currentGame.currentAge;
        }
      }
    },
    
    setGameSpeed: (state, action: PayloadAction<number>) => {
      if (state.currentGame) {
        state.currentGame.gameSpeed = action.payload;
        state.currentGame.settings.gameSpeed = action.payload;
      }
    },
    
    advanceYear: (state) => {
      if (state.currentGame) {
        state.currentGame.currentYear++;
        state.currentGame.currentAge++;
        if (state.currentGame.character) {
          state.currentGame.character.info.age = state.currentGame.currentAge;
        }
        state.currentGame.statistics.eventsExperienced++;
      }
    },
    
    // Settings
    updateGameSettings: (state, action: PayloadAction<Partial<GameSettings>>) => {
      if (state.currentGame) {
        Object.assign(state.currentGame.settings, action.payload);
      }
    },
    
    toggleAutoSave: (state) => {
      state.autoSaveEnabled = !state.autoSaveEnabled;
      if (state.currentGame) {
        state.currentGame.settings.autoSave = state.autoSaveEnabled;
      }
    },
    
    // Statistics
    updateStatistics: (state, action: PayloadAction<Partial<GameStatistics>>) => {
      if (state.currentGame) {
        Object.assign(state.currentGame.statistics, action.payload);
      }
    },
    
    incrementPlayTime: (state, action: PayloadAction<number>) => {
      if (state.currentGame) {
        state.currentGame.statistics.totalPlayTime += action.payload;
      }
    },
    
    incrementChoicesMade: (state) => {
      if (state.currentGame) {
        state.currentGame.statistics.choicesMade++;
      }
    },
    
    // Character management
    setGameCharacter: (state, action: PayloadAction<Character>) => {
      if (state.currentGame) {
        state.currentGame.character = action.payload;
      }
    },
    
    // Difficulty
    setDifficulty: (state, action: PayloadAction<GameState['difficulty']>) => {
      if (state.currentGame) {
        state.currentGame.difficulty = action.payload;
      }
    },
    
    // Reset
    resetGameState: () => initialState,
    
    clearError: (state) => {
      state.error = undefined;
    },
  },
  extraReducers: (builder) => {
    // Start new game
    builder
      .addCase(startNewGame.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(startNewGame.fulfilled, (state, action) => {
        state.loading = false;
        state.currentGame = {
          ...action.payload,
          character: null, // Will be set separately
        } as GameState;
      })
      .addCase(startNewGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    
    // Save game
    builder
      .addCase(saveGame.pending, (state) => {
        state.loading = true;
      })
      .addCase(saveGame.fulfilled, (state, action) => {
        state.loading = false;
        state.lastSaved = Date.now();
        state.currentGame = action.payload;
      })
      .addCase(saveGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    
    // Load game
    builder
      .addCase(loadGame.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(loadGame.fulfilled, (state, action) => {
        state.loading = false;
        // Handle successful load
        if (action.payload) {
          state.currentGame = action.payload;
        }
      })
      .addCase(loadGame.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load game';
      });
  },
});

// Export actions
export const {
  pauseGame,
  resumeGame,
  stopGame,
  updateGameTime,
  setGameSpeed,
  advanceYear,
  updateGameSettings,
  toggleAutoSave,
  updateStatistics,
  incrementPlayTime,
  incrementChoicesMade,
  setGameCharacter,
  setDifficulty,
  resetGameState,
  clearError,
} = gameSlice.actions;

// Selectors
export const selectCurrentGame = (state: { game: GameSliceState }) => state.game.currentGame;
export const selectGameLoading = (state: { game: GameSliceState }) => state.game.loading;
export const selectGameError = (state: { game: GameSliceState }) => state.game.error;
export const selectGameCharacter = (state: { game: GameSliceState }) => state.game.currentGame?.character;
export const selectGameSettings = (state: { game: GameSliceState }) => state.game.currentGame?.settings;
export const selectGameStatistics = (state: { game: GameSliceState }) => state.game.currentGame?.statistics;
export const selectIsGamePlaying = (state: { game: GameSliceState }) => state.game.currentGame?.isPlaying ?? false;
export const selectIsGamePaused = (state: { game: GameSliceState }) => state.game.currentGame?.isPaused ?? true;
export const selectGameSpeed = (state: { game: GameSliceState }) => state.game.currentGame?.gameSpeed ?? 1;
export const selectCurrentYear = (state: { game: GameSliceState }) => state.game.currentGame?.currentYear ?? 2024;
export const selectCurrentAge = (state: { game: GameSliceState }) => state.game.currentGame?.currentAge ?? 0;
export const selectAutoSaveEnabled = (state: { game: GameSliceState }) => state.game.autoSaveEnabled;

// Reducer
export default gameSlice;
export { gameSlice };
