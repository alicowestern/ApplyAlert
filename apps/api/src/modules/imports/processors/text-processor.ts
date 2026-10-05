/**
 * Text import processor.
 *
 * Handles user-submitted text content:
 * - Validates non-empty
 * - Normalizes line endings and excessive whitespace
 * - Preserves original text as evidence
 * - Generates content hash
 * - Synchronous — no async complexity needed
 */

import * as crypto from 'crypto';

export interface TextProcessingResult {
  originalText: string;
  normalizedText: string;
  contentHash: string;
}

/** Maximum text length (100K characters). */
export const MAX_TEXT_LENGTH = 100_000;

export function processText(text: string): TextProcessingResult {
  if (!text || !text.trim()) {
    throw new TextProcessingError('EMPTY_CONTENT', 'Text content is empty');
  }

  if (text.length > MAX_TEXT_LENGTH) {
    throw new TextProcessingError('CONTENT_TOO_LARGE', `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters`);
  }

  const originalText = text;

  // Normalize line endings (CRLF → LF)
  let normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // Collapse excessive blank lines (3+ → 2)
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  // Trim leading/trailing whitespace from each line (preserves indentation structure)
  // But do NOT aggressively transform — we need original wording as evidence
  normalized = normalized
    .split('\n')
    .map(line => line.trimEnd())
    .join('\n')
    .trim();

  const contentHash = crypto
    .createHash('sha256')
    .update(normalized, 'utf8')
    .digest('hex');

  return {
    originalText,
    normalizedText: normalized,
    contentHash,
  };
}

export class TextProcessingError extends Error {
  constructor(
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'TextProcessingError';
  }
}
