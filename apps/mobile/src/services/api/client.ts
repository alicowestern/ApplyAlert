/**
 * API client placeholder implementation.
 *
 * This will be replaced with a real implementation when
 * the backend is ready. For now it provides the structure.
 */

import { err } from '../../types/result';
import type { ApiClient, ApiClientConfig, ApiClientError } from './types';
import type { Result } from '../../types/result';

export function createApiClient(_config: ApiClientConfig): ApiClient {
  const notImplemented = async <T>(): Promise<Result<T, ApiClientError>> => {
    return err({
      kind: 'UNKNOWN',
      message: 'API client not yet implemented. Backend is not available.',
    });
  };

  return {
    get: notImplemented,
    post: notImplemented,
    put: notImplemented,
    delete: notImplemented,
  };
}
