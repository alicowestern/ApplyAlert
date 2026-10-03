import { createUnknownDeadline } from '@applyalert/contracts';
import type { Deadline, DeadlineKind } from '@applyalert/contracts';

describe('Deadline domain type', () => {
  describe('createUnknownDeadline', () => {
    it('creates a deadline with NONE_STATED kind', () => {
      const deadline = createUnknownDeadline();
      expect(deadline.kind).toBe('NONE_STATED');
    });

    it('has zero confidence', () => {
      const deadline = createUnknownDeadline();
      expect(deadline.confidence).toBe(0);
    });

    it('is not user confirmed', () => {
      const deadline = createUnknownDeadline();
      expect(deadline.userConfirmed).toBe(false);
    });

    it('has null time components', () => {
      const deadline = createUnknownDeadline();
      expect(deadline.localDate).toBeNull();
      expect(deadline.localTime).toBeNull();
      expect(deadline.timezone).toBeNull();
      expect(deadline.utcInstant).toBeNull();
    });

    it('has empty alternative candidates', () => {
      const deadline = createUnknownDeadline();
      expect(deadline.alternativeCandidates).toEqual([]);
    });
  });

  describe('DeadlineKind values', () => {
    it('accepts all valid kinds', () => {
      const kinds: DeadlineKind[] = [
        'EXACT_INSTANT',
        'DATE_ONLY',
        'ROLLING',
        'NONE_STATED',
        'AMBIGUOUS',
        'CLOSED',
      ];
      // If this compiles, the types are correct
      expect(kinds).toHaveLength(6);
    });
  });

  describe('Deadline structure', () => {
    it('represents an exact instant deadline correctly', () => {
      const deadline: Deadline = {
        kind: 'EXACT_INSTANT',
        originalText: 'Applications close January 15, 2027 at 11:59 PM EST',
        localDate: '2027-01-15',
        localTime: '23:59:00',
        timezone: 'America/New_York',
        utcInstant: '2027-01-16T04:59:00Z',
        confidence: 0.95,
        userConfirmed: false,
        evidence: 'Applications close January 15, 2027 at 11:59 PM EST. Late submissions will not be accepted.',
        alternativeCandidates: [],
      };

      expect(deadline.kind).toBe('EXACT_INSTANT');
      expect(deadline.utcInstant).toBe('2027-01-16T04:59:00Z');
      expect(deadline.confidence).toBe(0.95);
    });

    it('represents a date-only deadline without fabricating time', () => {
      const deadline: Deadline = {
        kind: 'DATE_ONLY',
        originalText: 'Deadline: March 1, 2027',
        localDate: '2027-03-01',
        localTime: null, // NOT "23:59:00" â€” we never fabricate
        timezone: null,
        utcInstant: null, // Cannot compute without time + timezone
        confidence: 0.9,
        userConfirmed: false,
        evidence: 'Deadline: March 1, 2027',
        alternativeCandidates: [],
      };

      expect(deadline.localTime).toBeNull();
      expect(deadline.utcInstant).toBeNull();
    });
  });
});
