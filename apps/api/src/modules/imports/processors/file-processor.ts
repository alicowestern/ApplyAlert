import { Injectable, Logger, Inject } from '@nestjs/common';
import * as crypto from 'crypto';
import type { ImportErrorCode } from '@applyalert/contracts';
import { OBJECT_STORAGE, type ObjectStorage } from '../../../storage/object-storage.interface';

// Dynamic require for pdf-parse to handle default/cjs exports safely
// eslint-disable-next-line @typescript-eslint/no-var-requires
const pdfParse = require('pdf-parse');

export interface FileUploadData {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface FileProcessingResult {
  fileName: string;
  mimeType: string;
  fileSize: number;
  storageKey: string;
  normalizedText: string | null;
  contentHash: string;
  metadata?: {
    numPages?: number;
    isScanned?: boolean;
    pageTextLengths?: number[];
  };
}

export class FileProcessingError extends Error {
  constructor(
    public readonly code: ImportErrorCode,
    message: string,
  ) {
    super(message);
    this.name = 'FileProcessingError';
  }
}

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

export const ALLOWED_IMAGE_MIMES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
];

export const ALLOWED_PDF_MIMES = ['application/pdf'];

@Injectable()
export class FileProcessor {
  private readonly logger = new Logger(FileProcessor.name);

  constructor(
    @Inject(OBJECT_STORAGE)
    private readonly storage: ObjectStorage,
  ) {}

  async processFile(
    file: FileUploadData,
    userId: string,
    importId: string,
  ): Promise<FileProcessingResult> {
    if (!file || !file.buffer || file.buffer.length === 0) {
      throw new FileProcessingError('EMPTY_CONTENT', 'Uploaded file is empty');
    }

    if (file.size > MAX_FILE_SIZE_BYTES || file.buffer.length > MAX_FILE_SIZE_BYTES) {
      throw new FileProcessingError(
        'FILE_TOO_LARGE',
        `File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds maximum limit of 10MB`,
      );
    }

    const mime = file.mimetype.toLowerCase();
    const isImage = ALLOWED_IMAGE_MIMES.includes(mime);
    const isPdf = ALLOWED_PDF_MIMES.includes(mime);

    if (!isImage && !isPdf) {
      throw new FileProcessingError(
        'UNSUPPORTED_FILE_TYPE',
        `File type "${mime}" is not supported. Please upload JPEG, PNG, WebP, or PDF.`,
      );
    }

    // 1. Store the original file safely via ObjectStorage
    const ext = file.originalname.includes('.')
      ? file.originalname.split('.').pop()
      : (isPdf ? 'pdf' : 'bin');
    const storageKey = `${userId}/${importId}/${crypto.randomUUID()}.${ext}`;

    try {
      await this.storage.putObject({
        key: storageKey,
        body: file.buffer,
        contentType: mime,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown storage error';
      this.logger.error(`Failed to store file for import ${importId}: ${msg}`);
      throw new FileProcessingError('STORAGE_FAILED', `Failed to safely store file: ${msg}`);
    }

    // 2. Process based on content type
    if (isImage) {
      // Images: Compute hash directly from image buffer.
      // Task 6 will process image via multimodal AI.
      const contentHash = crypto
        .createHash('sha256')
        .update(file.buffer)
        .digest('hex');

      return {
        fileName: file.originalname,
        mimeType: mime,
        fileSize: file.size,
        storageKey,
        normalizedText: null,
        contentHash,
        metadata: {
          isScanned: false,
        },
      };
    }

    // PDFs: Extract text deterministically using pdf-parse
    try {
      const data = await pdfParse(file.buffer);
      const rawText: string = data.text || '';
      const numPages: number = data.numpages || 1;

      // Normalize line endings and collapse empty spaces
      const normalized = rawText
        .replace(/\r\n/g, '\n')
        .replace(/\r/g, '\n')
        .replace(/\n{3,}/g, '\n\n')
        .trim();

      const isScanned = normalized.length < 50;

      // For hash: if normalized text exists, hash the text; otherwise hash file buffer
      const contentHash = crypto
        .createHash('sha256')
        .update(normalized.length > 0 ? normalized : file.buffer)
        .digest('hex');

      return {
        fileName: file.originalname,
        mimeType: mime,
        fileSize: file.size,
        storageKey,
        normalizedText: normalized.length > 0 ? normalized : null,
        contentHash,
        metadata: {
          numPages,
          isScanned,
        },
      };
    } catch (err: unknown) {
      this.logger.warn(`Failed to parse PDF for import ${importId}: ${err}`);
      throw new FileProcessingError(
        'INVALID_PDF',
        'Could not parse PDF content. The file may be corrupt or encrypted.',
      );
    }
  }
}
