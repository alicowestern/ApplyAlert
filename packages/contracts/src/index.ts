/**
 * @applyalert/contracts
 *
 * Shared domain types and API contracts for the ApplyAlert platform.
 * Used by both mobile app and backend.
 */

// Domain types
export type {
  DeadlineKind,
  Deadline,
} from './domain/deadline';
export { createUnknownDeadline } from './domain/deadline';

export type {
  OpportunityType,
  ApplicationStatus,
  FundingInfo,
  SourceContentType,
  OpportunitySource,
  Opportunity,
} from './domain/opportunity';

export type {
  InputContentType,
  RawInput,
} from './domain/input';

export type {
  Reminder,
  ReminderType,
  ReminderStatus,
  ReminderChannel
} from './domain/reminder';
export { DEFAULT_REMINDER_OFFSETS_DAYS } from './domain/reminder';

// Import domain types
export type {
  ImportStatus,
  ImportErrorCode,
  Import,
  ContentSection,
  DiscoveredLink,
  PdfMetadata,
  ImageMetadata,
  ExtractionInput,
} from './domain/import-types';
export { RETRYABLE_ERRORS } from './domain/import-types';

// API contracts
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  ListOpportunitiesQuery,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  UpdateStatusDto,
  SubmitInputRequest,
  ExtractionResponse,
} from './api/endpoints';

// Import API contracts
export type {
  CreateTextImportDto,
  CreateUrlImportDto,
  ImportResponseDto,
  ListImportsQuery,
} from './api/imports';
export { toImportResponseDto } from './api/imports';

// Extraction domain types
export type {
  ExtractionStatus,
  ExtractionErrorCode,
  ExtractedDeadlineCandidate,
  ExtractionResult,
  ExtractionConfidenceLevel,
  ExtractionWarningCode,
  Extraction,
} from './domain/extraction-types';

// Extraction API contracts
export type {
  ExtractionResponseDto,
  ConfirmExtractionDto,
  ConfirmExtractionResponseDto,
} from './api/extractions';

