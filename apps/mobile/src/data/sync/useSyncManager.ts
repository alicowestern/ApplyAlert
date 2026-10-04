/**
 * useSyncManager hook — orchestrates background synchronization.
 *
 * It listens to app state changes (foregrounding) and network availability
 * to trigger syncs. It also provides a manual trigger.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';
import { syncService } from './SyncService';

export function useSyncManager() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null);
  const [lastSyncError, setLastSyncError] = useState<string | null>(null);
  const appState = useRef(AppState.currentState);
  const netInfo = useNetInfo();

  const triggerSync = useCallback(async (force = false) => {
    // Only sync if network is available and we aren't already syncing
    if (!netInfo.isConnected && !force) {
      return;
    }
    
    if (syncService.isSyncing() || isSyncing) {
      return;
    }

    setIsSyncing(true);
    setLastSyncError(null);

    try {
      const result = await syncService.sync();
      
      if (result.success) {
        setLastSyncTime(new Date());
      } else {
        setLastSyncError(result.errors.join(', '));
      }
      
      // We don't necessarily want to spam the UI with toast notifications
      // for background syncs, so we just update state.
      if (result.pushed > 0 || result.pulled > 0) {
        console.log(`Sync completed: pushed ${result.pushed}, pulled ${result.pulled}`);
        // Consider invalidating TanStack queries here if data was pulled
        // But the safest way is for the component to provide a callback,
        // or for us to rely on the App wrapper invalidating.
      }
    } catch (e) {
      setLastSyncError(e instanceof Error ? e.message : 'Unknown sync error');
    } finally {
      setIsSyncing(false);
    }
  }, [netInfo.isConnected, isSyncing]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      // App has come to the foreground
      if (
        appState.current?.match(/inactive|background/) &&
        nextAppState === 'active'
      ) {
        triggerSync();
      }
      appState.current = nextAppState;
    });

    return () => {
      subscription.remove();
    };
  }, [triggerSync]);

  // Optional: trigger on network reconnection
  useEffect(() => {
    if (netInfo.isConnected && !isSyncing) {
      // Small delay to ensure connection is actually usable
      const timer = setTimeout(() => triggerSync(), 2000);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [netInfo.isConnected, isSyncing, triggerSync]);

  return {
    isSyncing,
    lastSyncTime,
    lastSyncError,
    triggerSync,
  };
}
