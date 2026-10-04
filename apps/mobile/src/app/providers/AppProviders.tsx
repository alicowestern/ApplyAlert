/**
 * AppProviders — wraps the application with all required providers.
 *
 * Order matters: outermost providers are available to inner ones.
 */

import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryProvider } from './QueryProvider';
import { SyncProvider } from './SyncProvider';

interface AppProvidersProps {
  children: React.ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SafeAreaProvider>
      <QueryProvider>
        <SyncProvider>
          <NavigationContainer>
            {children}
          </NavigationContainer>
        </SyncProvider>
      </QueryProvider>
    </SafeAreaProvider>
  );
}
