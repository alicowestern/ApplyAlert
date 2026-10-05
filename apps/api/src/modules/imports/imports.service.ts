import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import type {
  CreateTextImportDto,
  CreateUrlImportDto,
  ImportResponseDto,
  ListImportsQuery,
  ExtractionInput,
  ImportStatus,
  ImportErrorCode,
} from '@applyalert/contracts';
import { processText, TextProcessingError } from './processors/text-processor';
import { UrlProcessor, UrlProcessingError } from './processors/url-processor';
import { FileProcessor, FileProcessingError, type FileUploadData } from './processors/file-processor';
import { ImportMapper } from './import-mapper';
import { assertValidImportTransition } from './domain/import-status-transitions';
import { getUserSafeErrorMessage } from './domain/import-error-codes';

@Injectable()
export class ImportsService {
  private readonly logger = new Logger(ImportsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly urlProcessor: UrlProcessor,
    private readonly fileProcessor: FileProcessor,
  ) {}

  /**
   * Create and immediately process a text import.
   */
  async createTextImport(userId: string, dto: CreateTextImportDto): Promise<ImportResponseDto> {
    const rawText = dto.text;

    // 1. Initial validation
    let textResult;
    try {
      textResult = processText(rawText);
    } catch (err: unknown) {
      if (err instanceof TextProcessingError) {
        throw new BadRequestException(getUserSafeErrorMessage(err.code as ImportErrorCode));
      }
      throw new BadRequestException('Invalid text content');
    }

    // 2. Create Import record
    const created = await this.prisma.import.create({
      data: {
        userId,
        inputType: 'TEXT',
        status: 'READY_FOR_EXTRACTION',
        originalText: textResult.originalText,
        normalizedText: textResult.normalizedText,
        contentHash: textResult.contentHash,
        processingStartedAt: new Date(),
        processingCompletedAt: new Date(),
      },
    });

    return ImportMapper.toResponseDto(created);
  }

