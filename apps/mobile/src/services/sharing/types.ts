/**
 * Share receiver interface.
 *
 * Abstracts the Android Sharesheet / iOS Share Extension
 * integration so the app can receive shared content without
 * the core logic caring about the platform.
 */

import type { Result } from '../../types/result';
import type { InputContentType } from '@applyalert/contracts';

export type ShareErrorKind = 'NO_CONTENT' | 'UNSUPPORTED_TYPE' | 'READ_FAILED' | 'UNKNOWN';

export interface ShareError {
  kind: ShareErrorKind;
  message: string;
}

export interface SharedContent {
  /** What type of content was shared. */
  contentType: InputContentType;
  /** The shared content (URL string, text, or file URI). */
  content: string;
  /** MIME type if available. */
  mimeType: string | null;
}

export interface ShareReceiver {
  /** Get content that was shared into the app (e.g., on cold start). */
  getInitialShare(): Promise<Result<SharedContent | null, ShareError>>;
  /** Listen for shares received while the app is running. */
  onShareReceived(callback: (content: SharedContent) => void): () => void;
}
