/**
 * SyncService — orchestrates pushing local changes to the backend
 * and pulling remote changes to local storage.
 *
 * Strategy:
 * 1. PUSH: Process the sync queue (local mutations → API)
 * 2. PULL: Fetch latest from API → merge into MMKV
 *
 * Conflict resolution: server wins (last-write-wins based on updatedAt).
 * This is acceptable for a single-user app where the mobile device
 * is the primary input source.
 */

import type { Opportunity } from '@applyalert/contracts';
import { ApiClient, ApiClientError } from '../services/api/ApiClient';
import { syncQueue, type SyncOperation } from './SyncQueue';
import { opportunityRepository } from '../repository';

export interface SyncResult {
  /** Number of operations successfully pushed */
  pushed: number;
  /** Number of operations that failed */
  pushFailed: number;
  /** Number of remote items pulled/merged */
  pulled: number;
  /** Whether sync completed without errors */
  success: boolean;
  /** Error details for failed operations */
  errors: string[];
}

export class SyncService {
  private readonly apiClient: ApiClient;
  private syncing = false;

  constructor(apiClient?: ApiClient) {
    this.apiClient = apiClient || new ApiClient();
  }

  /**
   * Check if a sync is currently in progress.
   */
  isSyncing(): boolean {
    return this.syncing;
  }

  /**
   * Perform a full sync cycle: push local changes, then pull remote state.
   */
  async sync(): Promise<SyncResult> {
    if (this.syncing) {
      return {
        pushed: 0,
        pushFailed: 0,
        pulled: 0,
        success: false,
        errors: ['Sync already in progress'],
      };
    }

    this.syncing = true;
    const result: SyncResult = {
      pushed: 0,
      pushFailed: 0,
      pulled: 0,
      success: true,
      errors: [],
    };

    try {
      // Phase 1: Push local changes
      const pushResult = await this.pushChanges();
      result.pushed = pushResult.pushed;
      result.pushFailed = pushResult.failed;
      result.errors.push(...pushResult.errors);

      // Phase 2: Pull remote state
      const pullResult = await this.pullChanges();
      result.pulled = pullResult.pulled;
      result.errors.push(...pullResult.errors);

      result.success = result.pushFailed === 0 && pullResult.errors.length === 0;
    } catch (e) {
      result.success = false;
      result.errors.push(e instanceof Error ? e.message : 'Unknown sync error');
    } finally {
      this.syncing = false;
    }

    return result;
  }

  /**
   * Push only — process the sync queue without pulling.
   * Useful for fire-and-forget after local mutations.
   */
  async pushOnly(): Promise<{ pushed: number; failed: number; errors: string[] }> {
    if (this.syncing) {
      return { pushed: 0, failed: 0, errors: ['Sync already in progress'] };
    }

    this.syncing = true;
    try {
      return await this.pushChanges();
    } finally {
      this.syncing = false;
    }
  }

  /**
   * Process all pending sync queue operations.
   */
  private async pushChanges(): Promise<{ pushed: number; failed: number; errors: string[] }> {
    const operations = syncQueue.getAll();
    let pushed = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const op of operations) {
      try {
        await this.processOperation(op);
        syncQueue.dequeue(op.id);
        pushed++;
      } catch (e) {
        const errorMsg = e instanceof Error ? e.message : 'Unknown error';
        const shouldRetry = syncQueue.markFailed(op.id, errorMsg);
        failed++;

        if (!shouldRetry) {
          errors.push(`Operation ${op.type} for ${op.opportunityId} exhausted retries: ${errorMsg}`);
        }

        // If it's a network error, stop processing — no point trying remaining ops
        if (this.isNetworkError(e)) {
          errors.push('Network unavailable, stopping push');
          break;
        }
      }
    }

    // Prune exhausted operations
    const exhausted = syncQueue.pruneExhausted();
    for (const op of exhausted) {
      errors.push(`Dropped ${op.type} for ${op.opportunityId} after ${op.retryCount} retries`);
    }

