// 🏗️ Enhanced Redux Store - Clean Architecture
// Создано: Developer (Agile Team)
// Версия: 1.0.0

import { configureStore } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

// Enhanced slices
import characterSlice from './slices/characterSliceEnhanced';
import gameSlice from './slices/gameSliceEnhanced';
import uiSlice from './slices/uiSliceEnhanced';

export const store = configureStore({
  reducer: {
    character: characterSlice,
    game: gameSlice,
    ui: uiSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
  devTools: process.env.NODE_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// Typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
