import { Test, TestingModule } from '@nestjs/testing';
import { OpportunitiesService } from './opportunities.service';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CreateOpportunityDto } from '@applyalert/contracts';
import { RemindersService } from '../reminders/reminders.service';

describe('OpportunitiesService', () => {
  let service: OpportunitiesService;
  let mockPrisma: any;

  beforeEach(async () => {
    mockPrisma = {
      user: {
        upsert: jest.fn().mockResolvedValue({ id: 'user-1' }),
      },
      opportunity: {
        create: jest.fn(),
        findMany: jest.fn(),
        findUnique: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OpportunitiesService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: RemindersService,
          useValue: {
            generateRemindersForOpportunity: jest.fn(),
            cancelRemindersForOpportunity: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<OpportunitiesService>(OpportunitiesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('creates an opportunity with DATE_ONLY deadline preserving calendar date string', async () => {
      const dto: CreateOpportunityDto = {
        title: 'Global Fellowship',
        opportunityType: 'FELLOWSHIP',
        organization: null,
        summary: null,
        location: null,
        funding: null,
        applicationUrl: null,
        status: 'SAVED',
        source: {
          type: 'MANUAL',
          url: null,
          rawText: null,
          fileName: null,
          mimeType: null,
          fileRef: null,
          importedAt: '2026-10-04T00:00:00.000Z',
        },
        deadline: {
          kind: 'DATE_ONLY',
          originalText: 'Due Dec 15, 2026',
          localDate: '2026-12-15',
          localTime: null,
          timezone: null,
          utcInstant: null,
          confidence: 1.0,
          userConfirmed: true,
          evidence: null,
          alternativeCandidates: [],
        },
      };

      const now = new Date('2026-10-04T12:00:00.000Z');
      mockPrisma.opportunity.create.mockResolvedValueOnce({
        id: 'opp-1',
        userId: 'user-1',
        title: dto.title,
        opportunityType: dto.opportunityType,
        organization: null,
        summary: null,
        location: null,
        fundingIsFunded: null,
        fundingDetails: null,
        applicationUrl: null,
        status: 'SAVED',
        createdAt: now,
        updatedAt: now,
        appliedAt: null,
        archivedAt: null,
        source: {
          id: 'src-1',
          opportunityId: 'opp-1',
          type: 'MANUAL',
          url: null,
          rawText: null,
          fileName: null,
          mimeType: null,
          fileRef: null,
          importedAt: now,
        },
        deadline: {
          id: 'dl-1',
          opportunityId: 'opp-1',
          kind: 'DATE_ONLY',
          originalText: 'Due Dec 15, 2026',
          localDate: '2026-12-15',
          localTime: null,
          timezone: null,
          utcInstant: null,
          confidence: 1.0,
          userConfirmed: true,
          evidence: null,
          alternativeCandidates: [],
        },
      });

      const result = await service.create('user-1', dto);

      expect(mockPrisma.user.upsert).toHaveBeenCalledWith({
        where: { id: 'user-1' },
        create: { id: 'user-1' },
        update: {},
      });
      expect(mockPrisma.opportunity.create).toHaveBeenCalled();
      expect(result.id).toBe('opp-1');
      expect(result.deadline.kind).toBe('DATE_ONLY');
      expect(result.deadline.localDate).toBe('2026-12-15');
    });
  });

  describe('updateStatus', () => {
    it('throws BadRequestException on invalid status transition', async () => {
      const now = new Date();
      mockPrisma.opportunity.findUnique.mockResolvedValueOnce({
        id: 'opp-1',
        userId: 'user-1',
        title: 'Test',
        opportunityType: 'OTHER',
        status: 'SAVED',
        createdAt: now,
        updatedAt: now,
        source: null,
        deadline: null,
      });

      await expect(service.updateStatus('user-1', 'opp-1', 'SAVED')).rejects.toThrow(BadRequestException);
    });

    it('sets appliedAt when transitioning to APPLIED', async () => {
      const now = new Date();
      mockPrisma.opportunity.findUnique.mockResolvedValueOnce({
        id: 'opp-1',
        userId: 'user-1',
        title: 'Test',
        opportunityType: 'OTHER',
        status: 'PREPARING',
        createdAt: now,
        updatedAt: now,
        source: null,
        deadline: null,
      });

      mockPrisma.opportunity.update.mockResolvedValueOnce({
        id: 'opp-1',
        userId: 'user-1',
        title: 'Test',
        opportunityType: 'OTHER',
        status: 'APPLIED',
        appliedAt: now,
        createdAt: now,
        updatedAt: now,
        source: null,
        deadline: null,
      });

      const result = await service.updateStatus('user-1', 'opp-1', 'APPLIED');
      expect(result.status).toBe('APPLIED');
      expect(result.appliedAt).toBeDefined();
    });
  });

  describe('findById', () => {
    it('throws NotFoundException if opportunity does not belong to user', async () => {
      mockPrisma.opportunity.findUnique.mockResolvedValueOnce({
        id: 'opp-1',
        userId: 'other-user',
        title: 'Test',
      });

      await expect(service.findById('user-1', 'opp-1')).rejects.toThrow(NotFoundException);
    });
  });
});
