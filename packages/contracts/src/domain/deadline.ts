/**
 * Deadline representation for ApplyAlert.
 *
 * A deadline is NEVER just a Date. It preserves the kind of deadline,
 * original source text, and all components independently.
 *
 * Key invariants:
 * - `localTime` is null unless the source explicitly states a time.
 * - `utcInstant` is only set when localDate + localTime + timezone are all known.
 * - `confidence < 1.0` and `userConfirmed === false` â†’ UI must prompt for confirmation.
 * - `kind === 'AMBIGUOUS'` â†’ `alternativeCandidates` should be non-empty.
 * - We NEVER manufacture "23:59" for a source that only specifies a calendar date.
 */

/**
 * Classifies what kind of deadline was detected.
 */
export type DeadlineKind =
  | 'EXACT_INSTANT' // Full datetime + timezone known
  | 'DATE_ONLY' // Only calendar date, no time
  | 'ROLLING' // No fixed date, rolling admission
  | 'NONE_STATED' // Source doesn't state a deadline
  | 'AMBIGUOUS' // Multiple or unclear dates found
  | 'CLOSED'; // Already known to be closed

/**
 * Rich deadline type preserving all evidence and components.
 */
export interface Deadline {
  /** Classification of the deadline. */
  readonly kind: DeadlineKind;

  /**
   * Original text from which the deadline was extracted.
   * Preserved as-is for auditability.
   * Example: "Applications close January 15, 2027 at 11:59 PM EST"
   */
  readonly originalText: string | null;

  /**
   * Calendar date in ISO 8601 format: "YYYY-MM-DD".
   * Null when kind is ROLLING, NONE_STATED, or CLOSED without a known date.
   */
  readonly localDate: string | null;

  /**
   * Time of day in ISO 8601 format: "HH:mm:ss".
   * ONLY set when the source explicitly states a time.
   * Never manufactured (e.g., we never invent "23:59:00").
   */
  readonly localTime: string | null;

  /**
   * IANA timezone identifier (e.g., "America/New_York").
   * Only set when the source explicitly states a timezone.
   */
  readonly timezone: string | null;

  /**
   * Full ISO 8601 UTC instant (e.g., "2027-01-16T04:59:00Z").
   * Only set when localDate + localTime + timezone are ALL known,
   * making the conversion deterministic.
   */
  readonly utcInstant: string | null;

  /**
   * Confidence score from 0.0 to 1.0.
   * - 1.0 = high confidence (clear, unambiguous source)
   * - < 0.8 = should prompt user confirmation
   * - 0.0 = no confidence (placeholder)
   */
  readonly confidence: number;

  /**
   * Whether the user has explicitly confirmed this deadline.
   * When false and confidence < 1.0, the UI must prompt.
   */
  readonly userConfirmed: boolean;

  /**
   * Broader context/evidence from the source supporting the deadline extraction.
   * May include surrounding sentences or relevant paragraphs.
   */
  readonly evidence: string | null;

  /**
   * Other date strings found in the source that could potentially
   * be the deadline. Non-empty when kind is AMBIGUOUS.
   */
  readonly alternativeCandidates: readonly string[];
}

/**
 * Creates a deadline for an opportunity with no stated deadline.
 */
export function createUnknownDeadline(): Deadline {
  return {
    kind: 'NONE_STATED',
    originalText: null,
    localDate: null,
    localTime: null,
    timezone: null,
    utcInstant: null,
    confidence: 0,
    userConfirmed: false,
    evidence: null,
    alternativeCandidates: [],
  };
}
