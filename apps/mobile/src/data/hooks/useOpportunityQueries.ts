/**
 * React Query hooks for fetching opportunities.
 */

import { useQuery } from '@tanstack/react-query';
import type { ApplicationStatus } from '@applyalert/contracts';
import { opportunityService } from '../services/OpportunityService';
import { opportunityKeys } from './queryKeys';
import { unwrap } from '../../types/result';
import { compareDeadlines } from '../../domain/deadline-utils';

/**
 * Fetch all active opportunities.
 */
export function useActiveOpportunities() {
  return useQuery({
    queryKey: opportunityKeys.list('active'),
    queryFn: async () => {
      const result = await opportunityService.getActiveOpportunities();
      return unwrap(result);
    },
  });
}

/**
 * Fetch active opportunities sorted by nearest deadline.
 */
export function useSortedOpportunities() {
  return useQuery({
    queryKey: opportunityKeys.list('sorted'),
    queryFn: async () => {
      const result = await opportunityService.getActiveOpportunities();
      const opps = unwrap(result);
      // Sort in-place is fine since we own the array returned by service
      return opps.sort((a, b) => compareDeadlines(a.deadline, b.deadline));
    },
  });
}

/**
 * Fetch opportunities filtered by status.
 */
export function useOpportunitiesByStatus(status: ApplicationStatus) {
  return useQuery({
    queryKey: opportunityKeys.list(`status:${status}`),
    queryFn: async () => {
      const result = await opportunityService.getOpportunitiesByStatus(status);
      return unwrap(result);
    },
  });
}

/**
 * Fetch a single opportunity by ID.
 */
export function useOpportunity(id: string) {
  return useQuery({
    queryKey: opportunityKeys.detail(id),
    queryFn: async () => {
      const result = await opportunityService.getOpportunity(id);
      return unwrap(result);
    },
    enabled: !!id,
  });
}
