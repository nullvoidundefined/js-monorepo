/**
 * AsyncStorage adapter for React Native
 * This file should only be imported in React Native environments
 */

import type { StorageAdapter } from '../storage';

/**
 * Interface for React Native AsyncStorage
 */
interface AsyncStorageInterface {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * React Native AsyncStorage adapter
 * Note: AsyncStorage must be passed in to avoid import errors in web environments
 */
export class AsyncStorageAdapter implements StorageAdapter {
  constructor(private asyncStorage: AsyncStorageInterface) {
    if (!asyncStorage) {
      throw new Error('AsyncStorage instance is required');
    }
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await this.asyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.asyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.asyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
      throw error;
    }
  }
}
