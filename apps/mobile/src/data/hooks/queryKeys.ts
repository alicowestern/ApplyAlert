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

export const importKeys = {
  all: ['imports'] as const,
  lists: () => [...importKeys.all, 'list'] as const,
  details: () => [...importKeys.all, 'detail'] as const,
  detail: (id: string) => [...importKeys.details(), id] as const,
};

