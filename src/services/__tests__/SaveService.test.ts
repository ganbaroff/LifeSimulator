import AsyncStorage from '@react-native-async-storage/async-storage';
import saveService from '../SaveService';
import errorTrackingService from '../ErrorTrackingService';
import { Character, GameState } from '../../types';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Mock ErrorTrackingService
jest.mock('../ErrorTrackingService', () => ({
  captureError: jest.fn(),
}));

describe('SaveService', () => {
  const mockCharacter: Character = {
    name: 'Test Character',
    age: 20,
    health: 100,
    happiness: 100,
    wealth: 1000,
    skills: 50,
    country: 'USA',
    birthYear: 2000,
    profession: null,
    isAlive: true,
    deathCause: null,
    avatarUrl: null,
    history: [],
    lifeGoal: 'hedonist',
    assets: [],
    relationships: [],
    flags: [],
  };

  const mockGameState: GameState = {
    currentLevel: 'level_1',
    crystals: 50,
    unlockedLevels: ['demo', 'level_1'],
    achievements: [],
    dailyRewardLastClaimed: null,
    gameStartTime: Date.now(),
    totalPlayTime: 0,
    settings: {
      soundEnabled: true,
      musicEnabled: true,
      aiEnabled: true,
      language: 'en',
      theme: 'system',
    },
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    await AsyncStorage.clear();
  });

  it('should save game successfully', async () => {
    const result = await saveService.save(0, mockCharacter, mockGameState);
    
    expect(result).toBe(true);
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('lifesim_save_0'),
      expect.stringContaining('"version":1')
    );
  });

  it('should load game successfully', async () => {
    const savedData = {
      version: 1,
      character: mockCharacter,
      gameState: mockGameState,
      timestamp: Date.now(),
    };
    
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(savedData));
    
    const result = await saveService.load(0);
    
    expect(result).not.toBeNull();
    expect(result?.character.name).toBe(mockCharacter.name);
    expect(result?.gameState.crystals).toBe(mockGameState.crystals);
  });

  it('should return null if save does not exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    
    const result = await saveService.load(0);
    
    expect(result).toBeNull();
  });

  it('should handle partial character save', async () => {
    // First, setup existing save
    const existingSave = {
      version: 1,
      character: mockCharacter,
      gameState: mockGameState,
      timestamp: Date.now(),
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingSave));

    const updatedCharacter = { ...mockCharacter, age: 21 };
    const result = await saveService.saveCharacter(0, updatedCharacter);

    expect(result).toBe(true);
    // Verify that save was called with updated character and old game state
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('lifesim_save_0'),
      expect.stringContaining('"age":21')
    );
  });

  it('should handle partial game state save', async () => {
    // First, setup existing save
    const existingSave = {
      version: 1,
      character: mockCharacter,
      gameState: mockGameState,
      timestamp: Date.now(),
    };
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify(existingSave));

    const updatedState = { ...mockGameState, crystals: 100 };
    const result = await saveService.saveGameState(0, updatedState);

    expect(result).toBe(true);
    // Verify that save was called with old character and updated game state
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      expect.stringContaining('lifesim_save_0'),
      expect.stringContaining('"crystals":100')
    );
  });
});
