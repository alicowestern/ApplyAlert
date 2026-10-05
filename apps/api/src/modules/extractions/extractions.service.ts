import { Injectable, Logger, Inject, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { ExtractionInput, ExtractionResult, ConfirmExtractionDto } from '@applyalert/contracts';
import { ExtractionProvider, EXTRACTION_PROVIDER } from './providers/extraction-provider.interface';
import { EXTRACTION_PROMPT_VERSION, EXTRACTION_SCHEMA_VERSION } from './prompts/opportunity-extraction.v1';
import { parseISO, isValid } from 'date-fns';

@Injectable()
export class ExtractionsService {
  private readonly logger = new Logger(ExtractionsService.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(EXTRACTION_PROVIDER) private readonly provider: ExtractionProvider,
  ) {}

  async triggerExtraction(importId: string, userId: string, input: ExtractionInput): Promise<any> {
    // 1. Check if extraction already exists
    let extraction = await this.prisma.extraction.findUnique({
      where: { importId },
    });

    if (!extraction) {
      extraction = await this.prisma.extraction.create({
        data: {
          importId,
          userId,
          status: 'PENDING',
        },
      });
    }

    if (extraction.status === 'PROCESSING' || extraction.status === 'READY_FOR_REVIEW') {
      return extraction;
    }

    // 2. Mark as processing
    extraction = await this.prisma.extraction.update({
      where: { id: extraction.id },
      data: {
        status: 'PROCESSING',
        processingStartedAt: new Date(),
        errorCode: null,
        errorMessage: null,
      },
    });

    // 3. Process asynchronously (fire and forget for now, in prod this would be a queue)
    this.processExtraction(extraction.id, input).catch(err => {
      this.logger.error(`Extraction failed for ${extraction.id}: ${err.message}`, err.stack);
    });

    return extraction;
  }

  private async processExtraction(extractionId: string, input: ExtractionInput) {
    try {
      const rawAiResult = await this.provider.extract(input, {
        extractionId,
        promptVersion: EXTRACTION_PROMPT_VERSION,
        schemaVersion: EXTRACTION_SCHEMA_VERSION,
      });

      // Deterministic validation
      const { finalResult, warnings, confidenceLevel } = this.validateAndScoreResult(rawAiResult.result);

      await this.prisma.extraction.update({
        where: { id: extractionId },
        data: {
          status: 'READY_FOR_REVIEW',
          result: finalResult as any,
          warnings,
          confidenceLevel,
          provider: rawAiResult.provider,
          model: rawAiResult.model,
          promptVersion: EXTRACTION_PROMPT_VERSION,
          schemaVersion: EXTRACTION_SCHEMA_VERSION,
          processingCompletedAt: new Date(),
        },
      });
    } catch (error) {
      await this.prisma.extraction.update({
        where: { id: extractionId },
        data: {
          status: 'FAILED',
          errorCode: 'EXTRACTION_FAILED',
          errorMessage: error instanceof Error ? error.message : 'Unknown error',
          processingCompletedAt: new Date(),
        },
      });
    }
  }

  private validateAndScoreResult(result: ExtractionResult) {
    const warnings: string[] = [];
    let confidenceScore = 1.0; // Base score
    
    // Check primary deadline
    const pd = result.primaryDeadline;
    if (pd) {
      if (pd.date) {
        // Validate date parsing
        const parsedDate = parseISO(pd.date);
        if (!isValid(parsedDate)) {
          // LLM hallucinated a bad date string
          warnings.push('DEADLINE_YEAR_UNCLEAR');
          confidenceScore -= 0.3;
        }
      } else if (pd.kind === 'DATE_ONLY' || pd.kind === 'EXACT_INSTANT') {
        warnings.push('DEADLINE_YEAR_UNCLEAR');
        confidenceScore -= 0.5;
      }
      
      if (!pd.evidence || pd.evidence.length < 5) {
        warnings.push('DEADLINE_EVIDENCE_WEAK');
        confidenceScore -= 0.2;
      }
    } else {
      warnings.push('NO_DEADLINE_FOUND');
      confidenceScore -= 0.4;
    }

    if (result.alternativeDeadlines && result.alternativeDeadlines.length > 0) {
      warnings.push('MULTIPLE_DEADLINES');
      confidenceScore -= 0.2;
    }

    let confidenceLevel = 'HIGH';
    if (confidenceScore < 0.5) confidenceLevel = 'NEEDS_CONFIRMATION';
    else if (confidenceScore < 0.7) confidenceLevel = 'LOW';
    else if (confidenceScore < 0.9) confidenceLevel = 'MEDIUM';

    return { finalResult: result, warnings, confidenceLevel };
  }

  async getExtraction(id: string) {
    const ext = await this.prisma.extraction.findUnique({
      where: { id },
    });
    if (!ext) throw new NotFoundException('Extraction not found');
    return ext;
  }

  async confirmExtraction(id: string, userId: string, dto: ConfirmExtractionDto) {
    const extraction = await this.prisma.extraction.findUnique({
      where: { id },
      include: { import: true },
    });

    if (!extraction) throw new NotFoundException('Extraction not found');
    if (extraction.userId !== userId) throw new BadRequestException('Unauthorized');
    if (extraction.status !== 'READY_FOR_REVIEW') {
      throw new BadRequestException('Extraction is not ready for review');
    }

    // Wrap in transaction: create Opportunity + Source + Deadline
    const opportunity = await this.prisma.$transaction(async (tx) => {
      const opp = await tx.opportunity.create({
        data: {
          userId,
          title: dto.title,
          organization: dto.organization,
          opportunityType: dto.opportunityType,
          summary: dto.summary,
          location: dto.location,
          fundingIsFunded: dto.funding?.isFunded ?? null,
          fundingDetails: dto.funding?.details ?? null,
          applicationUrl: dto.applicationUrl,
          status: 'SAVED',
          source: {
            create: {
              type: extraction.import.inputType,
              url: extraction.import.finalUrl || extraction.import.originalUrl,
              rawText: extraction.import.originalText,
              fileName: extraction.import.fileName,
              mimeType: extraction.import.mimeType,
              fileRef: extraction.import.storageKey,
              importedAt: extraction.import.createdAt,
            }
          },
          deadline: {
            create: {
              kind: dto.deadline.kind,
              originalText: dto.deadline.originalText,
              localDate: dto.deadline.localDate,
              localTime: dto.deadline.localTime,
              timezone: dto.deadline.timezone,
              utcInstant: dto.deadline.utcInstant ? new Date(dto.deadline.utcInstant) : null,
              confidence: dto.deadline.confidence,
              userConfirmed: dto.deadline.userConfirmed,
              evidence: dto.deadline.evidence,
              alternativeCandidates: dto.deadline.alternativeCandidates as string[],
            }
          }
        },
        include: {
          source: true,
          deadline: true,
        }
      });

      return opp;
    });

    return opportunity;
  }
}
