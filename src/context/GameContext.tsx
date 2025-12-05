import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { GameState, Level, Character, GameSettings } from '../types';

interface GameContextValue {
  gameState: GameState | null;
  loading: boolean;
  startGame: (levelId: string) => Promise<void>;
  startLevel: (levelId: string) => Promise<void>;
  endGame: (character: Character) => Promise<void>;
  resetGameProgress: () => Promise<void>;
  updateSettings: (settings: Partial<GameSettings>) => Promise<void>;
  resetProgress: () => Promise<void>;
  LEVELS: Record<string, Level>;
}

const GameContext = createContext<GameContextValue | undefined>(undefined);

export const LEVELS: Record<string, Level> = {
    LEVEL_1: { id: 'level_1', name: 'The First Step', duration: 600, rewardCrystals: 50, unlocked: true, proMode: false, deathChance: 0.1, historicalDensity: 0.1, perks: '', requiredCrystals: 0, rewindPriceUSD: 0 },
};

const DEFAULT_GAME_STATE: GameState = {
  currentLevel: 'tutorial',
  crystals: 0,
  unlockedLevels: ['tutorial'],
  gameStartTime: Date.now(),
  settings: { 
    aiEnabled: true, 
    language: 'en', 
    musicEnabled: true, 
    soundEnabled: true,
    theme: 'system'
  },
  dailyRewardLastClaimed: null,
  totalPlayTime: 0,
  achievements: [],
};

export const GameProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => { loadGameState(); }, []);

  const loadGameState = async () => {
    setLoading(true);
    try {
      const savedStateJSON = await AsyncStorage.getItem('gameState');
      if (savedStateJSON) {
        const savedState = JSON.parse(savedStateJSON);
        setGameState({ ...DEFAULT_GAME_STATE, ...savedState });
      } else {
        setGameState(DEFAULT_GAME_STATE);
      }
    } catch (error) {
      setGameState(DEFAULT_GAME_STATE);
    } finally {
      setLoading(false);
    }
  };

  const saveGameState = async (state: GameState) => {
    try {
      await AsyncStorage.setItem('gameState', JSON.stringify(state));
      setGameState(state);
    } catch (error) { /* silent fail */ }
  };

  const startGame = async (levelId: string) => {
    if (!gameState) return;
    const level = LEVELS[levelId];
    if (!level) throw new Error(`Level not found`);
    if (!gameState.unlockedLevels.includes(levelId)) throw new Error(`Level is locked`);
    await saveGameState({ ...gameState, currentLevel: levelId, gameStartTime: Date.now() });
  };

  const endGame = async (character: Character) => {
    if (!gameState) return;
    const success = character.isAlive;
    const levelInfo = Object.values(LEVELS).find(l => l.id === gameState.currentLevel);
    let crystalsEarned = success ? (levelInfo?.rewardCrystals || 0) : 0;
    
    const newState = {
        ...gameState,
        crystals: gameState.crystals + crystalsEarned,
        currentLevel: 'tutorial',
        gameStartTime: Date.now(),
    };
    await saveGameState(newState);
  };

  const resetGameProgress = async () => {
      await saveGameState(DEFAULT_GAME_STATE);
  };

  const startLevel = async (levelId: string) => {
    if (!gameState) return;
    const newState = {
      ...gameState,
      currentLevel: levelId,
      gameStartTime: Date.now(),
    };
    await saveGameState(newState);
  };

  const updateSettings = async (newSettings: Partial<GameSettings>) => {
    if (!gameState) return;
    const newState = {
      ...gameState,
      settings: { ...gameState.settings, ...newSettings },
    };
    await saveGameState(newState);
  };

  const resetProgress = async () => {
    await saveGameState(DEFAULT_GAME_STATE);
  };

  const value: GameContextValue = { 
    gameState, 
    loading, 
    startGame, 
    startLevel,
    endGame, 
    resetGameProgress,
    updateSettings,
    resetProgress,
    LEVELS 
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

export const useGame = (): GameContextValue => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};
