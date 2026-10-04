import {
  Opportunity as PrismaOpportunity,
  OpportunityDeadline as PrismaDeadline,
  OpportunitySource as PrismaSource,
} from '@prisma/client';
import {
  Opportunity,
  Deadline,
  OpportunitySource,
  ApplicationStatus,
  OpportunityType,
  FundingInfo,
  createUnknownDeadline,
  DeadlineKind,
  SourceContentType,
} from '@applyalert/contracts';

export type PrismaOpportunityWithRelations = PrismaOpportunity & {
  source: PrismaSource | null;
  deadline: PrismaDeadline | null;
};

export class OpportunityMapper {
  static toDomain(record: PrismaOpportunityWithRelations): Opportunity {
    let funding: FundingInfo | null = null;
    if (record.fundingIsFunded !== null || record.fundingDetails !== null) {
      funding = {
        isFunded: record.fundingIsFunded,
        details: record.fundingDetails,
      };
    }

    let deadline: Deadline = createUnknownDeadline();

    if (record.deadline) {
      const d = record.deadline;
      deadline = {
        kind: (d.kind as DeadlineKind) || 'NONE_STATED',
        originalText: d.originalText,
        localDate: d.localDate,
        localTime: d.localTime,
        timezone: d.timezone,
        utcInstant: d.utcInstant ? d.utcInstant.toISOString() : null,
        confidence: d.confidence,
        userConfirmed: d.userConfirmed,
        evidence: d.evidence,
        alternativeCandidates: d.alternativeCandidates || [],
      };
    }

    let source: OpportunitySource = {
      type: 'MANUAL',
      url: null,
      rawText: null,
      fileName: null,
      mimeType: null,
      fileRef: null,
      importedAt: record.createdAt.toISOString(),
    };

    if (record.source) {
      const s = record.source;
      source = {
        type: (s.type as SourceContentType) || 'MANUAL',
        url: s.url,
        rawText: s.rawText,
        fileName: s.fileName,
        mimeType: s.mimeType,
        fileRef: s.fileRef,
        importedAt: s.importedAt.toISOString(),
      };
    }

    return {
      id: record.id,
      title: record.title,
      organization: record.organization,
      opportunityType: record.opportunityType as OpportunityType,
      summary: record.summary,
      location: record.location,
      funding,
      applicationUrl: record.applicationUrl,
      deadline,
      source,
      status: record.status as ApplicationStatus,
      createdAt: record.createdAt.toISOString(),
      updatedAt: record.updatedAt.toISOString(),
      appliedAt: record.appliedAt ? record.appliedAt.toISOString() : null,
      archivedAt: record.archivedAt ? record.archivedAt.toISOString() : null,
    };
  }
}
