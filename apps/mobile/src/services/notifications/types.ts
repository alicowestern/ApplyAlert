/**
 * Notification scheduler interface.
 *
 * Abstracts local notification scheduling so the app doesn't
 * depend on a specific notification library or platform API.
 *
 * IMPORTANT: Production reminder scheduling must NOT rely on
 * JavaScript timers. The implementation must use native
 * platform notification scheduling (Android AlarmManager,
 * iOS UNUserNotificationCenter).
 */

import type { Result } from '../../types/result';

export type NotificationErrorKind =
  | 'PERMISSION_DENIED'
  | 'SCHEDULE_FAILED'
  | 'CANCEL_FAILED'
  | 'UNKNOWN';

export interface NotificationError {
  kind: NotificationErrorKind;
  message: string;
}

export interface NotificationConfig {
  /** Unique ID for this notification (for cancellation). */
  id: string;
  /** Title text. */
  title: string;
  /** Body text. */
  body: string;
  /** When to deliver (ISO 8601 UTC instant). */
  scheduledAt: string;
  /** Optional data payload. */
  data?: Record<string, string>;
}

export interface NotificationScheduler {
  /** Check if notification permissions are granted. */
  hasPermission(): Promise<boolean>;
  /** Request notification permissions. */
  requestPermission(): Promise<Result<boolean, NotificationError>>;
  /** Schedule a local notification. */
  schedule(config: NotificationConfig): Promise<Result<void, NotificationError>>;
  /** Cancel a scheduled notification by ID. */
  cancel(id: string): Promise<Result<void, NotificationError>>;
  /** Cancel all scheduled notifications. */
  cancelAll(): Promise<Result<void, NotificationError>>;
}