  /**
   * Create and process a URL import.
   */
  async createUrlImport(userId: string, dto: CreateUrlImportDto): Promise<ImportResponseDto> {
    const trimmedUrl = dto.url.trim();

    // 1. Create initial PENDING record
    const importRecord = await this.prisma.import.create({
      data: {
        userId,
        inputType: 'URL',
        status: 'PENDING',
        originalUrl: trimmedUrl,
      },
    });

    // 2. Mark PROCESSING
    await this.prisma.import.update({
      where: { id: importRecord.id },
      data: {
        status: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    });

    // 3. Process URL
    try {
      const result = await this.urlProcessor.processUrl(trimmedUrl);

      const completed = await this.prisma.import.update({
        where: { id: importRecord.id },
        data: {
          status: 'READY_FOR_EXTRACTION',
          finalUrl: result.finalUrl,
          normalizedText: result.normalizedText,
          contentHash: result.contentHash,
          processingCompletedAt: new Date(),
        },
      });

      return ImportMapper.toResponseDto(completed);
    } catch (err: unknown) {
      let errorCode: ImportErrorCode = 'PROCESSING_FAILED';
      let errorMessage = 'Failed to process URL';

      if (err instanceof UrlProcessingError) {
        errorCode = err.code;
        errorMessage = getUserSafeErrorMessage(err.code);
      } else if (err instanceof Error) {
        this.logger.error(`Unexpected URL import error: ${err.message}`, err.stack);
      }

      const failed = await this.prisma.import.update({
        where: { id: importRecord.id },
        data: {
          status: 'FAILED',
          errorCode,
          errorMessage,
          processingCompletedAt: new Date(),
        },
      });

      return ImportMapper.toResponseDto(failed);
    }
  }

  /**
   * Create and process a file import (PDF or Image).
   */
  async createFileImport(userId: string, file: FileUploadData): Promise<ImportResponseDto> {
    const mime = (file.mimetype || '').toLowerCase();
    const isPdf = mime === 'application/pdf';
    const inputType = isPdf ? 'PDF' : 'IMAGE';

    // 1. Create initial PENDING record
    const importRecord = await this.prisma.import.create({
      data: {
        userId,
        inputType,
        status: 'PENDING',
        fileName: file.originalname,
        mimeType: mime,
        fileSize: file.size,
      },
    });

    // 2. Mark PROCESSING
    await this.prisma.import.update({
      where: { id: importRecord.id },
      data: {
        status: 'PROCESSING',
        processingStartedAt: new Date(),
      },
    });

    // 3. Process file
    try {
      const result = await this.fileProcessor.processFile(file, userId, importRecord.id);

      const completed = await this.prisma.import.update({
        where: { id: importRecord.id },
        data: {
          status: 'READY_FOR_EXTRACTION',
          storageKey: result.storageKey,
          normalizedText: result.normalizedText,
          contentHash: result.contentHash,
          processingCompletedAt: new Date(),
        },
      });

      return ImportMapper.toResponseDto(completed);
    } catch (err: unknown) {
      let errorCode: ImportErrorCode = 'PROCESSING_FAILED';
      let errorMessage = 'Failed to process file';

      if (err instanceof FileProcessingError) {
        errorCode = err.code;
        errorMessage = getUserSafeErrorMessage(err.code);
      } else if (err instanceof Error) {
        this.logger.error(`Unexpected file import error: ${err.message}`, err.stack);
      }

      const failed = await this.prisma.import.update({
        where: { id: importRecord.id },
        data: {
          status: 'FAILED',
          errorCode,
          errorMessage,
          processingCompletedAt: new Date(),
        },
      });

      return ImportMapper.toResponseDto(failed);
    }
  }

  /**
   * Get an import by ID, enforcing user ownership.
   */
  async getImport(userId: string, id: string): Promise<ImportResponseDto> {
    const record = await this.prisma.import.findUnique({
      where: { id },
    });

    if (!record || record.userId !== userId) {
      throw new NotFoundException(`Import "${id}" not found`);
    }

    return ImportMapper.toResponseDto(record);
  }

  /**
   * List imports for a user with optional status filter and cursor pagination.
   */
  async listImports(
    userId: string,
    query?: ListImportsQuery,
  ): Promise<{ items: ImportResponseDto[]; nextCursor: string | null }> {
    const limit = Math.min(Math.max(query?.limit ?? 20, 1), 100);
    const where: { userId: string; status?: string } = { userId };

    if (query?.status) {
      where.status = query.status;
    }

    const records = await this.prisma.import.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit + 1,
      ...(query?.cursor
        ? {
            skip: 1,
            cursor: { id: query.cursor },
          }
        : {}),
    });

    const hasMore = records.length > limit;
    const items = (hasMore ? records.slice(0, limit) : records).map(ImportMapper.toResponseDto);
    const nextCursor = hasMore ? items[items.length - 1].id : null;

    return { items, nextCursor };
  }

  /**
   * Cancel an in-flight import.
   */
  async cancelImport(userId: string, id: string): Promise<ImportResponseDto> {
    const record = await this.prisma.import.findUnique({
      where: { id },
    });

    if (!record || record.userId !== userId) {
      throw new NotFoundException(`Import "${id}" not found`);
    }

    const currentStatus = record.status as ImportStatus;
    try {
      assertValidImportTransition(currentStatus, 'CANCELLED');
    } catch {
      throw new BadRequestException(
        `Cannot cancel import with status "${currentStatus}". Only PENDING or PROCESSING imports can be cancelled.`,
      );
    }

    const updated = await this.prisma.import.update({
      where: { id },
      data: {
        status: 'CANCELLED',
        processingCompletedAt: new Date(),
      },
    });

    return ImportMapper.toResponseDto(updated);
  }

  /**
   * Internal/Task 6 method: get full ExtractionInput with provenance.
   */
  async getExtractionInput(userId: string, id: string): Promise<ExtractionInput> {
    const record = await this.prisma.import.findUnique({
      where: { id },
    });

    if (!record || record.userId !== userId) {
      throw new NotFoundException(`Import "${id}" not found`);
    }

    if (record.status !== 'READY_FOR_EXTRACTION') {
      throw new BadRequestException(
        `Import "${id}" is not ready for extraction (current status: ${record.status})`,
      );
    }

    return ImportMapper.toExtractionInput(record);
  }
}
