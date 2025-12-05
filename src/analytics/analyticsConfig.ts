// 📊 Analytics Configuration - Life Simulator Azerbaijan
// Создано: Data Analyst (Agile Team)
// Версия: 1.0.0

export interface AnalyticsEvent {
  event: string;
  properties?: Record<string, any>;
  timestamp?: number;
  userId?: string;
  sessionId?: string;
}

export interface UserProperties {
  userId: string;
  characterId?: string;
  difficulty?: string;
  birthCity?: string;
  birthYear?: number;
  deviceType?: string;
  appVersion?: string;
  sessionCount?: number;
  totalPlayTime?: number;
  lastSessionDate?: string;
}

export interface GameMetrics {
  characterId: string;
  sessionId: string;
  events: {
    eventType: 'character_created' | 'choice_made' | 'character_died' | 'game_completed' | 'choice_presented';
    timestamp: number;
    properties: Record<string, any>;
  }[];
  performance: {
    averageResponseTime: number;
    crashCount: number;
    errorCount: number;
    loadingTime: number;
  };
  engagement: {
    sessionDuration: number;
    eventsPerSession: number;
    choicesPerEvent: number;
    retentionRate: number;
  };
}

// 📈 Analytics Events Configuration
export const AnalyticsEvents = {
  // User Journey Events
  USER_SESSION_START: 'user_session_start',
  USER_SESSION_END: 'user_session_end',
  USER_SIGN_UP: 'user_sign_up',
  USER_LOGIN: 'user_login',
  
  // Character Events
  CHARACTER_CREATION_STARTED: 'character_creation_started',
  CHARACTER_CREATION_COMPLETED: 'character_creation_completed',
  CHARACTER_CREATION_ABANDONED: 'character_creation_abandoned',
  CHARACTER_DEATH: 'character_death',
  CHARACTER_LEVEL_UP: 'character_level_up',
  
  // Game Events
  GAME_STARTED: 'game_started',
  GAME_PAUSED: 'game_paused',
  GAME_RESUMED: 'game_resumed',
  GAME_COMPLETED: 'game_completed',
  GAME_ABANDONED: 'game_abandoned',
  
  // Choice Events
  CHOICE_PRESENTED: 'choice_presented',
  CHOICE_SELECTED: 'choice_selected',
  CHOICE_TIME_SPENT: 'choice_time_spent',
  
  // Performance Events
  PERFORMANCE_SLOW: 'performance_slow',
  PERFORMANCE_FAST: 'performance_fast',
  ERROR_OCCURRED: 'error_occurred',
  CRASH_OCCURRED: 'crash_occurred',
  
  // Feature Events
  FEATURE_USED: 'feature_used',
  FEATURE_DISCOVERED: 'feature_discovered',
  FEATURE_ABANDONED: 'feature_abandoned',
  
  // Monetization Events
  AD_VIEWED: 'ad_viewed',
  AD_CLICKED: 'ad_clicked',
  PURCHASE_ATTEMPTED: 'purchase_attempted',
  PURCHASE_COMPLETED: 'purchase_completed',
  PURCHASE_FAILED: 'purchase_failed',
  
  // Social Events
  SHARE_CLICKED: 'share_clicked',
  SHARE_COMPLETED: 'share_completed',
  INVITE_SENT: 'invite_sent',
  INVITE_ACCEPTED: 'invite_accepted',
};

// 📊 Analytics Properties
export const AnalyticsProperties = {
  // User Properties
  USER_ID: 'user_id',
  CHARACTER_ID: 'character_id',
  SESSION_ID: 'session_id',
  DEVICE_TYPE: 'device_type',
  APP_VERSION: 'app_version',
  OS_VERSION: 'os_version',
  
  // Game Properties
  DIFFICULTY: 'difficulty',
  BIRTH_CITY: 'birth_city',
  BIRTH_YEAR: 'birth_year',
  CURRENT_AGE: 'current_age',
  CURRENT_YEAR: 'current_year',
  
  // Character Stats
  HEALTH: 'health',
  HAPPINESS: 'happiness',
  ENERGY: 'energy',
  WEALTH: 'wealth',
  
  // Event Properties
  EVENT_ID: 'event_id',
  EVENT_TITLE: 'event_title',
  EVENT_TYPE: 'event_type',
  CHOICE_ID: 'choice_id',
  CHOICE_TEXT: 'choice_text',
  CHOICE_EFFECTS: 'choice_effects',
  CHOICE_TIME_SPENT: 'choice_time_spent',
  TIMESTAMP: 'timestamp',
  
  // Performance Properties
  RESPONSE_TIME: 'response_time',
  LOADING_TIME: 'loading_time',
  ERROR_TYPE: 'error_type',
  ERROR_MESSAGE: 'error_message',
  
  // Engagement Properties
  SESSION_DURATION: 'session_duration',
  EVENTS_COUNT: 'events_count',
  CHOICES_COUNT: 'choices_count',
  RETENTION_DAYS: 'retention_days',
  
  // Monetization Properties
  AD_TYPE: 'ad_type',
  AD_NETWORK: 'ad_network',
  PURCHASE_TYPE: 'purchase_type',
  PURCHASE_AMOUNT: 'purchase_amount',
  CURRENCY: 'currency',
};

