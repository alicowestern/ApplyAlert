import { ApiClient, ApiClientError } from '../src/data/services/api/ApiClient';
import { CreateOpportunityDto, Opportunity } from '@applyalert/contracts';

describe('ApiClient', () => {
  let mockFetch: jest.Mock;
  let client: ApiClient;

  beforeEach(() => {
    mockFetch = jest.fn();
    client = new ApiClient({
      baseUrl: 'http://api.applyalert.local/api/v1',
      devUserId: 'test-user-123',
      fetchFn: mockFetch,
    });
  });

  it('sends correct headers and serializes CreateOpportunityDto', async () => {
    const dto: CreateOpportunityDto = {
      title: 'Full Stack Fellowship',
      opportunityType: 'FELLOWSHIP',
      organization: 'Tech Org',
      summary: 'A 6-month fellowship',
      location: 'Remote',
      funding: { isFunded: true, details: '$5000 stipend' },
      applicationUrl: 'https://example.com/apply',
      source: {
        type: 'MANUAL',
        url: null,
        rawText: null,
        fileName: null,
        mimeType: null,
        fileRef: null,
        importedAt: '2026-10-04T00:00:00.000Z',
      },
      deadline: {
        kind: 'DATE_ONLY',
        originalText: 'Due Nov 30, 2026',
        localDate: '2026-11-30',
        localTime: null,
        timezone: null,
        utcInstant: null,
        confidence: 1.0,
        userConfirmed: true,
        evidence: null,
        alternativeCandidates: [],
      },
      status: 'SAVED',
    };

    const mockResponseOpportunity: Opportunity = {
      ...dto,
      id: 'mock-uuid-1',
      createdAt: '2026-10-04T00:00:00.000Z',
      updatedAt: '2026-10-04T00:00:00.000Z',
      appliedAt: null,
      archivedAt: null,
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 201,
      json: async () => ({
        success: true,
        data: mockResponseOpportunity,
        error: null,
      }),
    });

    const result = await client.createOpportunity(dto);

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('http://api.applyalert.local/api/v1/opportunities');
    expect(init.method).toBe('POST');

    const headers = init.headers as Headers;
    expect(headers.get('Content-Type')).toBe('application/json');
    expect(headers.get('x-dev-user-id')).toBe('test-user-123');

    const sentBody = JSON.parse(init.body as string);
    expect(sentBody.title).toBe('Full Stack Fellowship');
    expect(sentBody.deadline.kind).toBe('DATE_ONLY');
    expect(sentBody.deadline.localDate).toBe('2026-11-30');

    expect(result.id).toBe('mock-uuid-1');
    expect(result.deadline.localDate).toBe('2026-11-30');
  });

  it('builds query parameters correctly for listOpportunities', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        success: true,
        data: {
          items: [],
          nextCursor: null,
          hasMore: false,
        },
        error: null,
      }),
    });

    await client.listOpportunities({
      status: 'PREPARING',
      archived: false,
      limit: 15,
      cursor: 'cursor-abc',
      sort: 'deadline',
    });

    const [url] = mockFetch.mock.calls[0];
    const parsedUrl = new URL(url);
    expect(parsedUrl.pathname).toBe('/api/v1/opportunities');
    expect(parsedUrl.searchParams.get('status')).toBe('PREPARING');
    expect(parsedUrl.searchParams.get('archived')).toBe('false');
    expect(parsedUrl.searchParams.get('limit')).toBe('15');
    expect(parsedUrl.searchParams.get('cursor')).toBe('cursor-abc');
    expect(parsedUrl.searchParams.get('sort')).toBe('deadline');
  });

  it('throws ApiClientError when API returns structured error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 400,
      json: async () => ({
        success: false,
        data: null,
        error: {
          code: 'INVALID_STATUS_TRANSITION',
          message: 'Cannot transition from SAVED to SAVED',
          requestId: 'req-123',
        },
      }),
    });

    await expect(client.updateStatus('some-id', 'SAVED')).rejects.toThrow(ApiClientError);

    try {
      await client.updateStatus('some-id', 'SAVED');
      fail('Expected client.updateStatus to throw');
    } catch (e) {
      const err = e as ApiClientError;
      expect(err.code).toBe('INVALID_STATUS_TRANSITION');
      expect(err.message).toBe('Cannot transition from SAVED to SAVED');
      expect(err.status).toBe(400);
      expect(err.requestId).toBe('req-123');
    }
  });

  it('handles 204 No Content for deleteOpportunity', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 204,
    });

    await expect(client.deleteOpportunity('opp-123')).resolves.toBeUndefined();
    const [url, init] = mockFetch.mock.calls[0];
    expect(url).toBe('http://api.applyalert.local/api/v1/opportunities/opp-123');
    expect(init.method).toBe('DELETE');
  });
});
