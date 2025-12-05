import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Character, EventEffects, GameEvent } from '../types';

interface CharacterContextValue {
  character: Character | null;
  loading: boolean;
  createCharacter: (name: string) => Promise<void>;
  updateAttributes: (changes: EventEffects) => Promise<Character | void>;
  endCurrentCharacter: () => Promise<void>;
  addEventToHistory: (event: GameEvent) => Promise<void>;
}

const CharacterContext = createContext<CharacterContextValue | undefined>(undefined);

export const DEFAULT_CHARACTER: Character = {
  name: '',
  age: 18,
  health: 100,
  happiness: 100,
  wealth: 1000,
  skills: 10,
  isAlive: true,
  deathCause: null,
  history: [],
  country: 'USA', 
  birthYear: 2000,
  profession: null,
  lifeGoal: '',
  avatarUrl: null,
  flags: [],
  relationships: [],
  assets: [],
};

export const CharacterProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => { loadCharacter(); }, []);

  const loadCharacter = async () => {
    setLoading(true);
    try {
      const savedCharJSON = await AsyncStorage.getItem('character');
      if (savedCharJSON) {
        const savedChar = JSON.parse(savedCharJSON);
        if (savedChar.isAlive) {
          setCharacter({ ...DEFAULT_CHARACTER, ...savedChar });
        } else {
          setCharacter(null);
        }
      } else {
        setCharacter(null);
      }
    } catch (error) {
      setCharacter(null);
    } finally {
      setLoading(false);
    }
  };

  const saveCharacter = async (char: Character | null) => {
    try {
      if (char) {
        await AsyncStorage.setItem('character', JSON.stringify(char));
      }
      setCharacter(char);
    } catch (error) { /* silent fail */ }
  };

  const createCharacter = async (name: string) => {
    const newCharacter: Character = { ...DEFAULT_CHARACTER, name };
    await saveCharacter(newCharacter);
  };

  const updateAttributes = async (changes: EventEffects): Promise<Character | void> => {
    if (!character) return;
    let updated = { ...character };

    updated.health = Math.min(100, Math.max(0, updated.health + (changes.health || 0)));
    updated.happiness = Math.min(100, Math.max(0, updated.happiness + (changes.happiness || 0)));
    updated.skills = Math.min(100, Math.max(0, updated.skills + (changes.skills || 0)));
    updated.wealth += changes.wealth || 0;
    updated.age += 1; // Each event ages the character

    if (updated.health <= 0) {
      updated.isAlive = false;
      updated.deathCause = (changes as any).deathCause || 'Health reached zero';
    }
    await saveCharacter(updated);
    return updated;
  };

  const addEventToHistory = async (event: GameEvent) => {
    if (!character) return;
    await saveCharacter({ ...character, history: [...character.history, event] });
  };

  const endCurrentCharacter = async () => {
    if (character) {
      const deadChar = { ...character, isAlive: false };
      await saveCharacter(deadChar);
      setCharacter(null);
    }
  };

  const value: CharacterContextValue = { character, loading, createCharacter, updateAttributes, endCurrentCharacter, addEventToHistory };

  return <CharacterContext.Provider value={value}>{children}</CharacterContext.Provider>;
};

export const useCharacter = (): CharacterContextValue => {
  const context = useContext(CharacterContext);
  if (!context) throw new Error('useCharacter must be used within CharacterProvider');
  return context;
};
