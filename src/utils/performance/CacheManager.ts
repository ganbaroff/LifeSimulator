// 🗄️ Cache Manager - Performance Optimization
// Создано: Developer (Agile Team)
// Версия: 2.0.0

import AsyncStorage from '@react-native-async-storage/async-storage';

// Cache entry interface
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  version: string;
}

// Cache configuration
interface CacheConfig {
  maxSize: number; // Maximum number of entries
  defaultTTL: number; // Default TTL in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  enableCompression: boolean;
  enableEncryption: boolean;
}

class CacheManager {
  private memoryCache = new Map<string, CacheEntry<any>>();
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 100,
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      cleanupInterval: 60 * 1000, // 1 minute
      enableCompression: false,
      enableEncryption: false,
      ...config,
    };

    this.startCleanupTimer();
  }

  // Set cache entry
  async set<T>(
    key: string,
    data: T,
    ttl: number = this.config.defaultTTL,
    persistToDisk: boolean = false
  ): Promise<void> {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl,
      version: '1.0.0',
    };

    // Memory cache
    if (this.memoryCache.size >= this.config.maxSize) {
      this.evictLRU();
    }
    this.memoryCache.set(key, entry);

    // Persistent cache
    if (persistToDisk) {
      try {
        const serializedEntry = JSON.stringify(entry);
        await AsyncStorage.setItem(`cache_${key}`, serializedEntry);
      } catch (error) {
        console.error('Failed to persist cache entry:', error);
      }
    }
  }

  // Get cache entry
  async get<T>(key: string, checkDisk: boolean = true): Promise<T | null> {
    // Check memory cache first
    const memoryEntry = this.memoryCache.get(key);
    if (memoryEntry && !this.isExpired(memoryEntry)) {
      return memoryEntry.data as T;
    }

    if (memoryEntry && this.isExpired(memoryEntry)) {
      this.memoryCache.delete(key);
    }

    // Check disk cache
    if (checkDisk) {
      try {
        const serializedEntry = await AsyncStorage.getItem(`cache_${key}`);
        if (serializedEntry) {
          const diskEntry: CacheEntry<T> = JSON.parse(serializedEntry);
          
          if (!this.isExpired(diskEntry)) {
            // Restore to memory cache
            this.memoryCache.set(key, diskEntry);
            return diskEntry.data;
          } else {
            // Remove expired disk entry
            await AsyncStorage.removeItem(`cache_${key}`);
          }
        }
      } catch (error) {
        console.error('Failed to read from disk cache:', error);
      }
    }

    return null;
  }

  // Check if entry exists and is not expired
  async has(key: string): Promise<boolean> {
    const entry = await this.get(key);
    return entry !== null;
  }

  // Delete cache entry
  async delete(key: string): Promise<void> {
    this.memoryCache.delete(key);
    
    try {
      await AsyncStorage.removeItem(`cache_${key}`);
    } catch (error) {
      console.error('Failed to delete from disk cache:', error);
    }
  }

  // Clear all cache
  async clear(): Promise<void> {
    this.memoryCache.clear();
    
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      await AsyncStorage.multiRemove(cacheKeys);
    } catch (error) {
      console.error('Failed to clear disk cache:', error);
    }
  }

  // Get cache statistics
  getStats(): {
    memorySize: number;
    diskSize: number;
    hitRate: number;
    missRate: number;
  } {
    return {
      memorySize: this.memoryCache.size,
      diskSize: 0, // Would need to implement disk size calculation
      hitRate: 0, // Would need to implement hit/miss tracking
      missRate: 0,
    };
  }

  // Check if cache entry is expired
  private isExpired(entry: CacheEntry<any>): boolean {
    return Date.now() - entry.timestamp > entry.ttl;
  }

  // Evict least recently used entry
  private evictLRU(): void {
    let oldestKey = '';
    let oldestTime = Date.now();

    for (const [key, entry] of this.memoryCache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.memoryCache.delete(oldestKey);
    }
  }

  // Start cleanup timer
  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  // Cleanup expired entries
  private async cleanup(): Promise<void> {
    // Cleanup memory cache
    for (const [key, entry] of this.memoryCache.entries()) {
      if (this.isExpired(entry)) {
        this.memoryCache.delete(key);
      }
    }

    // Cleanup disk cache
    try {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter(key => key.startsWith('cache_'));
      
      for (const cacheKey of cacheKeys) {
        const serializedEntry = await AsyncStorage.getItem(cacheKey);
        if (serializedEntry) {
          const entry: CacheEntry<any> = JSON.parse(serializedEntry);
          if (this.isExpired(entry)) {
            await AsyncStorage.removeItem(cacheKey);
          }
        }
      }
    } catch (error) {
      console.error('Failed to cleanup disk cache:', error);
    }
  }

  // Destroy cache manager
  destroy(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}

// Specialized cache instances
export const gameDataCache = new CacheManager({
  maxSize: 50,
  defaultTTL: 10 * 60 * 1000, // 10 minutes
  cleanupInterval: 5 * 60 * 1000, // 5 minutes
});

export const characterCache = new CacheManager({
  maxSize: 20,
  defaultTTL: 30 * 60 * 1000, // 30 minutes
  cleanupInterval: 10 * 60 * 1000, // 10 minutes
});

export const imageCache = new CacheManager({
  maxSize: 100,
  defaultTTL: 60 * 60 * 1000, // 1 hour
  cleanupInterval: 15 * 60 * 1000, // 15 minutes
});

export const apiCache = new CacheManager({
  maxSize: 200,
  defaultTTL: 5 * 60 * 1000, // 5 minutes
  cleanupInterval: 2 * 60 * 1000, // 2 minutes
});

// Cache utilities
export const cacheUtils = {
  // Cache game events
  async cacheGameEvents(events: any[]): Promise<void> {
    await gameDataCache.set('game_events', events, 60 * 60 * 1000, true);
  },

  // Get cached game events
  async getCachedGameEvents(): Promise<any[] | null> {
    return await gameDataCache.get('game_events');
  },

  // Cache character data
  async cacheCharacter(character: any): Promise<void> {
    await characterCache.set(`character_${character.id}`, character, 24 * 60 * 60 * 1000, true);
  },

  // Get cached character
  async getCachedCharacter(characterId: string): Promise<any | null> {
    return await characterCache.get(`character_${characterId}`);
  },

  // Cache API response
  async cacheApiResponse(endpoint: string, response: any): Promise<void> {
    await apiCache.set(endpoint, response, 5 * 60 * 1000, true);
  },

  // Get cached API response
  async getCachedApiResponse(endpoint: string): Promise<any | null> {
    return await apiCache.get(endpoint);
  },

  // Clear all caches
  async clearAllCaches(): Promise<void> {
    await Promise.all([
      gameDataCache.clear(),
      characterCache.clear(),
      imageCache.clear(),
      apiCache.clear(),
    ]);
  },

  // Get cache statistics
  getAllCacheStats(): Record<string, any> {
    return {
      gameData: gameDataCache.getStats(),
      character: characterCache.getStats(),
      image: imageCache.getStats(),
      api: apiCache.getStats(),
    };
  },
};

export default CacheManager;
