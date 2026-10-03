/**
 * Zod schemas for Opportunity validation.
 */

import { z } from 'zod';
import { DeadlineSchema } from './deadline';

export const OpportunityTypeSchema = z.enum([
  'SCHOLARSHIP',
  'INTERNSHIP',
  'FELLOWSHIP',
  'JOB',
  'GRANT',
  'CONFERENCE',
  'HACKATHON',
  'COMPETITION',
  'EXCHANGE',
  'OTHER',
]);

export const ApplicationStatusSchema = z.enum([
  'SAVED',
  'PREPARING',
  'APPLIED',
  'SKIPPED',
  'ARCHIVED',
]);

export const FundingInfoSchema = z.object({
  isFunded: z.boolean().nullable(),
  details: z.string().nullable(),
});

export const SourceContentTypeSchema = z.enum([
  'URL',
  'TEXT',
  'IMAGE',
  'PDF',
  'ANDROID_SHARE',
  'MANUAL',
]);

export const OpportunitySourceSchema = z.object({
  type: SourceContentTypeSchema,
  url: z.string().url().nullable(),
  rawText: z.string().nullable(),
  fileName: z.string().nullable(),
  mimeType: z.string().nullable(),
  fileRef: z.string().nullable(),
  importedAt: z.string(),
});

export const OpportunitySchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, 'Title is required'),
  organization: z.string().nullable(),
  opportunityType: OpportunityTypeSchema,
  summary: z.string().nullable(),
  location: z.string().nullable(),
  funding: FundingInfoSchema.nullable(),
  applicationUrl: z.string().url().nullable(),
  source: OpportunitySourceSchema,
  deadline: DeadlineSchema,
  status: ApplicationStatusSchema,
  createdAt: z.string(),
  updatedAt: z.string(),
  appliedAt: z.string().nullable(),
  archivedAt: z.string().nullable(),
});

export type ValidatedOpportunity = z.infer<typeof OpportunitySchema>;
