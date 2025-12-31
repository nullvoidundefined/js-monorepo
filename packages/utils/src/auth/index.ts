/**
 * Shared authentication utilities
 */

export * from './jwt';
export * from './storage';
export * from './token';
export * from './api';

// Re-export common types
export type { User } from '@packages/type';

// Platform-specific adapters (import conditionally in consuming apps)
export { AsyncStorageAdapter } from './adapters/asyncstorage';

