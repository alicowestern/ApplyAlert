/**
 * API contract types for ApplyAlert.
 *
 * These define the shape of request/response payloads
 * for the future backend API. The actual API is not
 * implemented yet.
 */

import type { Opportunity } from '../domain/opportunity';

/**
 * Standard API response wrapper.
 */
export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly error: ApiError | null;
}

/**
 * Standard API error shape.
 */
export interface ApiError {
  readonly code: string;
  readonly message: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Paginated list response.
 */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
  readonly hasMore: boolean;
}

/**
 * Request to submit raw input for AI processing.
 */
export interface SubmitInputRequest {
  readonly contentType: 'URL' | 'TEXT' | 'IMAGE' | 'PDF';
  readonly content: string;
  readonly mimeType?: string;
}

/**
 * Response from AI processing of an input.
 */
export interface ExtractionResponse {
  readonly opportunity: Opportunity;
  readonly requiresConfirmation: boolean;
  readonly warnings: readonly string[];
}
