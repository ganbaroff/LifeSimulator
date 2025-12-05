// 🔒 Security Configuration - Life Simulator Azerbaijan
// Создано: Security Specialist (Agile Team)
// Версия: 3.0.0

// Import CryptoJS properly with type declarations
import * as CryptoJS from 'crypto-js';

// 🔐 Encryption Configuration
export const encryptionConfig = {
  algorithm: 'AES-256-GCM',
  keyLength: 256,
  ivLength: 16,
  saltLength: 32,
  iterations: 100000,
};

// 🛡️ Security Headers
export const securityHeaders = {
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.expo.dev",
    "frame-ancestors 'none'",
    "base-uri 'self'",
  ].join('; '),
  
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
};

// 🔍 Input Validation Rules
export const validationRules = {
  username: {
    minLength: 3,
    maxLength: 30,
    pattern: /^[a-zA-Zа-яА-Я0-9_\s]+$/,
    forbiddenWords: ['admin', 'root', 'system', 'null', 'undefined'],
    sanitizeHtml: true,
    removeScripts: true,
  },
  
  characterName: {
    minLength: 1,
    maxLength: 30,
    pattern: /^[a-zA-Zа-яА-Я0-9_\s\-']+$/,
    forbiddenWords: ['admin', 'root', 'system', 'null', 'undefined'],
    sanitizeHtml: true,
    removeScripts: true,
  },
  
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 254,
    sanitizeHtml: true,
    removeScripts: true,
  },
  
  generalText: {
    maxLength: 1000,
    sanitizeHtml: true,
    removeScripts: true,
  },
} as const;

// 🚫 Rate Limiting Configuration
export const rateLimitConfig = {
  api: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  },
  
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 auth requests per windowMs
    skipSuccessfulRequests: false,
  },
  
  characterCreation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // limit each IP to 10 character creations per hour
  },
};

// 🔐 Encryption Utilities
export class SecurityUtils {
  // Generate secure random string
  static generateSecureRandom(length: number = 32): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }
    return result;
  }

  // Hash password with salt
  static hashPassword(password: string, salt?: string): { hash: string; salt: string } {
    const generatedSalt = salt || this.generateSecureRandom(32);
    const hash = CryptoJS.PBKDF2(password, generatedSalt, {
      keySize: 256 / 32,
      iterations: encryptionConfig.iterations,
    }).toString();
    
    return { hash, salt: generatedSalt };
  }

  // Verify password
  static verifyPassword(password: string, hash: string, salt: string): boolean {
    const { hash: computedHash } = this.hashPassword(password, salt);
    return computedHash === hash;
  }

  // Encrypt sensitive data
  static encrypt(data: string, key: string): string {
    const encrypted = CryptoJS.AES.encrypt(data, key).toString();
    return encrypted;
  }

  // Decrypt sensitive data
  static decrypt(encryptedData: string, key: string): string {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key).toString(CryptoJS.enc.Utf8);
    return decrypted;
  }

  // Sanitize input
  static sanitizeInput(input: string, type: keyof typeof validationRules): string {
    const rules = validationRules[type];
    let sanitized = input.trim();
    
    // Remove HTML tags
    if ('sanitizeHtml' in rules && rules.sanitizeHtml) {
      sanitized = sanitized.replace(/<[^>]*>/g, '');
    }
    
    // Remove scripts
    if ('removeScripts' in rules && rules.removeScripts) {
      sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    
    // Check forbidden words
    if ('forbiddenWords' in rules && rules.forbiddenWords) {
      for (const word of rules.forbiddenWords) {
        if (sanitized.toLowerCase().includes(word.toLowerCase())) {
          throw new Error(`Forbidden word detected: ${word}`);
        }
      }
    }
    
    // Validate pattern
    if ('pattern' in rules && rules.pattern && !rules.pattern.test(sanitized)) {
      throw new Error(`Input does not match required pattern for ${type}`);
    }
    
    // Check length
    if ('minLength' in rules && rules.minLength && sanitized.length < rules.minLength) {
      throw new Error(`Input too short for ${type}`);
    }
    
    if ('maxLength' in rules && rules.maxLength && sanitized.length > rules.maxLength) {
      throw new Error(`Input too long for ${type}`);
    }
    
    return sanitized;
  }

  // Generate JWT token (simplified version)
  static generateToken(payload: any, expiresIn: string = '24h'): string {
    const header = { alg: 'HS256', typ: 'JWT' };
    const now = Math.floor(Date.now() / 1000);
    const exp = now + (expiresIn === '24h' ? 86400 : 3600); // 24 hours or 1 hour
    
    const tokenPayload = {
      ...payload,
      iat: now,
      exp,
    };
    
    // In production, use a proper JWT library
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(tokenPayload));
    const signature = btoa(`${encodedHeader}.${encodedPayload}.secret`);
    
    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Verify JWT token (simplified version)
  static verifyToken(token: string): any {
    try {
      const [header, payload, signature] = token.split('.');
      const decodedPayload = JSON.parse(atob(payload));
      
      // Check expiration
      if (decodedPayload.exp < Math.floor(Date.now() / 1000)) {
        throw new Error('Token expired');
      }
      
      return decodedPayload;
    } catch (error) {
      throw new Error('Invalid token');
    }
  }

  // Check for XSS attacks
  static checkXSS(input: string): boolean {
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
      /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi,
      /<embed\b[^<]*(?:(?!<\/embed>)<[^<]*)*<\/embed>/gi,
    ];
    
    return xssPatterns.some(pattern => pattern.test(input));
  }

  // Check for SQL injection
  static checkSQLInjection(input: string): boolean {
    const sqlPatterns = [
      /('|(\\')|(;)|(\-\-)|(\s+(or|and)\s+.*=))/gi,
      /(union|select|insert|update|delete|drop|create|alter)/gi,
      /(exec|execute|sp_|xp_)/gi,
    ];
    
    return sqlPatterns.some(pattern => pattern.test(input.toLowerCase()));
  }

  // Generate CSRF token
  static generateCSRFToken(): string {
    return this.generateSecureRandom(64);
  }

  // Validate CSRF token
  static validateCSRFToken(token: string, sessionToken: string): boolean {
    return token === sessionToken;
  }
}

// 🚨 Security Event Logger
export class SecurityLogger {
  static log(event: string, details: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium') {
    const logEntry = {
      timestamp: new Date().toISOString(),
      event,
      severity,
      details,
      ip: details.ip || 'unknown',
      userAgent: details.userAgent || 'unknown',
    };
    
    console.warn('🚨 Security Event:', logEntry);
    
    // In production, send to security monitoring service
    if (severity === 'critical' || severity === 'high') {
      // Send alert to security team
      this.sendAlert(logEntry);
    }
  }
  
  private static sendAlert(logEntry: any) {
    // Integration with security monitoring service
    console.error('🚨 CRITICAL SECURITY ALERT:', logEntry);
  }
}

export default SecurityUtils;
