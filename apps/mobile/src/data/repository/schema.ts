/**
 * Storage schema definitions.
 * 
 * This defines how data is laid out in the local storage engine.
 */

import { z } from 'zod';
import { OpportunitySchema } from '@applyalert/validation';

/**
 * The root document stored under our MMKV key.
 * Contains a schema version to allow future migrations.
 */
export const StorageDocumentSchema = z.object({
  version: z.number().int(),
  opportunities: z.array(OpportunitySchema),
});

export type StorageDocument = z.infer<typeof StorageDocumentSchema>;

/**
 * Current schema version for new installations.
 */
export const CURRENT_SCHEMA_VERSION = 1;

/**
 * The MMKV key used to store the opportunities document.
 */
export const OPPORTUNITIES_STORAGE_KEY = 'applyalert_opportunities_doc';
