/**
 * MMKV implementation of OpportunityRepository.
 */

import { createMMKV, type MMKV } from 'react-native-mmkv';
import type { Opportunity } from '@applyalert/contracts';
import type { OpportunityRepository } from './types';
import { ok, err, type Result } from '../../types/result';
import { StorageDocumentSchema, CURRENT_SCHEMA_VERSION, OPPORTUNITIES_STORAGE_KEY, type StorageDocument } from './schema';

export class MmkvOpportunityRepository implements OpportunityRepository {
  private storage: MMKV;

  constructor() {
    this.storage = createMMKV({
      id: 'applyalert-storage',
    });
  }

  /**
   * Reads the entire document from storage.
   * If it doesn't exist, returns an empty document.
   * Validates the structure with Zod.
   */
  private readDocument(): Result<StorageDocument> {
    try {
      const jsonStr = this.storage.getString(OPPORTUNITIES_STORAGE_KEY);
      
      if (!jsonStr) {
        return ok({ version: CURRENT_SCHEMA_VERSION, opportunities: [] });
      }

      const parsed = JSON.parse(jsonStr);
      const validationResult = StorageDocumentSchema.safeParse(parsed);
      
      if (validationResult.success) {
        return ok(validationResult.data);
      } else {
        console.error('Storage validation failed:', validationResult.error);
        return err(new Error('Corrupted storage data'));
      }
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to read from storage');
      return err(error);
    }
  }

  /**
   * Writes the entire document to storage.
   */
  private writeDocument(doc: StorageDocument): Result<void> {
    try {
      this.storage.set(OPPORTUNITIES_STORAGE_KEY, JSON.stringify(doc));
      return ok(undefined);
    } catch (e) {
      const error = e instanceof Error ? e : new Error('Failed to write to storage');
      return err(error);
    }
  }

  async listAll(): Promise<Result<Opportunity[]>> {
    const docResult = this.readDocument();
    if (!docResult.ok) return docResult;
    return ok(docResult.value.opportunities);
  }

  async getById(id: string): Promise<Result<Opportunity | null>> {
    const docResult = this.readDocument();
    if (!docResult.ok) return docResult;
    
    const opp = docResult.value.opportunities.find(o => o.id === id) || null;
    return ok(opp);
  }

  async create(opportunity: Opportunity): Promise<Result<void>> {
    const docResult = this.readDocument();
    if (!docResult.ok) return docResult;

    const doc = docResult.value;
    
    if (doc.opportunities.some(o => o.id === opportunity.id)) {
      return err(new Error(`Opportunity with id ${opportunity.id} already exists`));
    }
    
    doc.opportunities.push(opportunity as any);
    return this.writeDocument(doc);
  }

  async update(opportunity: Opportunity): Promise<Result<void>> {
    const docResult = this.readDocument();
    if (!docResult.ok) return docResult;

    const doc = docResult.value;
    const index = doc.opportunities.findIndex(o => o.id === opportunity.id);
    
    if (index === -1) {
      return err(new Error(`Opportunity with id ${opportunity.id} not found`));
    }
    
    doc.opportunities[index] = opportunity as any;
    return this.writeDocument(doc);
  }

  async delete(id: string): Promise<Result<void>> {
    const docResult = this.readDocument();
    if (!docResult.ok) return docResult;

    const doc = docResult.value;
    const initialLength = doc.opportunities.length;
    doc.opportunities = doc.opportunities.filter(o => o.id !== id);
    
    if (doc.opportunities.length === initialLength) {
      // Nothing was deleted, but that's okay, operation is idempotent
      return ok(undefined);
    }
    
    return this.writeDocument(doc);
  }
}
