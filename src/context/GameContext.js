// GameContext.js - Управление игровым состоянием, уровнями и прогрессом
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const GameContext = createContext();

// Определение уровней
export const LEVELS = {
  DEMO: {
    id: 'demo',
    name: 'Demo',
    duration: 300, // 5 минут в секундах
    requiredCrystals: 0,
    deathChance: 0.1, // 10% шанс смерти на C-выборах
    unlocked: true,
  },
  LEVEL_1: {
    id: 'level_1',
    name: 'Level 1',
    duration: 1800, // 30 минут
    requiredCrystals: 0,
    deathChance: 0.2,
    unlocked: false,
  },
  LEVEL_2: {
    id: 'level_2',
    name: 'Level 2',
    duration: 3600, // 60 минут
    requiredCrystals: 100,
    deathChance: 0.3,
    unlocked: false,
  },
  LEVEL_3: {
    id: 'level_3',
    name: 'Level 3',
    duration: 5400, // 90 минут
    requiredCrystals: 250,
    deathChance: 0.4,
    unlocked: false,
  },
  LEVEL_4: {
    id: 'level_4',
    name: 'Level 4',
    duration: 7200, // 120 минут
    requiredCrystals: 500,
    deathChance: 0.5,
    unlocked: false,
  },
  LEVEL_5: {
    id: 'level_5',
    name: 'Level 5',
    duration: 10800, // 180 минут
    requiredCrystals: 1000,
    deathChance: 0.6,
    unlocked: false,
  },
};

const DEFAULT_GAME_STATE = {
  currentLevel: 'demo',
  crystals: 0,
  unlockedLevels: ['demo'],
  achievements: [],
  dailyRewardLastClaimed: null,
  gameStartTime: null,
  totalPlayTime: 0,
  settings: {
    soundEnabled: true,
    musicEnabled: true,
    aiEnabled: true,
  },
};

