import {
  isActionableDeadline,
  isExpired,
  isToday,
  daysRemaining,
  compareDeadlines,
} from '../src/domain/deadline-utils';
import { createUnknownDeadline, type Deadline } from '@applyalert/contracts';

describe('Deadline Utilities', () => {
  // Use a fixed "now" for deterministic tests
  // Fixed "now": 2027-01-15T12:00:00.000Z
  const mockNow = new Date('2027-01-15T12:00:00.000Z');

  const baseDeadline = createUnknownDeadline();

  const exactFuture: Deadline = {
    ...baseDeadline,
    kind: 'EXACT_INSTANT',
    utcInstant: '2027-01-20T17:00:00Z',
    localDate: '2027-01-20',
  };

  const exactPast: Deadline = {
    ...baseDeadline,
    kind: 'EXACT_INSTANT',
    utcInstant: '2027-01-10T17:00:00Z',
    localDate: '2027-01-10',
  };

  const dateOnlyToday: Deadline = {
    ...baseDeadline,
    kind: 'DATE_ONLY',
    localDate: '2027-01-15', // Same day as mockNow locally
  };

  const dateOnlyTomorrow: Deadline = {
    ...baseDeadline,
    kind: 'DATE_ONLY',
    localDate: '2027-01-16',
  };

  const dateOnlyPast: Deadline = {
    ...baseDeadline,
    kind: 'DATE_ONLY',
    localDate: '2027-01-14',
  };

  const rolling: Deadline = {
    ...baseDeadline,
    kind: 'ROLLING',
  };

  const closed: Deadline = {
    ...baseDeadline,
    kind: 'CLOSED',
  };

  describe('isActionableDeadline', () => {
    it('returns true for EXACT_INSTANT and DATE_ONLY', () => {
      expect(isActionableDeadline(exactFuture)).toBe(true);
      expect(isActionableDeadline(dateOnlyToday)).toBe(true);
    });

    it('returns false for others', () => {
      expect(isActionableDeadline(rolling)).toBe(false);
      expect(isActionableDeadline(closed)).toBe(false);
      expect(isActionableDeadline(baseDeadline)).toBe(false);
    });
  });

  describe('isExpired', () => {
    it('EXACT_INSTANT semantics', () => {
      expect(isExpired(exactPast, mockNow)).toBe(true);
      expect(isExpired(exactFuture, mockNow)).toBe(false);
    });

    it('DATE_ONLY semantics (local calendar date)', () => {
      expect(isExpired(dateOnlyPast, mockNow)).toBe(true); // Yesterday is expired
      expect(isExpired(dateOnlyToday, mockNow)).toBe(false); // Today is NOT expired
      expect(isExpired(dateOnlyTomorrow, mockNow)).toBe(false); // Tomorrow is NOT expired
    });

    it('CLOSED is always expired', () => {
      expect(isExpired(closed, mockNow)).toBe(true);
    });

    it('ROLLING is never expired', () => {
      expect(isExpired(rolling, mockNow)).toBe(false);
    });
  });

  describe('isToday', () => {
    it('returns true if localDate matches today', () => {
      expect(isToday(dateOnlyToday, mockNow)).toBe(true);
      expect(isToday(dateOnlyTomorrow, mockNow)).toBe(false);
    });
  });

  describe('daysRemaining', () => {
    it('calculates days for DATE_ONLY correctly', () => {
      expect(daysRemaining(dateOnlyToday, mockNow)).toBe(0);
      expect(daysRemaining(dateOnlyTomorrow, mockNow)).toBe(1);
      expect(daysRemaining(dateOnlyPast, mockNow)).toBe(-1);
    });

    it('returns null for non-actionable', () => {
      expect(daysRemaining(rolling, mockNow)).toBeNull();
    });
  });

  describe('compareDeadlines', () => {
    it('sorts actionable first, then others', () => {
      const sorted = [rolling, exactFuture, closed, dateOnlyToday].sort(compareDeadlines);
      
      expect(sorted[0]?.kind).toBe('DATE_ONLY'); // earliest actionable
      expect(sorted[1]?.kind).toBe('EXACT_INSTANT'); // later actionable
      expect(sorted[2]?.kind).toBe('ROLLING');
      expect(sorted[3]?.kind).toBe('CLOSED');
    });

    it('sorts DATE_ONLY before EXACT_INSTANT on the same day', () => {
      const exactSameDay: Deadline = {
        ...baseDeadline,
        kind: 'EXACT_INSTANT',
        localDate: '2027-01-15',
        utcInstant: '2027-01-15T23:59:00Z',
      };
      
      const sorted = [exactSameDay, dateOnlyToday].sort(compareDeadlines);
      expect(sorted[0]?.kind).toBe('DATE_ONLY');
    });
  });
});
