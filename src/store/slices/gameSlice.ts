import { createSlice, PayloadAction, createSelector } from '@reduxjs/toolkit';
import { CharacterSchema, type SaveData } from '../../types/schemas';

// Constants
const MAX_ENERGY = 100;
const DAILY_ENERGY_RECOVERY = 20;
const MIN_AGE = 0;
const MAX_AGE = 120;

type PlayerState = {
  name: string;
  age: number;
  health: number;
  happiness: number;
  money: number;
  energy: number;
  lastUpdated: number;
};

type GameStatus = 'paused' | 'playing' | 'gameOver';

type GameState = {
  player: PlayerState;
  status: GameStatus;
  currentDay: number;
  lastSaved: number | null;
  gameSpeed: number; // Multiplier for game speed (1x, 2x, etc.)
};

const initialState: GameState = {
  player: {
    name: 'Player',
    age: 18,
    health: 100,
    happiness: 100,
    money: 1000,
    energy: 100,
    lastUpdated: Date.now(),
  },
  status: 'paused',
  currentDay: 1,
  lastSaved: null,
  gameSpeed: 1,
};

// Helper functions
const clamp = (value: number, min: number, max: number): number => 
  Math.min(Math.max(value, min), max);

const gameSlice = createSlice({
  name: 'game',
  initialState,
  reducers: {
    // Player actions
    updatePlayerName: (state, action: PayloadAction<string>) => {
      if (typeof action.payload === 'string' && action.payload.trim().length > 0) {
        state.player.name = action.payload.trim().slice(0, 50);
      }
    },
    
    updatePlayerStats: (state, action: PayloadAction<Partial<PlayerState>>) => {
      const updates = action.payload;
      
      // Apply updates with validation
      if ('health' in updates) {
        state.player.health = clamp(updates.health ?? state.player.health, 0, 100);
      }
      if ('happiness' in updates) {
        state.player.happiness = clamp(updates.happiness ?? state.player.happiness, 0, 100);
      }
      if ('money' in updates) {
        state.player.money = Math.max(0, updates.money ?? state.player.money);
      }
      if ('energy' in updates) {
        state.player.energy = clamp(updates.energy ?? state.player.energy, 0, MAX_ENERGY);
      }
      if ('age' in updates) {
        state.player.age = clamp(updates.age ?? state.player.age, MIN_AGE, MAX_AGE);
      }
      
      state.player.lastUpdated = Date.now();
      
      // Check for game over condition
      if (state.player.health <= 0) {
        state.status = 'gameOver';
      }
    },
    
    // Game actions
    nextDay: (state) => {
      if (state.status === 'gameOver') return;
      
      const now = Date.now();
      const timeElapsed = now - state.player.lastUpdated;
      
      // Update game day
      state.currentDay += 1;
      
      // Recover energy
      state.player.energy = clamp(
        state.player.energy + DAILY_ENERGY_RECOVERY,
        0,
        MAX_ENERGY
      );
      
      // Apply daily effects
      state.player.health = clamp(state.player.health - 1, 0, 100); // Slight health decay
      state.player.happiness = clamp(state.player.happiness - 2, 0, 100); // Slight happiness decay
      
      // Update last updated timestamp
      state.player.lastUpdated = now;
      
      // Check for death by old age
      if (state.player.age >= MAX_AGE) {
        state.player.health = 0;
        state.status = 'gameOver';
      } else if (state.player.age < MAX_AGE && state.currentDay % 365 === 0) {
        state.player.age += 1;
      }
    },
    
    startGame: (state, action: PayloadAction<{ seed: any; difficulty: string }>) => {
      // Initialize game with character seed and difficulty
      state.status = 'playing';
      state.currentDay = 1;
      state.lastSaved = Date.now();
      state.gameSpeed = 1;
      
      // Note: Player stats are managed in character slice
      // This action only sets game status and metadata
      state.player.lastUpdated = Date.now();
    },
    
    togglePause: (state) => {
      if (state.status === 'gameOver') return;
      state.status = state.status === 'playing' ? 'paused' : 'playing';
    },
    
    setGameSpeed: (state, action: PayloadAction<number>) => {
      state.gameSpeed = Math.max(0.5, Math.min(action.payload, 4)); // Clamp between 0.5x and 4x
    },
    
    loadGame: (state, action: PayloadAction<SaveData>) => {
      try {
        const { character, gameState } = action.payload;
        
        // Validate loaded data
        const validatedCharacter = CharacterSchema.parse(character);
        
        // Apply loaded data
        state.player = {
          name: validatedCharacter.name,
          age: validatedCharacter.age,
          health: validatedCharacter.health,
          happiness: validatedCharacter.happiness,
          money: validatedCharacter.wealth,
          energy: 100, // Reset energy on load
          lastUpdated: Date.now(),
        };
        
        state.currentDay = gameState.totalPlayTime;
        state.status = 'paused';
        state.lastSaved = action.payload.timestamp;
        
      } catch (error) {
        console.error('Failed to load game:', error);
        // Reset to initial state on error
        return { ...initialState };
      }
    },
    
    resetGame: () => {
      return { ...initialState };
    },
  },
});

// Selectors
export const selectPlayer = (state: { game: GameState }) => state.game.player;
export const selectGameStatus = (state: { game: GameState }) => state.game.status;
export const selectCurrentDay = (state: { game: GameState }) => state.game.currentDay;
export const selectGameSpeed = (state: { game: GameState }) => state.game.gameSpeed;

export const selectPlayerStats = createSelector(
  [selectPlayer],
  (player) => ({
    health: player.health,
    happiness: player.happiness,
    energy: player.energy,
    money: player.money,
    age: player.age,
  })
);

export const selectIsGameOver = createSelector(
  [selectGameStatus],
  (status) => status === 'gameOver'
);

export const {
  updatePlayerName,
  updatePlayerStats,
  nextDay,
  startGame,
  togglePause,
  setGameSpeed,
  loadGame,
  resetGame,
} = gameSlice.actions;

export type { GameState };

export default gameSlice.reducer;
