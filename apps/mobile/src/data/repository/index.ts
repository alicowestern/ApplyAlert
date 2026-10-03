/**
 * Exports the repository instance.
 */

import { MmkvOpportunityRepository } from './MmkvOpportunityRepository';
import type { OpportunityRepository } from './types';

export * from './types';
export * from './schema';

/**
 * Singleton instance of the repository.
 * In a larger app this might be provided via DI or Context,
 * but a singleton is fine for local persistence.
 */
export const opportunityRepository: OpportunityRepository = new MmkvOpportunityRepository();
