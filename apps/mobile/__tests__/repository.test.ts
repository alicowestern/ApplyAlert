import { MmkvOpportunityRepository } from '../src/data/repository/MmkvOpportunityRepository';
import { createUnknownDeadline, type Opportunity } from '@applyalert/contracts';
import { v4 as uuidv4 } from 'uuid';

// Mock react-native-mmkv
jest.mock('react-native-mmkv', () => {
  return {
    createMMKV: jest.fn(() => {
      let store: Record<string, string> = {};
      return {
        set: jest.fn((key: string, value: string) => {
          store[key] = value;
        }),
        getString: jest.fn((key: string) => {
          return store[key] || undefined;
        }),
        clearAll: jest.fn(() => {
          store = {};
        }),
      };
    }),
  };
});

describe('MmkvOpportunityRepository CRUD', () => {
  let repository: MmkvOpportunityRepository;

  beforeEach(() => {
    repository = new MmkvOpportunityRepository();
  });

  const createMockOpp = (id: string): Opportunity => ({
    id,
    title: 'Test',
    organization: 'Test Org',
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
  });

  it('can create and retrieve an opportunity', async () => {
    const opp = createMockOpp(uuidv4());
    
    const createResult = await repository.create(opp);
    expect(createResult.ok).toBe(true);

    const getResult = await repository.getById(opp.id);
    expect(getResult.ok).toBe(true);
    if (getResult.ok) {
      expect(getResult.value).toEqual(opp);
    }
  });

  it('can list all opportunities', async () => {
    const opp1 = createMockOpp(uuidv4());
    const opp2 = createMockOpp(uuidv4());
    
    await repository.create(opp1);
    await repository.create(opp2);

    const listResult = await repository.listAll();
    expect(listResult.ok).toBe(true);
    if (listResult.ok) {
      expect(listResult.value).toHaveLength(2);
      expect(listResult.value.map(o => o.id)).toContain(opp1.id);
      expect(listResult.value.map(o => o.id)).toContain(opp2.id);
    }
  });

  it('can update an opportunity', async () => {
    const opp = createMockOpp(uuidv4());
    await repository.create(opp);

    const updatedOpp = { ...opp, title: 'Updated Title' };
    const updateResult = await repository.update(updatedOpp);
    expect(updateResult.ok).toBe(true);

    const getResult = await repository.getById(opp.id);
    expect(getResult.ok).toBe(true);
    if (getResult.ok) {
      expect(getResult.value?.title).toBe('Updated Title');
    }
  });

  it('can delete an opportunity', async () => {
    const opp = createMockOpp(uuidv4());
    await repository.create(opp);

    const deleteResult = await repository.delete(opp.id);
    expect(deleteResult.ok).toBe(true);

    const getResult = await repository.getById(opp.id);
    expect(getResult.ok).toBe(true);
    if (getResult.ok) {
      expect(getResult.value).toBeNull();
    }
  });

  it('returns error when updating non-existent opportunity', async () => {
    const opp = createMockOpp(uuidv4());
    const updateResult = await repository.update(opp);
    expect(updateResult.ok).toBe(false);
  });
});
