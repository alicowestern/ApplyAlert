import { StorageDocumentSchema } from '../src/data/repository/schema';
import { createUnknownDeadline, type Opportunity } from '@applyalert/contracts';
import { v4 as uuidv4 } from 'uuid';

describe('Serialization and Validation', () => {
  it('validates a correct storage document', () => {
    const opp: Opportunity = {
      id: uuidv4(),
      title: 'Valid Opportunity',
      organization: 'Acme Corp',
      opportunityType: 'JOB',
      summary: null,
      location: 'Remote',
      funding: { isFunded: true, details: 'Salary' },
      applicationUrl: 'https://example.com',
      source: { type: 'URL', url: 'https://example.com', rawText: null, fileName: null, mimeType: null, fileRef: null, importedAt: '2027-01-01T00:00:00Z' },
      deadline: createUnknownDeadline(),
      status: 'SAVED',
      createdAt: '2027-01-01T00:00:00Z',
      updatedAt: '2027-01-01T00:00:00Z',
      appliedAt: null,
      archivedAt: null,
    };

    const doc = {
      version: 1,
      opportunities: [opp]
    };

    const result = StorageDocumentSchema.safeParse(doc);
    expect(result.success).toBe(true);
  });

  it('fails validation on missing required fields', () => {
    const doc = {
      version: 1,
      opportunities: [{
        // missing id, title, etc.
        status: 'SAVED'
      }]
    };

    const result = StorageDocumentSchema.safeParse(doc);
    expect(result.success).toBe(false);
  });

  it('fails validation on invalid status', () => {
    const opp: any = {
      id: uuidv4(),
      title: 'Valid Opportunity',
      organization: 'Acme Corp',
      opportunityType: 'JOB',
      summary: null,
      location: 'Remote',
      funding: { isFunded: true, details: 'Salary' },
      applicationUrl: 'https://example.com',
      source: { type: 'URL', url: 'https://example.com', rawText: null, fileName: null, mimeType: null, fileRef: null, importedAt: '2027-01-01T00:00:00Z' },
      deadline: createUnknownDeadline(),
      status: 'INVALID_STATUS', // <--- Invalid
      createdAt: '2027-01-01T00:00:00Z',
      updatedAt: '2027-01-01T00:00:00Z',
      appliedAt: null,
      archivedAt: null,
    };

    const doc = {
      version: 1,
      opportunities: [opp]
    };

    const result = StorageDocumentSchema.safeParse(doc);
    expect(result.success).toBe(false);
  });
});
