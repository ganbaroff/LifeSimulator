import { configureStore, Middleware, Action, ThunkAction } from '@reduxjs/toolkit';
import { useDispatch, TypedUseSelectorHook, useSelector } from 'react-redux';
import { setupListeners } from '@reduxjs/toolkit/query';
import { persistStore, persistReducer } from 'redux-persist';
import AsyncStorage from '@react-native-async-storage/async-storage';
import gameReducer, { GameState } from './slices/gameSlice';
import activitiesReducer, { 
  updateActivityProgress,
  ActivitiesState
} from './slices/activitiesSlice';
import characterReducer, { CharacterState } from './slices/characterSlice';
import gameLoopReducer, { GameLoopState } from './slices/gameLoopSlice';

// Define the root state type by combining all slice states
export interface RootState {
  game: GameState;
  activities: ActivitiesState;
  character: CharacterState;
  gameLoop: GameLoopState;
}

// Custom middleware for handling game ticks and activity updates
const gameLoopMiddleware: Middleware<{}, RootState> = (store) => (next) => (action: any) => {
  // Handle game ticks
  if (action.type === 'game/tick') {
    const state = store.getState() as RootState;
    const now = Date.now();
    
    // Update activity progress if there's an active activity
    if (state.activities.currentActivity) {
      store.dispatch(updateActivityProgress(now));
    }
    
    // Process other game loop updates here
  }
  
  return next(action);
};

// Configure persist
const persistConfig = {
  key: 'root',
  storage: AsyncStorage,
  whitelist: ['game', 'activities', 'character'], // Only persist these slices
};

// Create persisted reducers
const persistedGameReducer = persistReducer(persistConfig, gameReducer);
const persistedActivitiesReducer = persistReducer(persistConfig, activitiesReducer);
const persistedCharacterReducer = persistReducer(persistConfig, characterReducer);
// Note: gameLoop is not persisted as it's runtime state only

// Configure the store
export const store = configureStore({
  reducer: {
    game: persistedGameReducer,
    activities: persistedActivitiesReducer,
    character: persistedCharacterReducer,
    gameLoop: gameLoopReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['game/tick'],
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        ignoredPaths: ['activities.lastUpdated'],
      },
      // Disable immutable check for better performance with large state objects
      immutableCheck: { warnAfter: 128 },
    }).concat(gameLoopMiddleware),
  // Enable Redux DevTools
  devTools: process.env.NODE_ENV !== 'production',
});

// Setup listeners for RTK Query if needed
setupListeners(store.dispatch);

// Infer the `AppDispatch` type from the store itself
export type AppDispatch = typeof store.dispatch;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;

// Custom hooks for use throughout the app
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

// Helper function to start the game loop
let gameLoopInterval: NodeJS.Timeout | null = null;

export const startGameLoop = (): void => {
  if (gameLoopInterval) return;
  
  // Dispatch a tick every second (1000ms)
  gameLoopInterval = setInterval(() => {
    store.dispatch({ type: 'game/tick' });
  }, 1000);
};

// Helper function to stop the game loop
export const stopGameLoop = (): void => {
  if (gameLoopInterval) {
    clearInterval(gameLoopInterval);
    gameLoopInterval = null;
  }
};

// Start the game loop when the store is initialized
startGameLoop();

// Create and export persistor
export const persistor = persistStore(store);
