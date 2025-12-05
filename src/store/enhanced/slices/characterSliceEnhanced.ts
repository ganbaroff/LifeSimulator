// 🏗️ Enhanced Character Slice - Clean Architecture
// Создано: Developer (Agile Team)
// Версия: 1.0.0

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Character } from '../../../types/game';

interface CharacterState {
  current: Character | null;
  isLoading: boolean;
  error: string | null;
  history: Character[];
}

const initialState: CharacterState = {
  current: null,
  isLoading: false,
  error: null,
  history: [],
};

// Async thunks
export const createCharacter = createAsyncThunk(
  'character/create',
  async (characterData: any) => {
    // Implementation
    return characterData;
  }
);

export const updateCharacterStats = createAsyncThunk(
  'character/updateStats',
  async (stats: any) => {
    // Implementation
    return stats;
  }
);

const characterSliceEnhanced = createSlice({
  name: 'character',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    
    clearError: (state) => {
      state.error = null;
    },
    
    setCurrentCharacter: (state, action: PayloadAction<Character>) => {
      state.current = action.payload;
    },
    
    updateStats: (state, action: PayloadAction<Partial<Character['stats']>>) => {
      if (state.current) {
        state.current.stats = { ...state.current.stats, ...action.payload };
      }
    },
    
    reset: (state) => {
      state.current = null;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(createCharacter.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCharacter.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload;
      })
      .addCase(createCharacter.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to create character';
      });
  },
});

export const characterActions = characterSliceEnhanced.actions;
export default characterSliceEnhanced.reducer;
