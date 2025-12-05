// 🔐 Secure Storage - Encrypted AsyncStorage
// Создано: Security Specialist (Agile Team)
// Версия: 3.0.0

import AsyncStorage from '@react-native-async-storage/async-storage';
import * as CryptoJS from 'crypto-js';

// Encryption key derivation
const deriveKey = (salt: string): string => {
  const passphrase = 'LifeSimulator_Azerbaijan_2024_Secure_Key';
  return CryptoJS.PBKDF2(passphrase, salt, {
    keySize: 256/32,
    iterations: 10000,
  }).toString();
};

// Encrypt data
const encrypt = (data: string, key: string): string => {
  const encrypted = CryptoJS.AES.encrypt(data, key).toString();
  return encrypted;
};

// Decrypt data
const decrypt = (encryptedData: string, key: string): string => {
  try {
    const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
    return decrypted.toString(CryptoJS.enc.Utf8);
  } catch (error) {
    console.error('Decryption failed:', error);
    throw new Error('Failed to decrypt data');
  }
};

// Secure storage interface
export interface SecureStorageItem {
  key: string;
  value: any;
  encrypted: boolean;
  timestamp: number;
  expiresAt?: number;
}

class SecureStorage {
  private static instance: SecureStorage;
  private encryptionKey: string;
  private salt: string;

  private constructor() {
    this.salt = 'LifeSimulator_Salt_2024';
    this.encryptionKey = deriveKey(this.salt);
  }

  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }

  // Store data securely
  async setItem(key: string, value: any, options?: {
    encrypt?: boolean;
    expiresIn?: number; // in seconds
  }): Promise<void> {
    try {
      const shouldEncrypt = options?.encrypt ?? true;
      const expiresIn = options?.expiresIn;
      
      const item: SecureStorageItem = {
        key,
        value: shouldEncrypt ? encrypt(JSON.stringify(value), this.encryptionKey) : JSON.stringify(value),
        encrypted: shouldEncrypt,
        timestamp: Date.now(),
        expiresAt: expiresIn ? Date.now() + (expiresIn * 1000) : undefined,
      };

      await AsyncStorage.setItem(`secure_${key}`, JSON.stringify(item));
    } catch (error) {
      console.error('Failed to store secure item:', error);
      throw new Error('Failed to store data securely');
    }
  }

  // Retrieve data securely
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const itemString = await AsyncStorage.getItem(`secure_${key}`);
      if (!itemString) return null;

      const item: SecureStorageItem = JSON.parse(itemString);

      // Check if item has expired
      if (item.expiresAt && Date.now() > item.expiresAt) {
        await this.removeItem(key);
        return null;
      }

      const valueString = item.encrypted 
        ? decrypt(item.value, this.encryptionKey)
        : item.value;

      return JSON.parse(valueString) as T;
    } catch (error) {
      console.error('Failed to retrieve secure item:', error);
      // If decryption fails, remove the corrupted item
      await this.removeItem(key);
      return null;
    }
  }

  // Remove item
  async removeItem(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(`secure_${key}`);
    } catch (error) {
      console.error('Failed to remove secure item:', error);
      throw new Error('Failed to remove data');
    }
  }

  // Clear all secure storage
  async clear(): Promise<void> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      const secureKeys = keys.filter(key => key.startsWith('secure_'));
      await AsyncStorage.multiRemove(secureKeys);
    } catch (error) {
      console.error('Failed to clear secure storage:', error);
      throw new Error('Failed to clear secure storage');
    }
  }

  // Get all keys
  async getAllKeys(): Promise<string[]> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys
        .filter(key => key.startsWith('secure_'))
        .map(key => key.replace('secure_', ''));
    } catch (error) {
      console.error('Failed to get secure storage keys:', error);
      return [];
    }
  }

  // Check if item exists and is not expired
  async hasItem(key: string): Promise<boolean> {
    try {
      const item = await this.getItem(key);
      return item !== null;
    } catch (error) {
      return false;
    }
  }

  // Get storage size (approximate)
  async getStorageSize(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const itemString = await AsyncStorage.getItem(`secure_${key}`);
        if (itemString) {
          totalSize += itemString.length;
        }
      }
      
      return totalSize;
    } catch (error) {
      console.error('Failed to get storage size:', error);
      return 0;
    }
  }

  // Clean up expired items
  async cleanupExpired(): Promise<number> {
    try {
      const keys = await this.getAllKeys();
      let cleanedCount = 0;

      for (const key of keys) {
        const itemString = await AsyncStorage.getItem(`secure_${key}`);
        if (itemString) {
          const item: SecureStorageItem = JSON.parse(itemString);
          if (item.expiresAt && Date.now() > item.expiresAt) {
            await this.removeItem(key);
            cleanedCount++;
          }
        }
      }

      return cleanedCount;
    } catch (error) {
      console.error('Failed to cleanup expired items:', error);
      return 0;
    }
  }
}

// Export singleton instance
export const secureStorage = SecureStorage.getInstance();

// Convenience methods for common use cases
export const secureTokens = {
  setAccessToken: (token: string, expiresIn?: number) => 
    secureStorage.setItem('access_token', token, { encrypt: true, expiresIn }),
  
  getAccessToken: () => 
    secureStorage.getItem<string>('access_token'),
  
  removeAccessToken: () => 
    secureStorage.removeItem('access_token'),
};

export const secureUser = {
  setUser: (user: any, expiresIn?: number) => 
    secureStorage.setItem('user', user, { encrypt: true, expiresIn }),
  
  getUser: () => 
    secureStorage.getItem('user'),
  
  removeUser: () => 
    secureStorage.removeItem('user'),
};

export const secureSettings = {
  setSetting: (key: string, value: any) => 
    secureStorage.setItem(`setting_${key}`, value, { encrypt: false }),
  
  getSetting: <T = any>(key: string) => 
    secureStorage.getItem<T>(`setting_${key}`),
  
  removeSetting: (key: string) => 
    secureStorage.removeItem(`setting_${key}`),
};

export default secureStorage;
