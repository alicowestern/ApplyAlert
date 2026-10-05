/**
 * Validation schemas for Extraction models.
 */

import { z } from 'zod';

export const ExtractionStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'READY_FOR_REVIEW',
  'FAILED',
  'CANCELLED',
]);

export const ExtractionErrorCodeSchema = z.enum([
  'EXTRACTION_FAILED',
  'EXTRACTION_TIMEOUT',
  'EXTRACTION_RATE_LIMITED',
  'SOURCE_TOO_LARGE',
  'INVALID_EXTRACTION_RESULT',
  'VISUAL_EXTRACTION_FAILED',
  'PROVIDER_ERROR',
]);

export const ExtractionWarningCodeSchema = z.enum([
  'MULTIPLE_DEADLINES',
  'DEADLINE_YEAR_UNCLEAR',
  'DEADLINE_TIMEZONE_UNCLEAR',
  'DEADLINE_EVIDENCE_WEAK',
  'NO_DEADLINE_FOUND',
  'APPLICATION_URL_UNCERTAIN',
  'IMAGE_TEXT_UNCLEAR',
  'SOURCE_CONTENT_INCOMPLETE',
]);

export const ExtractedDeadlineCandidateSchema = z.object({
  date: z.string().nullable(),
  time: z.string().nullable(),
  timezone: z.string().nullable(),
  kind: z.enum([
    'EXACT_INSTANT',
    'DATE_ONLY',
    'ROLLING',
    'NONE_STATED',
    'AMBIGUOUS',
    'CLOSED',
  ]),
  label: z.string().nullable(),
  confidence: z.number().min(0).max(1),
  evidence: z.string().nullable(),
});

export const FundingInfoSchema = z.object({
  isFunded: z.boolean().nullable(),
  details: z.string().nullable(),
});

export const ExtractionResultSchema = z.object({
  title: z.string().nullable(),
  organization: z.string().nullable(),
  opportunityType: z.enum([
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
  ]).nullable(),
  summary: z.string().nullable(),
  location: z.string().nullable(),
  funding: FundingInfoSchema.nullable(),
  applicationUrl: z.string().nullable(),
  primaryDeadline: ExtractedDeadlineCandidateSchema.nullable(),
  alternativeDeadlines: z.array(ExtractedDeadlineCandidateSchema),
  eligibility: z.array(z.string()),
  requiredDocuments: z.array(z.string()),
});

export const ConfirmExtractionDtoSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  organization: z.string().max(200).nullable(),
  opportunityType: z.enum([
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
  ]),
  summary: z.string().max(2000).nullable(),
  location: z.string().max(200).nullable(),
  funding: FundingInfoSchema.nullable(),
  applicationUrl: z.string().url().max(1000).nullable(),
  deadline: z.object({
    kind: z.enum([
      'EXACT_INSTANT',
      'DATE_ONLY',
      'ROLLING',
      'NONE_STATED',
      'AMBIGUOUS',
      'CLOSED',
    ]),
    originalText: z.string().nullable(),
    localDate: z.string().nullable(),
    localTime: z.string().nullable(),
    timezone: z.string().nullable(),
    utcInstant: z.string().nullable(),
    confidence: z.number().min(0).max(1),
    userConfirmed: z.boolean(),
    evidence: z.string().nullable(),
    alternativeCandidates: z.array(z.string()),
  }),
});
