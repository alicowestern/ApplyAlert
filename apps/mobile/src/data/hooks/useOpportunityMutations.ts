/**
 * React Query hooks for mutating opportunities.
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { ApplicationStatus } from '@applyalert/contracts';
import { opportunityService } from '../services/OpportunityService';
import { opportunityKeys } from './queryKeys';
import { unwrap } from '../../types/result';

export function useCreateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Parameters<typeof opportunityService.createOpportunity>[0]) => {
      const result = await opportunityService.createOpportunity(data);
      return unwrap(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useUpdateOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Parameters<typeof opportunityService.updateOpportunity>[1] }) => {
      const result = await opportunityService.updateOpportunity(id, updates);
      return unwrap(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useUpdateOpportunityStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: ApplicationStatus }) => {
      const result = await opportunityService.updateStatus(id, status);
      return unwrap(result);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}

export function useDeleteOpportunity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const result = await opportunityService.deleteOpportunity(id);
      return unwrap(result);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: opportunityKeys.lists() });
    },
  });
}
