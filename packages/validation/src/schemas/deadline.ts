/**
 * Zod schemas for Deadline validation.
 *
 * These schemas validate data coming from the API/AI pipeline
 * to ensure deadline integrity before it reaches the UI.
 */

import { z } from 'zod';

export const DeadlineKindSchema = z.enum([
  'EXACT_INSTANT',
  'DATE_ONLY',
  'ROLLING',
  'NONE_STATED',
  'AMBIGUOUS',
  'CLOSED',
]);

/**
 * ISO 8601 date pattern: YYYY-MM-DD
 */
const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

/**
 * ISO 8601 time pattern: HH:mm:ss
 */
const isoTimePattern = /^\d{2}:\d{2}:\d{2}$/;

/**
 * ISO 8601 UTC instant pattern: ends with Z
 */
const utcInstantPattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z$/;

export const DeadlineSchema = z.object({
  kind: DeadlineKindSchema,
  originalText: z.string().nullable(),
  localDate: z
    .string()
    .regex(isoDatePattern, 'localDate must be ISO 8601 date (YYYY-MM-DD)')
    .nullable(),
  localTime: z
    .string()
    .regex(isoTimePattern, 'localTime must be ISO 8601 time (HH:mm:ss)')
    .nullable(),
  timezone: z.string().nullable(),
  utcInstant: z
    .string()
    .regex(utcInstantPattern, 'utcInstant must be ISO 8601 UTC instant')
    .nullable(),
  confidence: z.number().min(0).max(1),
  userConfirmed: z.boolean(),
  evidence: z.string().nullable(),
  alternativeCandidates: z.array(z.string()).readonly(),
}).refine(
  (data) => {
    // utcInstant should only be set when all components are known
    if (data.utcInstant !== null) {
      return data.localDate !== null && data.localTime !== null && data.timezone !== null;
    }
    return true;
  },
  {
    message: 'utcInstant requires localDate, localTime, and timezone to all be present',
  },
).refine(
  (data) => {
    // AMBIGUOUS kind should have alternative candidates
    if (data.kind === 'AMBIGUOUS') {
      return data.alternativeCandidates.length > 0;
    }
    return true;
  },
  {
    message: 'AMBIGUOUS deadline must have at least one alternative candidate',
  },
);

export type ValidatedDeadline = z.infer<typeof DeadlineSchema>;
