// CharacterContext.js - Управление персонажем и сохранение состояния
import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CharacterContext = createContext();

// Начальное состояние персонажа
const DEFAULT_CHARACTER = {
  name: '',
  age: 0,
  health: 100,
  happiness: 100,
  wealth: 0,
  skills: 0,
  country: 'USA',
  birthYear: 2000,
  profession: null,
  isAlive: true,
  deathCause: null,
  avatarUrl: null,
  history: [], // История всех событий
};

export const CharacterProvider = ({ children }) => {
  const [character, setCharacter] = useState(DEFAULT_CHARACTER);
  const [loading, setLoading] = useState(true);

  // Загрузка персонажа при старте
  useEffect(() => {
    loadCharacter();
  }, []);

  // ФУНКЦИЯ: Загрузка персонажа из AsyncStorage
  const loadCharacter = async () => {
    try {
      const saved = await AsyncStorage.getItem('character');
      if (saved) {
        setCharacter(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Error loading character:', error);
    } finally {
      setLoading(false);
    }
  };

  // ФУНКЦИЯ: Сохранение персонажа в AsyncStorage
  const saveCharacter = async (updatedCharacter) => {
    try {
      await AsyncStorage.setItem('character', JSON.stringify(updatedCharacter));
      setCharacter(updatedCharacter);
    } catch (error) {
      console.error('Error saving character:', error);
    }
  };

  // ФУНКЦИЯ: Создание нового персонажа
  const createCharacter = async (name, country, birthYear, profession) => {
    const newCharacter = {
      ...DEFAULT_CHARACTER,
      name,
      country,
      birthYear,
      profession,
      age: 0,
      createdAt: Date.now(),
    };
    await saveCharacter(newCharacter);
    return newCharacter;
  };

  // ФУНКЦИЯ: Обновление атрибутов персонажа
  const updateAttributes = async (changes) => {
    const updated = {
      ...character,
      health: Math.max(0, Math.min(100, character.health + (changes.health || 0))),
      happiness: Math.max(0, Math.min(100, character.happiness + (changes.happiness || 0))),
      wealth: Math.max(0, character.wealth + (changes.wealth || 0)),
      skills: Math.max(0, Math.min(100, character.skills + (changes.skills || 0))),
    };

    // Проверка смерти
    if (updated.health <= 0) {
      updated.isAlive = false;
      updated.deathCause = changes.deathCause || 'Poor health';
    }

    await saveCharacter(updated);
    return updated;
  };

  // ФУНКЦИЯ: Увеличение возраста
  const ageUp = async (years = 1) => {
    const updated = {
      ...character,
      age: character.age + years,
    };

    // Естественное старение влияет на здоровье
    if (updated.age > 60) {
      updated.health = Math.max(0, updated.health - (years * 0.5));
    }

    await saveCharacter(updated);
    return updated;
  };

  // ФУНКЦИЯ: Добавление события в историю
  const addEvent = async (event) => {
    const updated = {
      ...character,
      history: [
        ...character.history,
        {
          ...event,
          timestamp: Date.now(),
          age: character.age,
        },
      ],
    };
    await saveCharacter(updated);
    return updated;
  };

  // ФУНКЦИЯ: Rewind - возврат к прошлому состоянию
  const rewind = async (stepCount = 5) => {
    if (character.history.length < stepCount) {
      return character; // Недостаточно истории
    }

    // Удаляем последние N событий
    const newHistory = character.history.slice(0, -stepCount);
    
    // Пересчитываем атрибуты на основе оставшейся истории
    let rewoundChar = { ...DEFAULT_CHARACTER, name: character.name };
    
    for (const event of newHistory) {
      if (event.effects) {
        rewoundChar.health += event.effects.health || 0;
        rewoundChar.happiness += event.effects.happiness || 0;
        rewoundChar.wealth += event.effects.wealth || 0;
        rewoundChar.skills += event.effects.skills || 0;
      }
    }

    rewoundChar.history = newHistory;
    rewoundChar.isAlive = true;
    rewoundChar.deathCause = null;

    await saveCharacter(rewoundChar);
    return rewoundChar;
  };

  // ФУНКЦИЯ: Сброс персонажа (новая игра)
  const resetCharacter = async () => {
    await AsyncStorage.removeItem('character');
    setCharacter(DEFAULT_CHARACTER);
  };

  // ФУНКЦИЯ: Получение текущего возраста в игровых годах
  const getCurrentGameYear = () => {
    return character.birthYear + character.age;
  };

  const value = {
    character,
    loading,
    createCharacter,
    updateAttributes,
    ageUp,
    addEvent,
    rewind,
    resetCharacter,
    saveCharacter,
    getCurrentGameYear,
  };

  return (
    <CharacterContext.Provider value={value}>
      {children}
    </CharacterContext.Provider>
  );
};

// Hook для использования контекста
export const useCharacter = () => {
  const context = useContext(CharacterContext);
  if (!context) {
    throw new Error('useCharacter must be used within CharacterProvider');
  }
  return context;
};

export default CharacterContext;
