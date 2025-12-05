// 🏗️ Unified Redux Store - Clean Architecture
// Создано: Developer (Agile Team)
// Версия: 3.0.0

import { configureStore, Middleware, ThunkAction, Action } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { persistStore, persistReducer, FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import existing slices
import { characterReducer } from '../slices/characterSlice';
import gameSlice from '../slices/gameSlice';
import activitiesSlice from '../slices/activitiesSlice';
import uiSliceEnhanced from '../enhanced/slices/uiSliceEnhanced';

// Import unified slices (will replace existing ones)
import unifiedCharacterSlice from './slices/characterSlice';
import unifiedGameSlice from './slices/gameSlice';

// Persist configuration
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['character', 'game'], // Only persist character and game state
  blacklist: ['ui'], // Don't persist UI state
};

// Unified root state interface
export interface RootState {
  character: ReturnType<typeof unifiedCharacterSlice.reducer>;
  game: ReturnType<typeof unifiedGameSlice.reducer>;
  activities: ReturnType<typeof activitiesSlice>;
  ui: ReturnType<typeof uiSliceEnhanced>;
}

// Game loop middleware
const gameLoopMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  if (action.type === 'game/tick') {
    const state = store.getState();
    const now = Date.now();
    
    // Update activity progress if there's an active activity
    // Note: We'll need to check if activitiesSlice has the correct action structure
    if (state.activities.currentActivity) {
      // For now, we'll dispatch a generic update action
      // This will need to be fixed when we properly integrate activitiesSlice
      console.log('Updating activity progress at:', now);
    }
    
    // Update game time and other game logic
    store.dispatch({ type: 'game/updateGameTime' });
  }
  
  return next(action);
};

// Performance monitoring middleware
const performanceMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  const startTime = performance.now();
  const result = next(action);
  const endTime = performance.now();
  
  // Log slow actions (only in development)
  if (process.env.NODE_ENV === 'development' && endTime - startTime > 16) {
    console.warn(`Slow action: ${action.type} took ${endTime - startTime}ms`);
  }
  
  return result;
};

// Create persisted reducers
const persistedCharacterReducer = persistReducer(persistConfig, unifiedCharacterSlice.reducer);
const persistedGameReducer = persistReducer(persistConfig, unifiedGameSlice.reducer);

// Configure unified store
export const store = configureStore({
  reducer: {
    character: persistedCharacterReducer,
    game: persistedGameReducer,
    activities: activitiesSlice,
    ui: uiSliceEnhanced,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER, 'game/tick'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['activities.lastUpdated', 'character.history'],
      },
      immutableCheck: { warnAfter: 128 },
    }).concat(gameLoopMiddleware, performanceMiddleware),
  devTools: process.env.NODE_ENV !== 'production',
});

// Create persistor
export const persistor = persistStore(store);

// Types
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Game loop management
let gameLoopInterval: any = null;

export const startGameLoop = (): void => {
  if (gameLoopInterval) return;
  
  gameLoopInterval = setInterval(() => {
    store.dispatch({ type: 'game/tick' });
  }, 1000);
};

export const stopGameLoop = (): void => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
};

// Auto-start game loop in development
if (process.env.NODE_ENV === 'development') {
  startGameLoop();
}

export default store;
