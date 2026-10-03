/**
 * UI deadline classification.
 *
 * Maps a Deadline to a visual urgency category for display.
 * Thresholds are centralized here and can be adjusted.
 */

import type { Deadline } from '@applyalert/contracts';
import { isExpired, isToday, daysRemaining } from './deadline-utils';

/**
 * Visual urgency classification for UI display.
 */
export type DeadlineUrgency =
  | 'OVERDUE'
  | 'TODAY'
  | 'URGENT'      // 1–3 days
  | 'SOON'        // 4–7 days
  | 'UPCOMING'    // > 7 days
  | 'NO_DEADLINE'
  | 'ROLLING'
  | 'AMBIGUOUS';

/**
 * Classification thresholds (in calendar days).
 * Centralized so they can change without touching classification logic.
 */
export const URGENCY_THRESHOLDS = {
  /** Days remaining at or below which deadline is URGENT. */
  urgent: 3,
  /** Days remaining at or below which deadline is SOON. */
  soon: 7,
} as const;

/**
 * Classify a deadline into a UI urgency category.
 *
 * @param deadline - The deadline to classify
 * @param now - Current time (injectable for testing)
 * @returns The urgency classification
 */
export function classifyDeadline(deadline: Deadline, now: Date = new Date()): DeadlineUrgency {
  switch (deadline.kind) {
    case 'CLOSED':
      return 'OVERDUE';
    case 'ROLLING':
      return 'ROLLING';
    case 'NONE_STATED':
      return 'NO_DEADLINE';
    case 'AMBIGUOUS':
      return 'AMBIGUOUS';
    case 'EXACT_INSTANT':
    case 'DATE_ONLY': {
      if (isExpired(deadline, now)) return 'OVERDUE';
      if (isToday(deadline, now)) return 'TODAY';

      const days = daysRemaining(deadline, now);
      if (days === null) return 'NO_DEADLINE';

      if (days <= URGENCY_THRESHOLDS.urgent) return 'URGENT';
      if (days <= URGENCY_THRESHOLDS.soon) return 'SOON';
      return 'UPCOMING';
    }
  }
}

/**
 * Map urgency to the appropriate theme color key.
 */
export function urgencyColor(urgency: DeadlineUrgency): string {
  switch (urgency) {
    case 'OVERDUE':
      return 'critical';
    case 'TODAY':
      return 'critical';
    case 'URGENT':
      return 'high';
    case 'SOON':
      return 'medium';
    case 'UPCOMING':
      return 'low';
    case 'NO_DEADLINE':
    case 'ROLLING':
    case 'AMBIGUOUS':
      return 'low';
  }
}

/**
 * Human-readable label for an urgency classification.
 */
export function urgencyLabel(urgency: DeadlineUrgency): string {
  switch (urgency) {
    case 'OVERDUE':
      return 'Overdue';
    case 'TODAY':
      return 'Due Today';
    case 'URGENT':
      return 'Urgent';
    case 'SOON':
      return 'Soon';
    case 'UPCOMING':
      return 'Upcoming';
    case 'NO_DEADLINE':
      return 'No Deadline';
    case 'ROLLING':
      return 'Rolling';
    case 'AMBIGUOUS':
      return 'Confirm Date';
  }
}
