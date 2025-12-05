// 🎭 Character Slice - Unified State Management
// Создано: Developer (Agile Team)
// Версия: 3.0.0

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Character, CharacterInfo, CharacterStats, GameEvent } from '../../../types/unified';

// Async thunks
export const createCharacter = createAsyncThunk(
  'character/create',
  async (characterInfo: CharacterInfo) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const newCharacter: Character = {
      info: characterInfo,
      stats: {
        health: 100,
        happiness: 50,
        wealth: 0,
        energy: 100,
      },
      skills: {
        intelligence: 50,
        creativity: 50,
        social: 50,
        physical: 50,
        business: 50,
        technical: 50,
      },
      relationships: {
        family: 100,
        friends: 50,
        romantic: 0,
        colleagues: 0,
      },
      history: [],
      achievements: [],
      isAlive: true,
    };
    
    return newCharacter;
  }
);

export const updateCharacterStats = createAsyncThunk(
  'character/updateStats',
  async (updates: Partial<CharacterStats>) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return updates;
  }
);

export const addCharacterEvent = createAsyncThunk(
  'character/addEvent',
  async (event: GameEvent) => {
    await new Promise(resolve => setTimeout(resolve, 50));
    return event;
  }
);

export const killCharacter = createAsyncThunk(
  'character/kill',
  async (deathCause: string) => {
    await new Promise(resolve => setTimeout(resolve, 100));
    return deathCause;
  }
);

// State interface
interface CharacterState {
  character: Character | null;
  loading: boolean;
  error?: string;
  lastUpdated: number;
}

// Initial state
const initialState: CharacterState = {
  character: null,
  loading: false,
  lastUpdated: Date.now(),
};

// Slice
const characterSlice = createSlice({
  name: 'character',
  initialState,
  reducers: {
    // Synchronous actions
    updateCharacterName: (state, action: PayloadAction<string>) => {
      if (state.character) {
        state.character.info.name = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    
    updateCharacterAge: (state, action: PayloadAction<number>) => {
      if (state.character) {
        state.character.info.age = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    
    updateCharacterStatsSync: (state, action: PayloadAction<Partial<CharacterStats>>) => {
      if (state.character) {
        Object.assign(state.character.stats, action.payload);
        state.lastUpdated = Date.now();
      }
    },
    
    updateCharacterSkills: (state, action: PayloadAction<Partial<CharacterStats>>) => {
      if (state.character) {
        Object.assign(state.character.skills, action.payload);
        state.lastUpdated = Date.now();
      }
    },
    
    updateCharacterRelationships: (state, action: PayloadAction<Partial<CharacterStats>>) => {
      if (state.character) {
        Object.assign(state.character.relationships, action.payload);
        state.lastUpdated = Date.now();
      }
    },
    
    setCharacterProfession: (state, action: PayloadAction<string>) => {
      if (state.character) {
        state.character.profession = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    
    setCharacterEducation: (state, action: PayloadAction<string>) => {
      if (state.character) {
        state.character.education = action.payload;
        state.lastUpdated = Date.now();
      }
    },
    
    clearCharacter: (state) => {
      state.character = null;
      state.lastUpdated = Date.now();
    },
    
    resetCharacter: () => initialState,
  },
  extraReducers: (builder) => {
    // Create character
    builder
      .addCase(createCharacter.pending, (state) => {
        state.loading = true;
        state.error = undefined;
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.loading = false;
        state.character = action.payload;
        state.lastUpdated = Date.now();
      })
      .addCase(createCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    
    // Update stats
    builder
      .addCase(updateCharacterStats.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateCharacterStats.fulfilled, (state, action) => {
        state.loading = false;
        if (state.character) {
          Object.assign(state.character.stats, action.payload);
          state.lastUpdated = Date.now();
        }
      })
      .addCase(updateCharacterStats.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
    
    // Add event
    builder
      .addCase(addCharacterEvent.fulfilled, (state, action) => {
        if (state.character) {
          state.character.history.push(action.payload);
          state.lastUpdated = Date.now();
        }
      });
    
    // Kill character
    builder
      .addCase(killCharacter.pending, (state) => {
        state.loading = true;
      })
      .addCase(killCharacter.fulfilled, (state, action) => {
        state.loading = false;
        if (state.character) {
          state.character.isAlive = false;
          state.character.deathCause = action.payload;
          state.lastUpdated = Date.now();
        }
      })
      .addCase(killCharacter.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
      });
  },
});

// Export actions
export const {
  updateCharacterName,
  updateCharacterAge,
  updateCharacterStatsSync,
  updateCharacterSkills,
  updateCharacterRelationships,
  setCharacterProfession,
  setCharacterEducation,
  clearCharacter,
  resetCharacter,
} = characterSlice.actions;

// Selectors
export const selectCharacter = (state: { character: CharacterState }) => state.character.character;
export const selectCharacterStats = (state: { character: CharacterState }) => state.character.character?.stats;
export const selectCharacterSkills = (state: { character: CharacterState }) => state.character.character?.skills;
export const selectCharacterInfo = (state: { character: CharacterState }) => state.character.character?.info;
export const selectCharacterLoading = (state: { character: CharacterState }) => state.character.loading;
export const selectCharacterError = (state: { character: CharacterState }) => state.character.error;
export const selectCharacterHistory = (state: { character: CharacterState }) => state.character.character?.history;
export const selectIsCharacterAlive = (state: { character: CharacterState }) => state.character.character?.isAlive ?? false;

// Reducer
export default characterSlice.reducer;
// Export the slice for tests that need access to actions
export const characterSliceWithActions = characterSlice;
