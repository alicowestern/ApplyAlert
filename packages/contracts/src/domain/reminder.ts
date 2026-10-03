/**
 * Reminder domain types for ApplyAlert.
 *
 * Not implemented yet â€” these types establish the shape
 * for the future reminder scheduling system.
 */

/**
 * A scheduled reminder for an opportunity deadline.
 */
export interface Reminder {
  /** Unique identifier. */
  readonly id: string;

  /** The opportunity this reminder belongs to. */
  readonly opportunityId: string;

  /**
   * Scheduled time as ISO 8601 UTC instant.
   * When the reminder should fire.
   */
  readonly scheduledAt: string;

  /** Human-readable label (e.g., "7 days before deadline"). */
  readonly label: string;

  /** Whether this reminder has been delivered. */
  readonly delivered: boolean;

  /** Whether this reminder was cancelled (e.g., user marked APPLIED). */
  readonly cancelled: boolean;
}

/**
 * Default reminder offsets in days before deadline.
 *
 * The actual strategy depends on how far away the deadline is:
 * - >45 days: 30d, 14d, 7d, 3d, 1d, 0d
 * - 15â€“45 days: 14d, 7d, 3d, 1d, 0d
 * - 8â€“14 days: 7d, 3d, 1d, 0d
 * - 4â€“7 days: 3d, 1d, 0d
 * - 2â€“3 days: 1d, 0d
 *
 * Hour-level reminders may only be generated when an actual
 * deadline time is known.
 */
export const DEFAULT_REMINDER_OFFSETS_DAYS = {
  FAR: [30, 14, 7, 3, 1, 0],
  MEDIUM: [14, 7, 3, 1, 0],
  NEAR: [7, 3, 1, 0],
  CLOSE: [3, 1, 0],
  IMMINENT: [1, 0],
} as const;
