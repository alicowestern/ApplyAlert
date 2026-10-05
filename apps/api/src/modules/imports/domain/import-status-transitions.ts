/**
 * Import status transitions — centralized state machine.
 *
 * No controller or screen should assign arbitrary statuses.
 * All transitions go through this module.
 */

import type { ImportStatus } from '@applyalert/contracts';

export const VALID_TRANSITIONS: Record<ImportStatus, readonly ImportStatus[]> = {
  PENDING: ['PROCESSING', 'CANCELLED', 'FAILED'],
  PROCESSING: ['READY_FOR_EXTRACTION', 'FAILED', 'CANCELLED'],
  READY_FOR_EXTRACTION: [], // Terminal state for Task 5
  FAILED: ['PENDING'],      // Allow retry: FAILED → PENDING → PROCESSING
  CANCELLED: [],             // Terminal
};

export function isValidImportTransition(from: ImportStatus, to: ImportStatus): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

export const canTransitionImport = isValidImportTransition;

export function assertValidImportTransition(from: ImportStatus, to: ImportStatus): void {
  if (!isValidImportTransition(from, to)) {
    throw new Error(`Invalid import status transition: ${from} → ${to}`);
  }
}
