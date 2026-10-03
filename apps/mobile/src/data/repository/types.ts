/**
 * Repository interface for Opportunities.
 * 
 * Abstracting this ensures components don't know we're using MMKV.
 * It also returns a Result type instead of throwing.
 */

import type { Opportunity } from '@applyalert/contracts';
import type { Result } from '../../types/result';

export interface OpportunityRepository {
  /** Get all opportunities (active and archived) */
  listAll(): Promise<Result<Opportunity[]>>;
  
  /** Get an opportunity by its ID */
  getById(id: string): Promise<Result<Opportunity | null>>;
  
  /** Create a new opportunity */
  create(opportunity: Opportunity): Promise<Result<void>>;
  
  /** Update an existing opportunity */
  update(opportunity: Opportunity): Promise<Result<void>>;
  
  /** Delete an opportunity permanently */
  delete(id: string): Promise<Result<void>>;
}