// 🎯 Funnel Configuration
export const AnalyticsFunnels = {
  CHARACTER_CREATION: {
    name: 'Character Creation Funnel',
    steps: [
      AnalyticsEvents.CHARACTER_CREATION_STARTED,
      AnalyticsEvents.CHARACTER_CREATION_COMPLETED,
    ],
    properties: [AnalyticsProperties.DIFFICULTY, AnalyticsProperties.BIRTH_CITY],
  },
  
  GAME_SESSION: {
    name: 'Game Session Funnel',
    steps: [
      AnalyticsEvents.GAME_STARTED,
      AnalyticsEvents.CHOICE_PRESENTED,
      AnalyticsEvents.CHOICE_SELECTED,
    ],
    properties: [AnalyticsProperties.SESSION_DURATION, AnalyticsProperties.EVENTS_COUNT],
  },
  
  RETENTION: {
    name: 'Retention Funnel',
    steps: [
      AnalyticsEvents.USER_SESSION_START,
      AnalyticsEvents.GAME_STARTED,
      AnalyticsEvents.CHARACTER_DEATH,
      AnalyticsEvents.USER_SESSION_END,
    ],
    properties: [AnalyticsProperties.RETENTION_DAYS, AnalyticsProperties.SESSION_DURATION],
  },
  
  MONETIZATION: {
    name: 'Monetization Funnel',
    steps: [
      AnalyticsEvents.AD_VIEWED,
      AnalyticsEvents.AD_CLICKED,
      AnalyticsEvents.PURCHASE_ATTEMPTED,
      AnalyticsEvents.PURCHASE_COMPLETED,
    ],
    properties: [AnalyticsProperties.AD_TYPE, AnalyticsProperties.PURCHASE_AMOUNT],
  },
};

// 📈 KPI Configuration
export const AnalyticsKPIs = {
  // Engagement KPIs
  DAILY_ACTIVE_USERS: 'daily_active_users',
  MONTHLY_ACTIVE_USERS: 'monthly_active_users',
  SESSION_DURATION: 'session_duration',
  RETENTION_RATE: 'retention_rate',
  STICKINESS: 'stickiness',
  EVENTS_COUNT: 'events_count',
  CHOICES_PER_EVENT: 'choices_per_event',
  
  // Game KPIs
  CHARACTER_COMPLETION_RATE: 'character_completion_rate',
  AVERAGE_CHARACTER_LIFESPAN: 'average_character_lifespan',
  CHOICE_ENGAGEMENT_RATE: 'choice_engagement_rate',
  EVENT_COMPLETION_RATE: 'event_completion_rate',
  
  // Performance KPIs
  APP_CRASH_RATE: 'app_crash_rate',
  ERROR_RATE: 'error_rate',
  LOAD_TIME: 'load_time',
  RESPONSE_TIME: 'response_time',
  
  // Monetization KPIs
  AD_REVENUE_PER_USER: 'ad_revenue_per_user',
  PURCHASE_CONVERSION_RATE: 'purchase_conversion_rate',
  AVERAGE_REVENUE_PER_USER: 'average_revenue_per_user',
  LIFETIME_VALUE: 'lifetime_value',
  
  // Virality KPIs
  SHARE_RATE: 'share_rate',
  INVITE_CONVERSION_RATE: 'invite_conversion_rate',
  VIRAL_COEFFICIENT: 'viral_coefficient',
};

