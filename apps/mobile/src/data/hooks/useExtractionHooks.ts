import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultApiClient as api } from '../services/api/ApiClient';

export function useExtraction(extractionId: string | undefined, opts?: { refetchInterval?: number }) {
  return useQuery({
    queryKey: ['extractions', extractionId],
    queryFn: async () => {
      if (!extractionId) throw new Error('No extraction ID');
      return api.getExtraction(extractionId);
    },
    enabled: !!extractionId,
    refetchInterval: opts?.refetchInterval,
  });
}

export function useTriggerExtraction() {
  return useMutation({
    mutationFn: async ({ importId, input }: { importId: string; input: any }) => {
      return api.triggerExtraction(importId, input);
    },
  });
}

export function useConfirmExtraction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ extractionId, dto }: { extractionId: string; dto: any }) => {
      return api.confirmExtraction(extractionId, dto);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] });
    },
  });
}
