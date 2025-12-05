// 📊 Analytics Middleware - Redux Integration
// Создано: Analytics Engineer (Agile Team)
// Версия: 3.0.0

import { Middleware, AnyAction } from '@reduxjs/toolkit';
import { AnalyticsService } from '../../analytics/analyticsService';
import { RootState } from '../unified';

// Actions that should be tracked
const TRACKED_ACTIONS = {
  // Character actions
  'character/createCharacter/fulfilled': {
    event: 'character_created',
    properties: ['name', 'age', 'birthYear', 'birthCity', 'gender'],
  },
  'character/updateCharacterStats': {
    event: 'character_stats_updated',
    properties: ['health', 'happiness', 'wealth', 'energy'],
  },
  'character/addCharacterEvent': {
    event: 'character_event_added',
    properties: ['type', 'title', 'year', 'age'],
  },
  'character/killCharacter': {
    event: 'character_died',
    properties: ['deathCause'],
  },

  // Game actions
  'game/startNewGame/fulfilled': {
    event: 'game_started',
    properties: ['difficulty'],
  },
  'game/stopGame': {
    event: 'game_stopped',
    properties: [],
  },
  'game/updateGameTime': {
    event: 'game_time_updated',
    properties: ['currentYear', 'currentAge'],
  },
  'game/incrementChoicesMade': {
    event: 'choice_made',
    properties: [],
  },

  // UI actions
  'ui/setTheme': {
    event: 'theme_changed',
    properties: ['theme'],
  },
  'ui/setLanguage': {
    event: 'language_changed',
    properties: ['language'],
  },
  'ui/toggleSound': {
    event: 'sound_toggled',
    properties: ['soundEnabled'],
  },
};

// Performance tracking
const PERFORMANCE_ACTIONS = [
  'character/createCharacter/pending',
  'character/createCharacter/fulfilled',
  'character/createCharacter/rejected',
  'game/startNewGame/pending',
  'game/startNewGame/fulfilled',
  'game/startNewGame/rejected',
];

// Error tracking
const ERROR_ACTIONS = [
  'character/createCharacter/rejected',
  'game/startNewGame/rejected',
  'game/saveGame/rejected',
  'game/loadGame/rejected',
];

export interface AnalyticsMiddlewareOptions {
  enablePerformanceTracking?: boolean;
  enableErrorTracking?: boolean;
  enableUserProperties?: boolean;
  sampleRate?: number; // 0-1, percentage of users to track
}

export const createAnalyticsMiddleware = (
  options: AnalyticsMiddlewareOptions = {}
): Middleware<{}, RootState> => {
  const {
    enablePerformanceTracking = true,
    enableErrorTracking = true,
    enableUserProperties = true,
    sampleRate = 1.0,
  } = options;

  const analytics = AnalyticsService.getInstance();

  // Check if user should be sampled
  const shouldTrack = () => {
    if (sampleRate >= 1.0) return true;
    if (sampleRate <= 0) return false;
    return Math.random() < sampleRate;
  };

  return (store) => (next) => (action: AnyAction) => {
    const prevState = store.getState();
    const startTime = performance.now();

    // Don't track if not sampled
    if (!shouldTrack()) {
      return next(action);
    }

    // Track performance
    if (enablePerformanceTracking && PERFORMANCE_ACTIONS.includes(action.type)) {
      const startPerformance = performance.now();
      const result = next(action);
      const endPerformance = performance.now();
      const duration = endPerformance - startPerformance;

      analytics.trackPerformance(`action_${action.type}`, duration, 'ms');
    }

    // Track errors
    if (enableErrorTracking && ERROR_ACTIONS.includes(action.type)) {
      analytics.trackError(
        new Error(action.error?.message || 'Unknown error'),
        `action_${action.type}`
      );
    }

    // Execute the action
    const result = next(action);

    // Get new state
    const nextState = store.getState();

    // Track specific actions
    const trackedAction = TRACKED_ACTIONS[action.type as keyof typeof TRACKED_ACTIONS];
    if (trackedAction) {
      const properties: Record<string, any> = {};

      // Extract properties from action payload
      if (action.payload) {
        trackedAction.properties.forEach(prop => {
          if (action.payload[prop] !== undefined) {
            properties[prop] = action.payload[prop];
          }
        });
      }

      // Extract properties from state changes
      if (trackedAction.event === 'character_stats_updated') {
        const prevStats = prevState.character.character?.stats;
        const newStats = nextState.character.character?.stats;
        
        if (prevStats && newStats) {
          Object.keys(newStats).forEach(stat => {
            if (prevStats[stat as keyof typeof prevStats] !== newStats[stat as keyof typeof newStats]) {
              properties[stat] = newStats[stat as keyof typeof newStats];
              properties[`${stat}_change`] = 
                newStats[stat as keyof typeof newStats] - 
                prevStats[stat as keyof typeof prevStats];
            }
          });
        }
      }

      if (trackedAction.event === 'game_time_updated') {
        const prevGame = prevState.game.currentGame;
        const newGame = nextState.game.currentGame;
        
        if (prevGame && newGame) {
          properties.year_progression = newGame.currentYear - prevGame.currentYear;
          properties.age_progression = newGame.currentAge - prevGame.currentAge;
        }
      }

      analytics.trackEvent(trackedAction.event, properties);
    }

    // Update user properties based on state changes
    if (enableUserProperties) {
      const userProperties: Record<string, any> = {};

      // Character properties
      if (nextState.character.character) {
        const character = nextState.character.character;
        userProperties.character_name = character.info.name;
        userProperties.character_age = character.info.age;
        userProperties.character_birth_year = character.info.birthYear;
        userProperties.character_birth_city = character.info.birthCity;
        userProperties.character_gender = character.info.gender;
        userProperties.character_is_alive = character.isAlive;
      }

      // Game properties
      if (nextState.game.currentGame) {
        const game = nextState.game.currentGame;
        userProperties.game_difficulty = game.difficulty;
        userProperties.game_current_year = game.currentYear;
        userProperties.game_current_age = game.currentAge;
        userProperties.game_is_playing = game.isPlaying;
        userProperties.game_is_paused = game.isPaused;
        userProperties.total_choices = game.statistics.choicesMade;
        userProperties.total_play_time = game.statistics.totalPlayTime;
      }

      // UI properties - check if UI slice exists
      if (nextState.ui) {
        userProperties.ui_theme = (nextState.ui as any).theme || 'default';
        userProperties.ui_language = (nextState.ui as any).language || 'en';
        userProperties.sound_enabled = (nextState.ui as any).soundEnabled || false;
      }

      // Update user properties if they changed
      if (Object.keys(userProperties).length > 0) {
        analytics.setUserProperties(userProperties);
      }
    }

    // Track session duration periodically
    if (action.type === 'game/startNewGame/fulfilled') {
      // Start tracking session
      analytics.trackGameStart(action.payload.id || 'unknown');
    }

    if (action.type === 'character/killCharacter') {
      // End game session
      const character = nextState.character.character;
      if (character) {
        analytics.trackCharacterDeath(
          character.info.id,
          character.info.age,
          character.deathCause || 'Unknown'
        );
      }
    }

    return result;
  };
};

// Pre-configured middleware instances
export const analyticsMiddleware = createAnalyticsMiddleware({
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enableUserProperties: true,
  sampleRate: 1.0, // Track all users in development
});

export const productionAnalyticsMiddleware = createAnalyticsMiddleware({
  enablePerformanceTracking: true,
  enableErrorTracking: true,
  enableUserProperties: true,
  sampleRate: 0.1, // Track 10% of users in production
});

export default analyticsMiddleware;
