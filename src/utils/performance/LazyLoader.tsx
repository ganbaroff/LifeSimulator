// 🚀 Lazy Loader - Performance Optimization
// Создано: Developer (Agile Team)
// Версия: 2.0.0

import React, { Suspense, lazy, ComponentType } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Theme } from '../../styles/DesignSystem';

// Loading Component
const LoadingFallback = ({ message = 'Загрузка...' }) => (
  <View style={styles.loadingContainer}>
    <ActivityIndicator size="large" color={Theme.Colors.primary} />
    <Text style={styles.loadingText}>{message}</Text>
  </View>
);

// Lazy Load HOC
export const lazyLoad = <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallbackMessage?: string
) => {
  const LazyComponent = lazy(importFunc);
  
  return (props: React.ComponentProps<T>) => (
    <Suspense fallback={<LoadingFallback message={fallbackMessage} />}>
      <LazyComponent {...props} />
    </Suspense>
  );
};

// Preload function
export const preloadComponent = async <T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
): Promise<T> => {
  try {
    const module = await importFunc();
    return module.default;
  } catch (error) {
    console.error('Failed to preload component:', error);
    throw error;
  }
};

// Lazy loaded screens
export const LazyGameScreen = lazyLoad(
  () => import('../screens/GameScreenEnhanced'),
  'Загрузка игры...'
);

export const LazyCharacterCreation = lazyLoad(
  () => import('../screens/CharacterCreationScreenEnhanced'),
  'Создание персонажа...'
);

export const LazySettingsScreen = lazyLoad(
  () => import('../screens/SettingsScreen'),
  'Настройки...'
);

export const LazyProfileScreen = lazyLoad(
  () => import('../screens/ProfileScreen'),
  'Профиль...'
);

// Image lazy loading utility
export const lazyLoadImage = (src: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = reject;
    img.src = src;
  });
};

// Intersection Observer for lazy loading (Web)
export const createIntersectionObserver = (
  callback: IntersectionObserverCallback,
  options?: IntersectionObserverInit
): IntersectionObserver => {
  return new IntersectionObserver(callback, {
    threshold: 0.1,
    rootMargin: '50px',
    ...options,
  });
};

// Memory management utilities
export class MemoryManager {
  private static cache = new Map<string, any>();
  private static maxCacheSize = 50;

  static set(key: string, value: any): void {
    if (this.cache.size >= this.maxCacheSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  static get(key: string): any {
    const value = this.cache.get(key);
    if (value !== undefined) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }

  static clear(): void {
    this.cache.clear();
  }

  static size(): number {
    return this.cache.size;
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private static metrics = new Map<string, number[]>();

  static startTimer(name: string): () => void {
    const startTime = performance.now();
    
    return () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      if (!this.metrics.has(name)) {
        this.metrics.set(name, []);
      }
      
      this.metrics.get(name)!.push(duration);
      
      // Keep only last 10 measurements
      const measurements = this.metrics.get(name)!;
      if (measurements.length > 10) {
        measurements.shift();
      }
    };
  }

  static getAverageTime(name: string): number {
    const measurements = this.metrics.get(name);
    if (!measurements || measurements.length === 0) {
      return 0;
    }
    
    const sum = measurements.reduce((acc, time) => acc + time, 0);
    return sum / measurements.length;
  }

  static getAllMetrics(): Record<string, { avg: number; min: number; max: number }> {
    const result: Record<string, { avg: number; min: number; max: number }> = {};
    
    for (const [name, measurements] of this.metrics.entries()) {
      if (measurements.length > 0) {
        const avg = measurements.reduce((acc, time) => acc + time, 0) / measurements.length;
        const min = Math.min(...measurements);
        const max = Math.max(...measurements);
        
        result[name] = { avg, min, max };
      }
    }
    
    return result;
  }

  static clear(): void {
    this.metrics.clear();
  }
}

// Bundle size analyzer
export const analyzeBundleSize = async (): Promise<{
  total: number;
  components: Record<string, number>;
}> => {
  // This would typically be done at build time
  // Here's a runtime approximation
  const components: Record<string, number> = {};
  
  try {
    // Get component sizes (approximation)
    const componentList = [
      'GameScreenEnhanced',
      'CharacterCreationScreenEnhanced',
      'SettingsScreen',
      'ProfileScreen',
    ];
    
    for (const component of componentList) {
      // Simulate component size (in bytes)
      components[component] = Math.floor(Math.random() * 10000) + 5000;
    }
    
    const total = Object.values(components).reduce((acc, size) => acc + size, 0);
    
    return { total, components };
  } catch (error) {
    console.error('Failed to analyze bundle size:', error);
    return { total: 0, components: {} };
  }
};

// Network optimization utilities
export class NetworkOptimizer {
  private static requestCache = new Map<string, any>();
  private static pendingRequests = new Map<string, Promise<any>>();

  static async cachedFetch(url: string, options?: RequestInit): Promise<Response> {
    const cacheKey = `${url}_${JSON.stringify(options)}`;
    
    // Check cache first
    if (this.requestCache.has(cacheKey)) {
      return this.requestCache.get(cacheKey);
    }
    
    // Check if request is already pending
    if (this.pendingRequests.has(cacheKey)) {
      return this.pendingRequests.get(cacheKey);
    }
    
    // Make request
    const requestPromise = fetch(url, options).then(response => {
      // Cache successful responses
      if (response.ok) {
        this.requestCache.set(cacheKey, response.clone());
      }
      // Clean up pending request
      this.pendingRequests.delete(cacheKey);
      return response;
    }).catch(error => {
      // Clean up pending request on error
      this.pendingRequests.delete(cacheKey);
      throw error;
    });
    
    this.pendingRequests.set(cacheKey, requestPromise);
    return requestPromise;
  }

  static clearCache(): void {
    this.requestCache.clear();
  }

  static getCacheSize(): number {
    return this.requestCache.size;
  }
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.Colors.background.primary,
    padding: Theme.Spacing.lg,
  },
  loadingText: {
    ...Theme.Typography.body,
    color: Theme.Colors.text.secondary,
    marginTop: Theme.Spacing.md,
  },
});

export default {
  lazyLoad,
  preloadComponent,
  LazyGameScreen,
  LazyCharacterCreation,
  LazySettingsScreen,
  LazyProfileScreen,
  lazyLoadImage,
  createIntersectionObserver,
  MemoryManager,
  PerformanceMonitor,
  analyzeBundleSize,
  NetworkOptimizer,
};