    return { pushed, failed, errors };
  }

  /**
   * Execute a single sync operation against the API.
   */
  private async processOperation(op: SyncOperation): Promise<void> {
    switch (op.type) {
      case 'CREATE':
        if (!op.payload) throw new Error('CREATE operation missing payload');
        await this.apiClient.createOpportunity({
          title: op.payload.title,
          organization: op.payload.organization,
          opportunityType: op.payload.opportunityType,
          summary: op.payload.summary,
          location: op.payload.location,
          funding: op.payload.funding,
          applicationUrl: op.payload.applicationUrl,
          deadline: op.payload.deadline,
          source: op.payload.source,
          status: op.payload.status,
        });
        break;

      case 'UPDATE':
        if (!op.payload) throw new Error('UPDATE operation missing payload');
        await this.apiClient.updateOpportunity(op.opportunityId, {
          title: op.payload.title,
          organization: op.payload.organization,
          opportunityType: op.payload.opportunityType,
          summary: op.payload.summary,
          location: op.payload.location,
          funding: op.payload.funding,
          applicationUrl: op.payload.applicationUrl,
          deadline: op.payload.deadline,
        });
        break;

      case 'STATUS_CHANGE':
        if (!op.newStatus) throw new Error('STATUS_CHANGE operation missing newStatus');
        await this.apiClient.updateStatus(op.opportunityId, op.newStatus);
        break;

      case 'ARCHIVE':
        await this.apiClient.archiveOpportunity(op.opportunityId);
        break;

      case 'RESTORE':
        await this.apiClient.restoreOpportunity(op.opportunityId);
        break;

      case 'DELETE':
        try {
          await this.apiClient.deleteOpportunity(op.opportunityId);
        } catch (e) {
          // If the item is already gone on the server (404), that's fine
          if (e instanceof ApiClientError && e.status === 404) {
            return;
          }
          throw e;
        }
        break;

      default:
        throw new Error(`Unknown sync operation type: ${(op as SyncOperation).type}`);
    }
  }

  /**
   * Pull latest state from the server and merge into local storage.
   * Server wins on conflicts (based on updatedAt comparison).
   */
  private async pullChanges(): Promise<{ pulled: number; errors: string[] }> {
    let pulled = 0;
    const errors: string[] = [];

    try {
      // Fetch all remote opportunities (paginated)
      const remoteOpps: Opportunity[] = [];
      let cursor: string | undefined;
      let hasMore = true;

      while (hasMore) {
        const page = await this.apiClient.listOpportunities({
          limit: 100,
          cursor,
        });
        remoteOpps.push(...page.items);
        hasMore = page.hasMore;
        cursor = page.nextCursor ?? undefined;
      }

      // Fetch also archived
      cursor = undefined;
      hasMore = true;
      while (hasMore) {
        const page = await this.apiClient.listOpportunities({
          limit: 100,
          cursor,
          archived: true,
        });
        remoteOpps.push(...page.items);
        hasMore = page.hasMore;
        cursor = page.nextCursor ?? undefined;
      }

      // Get local state
      const localResult = await opportunityRepository.listAll();
      if (!localResult.ok) {
        errors.push(`Failed to read local store: ${localResult.error.message}`);
        return { pulled, errors };
      }
      const localOpps = localResult.value;
      const localMap = new Map(localOpps.map(o => [o.id, o]));

      // Merge: for each remote item, update local if remote is newer
      for (const remote of remoteOpps) {
        const local = localMap.get(remote.id);

        if (!local) {
          // New item from server — add locally
          const createResult = await opportunityRepository.create(remote);
          if (createResult.ok) pulled++;
          else errors.push(`Failed to create local copy of ${remote.id}`);
        } else if (new Date(remote.updatedAt) > new Date(local.updatedAt)) {
          // Server is newer — update local
          const updateResult = await opportunityRepository.update(remote);
          if (updateResult.ok) pulled++;
          else errors.push(`Failed to update local copy of ${remote.id}`);
        }
        // If local is newer or equal, keep local version (it will be pushed in next sync)
      }
    } catch (e) {
      if (this.isNetworkError(e)) {
        errors.push('Network unavailable, skipping pull');
      } else {
        errors.push(e instanceof Error ? e.message : 'Unknown pull error');
      }
    }

    return { pulled, errors };
  }

  /**
   * Check if an error is a network connectivity issue.
   */
  private isNetworkError(e: unknown): boolean {
    if (e instanceof ApiClientError) {
      return e.code === 'HTTP_ERROR' && (e.status === undefined || e.status === 0);
    }
    if (e instanceof TypeError && e.message.includes('Network request failed')) {
      return true;
    }
    return false;
  }
}

export const syncService = new SyncService();
