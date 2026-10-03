/**
 * Application status transition logic.
 *
 * Centralizes which status transitions are valid and handles
 * side-effects like setting/clearing appliedAt and archivedAt.
 *
 * Components never mutate status directly — they go through
 * the service layer which uses these functions.
 */

import type { ApplicationStatus, Opportunity } from '@applyalert/contracts';

/**
 * Valid status transitions.
 *
 * From any status, lists which target statuses are allowed.
 */
const VALID_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  SAVED: ['PREPARING', 'APPLIED', 'SKIPPED', 'ARCHIVED'],
  PREPARING: ['SAVED', 'APPLIED', 'SKIPPED', 'ARCHIVED'],
  APPLIED: ['PREPARING', 'ARCHIVED'], // Can go back to PREPARING or to ARCHIVED
  SKIPPED: ['SAVED', 'PREPARING', 'ARCHIVED'],
  ARCHIVED: ['SAVED'], // Can be un-archived back to SAVED
};

/**
 * Check whether a status transition is valid.
 */
export function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  if (from === to) return false;
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

/**
 * Get all valid target statuses from the current status.
 */
export function getValidTransitions(from: ApplicationStatus): readonly ApplicationStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}

/**
 * Error thrown when an invalid status transition is attempted.
 */
export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: ApplicationStatus,
    public readonly to: ApplicationStatus,
  ) {
    super(`Invalid status transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}

/**
 * Apply a status transition to an opportunity, handling timestamp side-effects.
 *
 * Returns a new opportunity object (immutable update).
 *
 * Side-effects:
 * - Moving TO APPLIED: sets appliedAt to now
 * - Moving FROM APPLIED: clears appliedAt
 * - Moving TO ARCHIVED: sets archivedAt to now
 * - Moving FROM ARCHIVED: clears archivedAt
 * - Always updates updatedAt
 *
 * @throws InvalidTransitionError if the transition is not valid
 */
export function applyStatusTransition(
  opportunity: Opportunity,
  newStatus: ApplicationStatus,
  now: Date = new Date(),
): Opportunity {
  if (!isValidTransition(opportunity.status, newStatus)) {
    throw new InvalidTransitionError(opportunity.status, newStatus);
  }

  const timestamp = now.toISOString();
  const wasApplied = opportunity.status === 'APPLIED';
  const becomingApplied = newStatus === 'APPLIED';
  const becomingArchived = newStatus === 'ARCHIVED';
  const wasArchived = opportunity.status === 'ARCHIVED';

  return {
    ...opportunity,
    status: newStatus,
    updatedAt: timestamp,
    appliedAt: becomingApplied ? timestamp : wasApplied ? null : opportunity.appliedAt,
    archivedAt: becomingArchived ? timestamp : wasArchived ? null : opportunity.archivedAt,
  };
}
