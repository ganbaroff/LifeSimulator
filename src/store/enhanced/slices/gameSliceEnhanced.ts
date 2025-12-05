// 🏗️ Enhanced Game Slice - Clean Architecture
// Создано: Developer (Agile Team)
// Версия: 1.0.0

import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';

interface GameState {
  current: {
    characterId: string;
    year: number;
    events: any[];
    isPlaying: boolean;
  } | null;
  isPlaying: boolean;
  history: any[];
  isLoading: boolean;
  error: string | null;
}

const initialState: GameState = {
  current: null,
  isPlaying: false,
  history: [],
  isLoading: false,
  error: null,
};

// Async thunks
export const startGame = createAsyncThunk(
  'game/start',
  async (gameData: any) => {
    // Implementation
    return gameData;
  }
);

export const pauseGame = createAsyncThunk(
  'game/pause',
  async () => {
    // Implementation
    return {};
  }
);

const gameSliceEnhanced = createSlice({
  name: 'game',
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
    
    setCurrentGame: (state, action: PayloadAction<GameState['current']>) => {
      state.current = action.payload;
    },
    
    setPlaying: (state, action: PayloadAction<boolean>) => {
      state.isPlaying = action.payload;
      if (state.current) {
        state.current.isPlaying = action.payload;
      }
    },
    
    advanceYear: (state) => {
      if (state.current) {
        state.current.year += 1;
      }
    },
    
    addEvent: (state, action: PayloadAction<any>) => {
      if (state.current) {
        state.current.events.push(action.payload);
      }
    },
    
    reset: (state) => {
      state.current = null;
      state.isPlaying = false;
      state.isLoading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(startGame.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(startGame.fulfilled, (state, action) => {
        state.isLoading = false;
        state.current = action.payload;
        state.isPlaying = true;
      })
      .addCase(startGame.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message || 'Failed to start game';
      });
  },
});

export const gameActions = gameSliceEnhanced.actions;
export default gameSliceEnhanced.reducer;
