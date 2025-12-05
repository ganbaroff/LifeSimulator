// 🧪 Game Slice Tests - Unified Architecture
// Создано: QA Engineer (Agile Team)
// Версия: 3.0.0

import { configureStore } from '@reduxjs/toolkit';
import gameSlice, {
  startNewGame,
  saveGame,
  loadGame,
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
} from '../../../store/unified/slices/gameSlice';
import { Character } from '../../../types/unified';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      game: gameSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for testing
      }),
  });
};

// Mock character for testing
const mockCharacter: Character = {
  info: {
    id: 'test-character-1',
    name: 'Test Character',
    age: 25,
    birthYear: 1999,
    birthCity: 'Baku',
    gender: 'male',
  },
  stats: {
    health: 100,
    happiness: 80,
    wealth: 50,
    energy: 90,
  },
  skills: {
    intelligence: 75,
    creativity: 60,
    social: 70,
    physical: 65,
    business: 55,
    technical: 80,
  },
  relationships: {
    family: 90,
    friends: 75,
    romantic: 50,
    colleagues: 60,
  },
  history: [],
  achievements: [],
  isAlive: true,
};

describe('Game Slice - Unified Architecture', () => {
  let store: ReturnType<typeof createTestStore>;

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().game;
      
      expect(state.currentGame).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeUndefined();
      expect(state.autoSaveEnabled).toBe(true);
    });
  });

  describe('Game Control Actions', () => {
    beforeEach(() => {
      // Create a game first
      store.dispatch(startNewGame.fulfilled({
        id: 'test-game-1',
        difficulty: 'normal',
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
      }, '', 'normal'));
    });

    it('should pause game', () => {
      store.dispatch(pauseGame());
      const game = store.getState().game.currentGame;
      
      expect(game?.isPaused).toBe(true);
    });

    it('should resume game', () => {
      store.dispatch(pauseGame()); // Pause first
      store.dispatch(resumeGame());
      const game = store.getState().game.currentGame;
      
      expect(game?.isPaused).toBe(false);
    });

    it('should stop game', () => {
      store.dispatch(stopGame());
      const game = store.getState().game.currentGame;
      
      expect(game?.isPlaying).toBe(false);
      expect(game?.isPaused).toBe(true);
    });

    it('should update game time', () => {
      const initialYear = store.getState().game.currentGame?.currentYear;
      const initialAge = store.getState().game.currentGame?.currentAge;
      
      store.dispatch(updateGameTime());
      
      const game = store.getState().game.currentGame;
      expect(game?.currentYear).toBeGreaterThan(initialYear!);
      expect(game?.currentAge).toBeGreaterThan(initialAge!);
    });

    it('should set game speed', () => {
      store.dispatch(setGameSpeed(2));
      const game = store.getState().game.currentGame;
      
      expect(game?.gameSpeed).toBe(2);
      expect(game?.settings.gameSpeed).toBe(2);
    });

    it('should advance year', () => {
      const initialYear = store.getState().game.currentGame?.currentYear;
      const initialAge = store.getState().game.currentGame?.currentAge;
      const initialEvents = store.getState().game.currentGame?.statistics.eventsExperienced;
      
      store.dispatch(advanceYear());
      
      const game = store.getState().game.currentGame;
      expect(game?.currentYear).toBe(initialYear! + 1);
      expect(game?.currentAge).toBe(initialAge! + 1);
      expect(game?.statistics.eventsExperienced).toBe(initialEvents! + 1);
    });
  });

  describe('Settings Management', () => {
    beforeEach(() => {
      store.dispatch(startNewGame.fulfilled({
        id: 'test-game-1',
        difficulty: 'normal',
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
      }, '', 'normal'));
    });

    it('should update game settings', () => {
      const newSettings = {
        soundEnabled: false,
        musicEnabled: false,
        language: 'az' as const,
      };
      
      store.dispatch(updateGameSettings(newSettings));
      const settings = store.getState().game.currentGame?.settings;
      
      expect(settings?.soundEnabled).toBe(false);
      expect(settings?.musicEnabled).toBe(false);
      expect(settings?.language).toBe('az');
      expect(settings?.autoSave).toBe(true); // Should remain unchanged
    });

    it('should toggle auto save', () => {
      const initialState = store.getState().game.autoSaveEnabled;
      
      store.dispatch(toggleAutoSave());
      
      expect(store.getState().game.autoSaveEnabled).toBe(!initialState);
      expect(store.getState().game.currentGame?.settings.autoSave).toBe(!initialState);
    });
  });

  describe('Statistics Management', () => {
    beforeEach(() => {
      store.dispatch(startNewGame.fulfilled({
        id: 'test-game-1',
        difficulty: 'normal',
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
      }, '', 'normal'));
    });

    it('should update statistics', () => {
      const newStats = {
        totalPlayTime: 1000,
        achievementsUnlocked: 5,
        longestGame: 500,
      };
      
      store.dispatch(updateStatistics(newStats));
      const stats = store.getState().game.currentGame?.statistics;
      
      expect(stats?.totalPlayTime).toBe(1000);
      expect(stats?.achievementsUnlocked).toBe(5);
      expect(stats?.longestGame).toBe(500);
      expect(stats?.sessionsPlayed).toBe(1); // Should remain unchanged
    });

    it('should increment play time', () => {
      const initialTime = store.getState().game.currentGame?.statistics.totalPlayTime;
      
      store.dispatch(incrementPlayTime(500));
      
      const stats = store.getState().game.currentGame?.statistics;
      expect(stats?.totalPlayTime).toBe(initialTime! + 500);
    });

    it('should increment choices made', () => {
      const initialChoices = store.getState().game.currentGame?.statistics.choicesMade;
      
      store.dispatch(incrementChoicesMade());
      
      const stats = store.getState().game.currentGame?.statistics;
      expect(stats?.choicesMade).toBe(initialChoices! + 1);
    });
  });

  describe('Character Management', () => {
    it('should set game character', () => {
      store.dispatch(startNewGame.fulfilled({
        id: 'test-game-1',
        difficulty: 'normal',
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
      }, '', 'normal'));
      
      store.dispatch(setGameCharacter(mockCharacter));
      
      const character = store.getState().game.currentGame?.character;
      expect(character?.info.name).toBe(mockCharacter.info.name);
      expect(character?.stats.health).toBe(mockCharacter.stats.health);
    });

    it('should set difficulty', () => {
      store.dispatch(startNewGame.fulfilled({
        id: 'test-game-1',
        difficulty: 'normal',
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
      }, '', 'normal'));
      
      store.dispatch(setDifficulty('hard'));
      
      const game = store.getState().game.currentGame;
      expect(game?.difficulty).toBe('hard');
    });
  });

  describe('Async Thunks', () => {
    describe('startNewGame', () => {
      it('should handle pending state', () => {
        store.dispatch(startNewGame.pending('', 'easy'));
        
        const state = store.getState().game;
        expect(state.loading).toBe(true);
        expect(state.error).toBeUndefined();
      });

      it('should handle fulfilled state', () => {
        store.dispatch(startNewGame.fulfilled({
          id: 'test-game-1',
          difficulty: 'easy',
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
        }, '', 'easy'));
        
        const game = store.getState().game.currentGame;
        expect(game?.difficulty).toBe('easy');
        expect(game?.isPlaying).toBe(true);
        expect(game?.currentYear).toBe(2024);
      });

      it('should handle rejected state', () => {
        const errorMessage = 'Failed to start game';
        store.dispatch(startNewGame.rejected(new Error(errorMessage), '', 'normal'));
        
        const state = store.getState().game;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('saveGame', () => {
      beforeEach(() => {
        // Create a game first
        store.dispatch(startNewGame.fulfilled({
          id: 'test-game-1',
          difficulty: 'normal',
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
        }, '', 'normal'));
      });

      it('should handle save pending', () => {
        store.dispatch(saveGame.pending('', store.getState().game.currentGame!));
        
        expect(store.getState().game.loading).toBe(true);
      });

      it('should handle save fulfilled', () => {
        const gameToSave = store.getState().game.currentGame!;
        store.dispatch(saveGame.fulfilled(gameToSave, '', gameToSave));
        
        expect(store.getState().game.loading).toBe(false);
        expect(store.getState().game.lastSaved).toBeDefined();
      });

      it('should handle save rejected', () => {
        const errorMessage = 'Save failed';
        store.dispatch(saveGame.rejected(new Error(errorMessage), '', store.getState().game.currentGame!));
        
        expect(store.getState().game.loading).toBe(false);
        expect(store.getState().game.error).toBe(errorMessage);
      });
    });

    describe('loadGame', () => {
      it('should handle load pending', () => {
        store.dispatch(loadGame.pending('', 'game-1'));
        
        expect(store.getState().game.loading).toBe(true);
        expect(store.getState().game.error).toBeUndefined();
      });

      it('should handle load rejected (game not found)', () => {
        store.dispatch(loadGame.rejected(new Error('Game not found'), '', 'non-existent-game'));
        
        expect(store.getState().game.loading).toBe(false);
        expect(store.getState().game.error).toBeDefined();
      });
    });
  });

  describe('State Management', () => {
    it('should reset game state', () => {
      // Create a game first
      store.dispatch(startNewGame.fulfilled({
        id: 'test-game-1',
        difficulty: 'normal',
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
      }, '', 'normal'));
      
      expect(store.getState().game.currentGame).not.toBeNull();
      
      store.dispatch(resetGameState());
      
      expect(store.getState().game.currentGame).toBeNull();
      expect(store.getState().game.loading).toBe(false);
      expect(store.getState().game.autoSaveEnabled).toBe(true);
    });

    it('should clear error', () => {
      // Create an error
      store.dispatch(startNewGame.rejected(new Error('Test error'), '', 'normal'));
      expect(store.getState().game.error).toBeDefined();
      
      store.dispatch(clearError());
      expect(store.getState().game.error).toBeUndefined();
    });
  });

  describe('Edge Cases', () => {
    it('should handle actions without current game gracefully', () => {
      // Try to control game without creating one first
      expect(() => {
        store.dispatch(pauseGame());
        store.dispatch(resumeGame());
        store.dispatch(stopGame());
        store.dispatch(updateGameTime());
        store.dispatch(setGameSpeed(2));
        store.dispatch(advanceYear());
      }).not.toThrow();
      
      // Should not crash and game should remain null
      expect(store.getState().game.currentGame).toBeNull();
    });

    it('should handle invalid game speed values', () => {
      store.dispatch(startNewGame.fulfilled({
        id: 'test-game-1',
        difficulty: 'normal',
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
      }, '', 'normal'));
      
      // Set extreme game speed
      store.dispatch(setGameSpeed(10));
      expect(store.getState().game.currentGame?.gameSpeed).toBe(10);
      
      // Set zero game speed
      store.dispatch(setGameSpeed(0));
      expect(store.getState().game.currentGame?.gameSpeed).toBe(0);
    });
  });
});
