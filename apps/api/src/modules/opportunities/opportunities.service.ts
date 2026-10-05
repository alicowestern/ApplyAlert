import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RemindersService } from '../reminders/reminders.service';
import { OpportunityMapper } from './opportunity-mapper';
import {
  Opportunity,
  CreateOpportunityDto,
  UpdateOpportunityDto,
  ApplicationStatus,
  PaginatedResponse,
  ListOpportunitiesQuery,
} from '@applyalert/contracts';
import { isValidTransition } from './domain/status-transitions';
import { Prisma } from '@prisma/client';

@Injectable()
export class OpportunitiesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly remindersService: RemindersService
  ) {}

  async create(userId: string, dto: CreateOpportunityDto): Promise<Opportunity> {
    // Ensure user exists (dev user or registered)
    await this.prisma.user.upsert({
      where: { id: userId },
      create: { id: userId },
      update: {},
    });

    const deadlineData = dto.deadline;
    const sourceData = dto.source;

    const record = await this.prisma.opportunity.create({
      data: {
        userId,
        title: dto.title,
        organization: dto.organization ?? null,
        opportunityType: dto.opportunityType,
        summary: dto.summary ?? null,
        location: dto.location ?? null,
        fundingIsFunded: dto.funding?.isFunded ?? null,
        fundingDetails: dto.funding?.details ?? null,
        applicationUrl: dto.applicationUrl ?? null,
        status: dto.status || 'SAVED',
        source: {
          create: {
            type: sourceData?.type || 'MANUAL',
            url: sourceData?.url ?? null,
            rawText: sourceData?.rawText ?? null,
            fileName: sourceData?.fileName ?? null,
            mimeType: sourceData?.mimeType ?? null,
            fileRef: sourceData?.fileRef ?? null,
          },
        },
        deadline: {
          create: {
            kind: deadlineData.kind,
            originalText: deadlineData.originalText ?? null,
            localDate: deadlineData.localDate ?? null,
            localTime: deadlineData.localTime ?? null,
            timezone: deadlineData.timezone ?? null,
            utcInstant: deadlineData.utcInstant ? new Date(deadlineData.utcInstant) : null,
            confidence: deadlineData.confidence ?? 1.0,
            userConfirmed: deadlineData.userConfirmed ?? false,
            evidence: deadlineData.evidence ?? null,
            alternativeCandidates: deadlineData.alternativeCandidates ? [...deadlineData.alternativeCandidates] : [],
          },
        },
      },
      include: {
        source: true,
        deadline: true,
      },
    });

    if (dto.deadline?.userConfirmed) {
      await this.remindersService.generateRemindersForOpportunity(record.id, userId, {
        smartRemindersEnabled: true,
        dateOnlyDefaultHour: 9,
        dateOnlyDefaultMinute: 0,
        enabledOffsets: ['THIRTY_DAYS', 'FOURTEEN_DAYS', 'SEVEN_DAYS', 'THREE_DAYS', 'ONE_DAY', 'DEADLINE_DAY']
      });
    }

    return OpportunityMapper.toDomain(record);
  }

  async findAll(userId: string, query: ListOpportunitiesQuery): Promise<PaginatedResponse<Opportunity>> {
    const limit = query.limit ? Math.min(Math.max(query.limit, 1), 100) : 20;

    const where: Prisma.OpportunityWhereInput = {
      userId,
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.archived === true) {
      where.archivedAt = { not: null };
    } else {
      where.archivedAt = null;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      where.OR = [
        { title: { contains: term, mode: 'insensitive' } },
        { organization: { contains: term, mode: 'insensitive' } },
        { summary: { contains: term, mode: 'insensitive' } },
      ];
    }

    let orderBy: Prisma.OpportunityOrderByWithRelationInput = { createdAt: 'desc' };
    if (query.sort === 'updatedAt') {
      orderBy = { updatedAt: 'desc' };
    } else if (query.sort === 'deadline') {
      orderBy = { deadline: { localDate: 'asc' } };
    }

    const records = await this.prisma.opportunity.findMany({
      where,
      take: limit + 1,
      skip: query.cursor ? 1 : 0,
      cursor: query.cursor ? { id: query.cursor } : undefined,
      orderBy,
      include: {
        source: true,
        deadline: true,
      },
    });

    let nextCursor: string | null = null;
    let hasMore = false;

    if (records.length > limit) {
      hasMore = true;
      records.pop();
      nextCursor = records[records.length - 1].id;
    }

    return {
      items: records.map(OpportunityMapper.toDomain),
      nextCursor,
      hasMore,
    };
  }

  async findById(userId: string, id: string): Promise<Opportunity> {
    const record = await this.prisma.opportunity.findUnique({
      where: { id },
      include: {
        source: true,
        deadline: true,
      },
    });

    if (!record || record.userId !== userId) {
      throw new NotFoundException(`Opportunity with ID "${id}" was not found`);
    }

    return OpportunityMapper.toDomain(record);
  }

  async update(userId: string, id: string, dto: UpdateOpportunityDto): Promise<Opportunity> {
    await this.findById(userId, id);

    const updateData: Prisma.OpportunityUpdateInput = {};

    if (dto.title !== undefined) updateData.title = dto.title;
    if (dto.organization !== undefined) updateData.organization = dto.organization;
    if (dto.opportunityType !== undefined) updateData.opportunityType = dto.opportunityType;
    if (dto.summary !== undefined) updateData.summary = dto.summary;
    if (dto.location !== undefined) updateData.location = dto.location;
    if (dto.applicationUrl !== undefined) updateData.applicationUrl = dto.applicationUrl;

    if (dto.funding !== undefined) {
      updateData.fundingIsFunded = dto.funding?.isFunded ?? null;
      updateData.fundingDetails = dto.funding?.details ?? null;
    }

    if (dto.deadline !== undefined) {
      const d = dto.deadline;
      const deadlinePayload = {
        kind: d.kind,
        originalText: d.originalText ?? null,
        localDate: d.localDate ?? null,
        localTime: d.localTime ?? null,
        timezone: d.timezone ?? null,
        utcInstant: d.utcInstant ? new Date(d.utcInstant) : null,
        confidence: d.confidence ?? 1.0,
        userConfirmed: d.userConfirmed ?? false,
        evidence: d.evidence ?? null,
        alternativeCandidates: d.alternativeCandidates ? [...d.alternativeCandidates] : [],
      };

      updateData.deadline = {
        upsert: {
          create: deadlinePayload,
          update: deadlinePayload,
        },
      };
    }

    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: {
        source: true,
        deadline: true,
      },
    });

    return OpportunityMapper.toDomain(updated);
  }

  async updateStatus(userId: string, id: string, newStatus: ApplicationStatus): Promise<Opportunity> {
    const existing = await this.findById(userId, id);

    if (!isValidTransition(existing.status, newStatus)) {
      throw new BadRequestException({
        code: 'INVALID_STATUS_TRANSITION',
        message: `Cannot transition status from ${existing.status} to ${newStatus}`,
      });
    }

    const now = new Date();
    const becomingApplied = newStatus === 'APPLIED';
    const wasApplied = existing.status === 'APPLIED';
    const becomingArchived = newStatus === 'ARCHIVED';
    const wasArchived = existing.status === 'ARCHIVED';

    const updateData: Prisma.OpportunityUpdateInput = {
      status: newStatus,
    };

    if (becomingApplied) {
      updateData.appliedAt = now;
    } else if (wasApplied) {
      updateData.appliedAt = null;
    }

    if (becomingArchived) {
      updateData.archivedAt = now;
    } else if (wasArchived) {
      updateData.archivedAt = null;
    }

    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: updateData,
      include: {
        source: true,
        deadline: true,
      },
    });

    return OpportunityMapper.toDomain(updated);
  }

  async archive(userId: string, id: string): Promise<Opportunity> {
    await this.findById(userId, id);
    const now = new Date();

    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: {
        status: 'ARCHIVED',
        archivedAt: now,
      },
      include: {
        source: true,
        deadline: true,
      },
    });

    return OpportunityMapper.toDomain(updated);
  }

  async restore(userId: string, id: string): Promise<Opportunity> {
    await this.findById(userId, id);

    const updated = await this.prisma.opportunity.update({
      where: { id },
      data: {
        status: 'SAVED',
        archivedAt: null,
      },
      include: {
        source: true,
        deadline: true,
      },
    });

    return OpportunityMapper.toDomain(updated);
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.findById(userId, id);
    await this.prisma.opportunity.delete({
      where: { id },
    });
  }
}
