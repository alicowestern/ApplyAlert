/**
 * API client interface.
 *
 * Abstracts the HTTP communication layer so the app doesn't
 * depend on a specific HTTP library or backend URL directly.
 */

import type { Result } from '../../types/result';

export interface ApiClientConfig {
  baseUrl: string;
  timeout?: number;
}

export type ApiErrorKind =
  | 'NETWORK'
  | 'TIMEOUT'
  | 'NOT_FOUND'
  | 'VALIDATION'
  | 'SERVER'
  | 'UNAUTHORIZED'
  | 'UNKNOWN';

export interface ApiClientError {
  kind: ApiErrorKind;
  message: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

export interface ApiClient {
  get<T>(path: string, params?: Record<string, string>): Promise<Result<T, ApiClientError>>;
  post<T>(path: string, body: unknown): Promise<Result<T, ApiClientError>>;
  put<T>(path: string, body: unknown): Promise<Result<T, ApiClientError>>;
  delete<T>(path: string): Promise<Result<T, ApiClientError>>;
}
