/**
 * Import API contract types.
 */

import type { Import, ImportStatus } from '../domain/import-types';

/**
 * Request to create a text import.
 */
export interface CreateTextImportDto {
  readonly text: string;
}

/**
 * Request to create a URL import.
 */
export interface CreateUrlImportDto {
  readonly url: string;
}

/**
 * Response DTO for an import (safe for client consumption).
 */
export interface ImportResponseDto {
  readonly id: string;
  readonly inputType: string;
  readonly status: ImportStatus;
  readonly fileName: string | null;
  readonly mimeType: string | null;
  readonly fileSize: number | null;
  readonly contentHash: string | null;
  readonly errorCode: string | null;
  readonly errorMessage: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly processingStartedAt: string | null;
  readonly processingCompletedAt: string | null;
}

/**
 * Query parameters for listing imports.
 */
export interface ListImportsQuery {
  readonly status?: ImportStatus;
  readonly limit?: number;
  readonly cursor?: string;
}

/**
 * Convert a full Import to a safe response DTO.
 * Strips internal fields like userId, storageKey, originalText, normalizedText.
 */
export function toImportResponseDto(imp: Import): ImportResponseDto {
  return {
    id: imp.id,
    inputType: imp.inputType,
    status: imp.status,
    fileName: imp.fileName,
    mimeType: imp.mimeType,
    fileSize: imp.fileSize,
    contentHash: imp.contentHash,
    errorCode: imp.errorCode,
    errorMessage: imp.errorMessage,
    createdAt: imp.createdAt,
    updatedAt: imp.updatedAt,
    processingStartedAt: imp.processingStartedAt,
    processingCompletedAt: imp.processingCompletedAt,
  };
}