// 🔍 A/B Testing Configuration
export const ABTestConfig = {
  // Test configurations
  tests: {
    CHARACTER_CREATION_FLOW: {
      name: 'Character Creation Flow',
      variants: {
        control: { weight: 50, description: 'Current flow' },
        variant_a: { weight: 25, description: 'Simplified flow' },
        variant_b: { weight: 25, description: 'Enhanced flow' },
      },
      targetMetric: AnalyticsKPIs.CHARACTER_COMPLETION_RATE,
      sampleSize: 1000,
      duration: 14, // days
    },
    
    CHOICE_INTERFACE: {
      name: 'Choice Interface',
      variants: {
        control: { weight: 50, description: 'Current buttons' },
        variant_a: { weight: 50, description: 'Card-based choices' },
      },
      targetMetric: AnalyticsKPIs.CHOICE_ENGAGEMENT_RATE,
      sampleSize: 500,
      duration: 7,
    },
    
    ONBOARDING: {
      name: 'Onboarding Experience',
      variants: {
        control: { weight: 33, description: 'No tutorial' },
        variant_a: { weight: 33, description: 'Interactive tutorial' },
        variant_b: { weight: 34, description: 'Video tutorial' },
      },
      targetMetric: AnalyticsKPIs.RETENTION_RATE,
      sampleSize: 2000,
      duration: 30,
    },
  },
  
  // Assignment logic
  assignVariant: (testName: string, userId: string): string => {
    const test = ABTestConfig.tests[testName as keyof typeof ABTestConfig.tests];
    if (!test) return 'control';
    
    // Hash user ID for consistent assignment
    const hash = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const weightSum = Object.values(test.variants).reduce((sum, variant) => sum + variant.weight, 0);
    const userWeight = hash % weightSum;
    
    let currentWeight = 0;
    for (const [variantName, variant] of Object.entries(test.variants)) {
      currentWeight += variant.weight;
      if (userWeight < currentWeight) {
        return variantName;
      }
    }
    
    return 'control';
  },
};

// 📊 Dashboard Configuration
export const DashboardConfig = {
  // Main dashboard widgets
  widgets: [
    {
      id: 'overview',
      title: 'Overview',
      type: 'metric_grid',
      metrics: [
        AnalyticsKPIs.DAILY_ACTIVE_USERS,
        AnalyticsKPIs.SESSION_DURATION,
        AnalyticsKPIs.RETENTION_RATE,
        AnalyticsKPIs.CHARACTER_COMPLETION_RATE,
      ],
      refreshInterval: 300, // 5 minutes
    },
    
    {
      id: 'funnel',
      title: 'Conversion Funnels',
      type: 'funnel_chart',
      funnels: [
        AnalyticsFunnels.CHARACTER_CREATION,
        AnalyticsFunnels.GAME_SESSION,
        AnalyticsFunnels.RETENTION,
      ],
      refreshInterval: 600, // 10 minutes
    },
    
    {
      id: 'performance',
      title: 'Performance Metrics',
      type: 'time_series',
      metrics: [
        AnalyticsKPIs.APP_CRASH_RATE,
        AnalyticsKPIs.ERROR_RATE,
        AnalyticsKPIs.LOAD_TIME,
        AnalyticsKPIs.RESPONSE_TIME,
      ],
      refreshInterval: 60, // 1 minute
    },
    
    {
      id: 'ab_tests',
      title: 'A/B Test Results',
      type: 'ab_test_results',
      tests: Object.keys(ABTestConfig.tests),
      refreshInterval: 3600, // 1 hour
    },
  ],
  
  // Alert configuration
  alerts: [
    {
      id: 'high_crash_rate',
      name: 'High Crash Rate',
      condition: 'crash_rate > 0.05',
      threshold: 0.05,
      severity: 'critical',
      notification: ['email', 'slack'],
    },
    
    {
      id: 'low_retention',
      name: 'Low Retention Rate',
      condition: 'retention_rate < 0.3',
      threshold: 0.3,
      severity: 'warning',
      notification: ['email'],
    },
    
    {
      id: 'slow_performance',
      name: 'Slow Performance',
      condition: 'response_time > 2000',
      threshold: 2000,
      severity: 'warning',
      notification: ['slack'],
    },
  ],
};

export default {
  AnalyticsEvents,
  AnalyticsProperties,
  AnalyticsFunnels,
  AnalyticsKPIs,
  ABTestConfig,
  DashboardConfig,
};
