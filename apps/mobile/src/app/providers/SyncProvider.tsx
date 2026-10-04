/**
 * SyncProvider — initializes background synchronization.
 */

import React, { useEffect } from 'react';
import { useSyncManager } from '../../data/sync/useSyncManager';
import { useQueryClient } from '@tanstack/react-query';
import { opportunityKeys } from '../../data/hooks/queryKeys';

interface SyncProviderProps {
  children: React.ReactNode;
}

export function SyncProvider({ children }: SyncProviderProps) {
  const { lastSyncTime, lastSyncError } = useSyncManager();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (lastSyncTime) {
      // Invalidate queries when a sync completes successfully
      // This ensures the UI reflects any data pulled from the server
      queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
    }
  }, [lastSyncTime, queryClient]);

  useEffect(() => {
    if (lastSyncError) {
      console.warn('Background sync failed:', lastSyncError);
    }
  }, [lastSyncError]);

  return <>{children}</>;
}
