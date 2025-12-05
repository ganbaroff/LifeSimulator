// 🧪 Test Setup - Jest Configuration
// Создано: QA Engineer (Agile Team)
// Версия: 1.0.0

import 'react-native-gesture-handler/jestSetup';

// Mock React Native Animated (already mocked by react-native preset)
// No additional mocking needed - jest preset handles this

// Mock Expo modules that are not installed for testing
jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {
        apiUrl: 'http://localhost:3000',
      },
    },
  },
}), { virtual: true });

jest.mock('expo-secure-store', () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}), { virtual: true });

jest.mock('expo-font', () => ({
  loadAsync: jest.fn(),
}), { virtual: true });

jest.mock('expo-asset', () => ({
  Asset: {
    fromModule: jest.fn(),
  },
}), { virtual: true });

// Mock Navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    dispatch: jest.fn(),
    setOptions: jest.fn(),
    isFocused: jest.fn(() => true),
  }),
  useRoute: () => ({
    params: {},
  }),
  useFocusEffect: jest.fn(),
}));

// Global test utilities
global.testUtils = {
  createMockCharacter: () => ({
    id: 'test-character-id',
    name: 'Test Character',
    stats: {
      health: 100,
      happiness: 100,
      energy: 100,
      wealth: 1000,
    },
    age: 25,
    birthYear: 1995,
    birthCity: 'baku',
    isAlive: true,
    history: [],
  }),
  
  createMockEvent: () => ({
    id: 'test-event-id',
    title: 'Test Event',
    description: 'This is a test event',
    choices: [
      {
        id: 'choice-1',
        text: 'Choice 1',
        effects: {
          health: 10,
          happiness: -5,
          energy: 0,
          wealth: 100,
        },
      },
    ],
  }),
  
  createMockGameState: () => ({
    current: {
      characterId: 'test-character-id',
      year: 2020,
      events: [],
      isPlaying: true,
    },
    isPlaying: true,
    history: [],
  }),
  
  waitForAsync: (ms: number = 100) => new Promise(resolve => setTimeout(resolve, ms)),
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Set up test environment
beforeEach(() => {
  jest.clearAllMocks();
});
