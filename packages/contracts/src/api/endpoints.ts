/**
 * API contract types for ApplyAlert.
 *
 * These define the shape of request/response payloads
 * for the backend API.
 */

import type { Opportunity, ApplicationStatus } from '../domain/opportunity';

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
  readonly requestId?: string;
  readonly details?: Record<string, unknown>;
}

/**
 * Paginated list response using cursor-based pagination.
 */
export interface PaginatedResponse<T> {
  readonly items: readonly T[];
  readonly nextCursor: string | null;
  readonly hasMore: boolean;
  readonly totalCount?: number;
}

/**
 * Query parameters for listing opportunities.
 */
export interface ListOpportunitiesQuery {
  readonly status?: ApplicationStatus;
  readonly archived?: boolean;
  readonly search?: string;
  readonly sort?: 'deadline' | 'createdAt' | 'updatedAt';
  readonly limit?: number;
  readonly cursor?: string;
}

/**
 * Data Transfer Object for creating an Opportunity.
 */
export type CreateOpportunityDto = Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'appliedAt' | 'archivedAt'>;

/**
 * Data Transfer Object for updating an Opportunity.
 */
export type UpdateOpportunityDto = Partial<Pick<Opportunity, 'title' | 'organization' | 'opportunityType' | 'summary' | 'location' | 'funding' | 'applicationUrl' | 'deadline'>>;

/**
 * Data Transfer Object for updating an Opportunity's status.
 */
export interface UpdateStatusDto {
  readonly status: ApplicationStatus;
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
