import {
  canTransitionImport,
  assertValidImportTransition,
} from './import-status-transitions';
import type { ImportStatus } from '@applyalert/contracts';

describe('Import Status Transitions State Machine', () => {
  it('allows valid transitions from PENDING', () => {
    expect(canTransitionImport('PENDING', 'PROCESSING')).toBe(true);
    expect(canTransitionImport('PENDING', 'CANCELLED')).toBe(true);
    expect(canTransitionImport('PENDING', 'FAILED')).toBe(true);
    expect(canTransitionImport('PENDING', 'READY_FOR_EXTRACTION')).toBe(false);
  });

  it('allows valid transitions from PROCESSING', () => {
    expect(canTransitionImport('PROCESSING', 'READY_FOR_EXTRACTION')).toBe(true);
    expect(canTransitionImport('PROCESSING', 'FAILED')).toBe(true);
    expect(canTransitionImport('PROCESSING', 'CANCELLED')).toBe(true);
    expect(canTransitionImport('PROCESSING', 'PENDING')).toBe(false);
  });

  it('treats terminal states as immutable (no outbound transitions)', () => {
    const terminalStates: ImportStatus[] = ['READY_FOR_EXTRACTION', 'CANCELLED'];
    const allStates: ImportStatus[] = [
      'PENDING',
      'PROCESSING',
      'READY_FOR_EXTRACTION',
      'FAILED',
      'CANCELLED',
    ];

    for (const terminal of terminalStates) {
      for (const target of allStates) {
        expect(canTransitionImport(terminal, target)).toBe(false);
      }
    }
  });

  it('allows retry from FAILED to PENDING', () => {
    expect(canTransitionImport('FAILED', 'PENDING')).toBe(true);
    expect(canTransitionImport('FAILED', 'PROCESSING')).toBe(false);
    expect(canTransitionImport('FAILED', 'READY_FOR_EXTRACTION')).toBe(false);
  });

  it('assertValidImportTransition throws descriptive error on invalid transition', () => {
    expect(() =>
      assertValidImportTransition('READY_FOR_EXTRACTION', 'PROCESSING'),
    ).toThrow('Invalid import status transition');
  });

  it('assertValidImportTransition does not throw on valid transition', () => {
    expect(() =>
      assertValidImportTransition('PROCESSING', 'READY_FOR_EXTRACTION'),
    ).not.toThrow();
  });
});
