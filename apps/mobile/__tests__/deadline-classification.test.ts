import { classifyDeadline, URGENCY_THRESHOLDS } from '../src/domain/deadline-classification';
import { createUnknownDeadline, type Deadline } from '@applyalert/contracts';

describe('Deadline Classification', () => {
  const mockNow = new Date('2027-01-15T12:00:00.000Z');
  const baseDeadline = createUnknownDeadline();

  // Helper to create a DATE_ONLY deadline relative to mockNow
  const createRelative = (daysDiff: number): Deadline => {
    const d = new Date(mockNow);
    d.setDate(d.getDate() + daysDiff);
    
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    
    return {
      ...baseDeadline,
      kind: 'DATE_ONLY',
      localDate: `${y}-${m}-${day}`,
    };
  };

  it('classifies expired as OVERDUE', () => {
    expect(classifyDeadline(createRelative(-1), mockNow)).toBe('OVERDUE');
  });

  it('classifies today as TODAY', () => {
    expect(classifyDeadline(createRelative(0), mockNow)).toBe('TODAY');
  });

  it('classifies within urgent threshold as URGENT', () => {
    expect(classifyDeadline(createRelative(URGENCY_THRESHOLDS.urgent), mockNow)).toBe('URGENT');
  });

  it('classifies within soon threshold as SOON', () => {
    expect(classifyDeadline(createRelative(URGENCY_THRESHOLDS.soon), mockNow)).toBe('SOON');
  });

  it('classifies beyond soon threshold as UPCOMING', () => {
    expect(classifyDeadline(createRelative(URGENCY_THRESHOLDS.soon + 1), mockNow)).toBe('UPCOMING');
  });

  it('classifies ROLLING as ROLLING', () => {
    expect(classifyDeadline({ ...baseDeadline, kind: 'ROLLING' }, mockNow)).toBe('ROLLING');
  });

  it('classifies AMBIGUOUS as AMBIGUOUS', () => {
    expect(classifyDeadline({ ...baseDeadline, kind: 'AMBIGUOUS' }, mockNow)).toBe('AMBIGUOUS');
  });

  it('classifies CLOSED as OVERDUE', () => {
    expect(classifyDeadline({ ...baseDeadline, kind: 'CLOSED' }, mockNow)).toBe('OVERDUE');
  });
});
