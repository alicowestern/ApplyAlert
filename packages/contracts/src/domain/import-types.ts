/**
 * Import domain types for ApplyAlert.
 *
 * An Import represents the lifecycle of processing source material
 * supplied by a user. It is separate from Opportunity — an import
 * may fail before an Opportunity ever exists.
 *
 * Import → (Task 6) Extraction → (user confirmation) → Opportunity
 */

import type { InputContentType } from './input';

/**
 * Import processing status.
 */
export type ImportStatus =
  | 'PENDING'               // Created, waiting to begin processing
  | 'PROCESSING'            // Actively being processed (fetching URL, extracting text, etc.)
  | 'READY_FOR_EXTRACTION'  // Source acquired and normalized — ready for Task 6 AI
  | 'FAILED'                // Processing failed (see errorCode)
  | 'CANCELLED';            // User cancelled the import

/**
 * Stable error codes for import failures.
 * These are safe to expose to the mobile client.
 */
export type ImportErrorCode =
  | 'INVALID_URL'
  | 'URL_NOT_ALLOWED'
  | 'FETCH_TIMEOUT'
  | 'FETCH_FAILED'
  | 'CONTENT_TOO_LARGE'
  | 'UNSUPPORTED_CONTENT_TYPE'
  | 'UNSUPPORTED_FILE_TYPE'
  | 'FILE_TOO_LARGE'
  | 'INVALID_PDF'
  | 'PDF_TEXT_EXTRACTION_FAILED'
  | 'EMPTY_CONTENT'
  | 'STORAGE_FAILED'
  | 'PROCESSING_FAILED';

/**
 * Whether a failed import error is potentially retryable.
 */
export const RETRYABLE_ERRORS: readonly ImportErrorCode[] = [
  'FETCH_TIMEOUT',
  'FETCH_FAILED',
  'STORAGE_FAILED',
  'PROCESSING_FAILED',
] as const;

/**
 * Core Import entity.
 */
export interface Import {
  readonly id: string;
  readonly userId: string;
  readonly inputType: InputContentType;
  readonly status: ImportStatus;

  /** Original URL submitted by the user (for URL imports). */
  readonly originalUrl: string | null;
  /** Final resolved URL after redirects (for URL imports). */
  readonly finalUrl: string | null;
  /** Original text submitted by the user (for TEXT imports). */
  readonly originalText: string | null;

  /** Original filename as provided by the user (metadata only, never used as path). */
  readonly fileName: string | null;
  /** Declared MIME type. */
  readonly mimeType: string | null;
  /** File size in bytes. */
  readonly fileSize: number | null;
  /** Server-generated storage key for the file (images/PDFs). */
  readonly storageKey: string | null;

  /** Normalized/extracted text content ready for AI analysis. */
  readonly normalizedText: string | null;
  /** SHA-256 hash of the normalized content for duplicate detection. */
  readonly contentHash: string | null;

  /** Stable error code if status is FAILED. */
  readonly errorCode: ImportErrorCode | null;
  /** User-safe error message. Never contains stack traces or internal paths. */
  readonly errorMessage: string | null;

  readonly createdAt: string;
  readonly updatedAt: string;
  readonly processingStartedAt: string | null;
  readonly processingCompletedAt: string | null;
}

// ─── ExtractionInput ─────────────────────────────────────────────
// Provider-independent contract for Task 6 AI analysis.
// Task 6 transforms this into whichever AI provider request is chosen.

/**
 * A section of extracted content with source provenance.
 */
export interface ContentSection {
  /** Section heading or identifier (e.g., "Main Content", "Page 3"). */
  readonly heading: string | null;
  /** The text content of this section. */
  readonly text: string;
  /** Source reference for provenance (e.g., page number, URL fragment). */
  readonly sourceRef: string | null;
}

/**
 * A discovered hyperlink from web content.
 */
export interface DiscoveredLink {
  readonly text: string;
  readonly href: string;
}

/**
 * Metadata about a processed PDF.
 */
export interface PdfMetadata {
  readonly pageCount: number;
  readonly hasExtractableText: boolean;
  /** Number of characters extracted. */
  readonly extractedCharCount: number;
  /** Whether the PDF likely requires OCR/vision (scanned document). */
  readonly requiresOcr: boolean;
}

/**
 * Metadata about a processed image.
 */
export interface ImageMetadata {
  readonly width: number | null;
  readonly height: number | null;
  readonly mimeType: string;
  readonly fileSize: number;
}

/**
 * Provider-independent input for Task 6 AI extraction.
 *
 * Task 6 will transform this into the appropriate AI provider request
 * (OpenAI, Gemini, Claude, etc.).
 */
export interface ExtractionInput {
  readonly importId: string;
  readonly inputType: InputContentType;

  /** Source URL (for URL imports). */
  readonly sourceUrl: string | null;
  /** Final resolved URL after redirects. */
  readonly finalUrl: string | null;
  /** Page title (for URL imports). */
  readonly title: string | null;

  /** Full extracted/normalized text. */
  readonly text: string | null;
  /** Structured content sections with provenance. */
  readonly sections: readonly ContentSection[];
  /** Discovered links (for URL imports). */
  readonly links: readonly DiscoveredLink[];

  /** Image metadata (for IMAGE imports). */
  readonly imageMetadata: ImageMetadata | null;
  /** Storage reference for the image file. */
  readonly imageReference: string | null;

  /** PDF metadata (for PDF imports). */
  readonly pdfMetadata: PdfMetadata | null;
  /** Storage reference for the PDF file. */
  readonly pdfReference: string | null;

  /** Provenance: trace extracted content back to its source. */
  readonly provenance: {
    /** How the content was acquired. */
    readonly method: 'user_text' | 'url_fetch' | 'file_upload';
    /** When the source was acquired. */
    readonly acquiredAt: string;
    /** Meta description from web page. */
    readonly metaDescription: string | null;
    /** Canonical URL from web page. */
    readonly canonicalUrl: string | null;
  };
}
