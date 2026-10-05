import type { Import as PrismaImport } from '@prisma/client';
import type {
  Import,
  ImportResponseDto,
  ExtractionInput,
  InputContentType,
  ImportStatus,
  ImportErrorCode,
} from '@applyalert/contracts';
import { toImportResponseDto } from '@applyalert/contracts';

export class ImportMapper {
  /**
   * Map Prisma model to domain Import.
   */
  static toDomain(record: PrismaImport): Import {
    return {
      id: record.id,
      userId: record.userId,
      inputType: record.inputType as InputContentType,
      status: record.status as ImportStatus,
      originalUrl: record.originalUrl,
      finalUrl: record.finalUrl,
      originalText: record.originalText,
      fileName: record.fileName,
      mimeType: record.mimeType,
      fileSize: record.fileSize,
      storageKey: record.storageKey,
      normalizedText: record.normalizedText,
      contentHash: record.contentHash,
      errorCode: (record.errorCode as ImportErrorCode) || null,
      errorMessage: record.errorMessage,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      processingStartedAt: record.processingStartedAt?.toISOString() || null,
      processingCompletedAt: record.processingCompletedAt?.toISOString() || null,
    };
  }

  /**
   * Map Prisma model to safe client response DTO.
   */
  static toResponseDto(record: PrismaImport): ImportResponseDto {
    const domain = ImportMapper.toDomain(record);
    return toImportResponseDto(domain);
  }

  /**
   * Build ExtractionInput ready for Task 6 AI processing.
   */
  static toExtractionInput(
    record: PrismaImport,
    additionalData?: {
      title?: string | null;
      metaDescription?: string | null;
      canonicalUrl?: string | null;
      sections?: readonly { heading: string | null; text: string; sourceRef: string | null }[];
      links?: readonly { text: string; href: string }[];
      pdfMetadata?: {
        pageCount: number;
        hasExtractableText: boolean;
        extractedCharCount: number;
        requiresOcr: boolean;
      } | null;
      imageMetadata?: {
        width: number | null;
        height: number | null;
        mimeType: string;
        fileSize: number;
      } | null;
    },
  ): ExtractionInput {
    const methodMap: Record<string, 'user_text' | 'url_fetch' | 'file_upload'> = {
      TEXT: 'user_text',
      URL: 'url_fetch',
      IMAGE: 'file_upload',
      PDF: 'file_upload',
    };

    const inputType = record.inputType as InputContentType;
    const text = record.normalizedText || record.originalText || null;

    const sections = additionalData?.sections ?? (text ? [{ heading: null, text, sourceRef: null }] : []);
    const links = additionalData?.links ?? [];

    return {
      importId: record.id,
      inputType,
      sourceUrl: record.originalUrl,
      finalUrl: record.finalUrl,
      title: additionalData?.title ?? null,
      text,
      sections,
      links,
      imageMetadata: additionalData?.imageMetadata ?? (record.inputType === 'IMAGE' && record.mimeType && record.fileSize ? {
        width: null,
        height: null,
        mimeType: record.mimeType,
        fileSize: record.fileSize,
      } : null),
      imageReference: record.inputType === 'IMAGE' ? record.storageKey : null,
      pdfMetadata: additionalData?.pdfMetadata ?? (record.inputType === 'PDF' ? {
        pageCount: 1,
        hasExtractableText: !!record.normalizedText && record.normalizedText.length >= 50,
        extractedCharCount: record.normalizedText?.length ?? 0,
        requiresOcr: !record.normalizedText || record.normalizedText.length < 50,
      } : null),
      pdfReference: record.inputType === 'PDF' ? record.storageKey : null,
      provenance: {
        method: methodMap[record.inputType] || 'file_upload',
        acquiredAt: (record.processingCompletedAt || record.createdAt).toISOString(),
        metaDescription: additionalData?.metaDescription ?? null,
        canonicalUrl: additionalData?.canonicalUrl ?? null,
      },
    };
  }
}
