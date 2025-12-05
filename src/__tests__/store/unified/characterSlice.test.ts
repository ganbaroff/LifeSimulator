// 🧪 Character Slice Tests - Unified Architecture
// Создано: QA Engineer (Agile Team)
// Версия: 3.0.0

import { configureStore } from '@reduxjs/toolkit';
import characterSlice, {
  createCharacter,
  updateCharacterStats,
  addCharacterEvent,
  killCharacter,
  updateCharacterName,
  updateCharacterAge,
  updateCharacterStatsSync,
  updateCharacterSkills,
  updateCharacterRelationships,
  setCharacterProfession,
  setCharacterEducation,
  clearCharacter,
  resetCharacter,
} from '../../../store/unified/slices/characterSlice';
import { CharacterInfo } from '../../../types/unified';

// Test store setup
const createTestStore = () => {
  return configureStore({
    reducer: {
      character: characterSlice.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        serializableCheck: false, // Disable for testing
      }),
  });
};

describe('Character Slice - Unified Architecture', () => {
  let store: ReturnType<typeof createTestStore>;
  const mockCharacterInfo: CharacterInfo = {
    id: 'test-character-1',
    name: 'Test Character',
    age: 0,
    birthYear: 2024,
    birthCity: 'Baku',
    gender: 'male',
  };

  beforeEach(() => {
    store = createTestStore();
  });

  describe('Initial State', () => {
    it('should have correct initial state', () => {
      const state = store.getState().character;
      
      expect(state.character).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeUndefined();
      expect(state.lastUpdated).toBeGreaterThan(0);
    });
  });

  describe('Synchronous Actions', () => {
    it('should update character name', () => {
      // First create a character
      store.dispatch(createCharacter(mockCharacterInfo));
      expect(store.getState().character.character?.info.name).toBe('Test Character');
      
      // Update name
      store.dispatch(updateCharacterName('Updated Name'));
      expect(store.getState().character.character?.info.name).toBe('Updated Name');
    });

    it('should update character age', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      expect(store.getState().character.character?.info.age).toBe(0);
      
      store.dispatch(updateCharacterAge(25));
      expect(store.getState().character.character?.info.age).toBe(25);
    });

    it('should update character stats synchronously', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      
      store.dispatch(updateCharacterStatsSync({ health: 80, happiness: 90 }));
      const stats = store.getState().character.character?.stats;
      
      expect(stats?.health).toBe(80);
      expect(stats?.happiness).toBe(90);
      expect(stats?.wealth).toBe(0); // Should remain unchanged
      expect(stats?.energy).toBe(100); // Should remain unchanged
    });

    it('should update character skills', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      
      store.dispatch(updateCharacterSkills({ intelligence: 80, creativity: 90 }));
      const skills = store.getState().character.character?.skills;
      
      expect(skills?.intelligence).toBe(80);
      expect(skills?.creativity).toBe(90);
      expect(skills?.social).toBe(50); // Should remain unchanged
    });

    it('should update character relationships', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      
      store.dispatch(updateCharacterRelationships({ family: 90, friends: 80 }));
      const relationships = store.getState().character.character?.relationships;
      
      expect(relationships?.family).toBe(90);
      expect(relationships?.friends).toBe(80);
      expect(relationships?.romantic).toBe(0); // Should remain unchanged
    });

    it('should set character profession', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      
      store.dispatch(setCharacterProfession('Software Developer'));
      expect(store.getState().character.character?.profession).toBe('Software Developer');
    });

    it('should set character education', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      
      store.dispatch(setCharacterEducation('Bachelor Degree'));
      expect(store.getState().character.character?.education).toBe('Bachelor Degree');
    });

    it('should clear character', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      expect(store.getState().character.character).not.toBeNull();
      
      store.dispatch(clearCharacter());
      expect(store.getState().character.character).toBeNull();
    });

    it('should reset character state', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      store.dispatch(updateCharacterName('Test'));
      
      store.dispatch(resetCharacter());
      
      const state = store.getState().character;
      expect(state.character).toBeNull();
      expect(state.loading).toBe(false);
      expect(state.error).toBeUndefined();
    });
  });

  describe('Async Thunks', () => {
    describe('createCharacter', () => {
      it('should handle character creation pending', () => {
        store.dispatch(createCharacter.pending('', mockCharacterInfo));
        
        const state = store.getState().character;
        expect(state.loading).toBe(true);
        expect(state.error).toBeUndefined();
      });

      it('should handle character creation fulfilled', () => {
        store.dispatch(createCharacter.fulfilled(undefined, '', mockCharacterInfo));
        
        const state = store.getState().character;
        expect(state.loading).toBe(false);
        expect(state.character).not.toBeNull();
        expect(state.character?.info.name).toBe(mockCharacterInfo.name);
        expect(state.character?.stats.health).toBe(100);
        expect(state.character?.isAlive).toBe(true);
      });

      it('should handle character creation rejected', () => {
        const errorMessage = 'Creation failed';
        store.dispatch(createCharacter.rejected(new Error(errorMessage), '', mockCharacterInfo));
        
        const state = store.getState().character;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('updateCharacterStats', () => {
      it('should handle stats update fulfilled', () => {
        // First create a character
        store.dispatch(createCharacter.fulfilled(undefined, '', mockCharacterInfo));
        
        // Update stats
        const statsUpdate = { health: 80, happiness: 90 };
        store.dispatch(updateCharacterStats.fulfilled(statsUpdate, '', statsUpdate));
        
        const stats = store.getState().character.character?.stats;
        expect(stats?.health).toBe(80);
        expect(stats?.happiness).toBe(90);
      });

      it('should handle stats update rejected', () => {
        const errorMessage = 'Update failed';
        store.dispatch(updateCharacterStats.rejected(new Error(errorMessage), '', {}));
        
        const state = store.getState().character;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });

    describe('addCharacterEvent', () => {
      it('should handle event addition fulfilled', () => {
        // First create a character
        store.dispatch(createCharacter.fulfilled(undefined, '', mockCharacterInfo));
        
        // Add event
        const event = {
          id: 'event-1',
          type: 'birth' as const,
          title: 'Birth Event',
          description: 'You were born',
          year: 2024,
          age: 0,
        };
        
        store.dispatch(addCharacterEvent.fulfilled(undefined, '', event));
        
        const history = store.getState().character.character?.history;
        expect(history).toHaveLength(1);
        expect(history?.[0].title).toBe('Birth Event');
      });
    });

    describe('killCharacter', () => {
      it('should handle character death fulfilled', () => {
        // First create a character
        store.dispatch(createCharacter.fulfilled(undefined, '', mockCharacterInfo));
        expect(store.getState().character.character?.isAlive).toBe(true);
        
        // Kill character
        const deathCause = 'Old age';
        store.dispatch(killCharacter.fulfilled(undefined, '', deathCause));
        
        const character = store.getState().character.character;
        expect(character?.isAlive).toBe(false);
        expect(character?.deathCause).toBe(deathCause);
      });

      it('should handle character death rejected', () => {
        const errorMessage = 'Death failed';
        store.dispatch(killCharacter.rejected(new Error(errorMessage), '', ''));
        
        const state = store.getState().character;
        expect(state.loading).toBe(false);
        expect(state.error).toBe(errorMessage);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle synchronous actions without character', () => {
      // Try to update stats without creating character first
      store.dispatch(updateCharacterStatsSync({ health: 50 }));
      
      // Should not crash and character should remain null
      expect(store.getState().character.character).toBeNull();
    });

    it('should handle partial stats updates', () => {
      store.dispatch(createCharacter(mockCharacterInfo));
      
      // Update only one stat
      store.dispatch(updateCharacterStatsSync({ health: 75 }));
      
      const stats = store.getState().character.character?.stats;
      expect(stats?.health).toBe(75);
      expect(stats?.happiness).toBe(50); // Should remain default
      expect(stats?.wealth).toBe(0);
      expect(stats?.energy).toBe(100);
    });

    it('should update lastUpdated timestamp on every action', () => {
      const initialTimestamp = store.getState().character.lastUpdated;
      
      // Wait a bit to ensure different timestamp
      setTimeout(() => {
        store.dispatch(updateCharacterName('Test'));
        const newTimestamp = store.getState().character.lastUpdated;
        
        expect(newTimestamp).toBeGreaterThan(initialTimestamp);
      }, 10);
    });
  });

  describe('State Immutability', () => {
    it('should not mutate state directly', () => {
      const initialState = store.getState().character;
      
      store.dispatch(createCharacter(mockCharacterInfo));
      const newState = store.getState().character;
      
      // Should be different objects
      expect(initialState).not.toBe(newState);
      
      // Immutable updates should work
      expect(initialState.character).toBeNull();
      expect(newState.character).not.toBeNull();
    });
  });
});
