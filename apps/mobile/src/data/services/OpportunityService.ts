/**
 * Domain service for managing Opportunities.
 * 
 * Contains business logic, validation, and coordinates with the repository.
 * UI components should use this service (via React Query hooks) rather than
 * calling the repository directly.
 */

import 'react-native-get-random-values';
import { v4 as uuidv4 } from 'uuid';
import { OpportunitySchema } from '@applyalert/validation';
import type { Opportunity, ApplicationStatus } from '@applyalert/contracts';
import { ok, err, type Result } from '../../types/result';
import { opportunityRepository } from '../repository';
import { applyStatusTransition } from '../../domain/status-transitions';

export class OpportunityService {
  /**
   * Get all active opportunities (not archived).
   */
  async getActiveOpportunities(): Promise<Result<Opportunity[]>> {
    const listResult = await opportunityRepository.listAll();
    if (!listResult.ok) return listResult;

    const active = listResult.value.filter(o => o.status !== 'ARCHIVED');
    return ok(active);
  }

  /**
   * Get all opportunities with a specific status.
   */
  async getOpportunitiesByStatus(status: ApplicationStatus): Promise<Result<Opportunity[]>> {
    const listResult = await opportunityRepository.listAll();
    if (!listResult.ok) return listResult;

    const filtered = listResult.value.filter(o => o.status === status);
    return ok(filtered);
  }

  /**
   * Get a single opportunity.
   */
  async getOpportunity(id: string): Promise<Result<Opportunity | null>> {
    return opportunityRepository.getById(id);
  }

  /**
   * Create a new opportunity.
   * Generates ID, timestamps, validates, and persists.
   */
  async createOpportunity(data: Omit<Opportunity, 'id' | 'createdAt' | 'updatedAt' | 'appliedAt' | 'archivedAt'>): Promise<Result<Opportunity>> {
    const now = new Date().toISOString();
    
    const newOpportunity: Opportunity = {
      ...data,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now,
      appliedAt: data.status === 'APPLIED' ? now : null,
      archivedAt: data.status === 'ARCHIVED' ? now : null,
    };

    // Validate against schema before saving
    const validationResult = OpportunitySchema.safeParse(newOpportunity);
    if (!validationResult.success) {
      return err(new Error(`Validation failed: ${validationResult.error.message}`));
    }

    const saveResult = await opportunityRepository.create(validationResult.data);
    if (!saveResult.ok) return err(saveResult.error);

    return ok(validationResult.data);
  }

  /**
   * Update an existing opportunity's editable fields.
   */
  async updateOpportunity(id: string, updates: Partial<Pick<Opportunity, 'title' | 'organization' | 'opportunityType' | 'summary' | 'location' | 'funding' | 'applicationUrl' | 'deadline'>>): Promise<Result<Opportunity>> {
    const getResult = await opportunityRepository.getById(id);
    if (!getResult.ok) return err(getResult.error);
    
    const existing = getResult.value;
    if (!existing) return err(new Error(`Opportunity ${id} not found`));

    const updated: Opportunity = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    const validationResult = OpportunitySchema.safeParse(updated);
    if (!validationResult.success) {
      return err(new Error(`Validation failed: ${validationResult.error.message}`));
    }

    const saveResult = await opportunityRepository.update(validationResult.data);
    if (!saveResult.ok) return err(saveResult.error);

    return ok(validationResult.data);
  }

  /**
   * Update the status of an opportunity, applying valid transitions.
   */
  async updateStatus(id: string, newStatus: ApplicationStatus): Promise<Result<Opportunity>> {
    const getResult = await opportunityRepository.getById(id);
    if (!getResult.ok) return err(getResult.error);
    
    const existing = getResult.value;
    if (!existing) return err(new Error(`Opportunity ${id} not found`));

    try {
      const updated = applyStatusTransition(existing, newStatus);
      
      const validationResult = OpportunitySchema.safeParse(updated);
      if (!validationResult.success) {
        return err(new Error(`Validation failed: ${validationResult.error.message}`));
      }

      const saveResult = await opportunityRepository.update(validationResult.data);
      if (!saveResult.ok) return err(saveResult.error);

      return ok(validationResult.data);
    } catch (e) {
      return err(e instanceof Error ? e : new Error('Unknown error during status transition'));
    }
  }

  /**
   * Permanently delete an opportunity.
   */
  async deleteOpportunity(id: string): Promise<Result<void>> {
    return opportunityRepository.delete(id);
  }
}

export const opportunityService = new OpportunityService();
