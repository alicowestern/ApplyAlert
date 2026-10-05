import { ExtractionInput, ExtractionResult } from '@applyalert/contracts';

export interface ExtractionContext {
  readonly extractionId: string;
  readonly promptVersion: string;
  readonly schemaVersion: string;
}

/**
 * Raw output from the AI provider before our deterministic validation.
 */
export interface RawAiResult {
  readonly result: ExtractionResult;
  readonly provider: string;
  readonly model: string;
}

/**
 * Provider-independent interface for AI extraction.
 */
export interface ExtractionProvider {
  /**
   * Processes the normalized source text and extracts the structured opportunity.
   */
  extract(input: ExtractionInput, context: ExtractionContext): Promise<RawAiResult>;
}

export const EXTRACTION_PROVIDER = Symbol('EXTRACTION_PROVIDER');