export const GameProvider = ({ children }) => {
  const [gameState, setGameState] = useState(DEFAULT_GAME_STATE);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGameState();
  }, []);

  // ФУНКЦИЯ: Загрузка игрового состояния
  const loadGameState = async () => {
    try {
      const saved = await AsyncStorage.getItem('gameState');
      if (saved) {
        setGameState(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading game state:', error);
    } finally {
      setLoading(false);
    }
  };

  // ФУНКЦИЯ: Сохранение игрового состояния
  const saveGameState = async (updatedState) => {
    try {
      await AsyncStorage.setItem('gameState', JSON.stringify(updatedState));
      setGameState(updatedState);
    } catch (error) {
      console.error('Error saving game state:', error);
    }
  };

  // ФУНКЦИЯ: Начать новую игру на выбранном уровне
  const startLevel = async (levelId) => {
    // Поиск уровня по id
    const level = Object.values(LEVELS).find(l => l.id === levelId);
    if (!level) {
      throw new Error(`Level ${levelId} not found`);
    }

    // Проверка разблокировки
    if (!gameState.unlockedLevels.includes(levelId) && levelId !== 'demo') {
      throw new Error(`Level ${levelId} is locked`);
    }

    // Проверка кристаллов
    if (gameState.crystals < level.requiredCrystals) {
      throw new Error(`Not enough crystals. Need ${level.requiredCrystals}, have ${gameState.crystals}`);
    }

    const updated = {
      ...gameState,
      currentLevel: levelId,
      gameStartTime: Date.now(),
    };

    await saveGameState(updated);
    return updated;
  };

  // ФУНКЦИЯ: Добавление кристаллов
  const addCrystals = async (amount) => {
    const updated = {
      ...gameState,
      crystals: gameState.crystals + amount,
    };
    await saveGameState(updated);
    return updated;
  };

  // ФУНКЦИЯ: Потратить кристаллы (для Rewind)
  const spendCrystals = async (amount) => {
    if (gameState.crystals < amount) {
      throw new Error('Not enough crystals');
    }

    const updated = {
      ...gameState,
      crystals: gameState.crystals - amount,
    };
    await saveGameState(updated);
    return updated;
  };

  // ФУНКЦИЯ: Разблокировать уровень
  const unlockLevel = async (levelId) => {
    if (gameState.unlockedLevels.includes(levelId)) {
      return gameState; // Уже разблокирован
    }

    const updated = {
      ...gameState,
      unlockedLevels: [...gameState.unlockedLevels, levelId],
    };
    await saveGameState(updated);
    return updated;
  };

  // ФУНКЦИЯ: Добавить достижение
  const unlockAchievement = async (achievementId, reward = 0) => {
    if (gameState.achievements.includes(achievementId)) {
      return gameState; // Уже получено
    }

    const updated = {
      ...gameState,
      achievements: [...gameState.achievements, achievementId],
      crystals: gameState.crystals + reward,
    };
    await saveGameState(updated);
    return updated;
  };

  // ФУНКЦИЯ: Получить ежедневную награду
  const claimDailyReward = async () => {
    const now = Date.now();
    const lastClaimed = gameState.dailyRewardLastClaimed;

    // Проверка: прошло ли 24 часа
    if (lastClaimed && (now - lastClaimed) < 86400000) {
      const timeLeft = 86400000 - (now - lastClaimed);
      throw new Error(`Daily reward available in ${Math.ceil(timeLeft / 3600000)} hours`);
    }

    const dailyReward = 50; // 50 кристаллов в день

    const updated = {
      ...gameState,
      crystals: gameState.crystals + dailyReward,
      dailyRewardLastClaimed: now,
    };
    await saveGameState(updated);
    return { reward: dailyReward, updated };
  };

  // ФУНКЦИЯ: Завершить игру (успешно или смерть)
  const endGame = async (success, finalAge, finalWealth) => {
    // Расчет награды
    let crystalsEarned = 0;

    if (success) {
      // Награда за возраст
      crystalsEarned += Math.floor(finalAge / 10) * 10;
      
      // Награда за богатство
      crystalsEarned += Math.floor(finalWealth / 1000) * 5;

      // Бонус за завершение уровня
      const levelBonus = {
        demo: 10,
        level_1: 25,
        level_2: 50,
        level_3: 100,
        level_4: 200,
        level_5: 500,
      };
      crystalsEarned += levelBonus[gameState.currentLevel] || 0;
    }

    const updated = {
      ...gameState,
      crystals: gameState.crystals + crystalsEarned,
      totalPlayTime: gameState.totalPlayTime + (Date.now() - gameState.gameStartTime),
    };

    // Автоматическая разблокировка следующего уровня при успехе
    if (success) {
      const levelOrder = ['demo', 'level_1', 'level_2', 'level_3', 'level_4', 'level_5'];
      const currentIndex = levelOrder.indexOf(gameState.currentLevel);
      if (currentIndex >= 0 && currentIndex < levelOrder.length - 1) {
        const nextLevel = levelOrder[currentIndex + 1];
        if (!updated.unlockedLevels.includes(nextLevel)) {
          updated.unlockedLevels.push(nextLevel);
        }
      }
    }

    await saveGameState(updated);
    return { crystalsEarned, updated };
  };

  // ФУНКЦИЯ: Получить информацию о текущем уровне
  const getCurrentLevelInfo = () => {
    return Object.values(LEVELS).find(l => l.id === gameState.currentLevel) || LEVELS.DEMO;
  };

  // ФУНКЦИЯ: Получить оставшееся время уровня
  const getRemainingTime = () => {
    if (!gameState.gameStartTime) return 0;
    
    const levelInfo = getCurrentLevelInfo();
    const elapsed = Math.floor((Date.now() - gameState.gameStartTime) / 1000);
    const remaining = levelInfo.duration - elapsed;
    
    return Math.max(0, remaining);
  };

  // ФУНКЦИЯ: Обновить настройки
  const updateSettings = async (newSettings) => {
    const updated = {
      ...gameState,
      settings: {
        ...gameState.settings,
        ...newSettings,
      },
    };
    await saveGameState(updated);
    return updated;
  };

  // ФУНКЦИЯ: Сброс игрового прогресса
  const resetProgress = async () => {
    await AsyncStorage.removeItem('gameState');
    setGameState(DEFAULT_GAME_STATE);
  };

  const value = {
    gameState,
    loading,
    startLevel,
    addCrystals,
    spendCrystals,
    unlockLevel,
    unlockAchievement,
    claimDailyReward,
    endGame,
    getCurrentLevelInfo,
    getRemainingTime,
    updateSettings,
    resetProgress,
    LEVELS,
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
};

// Hook для использования контекста
export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
};

export default GameContext;
