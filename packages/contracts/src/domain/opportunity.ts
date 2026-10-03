/**
 * Core Opportunity domain types for ApplyAlert.
 */

import type { Deadline } from './deadline';

/**
 * Classification of opportunity type.
 */
export type OpportunityType =
  | 'SCHOLARSHIP'
  | 'INTERNSHIP'
  | 'FELLOWSHIP'
  | 'JOB'
  | 'GRANT'
  | 'CONFERENCE'
  | 'HACKATHON'
  | 'COMPETITION'
  | 'EXCHANGE'
  | 'OTHER';

/**
 * Tracks the user's application progress.
 */
export type ApplicationStatus =
  | 'SAVED' // Opportunity saved, not started
  | 'PREPARING' // User is working on application
  | 'APPLIED' // Application submitted
  | 'SKIPPED' // User decided not to apply
  | 'ARCHIVED'; // Moved to archive (deadline passed, etc.)

/**
 * Represents funding information extracted from the opportunity source.
 */
export interface FundingInfo {
  /** Whether funding/financial support is mentioned. */
  readonly isFunded: boolean | null;
  /** Free-text description of funding details. */
  readonly details: string | null;
}

/**
 * Tracks the source from which an opportunity was imported.
 */
/**
 * Source content type for how the opportunity was imported.
 */
export type SourceContentType = 'URL' | 'TEXT' | 'IMAGE' | 'PDF' | 'ANDROID_SHARE' | 'MANUAL';

/**
 * Tracks the source from which an opportunity was imported.
 */
export interface OpportunitySource {
  /** How the opportunity was imported. */
  readonly type: SourceContentType;
  /** Original URL if available. */
  readonly url: string | null;
  /** Raw text content if available (pasted text, extracted text). */
  readonly rawText: string | null;
  /** Original filename if imported from file. */
  readonly fileName: string | null;
  /** MIME type when applicable (e.g., "image/png", "application/pdf"). */
  readonly mimeType: string | null;
  /**
   * Reference to a locally stored file (path or future object-storage key).
   * Binary data is NOT stored in the opportunity record.
   */
  readonly fileRef: string | null;
  /** Timestamp of import. */
  readonly importedAt: string;
}

/**
 * Core Opportunity entity.
 *
 * This is the central domain object. All fields that come from AI extraction
 * preserve their original evidence via the source and deadline.evidence fields.
 */
export interface Opportunity {
  /** Unique identifier (UUID v4). */
  readonly id: string;

  /** Title of the opportunity. */
  readonly title: string;

  /** Organization offering the opportunity. */
  readonly organization: string | null;

  /** Type classification. */
  readonly opportunityType: OpportunityType;

  /** Brief summary of the opportunity. */
  readonly summary: string | null;

  /** Location (city, country, or "Remote"). */
  readonly location: string | null;

  /** Funding information. */
  readonly funding: FundingInfo | null;

  /** URL to the application page. */
  readonly applicationUrl: string | null;

  /** Source from which this opportunity was imported. */
  readonly source: OpportunitySource;

  /** Deadline information â€” never a bare Date. */
  readonly deadline: Deadline;

  /** Current application status. */
  readonly status: ApplicationStatus;

  /** ISO 8601 timestamp of creation. */
  readonly createdAt: string;

  /** ISO 8601 timestamp of last update. */
  readonly updatedAt: string;

  /** ISO 8601 timestamp of when the user marked APPLIED. Null otherwise. */
  readonly appliedAt: string | null;

  /** ISO 8601 timestamp of when the opportunity was archived. Null otherwise. */
  readonly archivedAt: string | null;
}
