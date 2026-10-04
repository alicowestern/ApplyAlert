import { ApplicationStatus } from '@applyalert/contracts';

const VALID_TRANSITIONS: Record<ApplicationStatus, readonly ApplicationStatus[]> = {
  SAVED: ['PREPARING', 'APPLIED', 'SKIPPED', 'ARCHIVED'],
  PREPARING: ['SAVED', 'APPLIED', 'SKIPPED', 'ARCHIVED'],
  APPLIED: ['PREPARING', 'ARCHIVED'],
  SKIPPED: ['SAVED', 'PREPARING', 'ARCHIVED'],
  ARCHIVED: ['SAVED'],
};

export function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  if (from === to) return false;
  return (VALID_TRANSITIONS[from] ?? []).includes(to);
}

export function getValidTransitions(from: ApplicationStatus): readonly ApplicationStatus[] {
  return VALID_TRANSITIONS[from] ?? [];
}

export class InvalidTransitionError extends Error {
  constructor(
    public readonly from: ApplicationStatus,
    public readonly to: ApplicationStatus,
  ) {
    super(`Invalid status transition: ${from} → ${to}`);
    this.name = 'InvalidTransitionError';
  }
}
