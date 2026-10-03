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
  OpportunitySource,
  Opportunity,
} from './domain/opportunity';

export type {
  InputContentType,
  RawInput,
} from './domain/input';

export type {
  Reminder,
} from './domain/reminder';
export { DEFAULT_REMINDER_OFFSETS_DAYS } from './domain/reminder';

// API contracts
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  SubmitInputRequest,
  ExtractionResponse,
} from './api/endpoints';
