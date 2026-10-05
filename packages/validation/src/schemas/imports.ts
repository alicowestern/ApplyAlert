/**
 * Validation schemas for Import API payloads.
 */

import { z } from 'zod';

export const ImportStatusSchema = z.enum([
  'PENDING',
  'PROCESSING',
  'READY_FOR_EXTRACTION',
  'FAILED',
  'CANCELLED',
]);

export const ImportInputTypeSchema = z.enum(['URL', 'TEXT', 'IMAGE', 'PDF']);

export const CreateTextImportSchema = z.object({
  text: z
    .string()
    .min(1, 'Text content is required')
    .max(100_000, 'Text content exceeds maximum length of 100,000 characters'),
});

export const CreateUrlImportSchema = z.object({
  url: z
    .string()
    .url('Must be a valid URL')
    .refine(
      (val) => val.startsWith('http://') || val.startsWith('https://'),
      { message: 'Only HTTP and HTTPS URLs are allowed' },
    ),
});

export const ListImportsQuerySchema = z.object({
  status: ImportStatusSchema.optional(),
  limit: z.coerce.number().int().min(1).max(100).optional(),
  cursor: z.string().uuid().optional(),
});
