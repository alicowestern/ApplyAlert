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

export const OpportunitySourceSchema = z.object({
  type: z.enum(['URL', 'TEXT', 'IMAGE', 'PDF', 'SHARE', 'MANUAL']),
  url: z.string().url().nullable(),
  rawText: z.string().nullable(),
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
});

export type ValidatedOpportunity = z.infer<typeof OpportunitySchema>;
