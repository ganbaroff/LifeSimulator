// 📊 Analytics Service - Data Collection & Analysis
// Создано: Data Analyst (Agile Team)
// Версия: 1.0.0

import { 
  AnalyticsEvent, 
  UserProperties, 
  GameMetrics,
  AnalyticsEvents,
  AnalyticsProperties,
  AnalyticsFunnels,
  AnalyticsKPIs,
  ABTestConfig,
  DashboardConfig
} from './analyticsConfig';

// 📱 Analytics Service Class
export class AnalyticsService {
  private static instance: AnalyticsService;
  private sessionId: string;
  private userId: string | null = null;
  private events: AnalyticsEvent[] = [];
  private userProperties: UserProperties | null = null;
  private gameMetrics: GameMetrics | null = null;
  private startTime: number;
  private lastEventTime: number;

  private constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.lastEventTime = Date.now();
  }

  static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  // 🔧 Utility Methods
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateUserId(): string {
    return `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private getCurrentTimestamp(): number {
    return Date.now();
  }

  private isValidEvent(event: AnalyticsEvent): boolean {
    return !!event.event && typeof event.event === 'string';
  }

  // 👤 User Management
  setUserId(userId: string): void {
    this.userId = userId;
    this.trackEvent(AnalyticsEvents.USER_SESSION_START, {
      [AnalyticsProperties.USER_ID]: userId,
      [AnalyticsProperties.SESSION_ID]: this.sessionId,
    });
  }

  setUserProperties(properties: Partial<UserProperties>): void {
    if (!this.userId && properties.userId) {
      this.userId = properties.userId;
    }
    this.userProperties = { 
      userId: this.userId || 'anonymous',
      ...this.userProperties, 
      ...properties 
    };
  }

  // 📊 Event Tracking
  trackEvent(eventName: string, properties?: Record<string, any>): void {
    const event: AnalyticsEvent = {
      event: eventName,
      properties: {
        ...properties,
        [AnalyticsProperties.SESSION_ID]: this.sessionId,
        [AnalyticsProperties.TIMESTAMP]: this.getCurrentTimestamp(),
      },
      timestamp: this.getCurrentTimestamp(),
      userId: this.userId || undefined,
      sessionId: this.sessionId,
    };

    if (!this.isValidEvent(event)) {
      console.warn('Invalid event format:', event);
      return;
    }

    this.events.push(event);
    this.lastEventTime = Date.now();

    // Send to analytics service
    this.sendEvent(event);
  }

  private async sendEvent(event: AnalyticsEvent): Promise<void> {
    try {
      // In production, send to actual analytics service
      if (__DEV__) {
        console.log('📊 Analytics Event:', event);
      } else {
        // Send to analytics backend
        await fetch('https://api.lifesimulator.az/analytics/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.getApiKey()}`,
          },
          body: JSON.stringify(event),
        });
      }
    } catch (error) {
      console.error('Failed to send analytics event:', error);
      // Store events for retry
      this.storeEventForRetry(event);
    }
  }

  private getApiKey(): string {
    // In production, get from secure storage
    return 'analytics_api_key_placeholder';
  }

  private storeEventForRetry(event: AnalyticsEvent): void {
    // Store events locally for retry when connection is restored
    try {
      const retryEvents = JSON.parse(localStorage.getItem('analytics_retry_events') || '[]');
      retryEvents.push(event);
      localStorage.setItem('analytics_retry_events', JSON.stringify(retryEvents));
    } catch (error) {
      console.error('Failed to store event for retry:', error);
    }
  }

  // 🎮 Game-Specific Tracking
  trackCharacterCreation(properties: {
    difficulty: string;
    birthCity: string;
    birthYear: number;
    completionTime: number;
  }): void {
    this.trackEvent(AnalyticsEvents.CHARACTER_CREATION_COMPLETED, {
      [AnalyticsProperties.DIFFICULTY]: properties.difficulty,
      [AnalyticsProperties.BIRTH_CITY]: properties.birthCity,
      [AnalyticsProperties.BIRTH_YEAR]: properties.birthYear,
      completion_time: properties.completionTime,
    });

    this.setUserProperties({
      difficulty: properties.difficulty,
      birthCity: properties.birthCity,
      birthYear: properties.birthYear,
    });
  }

  trackGameStart(characterId: string): void {
    this.trackEvent(AnalyticsEvents.GAME_STARTED, {
      [AnalyticsProperties.CHARACTER_ID]: characterId,
    });

    this.initializeGameMetrics(characterId);
  }

  trackChoicePresented(eventId: string, eventTitle: string, choices: any[]): void {
    this.trackEvent(AnalyticsEvents.CHOICE_PRESENTED, {
      [AnalyticsProperties.EVENT_ID]: eventId,
      [AnalyticsProperties.EVENT_TITLE]: eventTitle,
      choices_count: choices.length,
    });
  }

  trackChoiceSelected(choiceId: string, choiceText: string, effects: any, timeSpent: number): void {
    this.trackEvent(AnalyticsEvents.CHOICE_SELECTED, {
      [AnalyticsProperties.CHOICE_ID]: choiceId,
      [AnalyticsProperties.CHOICE_TEXT]: choiceText,
      [AnalyticsProperties.CHOICE_EFFECTS]: effects,
      [AnalyticsProperties.CHOICE_TIME_SPENT]: timeSpent,
    });

    this.updateGameMetrics({
      eventType: 'choice_made',
      timestamp: this.getCurrentTimestamp(),
      properties: { choiceId, choiceText, effects, timeSpent },
    });
  }

  trackCharacterDeath(characterId: string, age: number, cause: string): void {
    this.trackEvent(AnalyticsEvents.CHARACTER_DEATH, {
      [AnalyticsProperties.CHARACTER_ID]: characterId,
      [AnalyticsProperties.CURRENT_AGE]: age,
      death_cause: cause,
    });

    this.finalizeGameMetrics(characterId);
  }

  // 📈 Performance Tracking
  trackPerformance(metric: string, value: number, unit?: string): void {
    this.trackEvent('performance_metric', {
      metric_name: metric,
      metric_value: value,
      metric_unit: unit,
    });
  }

  trackError(error: Error, context?: string): void {
    this.trackEvent(AnalyticsEvents.ERROR_OCCURRED, {
      [AnalyticsProperties.ERROR_TYPE]: error.name,
      [AnalyticsProperties.ERROR_MESSAGE]: error.message,
      error_context: context,
      error_stack: error.stack,
    });
  }

  trackCrash(error: Error, context?: string): void {
    this.trackEvent(AnalyticsEvents.CRASH_OCCURRED, {
      [AnalyticsProperties.ERROR_TYPE]: error.name,
      [AnalyticsProperties.ERROR_MESSAGE]: error.message,
      error_context: context,
      error_stack: error.stack,
    });
  }

  // 🧪 A/B Testing
  getABTestVariant(testName: string): string {
    if (!this.userId) {
      return 'control';
    }

    return ABTestConfig.assignVariant(testName, this.userId);
  }

  trackABTestExposure(testName: string, variant: string): void {
    this.trackEvent('ab_test_exposure', {
      test_name: testName,
      test_variant: variant,
    });
  }

  trackABTestConversion(testName: string, variant: string, conversionValue?: number): void {
    this.trackEvent('ab_test_conversion', {
      test_name: testName,
      test_variant: variant,
      conversion_value: conversionValue,
    });
  }

  // 📊 Game Metrics Management
  private initializeGameMetrics(characterId: string): void {
    this.gameMetrics = {
      characterId,
      sessionId: this.sessionId,
      events: [],
      performance: {
        averageResponseTime: 0,
        crashCount: 0,
        errorCount: 0,
        loadingTime: 0,
      },
      engagement: {
        sessionDuration: 0,
        eventsPerSession: 0,
        choicesPerEvent: 0,
        retentionRate: 0,
      },
    };
  }

  private updateGameMetrics(event: any): void {
    if (!this.gameMetrics) return;

    this.gameMetrics.events.push(event);
    
    // Update engagement metrics
    this.gameMetrics.engagement.sessionDuration = Date.now() - this.startTime;
    this.gameMetrics.engagement.eventsPerSession = this.gameMetrics.events.length;
    
    const choiceEvents = this.gameMetrics.events.filter(e => e.eventType === 'choice_made');
    const totalEvents = this.gameMetrics.events.filter(e => e.eventType === 'choice_presented');
    this.gameMetrics.engagement.choicesPerEvent = totalEvents.length > 0 ? choiceEvents.length / totalEvents.length : 0;
  }

  private finalizeGameMetrics(characterId: string): void {
    if (!this.gameMetrics) return;

    this.gameMetrics.engagement.sessionDuration = Date.now() - this.startTime;
    
    // Send final metrics
    this.trackEvent('game_metrics_finalized', {
      character_id: characterId,
      session_duration: this.gameMetrics.engagement.sessionDuration,
      events_count: this.gameMetrics.events.length,
      choices_per_event: this.gameMetrics.engagement.choicesPerEvent,
    });

    // Reset for next game
    this.gameMetrics = null;
  }

  // 📈 KPI Calculation
  calculateKPI(kpiName: string): number | null {
    switch (kpiName) {
      case AnalyticsKPIs.SESSION_DURATION:
        return this.gameMetrics?.engagement.sessionDuration || 0;
      
      case AnalyticsKPIs.EVENTS_COUNT:
        return this.gameMetrics?.events.length || 0;
      
      case AnalyticsKPIs.CHOICES_PER_EVENT:
        return this.gameMetrics?.engagement.choicesPerEvent || 0;
      
      default:
        return null;
    }
  }

  // 📊 Funnel Analysis
  analyzeFunnel(funnelName: keyof typeof AnalyticsFunnels): any {
    const funnel = AnalyticsFunnels[funnelName];
    const funnelEvents = this.events.filter(event => 
      funnel.steps.includes(event.event as any)
    );

    const analysis = {
      name: funnel.name,
      totalUsers: new Set(this.events.map(e => e.userId)).size,
      steps: funnel.steps.map(step => ({
        event: step,
        count: funnelEvents.filter(e => e.event === step).length,
        conversionRate: 0, // Calculate based on previous step
      })),
    };

    // Calculate conversion rates
    for (let i = 0; i < analysis.steps.length; i++) {
      const currentStep = analysis.steps[i];
      const previousStep = i > 0 ? analysis.steps[i - 1] : null;
      
      if (previousStep && previousStep.count > 0) {
        currentStep.conversionRate = currentStep.count / previousStep.count;
      } else if (i === 0) {
        currentStep.conversionRate = currentStep.count / analysis.totalUsers;
      }
    }

    return analysis;
  }

  // 🔄 Session Management
  endSession(): void {
    const sessionDuration = Date.now() - this.startTime;
    
    this.trackEvent(AnalyticsEvents.USER_SESSION_END, {
      [AnalyticsProperties.SESSION_DURATION]: sessionDuration,
      events_count: this.events.length,
    });

    // Flush remaining events
    this.flushEvents();
  }

  private async flushEvents(): Promise<void> {
    if (this.events.length === 0) return;

    try {
      await fetch('https://api.lifesimulator.az/analytics/batch', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getApiKey()}`,
        },
        body: JSON.stringify({
          events: this.events,
          sessionId: this.sessionId,
          userId: this.userId,
        }),
      });

      this.events = [];
    } catch (error) {
      console.error('Failed to flush events:', error);
    }
  }

  // 📊 Data Export
  exportData(): {
    events: AnalyticsEvent[];
    userProperties: UserProperties | null;
    gameMetrics: GameMetrics | null;
    sessionInfo: {
      sessionId: string;
      userId: string | null;
      startTime: number;
      endTime: number;
      duration: number;
    };
  } {
    return {
      events: [...this.events],
      userProperties: this.userProperties,
      gameMetrics: this.gameMetrics,
      sessionInfo: {
        sessionId: this.sessionId,
        userId: this.userId,
        startTime: this.startTime,
        endTime: Date.now(),
        duration: Date.now() - this.startTime,
      },
    };
  }

  // 🧹 Cleanup
  cleanup(): void {
    this.endSession();
    this.events = [];
    this.userProperties = null;
    this.gameMetrics = null;
  }
}

// 🎯 Analytics Hook for React Components
export const useAnalytics = () => {
  const analytics = AnalyticsService.getInstance();

  return {
    trackEvent: analytics.trackEvent.bind(analytics),
    trackCharacterCreation: analytics.trackCharacterCreation.bind(analytics),
    trackGameStart: analytics.trackGameStart.bind(analytics),
    trackChoicePresented: analytics.trackChoicePresented.bind(analytics),
    trackChoiceSelected: analytics.trackChoiceSelected.bind(analytics),
    trackCharacterDeath: analytics.trackCharacterDeath.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackCrash: analytics.trackCrash.bind(analytics),
    getABTestVariant: analytics.getABTestVariant.bind(analytics),
    trackABTestExposure: analytics.trackABTestExposure.bind(analytics),
    trackABTestConversion: analytics.trackABTestConversion.bind(analytics),
    setUserId: analytics.setUserId.bind(analytics),
    setUserProperties: analytics.setUserProperties.bind(analytics),
    calculateKPI: analytics.calculateKPI.bind(analytics),
    analyzeFunnel: analytics.analyzeFunnel.bind(analytics),
    endSession: analytics.endSession.bind(analytics),
    exportData: analytics.exportData.bind(analytics),
  };
};

export default AnalyticsService;
