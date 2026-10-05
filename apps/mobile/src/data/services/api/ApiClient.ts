import { Platform } from 'react-native';
import {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  ApplicationStatus,
  PaginatedResponse,
  ListOpportunitiesQuery,
  ApiResponse,
  ApiError,
  ImportResponseDto,
  CreateTextImportDto,
  CreateUrlImportDto,
  ListImportsQuery,
} from '@applyalert/contracts';

declare const process: {
  env?: Record<string, string | undefined>;
} | undefined;

export interface ApiClientConfig {
  baseUrl?: string;
  devUserId?: string;
  fetchFn?: typeof fetch;
}

export class ApiClientError extends Error {
  readonly code: string;
  readonly status?: number;
  readonly details?: Record<string, unknown>;
  readonly requestId?: string;

  constructor(
    code: string,
    message: string,
    status?: number,
    details?: Record<string, unknown>,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiClientError';
    this.code = code;
    this.status = status;
    this.details = details;
    this.requestId = requestId;
    Object.setPrototypeOf(this, ApiClientError.prototype);
  }
}

export function getDefaultBaseUrl(): string {
  const envUrl = typeof process !== 'undefined' ? process?.env?.EXPO_PUBLIC_API_URL : undefined;
  if (envUrl) {
    return envUrl;
  }
  // Android emulator requires 10.0.2.2 to reach host machine localhost
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000/api/v1';
  }
  return 'http://localhost:3000/api/v1';
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly devUserId: string;
  private readonly fetch: typeof fetch;

  constructor(config: ApiClientConfig = {}) {
    this.baseUrl = (config.baseUrl || getDefaultBaseUrl()).replace(/\/+$/, '');
    this.devUserId = config.devUserId || 'dev-user-id';
    this.fetch = config.fetchFn || fetch.bind(globalThis);
  }

  private async request<T>(
    path: string,
    options: RequestInit = {},
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = new Headers(options.headers);

    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (!headers.has('Content-Type') && options.body && !isFormData) {
      headers.set('Content-Type', 'application/json');
    }
    if (!headers.has('Accept')) {
      headers.set('Accept', 'application/json');
    }
    if (this.devUserId) {
      headers.set('x-dev-user-id', this.devUserId);
    }

    const response = await this.fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 204) {
      return undefined as unknown as T;
    }

    let json: ApiResponse<T>;
    try {
      json = (await response.json()) as ApiResponse<T>;
    } catch {
      throw new ApiClientError(
        'HTTP_ERROR',
        `Request failed with HTTP status ${response.status}`,
        response.status,
      );
    }

    if (!response.ok || !json.success) {
      const err = json?.error as ApiError | undefined;
      throw new ApiClientError(
        err?.code || 'API_ERROR',
        err?.message || `Request failed with HTTP status ${response.status}`,
        response.status,
        err?.details,
        err?.requestId,
      );
    }

    return json.data;
  }

  // ─── Opportunities ─────────────────────────────────────────────

  async createOpportunity(dto: CreateOpportunityDto): Promise<Opportunity> {
    return this.request<Opportunity>('/opportunities', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async listOpportunities(query: ListOpportunitiesQuery = {}): Promise<PaginatedResponse<Opportunity>> {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.archived !== undefined) params.set('archived', String(query.archived));
    if (query.search) params.set('search', query.search);
    if (query.sort) params.set('sort', query.sort);
    if (query.limit) params.set('limit', String(query.limit));
    if (query.cursor) params.set('cursor', query.cursor);

    const queryString = params.toString();
    const path = `/opportunities${queryString ? `?${queryString}` : ''}`;
    return this.request<PaginatedResponse<Opportunity>>(path, {
      method: 'GET',
    });
  }

  async getOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  }

  async updateOpportunity(id: string, dto: UpdateOpportunityDto): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${encodeURIComponent(id)}`, {
      method: 'PATCH',
      body: JSON.stringify(dto),
    });
  }

  async updateStatus(id: string, status: ApplicationStatus): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${encodeURIComponent(id)}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  async archiveOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${encodeURIComponent(id)}/archive`, {
      method: 'POST',
    });
  }

  async restoreOpportunity(id: string): Promise<Opportunity> {
    return this.request<Opportunity>(`/opportunities/${encodeURIComponent(id)}/restore`, {
      method: 'POST',
    });
  }

  async deleteOpportunity(id: string): Promise<void> {
    return this.request<void>(`/opportunities/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    });
  }

  // ─── Imports ───────────────────────────────────────────────────

  async createTextImport(dto: CreateTextImportDto): Promise<ImportResponseDto> {
    return this.request<ImportResponseDto>('/imports/text', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async createUrlImport(dto: CreateUrlImportDto): Promise<ImportResponseDto> {
    return this.request<ImportResponseDto>('/imports/url', {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }

  async createFileImport(formData: FormData): Promise<ImportResponseDto> {
    return this.request<ImportResponseDto>('/imports/file', {
      method: 'POST',
      body: formData,
    });
  }

  async getImport(id: string): Promise<ImportResponseDto> {
    return this.request<ImportResponseDto>(`/imports/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  }

  async listImports(
    query: ListImportsQuery = {},
  ): Promise<{ items: ImportResponseDto[]; nextCursor: string | null }> {
    const params = new URLSearchParams();
    if (query.status) params.set('status', query.status);
    if (query.limit) params.set('limit', String(query.limit));
    if (query.cursor) params.set('cursor', query.cursor);

    const queryString = params.toString();
    const path = `/imports${queryString ? `?${queryString}` : ''}`;
    return this.request<{ items: ImportResponseDto[]; nextCursor: string | null }>(path, {
      method: 'GET',
    });
  }

  async cancelImport(id: string): Promise<ImportResponseDto> {
    return this.request<ImportResponseDto>(`/imports/${encodeURIComponent(id)}/cancel`, {
      method: 'POST',
    });
  }

  // ─── Extractions ───────────────────────────────────────────────

  async triggerExtraction(importId: string, input: any): Promise<{ success: boolean; data: { id: string; status: string } }> {
    return this.request<any>(`/imports/${encodeURIComponent(importId)}/extract`, {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getExtraction(id: string): Promise<any> {
    return this.request<any>(`/extractions/${encodeURIComponent(id)}`, {
      method: 'GET',
    });
  }

  async confirmExtraction(id: string, dto: any): Promise<any> {
    return this.request<any>(`/extractions/${encodeURIComponent(id)}/confirm`, {
      method: 'POST',
      body: JSON.stringify(dto),
    });
  }
}

export const defaultApiClient = new ApiClient();

