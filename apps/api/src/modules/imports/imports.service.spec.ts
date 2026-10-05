import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ImportsService } from './imports.service';
import { PrismaService } from '../../prisma/prisma.service';
import { UrlProcessor, UrlProcessingError } from './processors/url-processor';
import { FileProcessor } from './processors/file-processor';

describe('ImportsService', () => {
  let service: ImportsService;
  let prisma: {
    import: {
      create: jest.Mock;
      update: jest.Mock;
      findUnique: jest.Mock;
      findMany: jest.Mock;
    };
  };
  let urlProcessor: { processUrl: jest.Mock };
  let fileProcessor: { processFile: jest.Mock };

  const userId = 'user-123';
  const importId = 'import-456';

  beforeEach(async () => {
    prisma = {
      import: {
        create: jest.fn(),
        update: jest.fn(),
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
    };

    urlProcessor = {
      processUrl: jest.fn(),
    };

    fileProcessor = {
      processFile: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImportsService,
        { provide: PrismaService, useValue: prisma },
        { provide: UrlProcessor, useValue: urlProcessor },
        { provide: FileProcessor, useValue: fileProcessor },
      ],
    }).compile();

    service = module.get<ImportsService>(ImportsService);
  });

  describe('createTextImport', () => {
    it('creates and normalizes a text import', async () => {
      const text = 'Opportunity Announcement: Apply before December 1, 2026.';
      prisma.import.create.mockResolvedValue({
        id: importId,
        userId,
        inputType: 'TEXT',
        status: 'READY_FOR_EXTRACTION',
        originalText: text,
        normalizedText: text,
        contentHash: 'hash123',
        createdAt: new Date(),
        updatedAt: new Date(),
        processingStartedAt: new Date(),
        processingCompletedAt: new Date(),
      });

      const result = await service.createTextImport(userId, { text });

      expect(prisma.import.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId,
            inputType: 'TEXT',
            status: 'READY_FOR_EXTRACTION',
          }),
        }),
      );
      expect(result.id).toBe(importId);
      expect(result.status).toBe('READY_FOR_EXTRACTION');
    });

    it('rejects empty text import with BadRequestException', async () => {
      await expect(service.createTextImport(userId, { text: '   ' })).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('createUrlImport', () => {
    it('successfully processes a valid URL', async () => {
      const url = 'https://example.com/fellowship';
      prisma.import.create.mockResolvedValue({
        id: importId,
        userId,
        inputType: 'URL',
        status: 'PENDING',
        originalUrl: url,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prisma.import.update
        .mockResolvedValueOnce({
          id: importId,
          status: 'PROCESSING',
        })
        .mockResolvedValueOnce({
          id: importId,
          userId,
          inputType: 'URL',
          status: 'READY_FOR_EXTRACTION',
          originalUrl: url,
          finalUrl: url,
          normalizedText: 'Fellowship Details',
          contentHash: 'hash-abc',
          createdAt: new Date(),
          updatedAt: new Date(),
          processingStartedAt: new Date(),
          processingCompletedAt: new Date(),
        });

      urlProcessor.processUrl.mockResolvedValue({
        finalUrl: url,
        normalizedText: 'Fellowship Details',
        contentHash: 'hash-abc',
        title: 'Fellowship',
        metaDescription: 'Desc',
        sections: [],
        links: [],
      });

      const result = await service.createUrlImport(userId, { url });

      expect(result.status).toBe('READY_FOR_EXTRACTION');
      expect(urlProcessor.processUrl).toHaveBeenCalledWith(url);
    });

    it('records FAILED status and error code when UrlProcessor throws', async () => {
      const url = 'https://blocked-host.local/admin';
      prisma.import.create.mockResolvedValue({
        id: importId,
        userId,
        inputType: 'URL',
        status: 'PENDING',
        originalUrl: url,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prisma.import.update
        .mockResolvedValueOnce({ id: importId, status: 'PROCESSING' })
        .mockResolvedValueOnce({
          id: importId,
          userId,
          inputType: 'URL',
          status: 'FAILED',
          errorCode: 'URL_NOT_ALLOWED',
          errorMessage: 'The provided URL cannot be accessed for security reasons.',
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      urlProcessor.processUrl.mockRejectedValue(
        new UrlProcessingError('URL_NOT_ALLOWED', 'Blocked target'),
      );

      const result = await service.createUrlImport(userId, { url });

      expect(result.status).toBe('FAILED');
      expect(result.errorCode).toBe('URL_NOT_ALLOWED');
    });
  });

  describe('Ownership and access control', () => {
    it('throws NotFoundException when getting an import belonging to another user', async () => {
      prisma.import.findUnique.mockResolvedValue({
        id: importId,
        userId: 'other-user',
        status: 'READY_FOR_EXTRACTION',
      });

      await expect(service.getImport(userId, importId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when cancelling an import belonging to another user', async () => {
      prisma.import.findUnique.mockResolvedValue({
        id: importId,
        userId: 'other-user',
        status: 'PROCESSING',
      });

      await expect(service.cancelImport(userId, importId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('cancels an in-flight import successfully', async () => {
      prisma.import.findUnique.mockResolvedValue({
        id: importId,
        userId,
        inputType: 'URL',
        status: 'PROCESSING',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      prisma.import.update.mockResolvedValue({
        id: importId,
        userId,
        inputType: 'URL',
        status: 'CANCELLED',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const result = await service.cancelImport(userId, importId);
      expect(result.status).toBe('CANCELLED');
    });

    it('rejects cancelling an import that is already READY_FOR_EXTRACTION', async () => {
      prisma.import.findUnique.mockResolvedValue({
        id: importId,
        userId,
        inputType: 'URL',
        status: 'READY_FOR_EXTRACTION',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await expect(service.cancelImport(userId, importId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('getExtractionInput for Task 6', () => {
    it('generates a valid ExtractionInput contract with provenance', async () => {
      prisma.import.findUnique.mockResolvedValue({
        id: importId,
        userId,
        inputType: 'TEXT',
        status: 'READY_FOR_EXTRACTION',
        originalText: 'Full Opportunity Text',
        normalizedText: 'Full Opportunity Text',
        contentHash: 'hash-xyz',
        createdAt: new Date('2026-10-04T12:00:00Z'),
        updatedAt: new Date('2026-10-04T12:00:00Z'),
        processingCompletedAt: new Date('2026-10-04T12:00:01Z'),
      });

      const extractionInput = await service.getExtractionInput(userId, importId);

      expect(extractionInput.importId).toBe(importId);
      expect(extractionInput.inputType).toBe('TEXT');
      expect(extractionInput.text).toBe('Full Opportunity Text');
      expect(extractionInput.provenance.method).toBe('user_text');
      expect(extractionInput.sections.length).toBeGreaterThan(0);
    });
  });
});
