/**
 * Extraction API contract types.
 */

import type { 
  ExtractionStatus,
  ExtractionResult, 
  ExtractionWarningCode,
  ExtractionConfidenceLevel
} from '../domain/extraction-types';
import type { Opportunity } from '../domain/opportunity';

/**
 * Response DTO for an extraction (safe for client consumption).
 */
export interface ExtractionResponseDto {
  readonly id: string;
  readonly importId: string;
  readonly status: ExtractionStatus;
  
  readonly result: ExtractionResult | null;
  readonly confidenceLevel: ExtractionConfidenceLevel | null;
  readonly warnings: readonly ExtractionWarningCode[];
  
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
  
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly processingStartedAt: string | null;
  readonly processingCompletedAt: string | null;
}

/**
 * Request DTO for confirming an extraction and creating an Opportunity.
 * The mobile app sends the user-reviewed data here.
 */
export interface ConfirmExtractionDto {
  readonly title: string;
  readonly organization: string | null;
  readonly opportunityType: string;
  readonly summary: string | null;
  readonly location: string | null;
  readonly funding: {
    readonly isFunded: boolean | null;
    readonly details: string | null;
  } | null;
  readonly applicationUrl: string | null;
  readonly deadline: {
    readonly kind: string;
    readonly originalText: string | null;
    readonly localDate: string | null;
    readonly localTime: string | null;
    readonly timezone: string | null;
    readonly utcInstant: string | null;
    readonly confidence: number;
    readonly userConfirmed: boolean;
    readonly evidence: string | null;
    readonly alternativeCandidates: readonly string[];
  };
}

/**
 * Response DTO for the confirm endpoint.
 */
export interface ConfirmExtractionResponseDto {
  readonly opportunity: Opportunity;
}
