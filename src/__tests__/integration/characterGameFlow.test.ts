// 🧪 Integration Tests - Character & Game Flow
// Создано: QA Engineer (Agile Team)
// Версия: 3.0.0

import { configureStore } from '@reduxjs/toolkit';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import unifiedCharacterSlice from '../../store/unified/slices/characterSlice';
import unifiedGameSlice from '../../store/unified/slices/gameSlice';

// Mock AsyncStorage for testing
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Test store setup with both slices
const createTestStore = () => {
  const persistConfig = {
    key: 'test',
    storage: AsyncStorage,
    whitelist: ['character', 'game'],
  };

  const persistedCharacterReducer = persistReducer(persistConfig, unifiedCharacterSlice);
  const persistedGameReducer = persistReducer(persistConfig, unifiedGameSlice);

  const store = configureStore({
    reducer: {
      character: persistedCharacterReducer,
      game: persistedGameReducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: {
          ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        },
      }),
  });

  return { store, persistor: persistStore(store) };
};

describe('Character & Game Flow Integration Tests', () => {
  let store: ReturnType<typeof createTestStore>['store'];
  let persistor: ReturnType<typeof createTestStore>['persistor'];

  beforeEach(async () => {
    // Clear AsyncStorage
    await AsyncStorage.clear();
    
    // Create fresh store
    const testStore = createTestStore();
    store = testStore.store;
    persistor = testStore.persistor;
    
    // Wait for rehydration
    await new Promise(resolve => {
      const unsubscribe = persistor.subscribe(() => {
        if (persistor.getState().bootstrapped) {
          unsubscribe();
          resolve(void 0);
        }
      });
    });
  });

  describe('Complete Game Flow', () => {
    it('should create character and start game successfully', async () => {
      // Step 1: Create character
      const characterInfo = {
        id: 'test-character-1',
        name: 'John Doe',
        age: 0,
        birthYear: 2024,
        birthCity: 'Baku',
        gender: 'male' as const,
      };

      // Create character
      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      
      // Verify character created
      const characterState = store.getState().character;
      expect(characterState.character).not.toBeNull();
      expect(characterState.character?.info.name).toBe('John Doe');
      expect(characterState.character?.stats.health).toBe(100);
      expect(characterState.character?.isAlive).toBe(true);

      // Step 2: Start game with character
      await store.dispatch(unifiedGameSlice.actions.startNewGame('normal'));
      
      // Verify game started
      const gameState = store.getState().game;
      expect(gameState.currentGame).not.toBeNull();
      expect(gameState.currentGame?.difficulty).toBe('normal');
      expect(gameState.currentGame?.isPlaying).toBe(true);
      expect(gameState.currentGame?.isPaused).toBe(false);

      // Step 3: Link character to game
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(characterState.character!));
      
      // Verify character linked to game
      const gameCharacter = store.getState().game.currentGame?.character;
      expect(gameCharacter?.info.name).toBe('John Doe');
      expect(gameCharacter?.stats.health).toBe(100);
    });

    it('should handle character aging and game progression', async () => {
      // Create and start game
      const characterInfo = {
        id: 'test-character-2',
        name: 'Jane Smith',
        age: 0,
        birthYear: 2000,
        birthCity: 'Ganja',
        gender: 'female' as const,
      };

      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      await store.dispatch(unifiedGameSlice.actions.startNewGame('easy'));
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(store.getState().character.character!));

      // Initial state
      expect(store.getState().character.character?.info.age).toBe(0);
      expect(store.getState().game.currentGame?.currentAge).toBe(0);
      expect(store.getState().game.currentGame?.currentYear).toBe(2024);

      // Simulate game time progression
      store.dispatch(unifiedGameSlice.actions.updateGameTime());
      
      // Character should age with game
      expect(store.getState().character.character?.info.age).toBeGreaterThan(0);
      expect(store.getState().game.currentGame?.currentAge).toBeGreaterThan(0);
      expect(store.getState().game.currentGame?.currentYear).toBeGreaterThan(2024);

      // Advance year manually
      store.dispatch(unifiedGameSlice.actions.advanceYear());
      
      // Both character and game should be updated
      expect(store.getState().character.character?.info.age).toBe(2); // 2 years total
      expect(store.getState().game.currentGame?.currentAge).toBe(2);
      expect(store.getState().game.currentGame?.currentYear).toBe(2026);
    });

    it('should handle character death and game end', async () => {
      // Create and start game
      const characterInfo = {
        id: 'test-character-3',
        name: 'Bob Wilson',
        age: 25,
        birthYear: 1999,
        birthCity: 'Sumgait',
        gender: 'male' as const,
      };

      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      await store.dispatch(unifiedGameSlice.actions.startNewGame('normal'));
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(store.getState().character.character!));

      // Verify initial alive state
      expect(store.getState().character.character?.isAlive).toBe(true);
      expect(store.getState().game.currentGame?.isPlaying).toBe(true);

      // Kill character
      await store.dispatch(unifiedCharacterSlice.actions.killCharacter('Old age'));
      
      // Verify character death
      expect(store.getState().character.character?.isAlive).toBe(false);
      expect(store.getState().character.character?.deathCause).toBe('Old age');

      // Game should still be running but character is dead
      expect(store.getState().game.currentGame?.isPlaying).toBe(true);
      expect(store.getState().game.currentGame?.character?.isAlive).toBe(false);

      // Stop game
      store.dispatch(unifiedGameSlice.actions.stopGame());
      
      expect(store.getState().game.currentGame?.isPlaying).toBe(false);
      expect(store.getState().game.currentGame?.isPaused).toBe(true);
    });

    it('should handle character stats changes and game statistics', async () => {
      // Create and start game
      const characterInfo = {
        id: 'test-character-4',
        name: 'Alice Brown',
        age: 30,
        birthYear: 1994,
        birthCity: 'Lankaran',
        gender: 'female' as const,
      };

      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      await store.dispatch(unifiedGameSlice.actions.startNewGame('hard'));
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(store.getState().character.character!));

      // Initial stats
      expect(store.getState().character.character?.stats.health).toBe(100);
      expect(store.getState().character.character?.stats.happiness).toBe(50);

      // Update character stats
      store.dispatch(unifiedCharacterSlice.actions.updateCharacterStatsSync({
        health: 80,
        happiness: 70,
        wealth: 1000,
      }));

      // Verify stats updated
      const updatedStats = store.getState().character.character?.stats;
      expect(updatedStats?.health).toBe(80);
      expect(updatedStats?.happiness).toBe(70);
      expect(updatedStats?.wealth).toBe(1000);
      expect(updatedStats?.energy).toBe(100); // Should remain unchanged

      // Update game statistics
      store.dispatch(unifiedGameSlice.actions.updateStatistics({
        totalPlayTime: 3600, // 1 hour
        choicesMade: 10,
      }));

      // Verify statistics updated
      const stats = store.getState().game.currentGame?.statistics;
      expect(stats?.totalPlayTime).toBe(3600);
      expect(stats?.choicesMade).toBe(10);
      expect(stats?.sessionsPlayed).toBe(1); // Should remain unchanged
    });

    it('should handle character skills and relationships development', async () => {
      // Create and start game
      const characterInfo = {
        id: 'test-character-5',
        name: 'Charlie Davis',
        age: 20,
        birthYear: 2004,
        birthCity: 'Shaki',
        gender: 'male' as const,
      };

      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      await store.dispatch(unifiedGameSlice.actions.startNewGame('normal'));
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(store.getState().character.character!));

      // Initial skills and relationships
      expect(store.getState().character.character?.skills.intelligence).toBe(50);
      expect(store.getState().character.character?.relationships.friends).toBe(50);

      // Develop skills
      store.dispatch(unifiedCharacterSlice.actions.updateCharacterSkills({
        intelligence: 80,
        technical: 90,
        creativity: 70,
      }));

      // Improve relationships
      store.dispatch(unifiedCharacterSlice.actions.updateCharacterRelationships({
        friends: 85,
        romantic: 60,
        colleagues: 75,
      }));

      // Verify development
      const skills = store.getState().character.character?.skills;
      expect(skills?.intelligence).toBe(80);
      expect(skills?.technical).toBe(90);
      expect(skills?.creativity).toBe(70);
      expect(skills?.social).toBe(50); // Should remain unchanged

      const relationships = store.getState().character.character?.relationships;
      expect(relationships?.friends).toBe(85);
      expect(relationships?.romantic).toBe(60);
      expect(relationships?.colleagues).toBe(75);
      expect(relationships?.family).toBe(100); // Should remain unchanged
    });

    it('should handle character events and history', async () => {
      // Create and start game
      const characterInfo = {
        id: 'test-character-6',
        name: 'Diana Miller',
        age: 18,
        birthYear: 2006,
        birthCity: 'Mingachevir',
        gender: 'female' as const,
      };

      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      await store.dispatch(unifiedGameSlice.actions.startNewGame('normal'));
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(store.getState().character.character!));

      // Initial history should be empty
      expect(store.getState().character.character?.history).toHaveLength(0);

      // Add events to character history
      const event1 = {
        id: 'event-1',
        type: 'education' as const,
        title: 'Started School',
        description: 'You started your education journey',
        year: 2024,
        age: 18,
      };

      const event2 = {
        id: 'event-2',
        type: 'career' as const,
        title: 'First Job',
        description: 'You got your first job',
        year: 2024,
        age: 18,
        impact: {
          wealth: 100,
          happiness: 10,
        },
      };

      await store.dispatch(unifiedCharacterSlice.actions.addCharacterEvent(event1));
      await store.dispatch(unifiedCharacterSlice.actions.addCharacterEvent(event2));

      // Verify events added
      const history = store.getState().character.character?.history;
      expect(history).toHaveLength(2);
      expect(history?.[0].title).toBe('Started School');
      expect(history?.[1].title).toBe('First Job');
    });
  });

  describe('Persistence Integration', () => {
    it('should persist and rehydrate state correctly', async () => {
      // Create character and game
      const characterInfo = {
        id: 'test-character-persist',
        name: 'Persistent Character',
        age: 25,
        birthYear: 1999,
        birthCity: 'Baku',
        gender: 'male' as const,
      };

      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      await store.dispatch(unifiedGameSlice.actions.startNewGame('normal'));
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(store.getState().character.character!));

      // Modify state
      store.dispatch(unifiedCharacterSlice.actions.updateCharacterStatsSync({ health: 80 }));
      store.dispatch(unifiedGameSlice.actions.updateStatistics({ totalPlayTime: 1000 }));

      // Simulate app restart by creating new store
      const newStore = createTestStore();
      const newPersistor = newStore.persistor;
      
      // Wait for rehydration
      await new Promise(resolve => {
        const unsubscribe = newPersistor.subscribe(() => {
          if (newPersistor.getState().bootstrapped) {
            unsubscribe();
            resolve(void 0);
          }
        });
      });

      // Verify state was rehydrated
      expect(newStore.store.getState().character.character?.info.name).toBe('Persistent Character');
      expect(newStore.store.getState().character.character?.stats.health).toBe(80);
      expect(newStore.store.getState().game.currentGame?.difficulty).toBe('normal');
      expect(newStore.store.getState().game.currentGame?.statistics.totalPlayTime).toBe(1000);
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle character creation errors gracefully', async () => {
      // Try to create character with invalid data
      const invalidCharacterInfo = {
        id: '',
        name: '',
        age: -1,
        birthYear: 2024,
        birthCity: '',
        gender: 'male' as const,
      };

      // Should not throw but handle gracefully
      expect(async () => {
        await store.dispatch(unifiedCharacterSlice.actions.createCharacter(invalidCharacterInfo));
      }).not.toThrow();

      // Character should not be created
      expect(store.getState().character.character).toBeNull();
    });

    it('should handle game start errors gracefully', async () => {
      // Try to start game without character
      expect(async () => {
        await store.dispatch(unifiedGameSlice.actions.startNewGame('normal'));
      }).not.toThrow();

      // Game should be created but without character
      expect(store.getState().game.currentGame).not.toBeNull();
      expect(store.getState().game.currentGame?.character).toBeUndefined();
    });
  });

  describe('Performance Integration', () => {
    it('should handle rapid state updates efficiently', async () => {
      const startTime = performance.now();

      // Create character
      const characterInfo = {
        id: 'test-character-perf',
        name: 'Performance Test',
        age: 0,
        birthYear: 2024,
        birthCity: 'Baku',
        gender: 'male' as const,
      };

      await store.dispatch(unifiedCharacterSlice.actions.createCharacter(characterInfo));
      await store.dispatch(unifiedGameSlice.actions.startNewGame('normal'));
      store.dispatch(unifiedGameSlice.actions.setGameCharacter(store.getState().character.character!));

      // Perform rapid updates
      for (let i = 0; i < 100; i++) {
        store.dispatch(unifiedCharacterSlice.actions.updateCharacterStatsSync({
          health: 100 - i,
          happiness: 50 + i,
        }));
        
        store.dispatch(unifiedGameSlice.actions.updateGameTime());
        
        if (i % 10 === 0) {
          store.dispatch(unifiedGameSlice.actions.incrementChoicesMade());
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);

      // Verify final state
      expect(store.getState().character.character?.stats.health).toBe(0);
      expect(store.getState().character.character?.stats.happiness).toBe(150);
      expect(store.getState().game.currentGame?.statistics.choicesMade).toBe(10);
    });
  });
});
