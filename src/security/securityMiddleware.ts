// 🛡️ Security Middleware - Life Simulator Azerbaijan
// Создано: Security Engineer (Agile Team)
// Версия: 3.0.0

import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    maxRequests: number;
    windowMs: number;
    skipSuccessfulRequests: boolean;
  };
  headers: {
    'X-Content-Type-Options': string;
    'X-Frame-Options': string;
    'X-XSS-Protection': string;
    'Strict-Transport-Security': string;
    'Content-Security-Policy': string;
    'Referrer-Policy': string;
  };
  cors: {
    enabled: boolean;
    origins: string[];
    methods: string[];
    allowedHeaders: string[];
    credentials: boolean;
  };
}

export interface RateLimitEntry {
  timestamp: number;
  count: number;
  blocked: boolean;
}

export class SecurityMiddleware {
  private static instance: SecurityMiddleware;
  private config: SecurityConfig;
  private rateLimitStore: Map<string, RateLimitEntry[]> = new Map();

  static getInstance(): SecurityMiddleware {
    if (!SecurityMiddleware.instance) {
      SecurityMiddleware.instance = new SecurityMiddleware();
      SecurityMiddleware.instance.initializeConfig();
    }
    return SecurityMiddleware.instance;
  }

  private initializeConfig() {
    this.config = {
      rateLimiting: {
        enabled: true,
        maxRequests: 100, // 100 requests per window
        windowMs: 15 * 60 * 1000, // 15 minutes
        skipSuccessfulRequests: false,
      },
      headers: {
        'X-Content-Type-Options': 'nosniff',
        'X-Frame-Options': 'DENY',
        'X-XSS-Protection': '1; mode=block',
        'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
        'Content-Security-Policy': this.generateCSP(),
        'Referrer-Policy': 'strict-origin-when-cross-origin',
      },
      cors: {
        enabled: true,
        origins: ['https://lifesimulator.az', 'https://api.lifesimulator.az'],
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
        credentials: true,
      },
    };
  }

  private generateCSP(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self' https://api.lifesimulator.az",
      "media-src 'self'",
      "object-src 'none'",
      "frame-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    return directives.join('; ');
  }

  // Rate limiting
  async checkRateLimit(identifier: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
  }> {
    if (!this.config.rateLimiting.enabled) {
      return {
        allowed: true,
        remaining: this.config.rateLimiting.maxRequests,
        resetTime: Date.now() + this.config.rateLimiting.windowMs,
      };
    }

    const now = Date.now();
    const windowMs = this.config.rateLimiting.windowMs;
    const maxRequests = this.config.rateLimiting.maxRequests;

    // Get existing entries for this identifier
    let entries = this.rateLimitStore.get(identifier) || [];
    
    // Remove old entries outside the window
    entries = entries.filter(entry => now - entry.timestamp < windowMs);

    // Count requests in current window
    const currentCount = entries.reduce((sum, entry) => sum + entry.count, 0);

    // Check if limit exceeded
    const allowed = currentCount < maxRequests;
    const remaining = Math.max(0, maxRequests - currentCount);
    const resetTime = now + windowMs;

    if (allowed) {
      // Add new entry or update existing
      if (entries.length > 0 && now - entries[entries.length - 1].timestamp < 1000) {
        // Update last entry if within same second
        entries[entries.length - 1].count++;
      } else {
        // Add new entry
        entries.push({
          timestamp: now,
          count: 1,
          blocked: false,
        });
      }

      // Store updated entries
      this.rateLimitStore.set(identifier, entries);
    } else {
      // Mark as blocked
      if (entries.length > 0) {
        entries[entries.length - 1].blocked = true;
      }
    }

    return {
      allowed,
      remaining,
      resetTime,
    };
  }

  // Security headers
  getSecurityHeaders(): Record<string, string> {
    return { ...this.config.headers };
  }

  // CORS validation
  validateCors(origin: string, method: string): boolean {
    if (!this.config.cors.enabled) {
      return false;
    }

    // Check origin
    if (this.config.cors.origins.length > 0 && !this.config.cors.origins.includes(origin)) {
      return false;
    }

    // Check method
    if (this.config.cors.methods.length > 0 && !this.config.cors.methods.includes(method)) {
      return false;
    }

    return true;
  }

  // Input sanitization middleware
  sanitizeInput(data: any): any {
    if (typeof data === 'string') {
      return this.sanitizeString(data);
    }

    if (Array.isArray(data)) {
      return data.map(item => this.sanitizeInput(item));
    }

    if (typeof data === 'object' && data !== null) {
      const sanitized: any = {};
      for (const [key, value] of Object.entries(data)) {
        sanitized[this.sanitizeKey(key)] = this.sanitizeInput(value);
      }
      return sanitized;
    }

    return data;
  }

  private sanitizeString(str: string): string {
    if (!str) return str;

    return str
      // Remove potentially dangerous characters
      .replace(/[<>]/g, '')
      // Remove JavaScript event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove script tags
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Remove CSS expressions
      .replace(/expression\s*\(/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  private sanitizeKey(key: string): string {
    // Allow only alphanumeric, underscore, and hyphen
    return key.replace(/[^a-zA-Z0-9_-]/g, '');
  }

  // Security monitoring
  async logSecurityEvent(event: {
    type: 'rate_limit_exceeded' | 'cors_violation' | 'invalid_input' | 'suspicious_activity';
    identifier: string;
    details: any;
    timestamp: number;
  }) {
    const logEntry = {
      ...event,
      platform: Platform.OS,
      userAgent: Platform.select({
        ios: 'iOS',
        android: 'Android',
        default: 'Unknown',
      }),
    };

    try {
      // Store security events for monitoring
      const existingLogs = await AsyncStorage.getItem('security_logs');
      const logs = existingLogs ? JSON.parse(existingLogs) : [];
      
      logs.push(logEntry);
      
      // Keep only last 1000 events
      if (logs.length > 1000) {
        logs.splice(0, logs.length - 1000);
      }
      
      await AsyncStorage.setItem('security_logs', JSON.stringify(logs));
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  }

  // Get security statistics
  async getSecurityStats(): Promise<{
    totalEvents: number;
    eventsByType: Record<string, number>;
    recentEvents: any[];
  }> {
    try {
      const logs = await AsyncStorage.getItem('security_logs');
      const events = logs ? JSON.parse(logs) : [];

      const eventsByType: Record<string, number> = {};
      
      events.forEach((event: any) => {
        eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
      });

      return {
        totalEvents: events.length,
        eventsByType,
        recentEvents: events.slice(-10).reverse(),
      };
    } catch (error) {
      console.error('Failed to get security stats:', error);
      return {
        totalEvents: 0,
        eventsByType: {},
        recentEvents: [],
      };
    }
  }

  // Clear security logs
  async clearSecurityLogs(): Promise<void> {
    try {
      await AsyncStorage.removeItem('security_logs');
      this.rateLimitStore.clear();
    } catch (error) {
      console.error('Failed to clear security logs:', error);
    }
  }

  // Update configuration
  updateConfig(newConfig: Partial<SecurityConfig>) {
    this.config = {
      ...this.config,
      ...newConfig,
      headers: {
        ...this.config.headers,
        ...newConfig.headers,
      },
      rateLimiting: {
        ...this.config.rateLimiting,
        ...newConfig.rateLimiting,
      },
      cors: {
        ...this.config.cors,
        ...newConfig.cors,
      },
    };
  }

  // Get current configuration
  getConfig(): SecurityConfig {
    return { ...this.config };
  }
}

export default SecurityMiddleware;
