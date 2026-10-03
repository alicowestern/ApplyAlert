/**
 * Storage service interface.
 *
 * Abstracts persistent storage so the app doesn't depend
 * on a specific storage implementation (AsyncStorage, MMKV, etc.).
 */

import type { Result } from '../../types/result';

export type StorageErrorKind = 'READ' | 'WRITE' | 'DELETE' | 'NOT_FOUND' | 'UNKNOWN';

export interface StorageError {
  kind: StorageErrorKind;
  message: string;
}

/**
 * General-purpose key-value storage.
 */
export interface StorageService {
  get(key: string): Promise<Result<string | null, StorageError>>;
  set(key: string, value: string): Promise<Result<void, StorageError>>;
  delete(key: string): Promise<Result<void, StorageError>>;
  clear(): Promise<Result<void, StorageError>>;
}

/**
 * Secure storage for sensitive data (tokens, keys).
 * Implementation should use platform-specific secure storage
 * (Android Keystore, iOS Keychain).
 */
export interface SecureStorageService {
  get(key: string): Promise<Result<string | null, StorageError>>;
  set(key: string, value: string): Promise<Result<void, StorageError>>;
  delete(key: string): Promise<Result<void, StorageError>>;
}
