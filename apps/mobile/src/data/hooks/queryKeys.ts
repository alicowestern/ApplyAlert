/**
 * Query key factory for TanStack Query.
 * 
 * Centralizing keys prevents typos and ensures cache invalidation
 * targets the right queries.
 */

export const opportunityKeys = {
  all: ['opportunities'] as const,
  lists: () => [...opportunityKeys.all, 'list'] as const,
  list: (filters: string) => [...opportunityKeys.lists(), { filters }] as const,
  details: () => [...opportunityKeys.all, 'detail'] as const,
  detail: (id: string) => [...opportunityKeys.details(), id] as const,
};
