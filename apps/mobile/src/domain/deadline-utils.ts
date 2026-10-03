/**
 * Deadline utility functions.
 *
 * Pure, testable functions for working with the Deadline domain type.
 *
 * ## DATE_ONLY semantics
 *
 * A DATE_ONLY deadline represents a calendar date without a known time.
 * When comparing to "now":
 * - We compare against the user's LOCAL calendar date (not UTC).
 * - A DATE_ONLY deadline for "2027-03-01" is considered expired on 2027-03-02
 *   in the user's local timezone, regardless of what UTC says.
 * - On the deadline day itself (2027-03-01), it is NOT expired — it's "today".
 * - We NEVER fabricate "23:59" or any arbitrary time.
 *
 * ## EXACT_INSTANT semantics
 *
 * An EXACT_INSTANT deadline has a utcInstant. We compare directly to
 * the current UTC time. This is timezone-safe by definition.
 *
 * ## Non-actionable deadlines
 *
 * ROLLING, NONE_STATED, AMBIGUOUS deadlines are not time-comparable.
 * CLOSED deadlines are always expired.
 */

import type { Deadline } from '@applyalert/contracts';

// ─── Helpers ──────────────────────────────────────────────────────

/**
 * Returns today's date as "YYYY-MM-DD" in the local timezone.
 * Extracted so it can be injected in tests.
 */
export function getLocalToday(now: Date = new Date()): string {
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Parse a "YYYY-MM-DD" string to midnight-local Date (for day arithmetic only).
 * Returns null if the string is malformed.
 */
function parseLocalDate(iso: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const date = new Date(year, month, day);
  // Validate the date is real (e.g., Feb 30 would roll over)
  if (date.getFullYear() !== year || date.getMonth() !== month || date.getDate() !== day) {
    return null;
  }
  return date;
}

// ─── Core functions ───────────────────────────────────────────────

/**
 * Whether a deadline has an actionable date (something we can compare to time).
 *
 * Actionable: EXACT_INSTANT, DATE_ONLY
 * Not actionable: ROLLING, NONE_STATED, AMBIGUOUS, CLOSED
 */
export function isActionableDeadline(deadline: Deadline): boolean {
  return deadline.kind === 'EXACT_INSTANT' || deadline.kind === 'DATE_ONLY';
}

/**
 * Whether a deadline has expired.
 *
 * - EXACT_INSTANT: expired when utcInstant < now (UTC comparison)
 * - DATE_ONLY: expired when localDate < today (local calendar comparison)
 * - CLOSED: always expired
 * - Others: never expired (not time-comparable)
 */
export function isExpired(deadline: Deadline, now: Date = new Date()): boolean {
  if (deadline.kind === 'CLOSED') return true;

  if (deadline.kind === 'EXACT_INSTANT' && deadline.utcInstant) {
    return new Date(deadline.utcInstant).getTime() < now.getTime();
  }

  if (deadline.kind === 'DATE_ONLY' && deadline.localDate) {
    const today = getLocalToday(now);
    return deadline.localDate < today; // string comparison works for ISO dates
  }

  return false;
}

/**
 * Whether the deadline is today (local calendar date).
 *
 * - DATE_ONLY: localDate === today
 * - EXACT_INSTANT: localDate === today (if localDate present)
 * - Others: false
 */
export function isToday(deadline: Deadline, now: Date = new Date()): boolean {
  if (!deadline.localDate) return false;
  if (deadline.kind !== 'EXACT_INSTANT' && deadline.kind !== 'DATE_ONLY') return false;
  return deadline.localDate === getLocalToday(now);
}

/**
 * Calculate days remaining for a DATE_ONLY deadline.
 *
 * Returns the number of calendar days from today to the deadline date.
 * Returns null for non-DATE_ONLY deadlines or missing localDate.
 *
 * A deadline on today returns 0.
 * A deadline tomorrow returns 1.
 * A past deadline returns a negative number.
 */
export function daysRemainingDateOnly(deadline: Deadline, now: Date = new Date()): number | null {
  if (deadline.kind !== 'DATE_ONLY' || !deadline.localDate) return null;

  const todayDate = parseLocalDate(getLocalToday(now));
  const deadlineDate = parseLocalDate(deadline.localDate);
  if (!todayDate || !deadlineDate) return null;

  const diffMs = deadlineDate.getTime() - todayDate.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Calculate milliseconds remaining for an EXACT_INSTANT deadline.
 *
 * Returns null for non-EXACT_INSTANT deadlines or missing utcInstant.
 * Returns a negative number if the deadline has passed.
 */
export function msRemainingExact(deadline: Deadline, now: Date = new Date()): number | null {
  if (deadline.kind !== 'EXACT_INSTANT' || !deadline.utcInstant) return null;
  return new Date(deadline.utcInstant).getTime() - now.getTime();
}

/**
 * Calculate days remaining for any actionable deadline.
 *
 * - DATE_ONLY: calendar day difference (local)
 * - EXACT_INSTANT: uses localDate if present, otherwise derives from utcInstant
 * - Others: null
 */
export function daysRemaining(deadline: Deadline, now: Date = new Date()): number | null {
  if (deadline.kind === 'DATE_ONLY') {
    return daysRemainingDateOnly(deadline, now);
  }

  if (deadline.kind === 'EXACT_INSTANT' && deadline.localDate) {
    const todayDate = parseLocalDate(getLocalToday(now));
    const deadlineDate = parseLocalDate(deadline.localDate);
    if (!todayDate || !deadlineDate) return null;
    const diffMs = deadlineDate.getTime() - todayDate.getTime();
    return Math.round(diffMs / (1000 * 60 * 60 * 24));
  }

  return null;
}

/**
 * Sort comparator for opportunities by nearest actionable deadline.
 *
 * Sorting order:
 * 1. Actionable deadlines (EXACT_INSTANT, DATE_ONLY) sorted by date ascending
 * 2. AMBIGUOUS deadlines (need attention)
 * 3. ROLLING deadlines
 * 4. NONE_STATED deadlines
 * 5. CLOSED deadlines (already done)
 */
export function compareDeadlines(a: Deadline, b: Deadline): number {
  const kindOrder: Record<string, number> = {
    EXACT_INSTANT: 0,
    DATE_ONLY: 0,
    AMBIGUOUS: 1,
    ROLLING: 2,
    NONE_STATED: 3,
    CLOSED: 4,
  };

  const aOrder = kindOrder[a.kind] ?? 5;
  const bOrder = kindOrder[b.kind] ?? 5;

  if (aOrder !== bOrder) return aOrder - bOrder;

  // Both are actionable — sort by date
  if (aOrder === 0 && a.localDate && b.localDate) {
    const dateCompare = a.localDate.localeCompare(b.localDate);
    if (dateCompare !== 0) return dateCompare;

    // Same date — if both have utcInstant, compare by time
    if (a.utcInstant && b.utcInstant) {
      return a.utcInstant.localeCompare(b.utcInstant);
    }
    // DATE_ONLY before EXACT_INSTANT (unknown time is riskier)
    if (a.kind === 'DATE_ONLY' && b.kind === 'EXACT_INSTANT') return -1;
    if (a.kind === 'EXACT_INSTANT' && b.kind === 'DATE_ONLY') return 1;
  }

  return 0;
}
