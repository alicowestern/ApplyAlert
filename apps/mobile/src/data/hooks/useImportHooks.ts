import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { defaultApiClient } from '../services/api/ApiClient';
import { importKeys } from './queryKeys';
import type {
  CreateTextImportDto,
  CreateUrlImportDto,
} from '@applyalert/contracts';

/**
 * Poll an import's status until it reaches a terminal state
 * (READY_FOR_EXTRACTION, FAILED, CANCELLED).
 */
export function useImport(id: string | null) {
  return useQuery({
    queryKey: importKeys.detail(id || ''),
    queryFn: () => defaultApiClient.getImport(id!),
    enabled: !!id,
    refetchInterval: (query) => {
      const data = query.state.data;
      if (!data) return 1000;
      if (data.status === 'PENDING' || data.status === 'PROCESSING') {
        return 1000;
      }
      return false; // Stop polling on terminal states
    },
  });
}

export function useCreateTextImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateTextImportDto) => defaultApiClient.createTextImport(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(importKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}

export function useCreateUrlImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (dto: CreateUrlImportDto) => defaultApiClient.createUrlImport(dto),
    onSuccess: (data) => {
      queryClient.setQueryData(importKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}

export function useCreateFileImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => defaultApiClient.createFileImport(formData),
    onSuccess: (data) => {
      queryClient.setQueryData(importKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}

export function useCancelImport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => defaultApiClient.cancelImport(id),
    onSuccess: (data) => {
      queryClient.setQueryData(importKeys.detail(data.id), data);
      queryClient.invalidateQueries({ queryKey: importKeys.lists() });
    },
  });
}
