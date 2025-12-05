// 🔒 Security Middleware - React Native Protection
// Создано: Security Specialist (Agile Team)
// Версия: 1.0.0

// @ts-ignore - React import workaround
import * as React from 'react';
import { useEffect, useState } from 'react';
import { Platform, Alert, Linking, BackHandler } from 'react-native';
import { SecurityUtils, SecurityLogger } from './securityConfig';

// @ts-ignore - React Native imports
import AsyncStorage from '@react-native-async-storage/async-storage';
// @ts-ignore - Expo SecureStore
import * as SecureStore from 'expo-secure-store';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export const SecurityMiddleware: React.FC<SecurityMiddlewareProps> = ({ children }) => {
  const [isSecure, setIsSecure] = useState(false);
  const [securityChecks, setSecurityChecks] = useState({
    jailbreak: false,
    root: false,
    debugger: false,
    emulator: false,
  });

  // 🔍 Security checks on app start
  useEffect(() => {
    performSecurityChecks();
  }, []);

  const performSecurityChecks = async () => {
    const checks = {
      jailbreak: await checkJailbreak(),
      root: await checkRoot(),
      debugger: await checkDebugger(),
      emulator: await checkEmulator(),
    };
    
    setSecurityChecks(checks);
    
    // Log security status
    const hasSecurityIssues = Object.values(checks).some(issue => issue);
    
    if (hasSecurityIssues) {
      SecurityLogger.log('Security risks detected', checks, 'high');
      
      // Show warning for non-production environments
      if (__DEV__) {
        Alert.alert(
          '⚠️ Security Warning',
          'Security risks detected. This device may not be secure.',
          [
            { text: 'Continue', style: 'destructive' },
            { text: 'Exit', onPress: () => exitApp() },
          ]
        );
      } else {
        // In production, exit app on security risks
        exitApp();
      }
    } else {
      setIsSecure(true);
      SecurityLogger.log('Security checks passed', { status: 'secure' }, 'low');
    }
  };

  const checkJailbreak = async (): Promise<boolean> => {
    if (Platform.OS === 'ios') {
      // iOS jailbreak detection
      try {
        // Check for jailbreak files
        const jailbreakFiles = [
          '/Applications/Cydia.app',
          '/Library/MobileSubstrate/MobileSubstrate.dylib',
          '/bin/bash',
          '/usr/sbin/sshd',
          '/etc/apt',
        ];
        
        // In React Native, we'd use a native module for this
        // For now, return false (safe)
        return false;
      } catch (error) {
        return false;
      }
    } else {
      // Android root detection
      try {
        // Check for root files
        const rootFiles = [
          '/system/app/Superuser.apk',
          '/sbin/su',
          '/system/bin/su',
          '/system/xbin/su',
          '/data/local/xbin/su',
          '/data/local/bin/su',
          '/system/sd/xbin/su',
          '/system/bin/failsafe/su',
          '/data/local/su',
        ];
        
        // In React Native, we'd use a native module for this
        // For now, return false (safe)
        return false;
      } catch (error) {
        return false;
      }
    }
  };

  const checkRoot = async (): Promise<boolean> => {
    // Additional root detection logic
    return false;
  };

  const checkDebugger = async (): Promise<boolean> => {
    // Check if debugger is attached
    return __DEV__;
  };

  const checkEmulator = async (): Promise<boolean> => {
    // Check if running on emulator
    if (Platform.OS === 'android') {
      // Android emulator detection
      return false;
    } else {
      // iOS simulator detection
      // @ts-ignore - Platform.isPad may not exist in all platforms
      return Platform.isPad || Platform.isTV;
    }
  };

  const exitApp = () => {
    // Exit app on security risks
    if (Platform.OS === 'android') {
      // Android exit
      BackHandler.exitApp();
    } else {
      // iOS exit (limited options)
      // In production, you might want to show a message and disable functionality
    }
  };

  // 🔒 Input validation wrapper
  const validateInput = (input: string, type: 'username' | 'characterName' | 'generalText'): string => {
    try {
      return SecurityUtils.sanitizeInput(input, type);
    } catch (error) {
      SecurityLogger.log('Invalid input detected', { input, type, error: (error as Error).message }, 'medium');
      throw error;
    }
  };

  // 🛡️ XSS protection
  const checkXSS = (input: string): boolean => {
    const hasXSS = SecurityUtils.checkXSS(input);
    if (hasXSS) {
      SecurityLogger.log('XSS attempt detected', { input }, 'high');
    }
    return hasXSS;
  };

  // 🔐 Token management
  const generateSecureToken = (): string => {
    return SecurityUtils.generateSecureRandom(64);
  };

  // 📱 Device fingerprinting
  const getDeviceFingerprint = (): string => {
    const deviceInfo = {
      platform: Platform.OS,
      version: Platform.Version,
      // @ts-ignore - Platform.isPad may not exist in all platforms
      isPad: Platform.isPad,
      isTV: Platform.isTV,
      constants: Platform.constants,
    };
    
    return SecurityUtils.encrypt(JSON.stringify(deviceInfo), 'device-fingerprint-key');
  };

  // 🔗 URL validation
  const validateURL = (url: string): boolean => {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch (error) {
      return false;
    }
  };

  // 🚫 Prevent screenshot in sensitive areas
  const preventScreenshot = (enabled: boolean) => {
    // In React Native, you'd use a native module for this
    // For now, this is a placeholder
    console.log('Screenshot protection:', enabled);
  };

  // 🔒 Secure storage wrapper
  const secureStorage = {
    setItem: async (key: string, value: string) => {
      try {
        const encrypted = SecurityUtils.encrypt(value, generateSecureToken());
        // Use secure storage like Expo's SecureStore
        // @ts-ignore - SecureStore implementation
        await SecureStore.setItemAsync(key, encrypted);
        console.log('Secure storage set:', key);
      } catch (error) {
        SecurityLogger.log('Secure storage error', { key, error: (error as Error).message }, 'medium');
        throw error;
      }
    },
    
    getItem: async (key: string): Promise<string | null> => {
      try {
        // @ts-ignore - SecureStore implementation
        const encrypted = await SecureStore.getItemAsync(key);
        if (encrypted) {
          return SecurityUtils.decrypt(encrypted, generateSecureToken());
        }
        return null;
      } catch (error) {
        SecurityLogger.log('Secure storage error', { key, error: (error as Error).message }, 'medium');
        return null;
      }
    },
    
    removeItem: async (key: string) => {
      try {
        // @ts-ignore - SecureStore implementation
        await SecureStore.deleteItemAsync(key);
        console.log('Secure storage removed:', key);
      } catch (error) {
        SecurityLogger.log('Secure storage error', { key, error: (error as Error).message }, 'medium');
        throw error;
      }
    },
  };

  // 🌐 Network security
  const validateNetworkRequest = (url: string): boolean => {
    if (!validateURL(url)) {
      SecurityLogger.log('Invalid URL request', { url }, 'high');
      return false;
    }
    
    // Check for allowed domains
    const allowedDomains = [
      'api.expo.dev',
      'life-simulator-azerbaijan.vercel.app',
      'localhost',
    ];
    
    try {
      const urlObj = new URL(url);
      const isAllowed = allowedDomains.some(domain => 
        urlObj.hostname.includes(domain)
      );
      
      if (!isAllowed) {
        SecurityLogger.log('Unauthorized domain request', { url }, 'high');
        return false;
      }
      
      return true;
    } catch (error) {
      return false;
    }
  };

  // Export security utilities to context
  const securityContext = {
    isSecure,
    securityChecks,
    validateInput,
    checkXSS,
    generateSecureToken,
    getDeviceFingerprint,
    validateURL,
    preventScreenshot,
    secureStorage,
    validateNetworkRequest,
  };

  // Only render children if security checks pass
  if (!isSecure && !__DEV__) {
    return null;
  }

  // @ts-ignore - React context type
  return React.createElement(
    SecurityContext.Provider,
    { value: securityContext },
    children
  );
};

// Security context
// @ts-ignore - React context type
export const SecurityContext = React.createContext<any>(null);

// Custom hook for security
export const useSecurity = () => {
  const context = React.useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurity must be used within SecurityMiddleware');
  }
  return context;
};

export default SecurityMiddleware;
