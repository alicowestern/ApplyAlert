import { applyStatusTransition, isValidTransition, InvalidTransitionError } from '../src/domain/status-transitions';
import type { Opportunity } from '@applyalert/contracts';
import { createUnknownDeadline } from '@applyalert/contracts';
import { v4 as uuidv4 } from 'uuid';

describe('Status Transitions', () => {
  const baseOpportunity: Opportunity = {
    id: uuidv4(),
    title: 'Test',
    organization: null,
    opportunityType: 'OTHER',
    summary: null,
    location: null,
    funding: null,
    applicationUrl: null,
    source: { type: 'MANUAL', url: null, rawText: null, fileName: null, mimeType: null, fileRef: null, importedAt: '2027-01-01T00:00:00Z' },
    deadline: createUnknownDeadline(),
    status: 'SAVED',
    createdAt: '2027-01-01T00:00:00Z',
    updatedAt: '2027-01-01T00:00:00Z',
    appliedAt: null,
    archivedAt: null,
  };

  const mockNow = new Date('2027-01-15T12:00:00.000Z');

  it('allows valid transitions', () => {
    expect(isValidTransition('SAVED', 'PREPARING')).toBe(true);
    expect(isValidTransition('PREPARING', 'APPLIED')).toBe(true);
  });

  it('prevents invalid transitions', () => {
    expect(isValidTransition('SAVED', 'SAVED')).toBe(false);
  });

  it('updates appliedAt when transitioning to APPLIED', () => {
    const updated = applyStatusTransition(baseOpportunity, 'APPLIED', mockNow);
    expect(updated.status).toBe('APPLIED');
    expect(updated.appliedAt).toBe(mockNow.toISOString());
    expect(updated.updatedAt).toBe(mockNow.toISOString());
  });

  it('clears appliedAt when transitioning back from APPLIED', () => {
    const appliedOpp = { ...baseOpportunity, status: 'APPLIED' as const, appliedAt: '2027-01-10T00:00:00Z' };
    const updated = applyStatusTransition(appliedOpp, 'PREPARING', mockNow);
    expect(updated.status).toBe('PREPARING');
    expect(updated.appliedAt).toBeNull();
  });

  it('throws on invalid transition', () => {
    expect(() => applyStatusTransition(baseOpportunity, 'SAVED', mockNow)).toThrow(InvalidTransitionError);
  });
});
