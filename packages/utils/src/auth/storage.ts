/**
 * Abstract storage interface for auth state persistence
 * Allows for different storage implementations (AsyncStorage, localStorage, etc.)
 */

export interface StorageAdapter {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}

/**
 * Browser localStorage adapter
 */
export class LocalStorageAdapter implements StorageAdapter {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    return window.localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.removeItem(key);
  }
}

/**
 * Generic auth storage handler
 */
export class AuthStorage<T = any> {
  constructor(
    private adapter: StorageAdapter,
    private storageKey: string
  ) {}

  async save(data: T): Promise<void> {
    try {
      await this.adapter.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to storage:', error);
      throw error;
    }
  }

  async load(): Promise<T | null> {
    try {
      const stored = await this.adapter.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Error loading from storage:', error);
      return null;
    }
  }

  async remove(): Promise<void> {
    try {
      await this.adapter.removeItem(this.storageKey);
    } catch (error) {
      console.error('Error removing from storage:', error);
      throw error;
    }
  }

  async update(updater: (current: T | null) => T): Promise<void> {
    const current = await this.load();
    const updated = updater(current);
    await this.save(updated);
  }
}

