/**
 * SyncQueue — tracks local mutations that need to be pushed to the backend.
 *
 * Each local write (create, update, status change, delete) enqueues an operation.
 * The SyncService processes these operations in order, removing them on success.
 *
 * Persisted in MMKV so pending operations survive app restarts.
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { Opportunity, ApplicationStatus } from '@applyalert/contracts';

export type SyncOperationType = 'CREATE' | 'UPDATE' | 'STATUS_CHANGE' | 'ARCHIVE' | 'RESTORE' | 'DELETE';

export interface SyncOperation {
  /** Unique ID for this queue entry */
  readonly id: string;
  /** Type of mutation */
  readonly type: SyncOperationType;
  /** Opportunity ID this operation targets */
  readonly opportunityId: string;
  /** Full opportunity snapshot (for CREATE/UPDATE) */
  readonly payload?: Opportunity;
  /** New status (for STATUS_CHANGE) */
  readonly newStatus?: ApplicationStatus;
  /** Timestamp when this operation was enqueued */
  readonly enqueuedAt: string;
  /** Number of failed sync attempts */
  retryCount: number;
  /** Last error message if sync failed */
  lastError?: string;
}

const SYNC_QUEUE_KEY = 'applyalert-sync-queue';
const MAX_RETRIES = 5;

export class SyncQueue {
  private storage: MMKV;

  constructor() {
    this.storage = createMMKV({ id: 'applyalert-sync' });
  }

  /**
   * Read all pending operations from storage.
   */
  getAll(): SyncOperation[] {
    try {
      const raw = this.storage.getString(SYNC_QUEUE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) as SyncOperation[];
    } catch {
      return [];
    }
  }

  /**
   * Enqueue a new sync operation.
   * If an operation for the same opportunityId and same type already exists,
   * replace it (latest mutation wins).
   */
  enqueue(operation: Omit<SyncOperation, 'id' | 'enqueuedAt' | 'retryCount'>): void {
    const queue = this.getAll();

    // Deduplicate: if same opportunityId + type already queued, replace it
    const existingIndex = queue.findIndex(
      op => op.opportunityId === operation.opportunityId && op.type === operation.type,
    );

    const newOp: SyncOperation = {
      ...operation,
      id: `${operation.opportunityId}-${operation.type}-${Date.now()}`,
      enqueuedAt: new Date().toISOString(),
      retryCount: 0,
    };

    if (existingIndex >= 0) {
      queue[existingIndex] = newOp;
    } else {
      queue.push(newOp);
    }

    this.save(queue);
  }

  /**
   * Remove a successfully synced operation.
   */
  dequeue(operationId: string): void {
    const queue = this.getAll().filter(op => op.id !== operationId);
    this.save(queue);
  }

  /**
   * Mark an operation as failed, incrementing retry count.
   * Returns true if the operation should be retried, false if max retries exceeded.
   */
  markFailed(operationId: string, error: string): boolean {
    const queue = this.getAll();
    const op = queue.find(o => o.id === operationId);

    if (!op) return false;

    op.retryCount += 1;
    op.lastError = error;
    this.save(queue);

    return op.retryCount < MAX_RETRIES;
  }

  /**
   * Remove operations that have exceeded max retries.
   * Returns the removed operations for logging/notification.
   */
  pruneExhausted(): SyncOperation[] {
    const queue = this.getAll();
    const exhausted = queue.filter(op => op.retryCount >= MAX_RETRIES);
    const remaining = queue.filter(op => op.retryCount < MAX_RETRIES);

    if (exhausted.length > 0) {
      this.save(remaining);
    }

    return exhausted;
  }

  /**
   * Get the count of pending operations.
   */
  pendingCount(): number {
    return this.getAll().length;
  }

  /**
   * Clear all pending operations (e.g., after a full re-sync).
   */
  clear(): void {
    this.save([]);
  }

  private save(queue: SyncOperation[]): void {
    this.storage.set(SYNC_QUEUE_KEY, JSON.stringify(queue));
  }
}

export const syncQueue = new SyncQueue();
