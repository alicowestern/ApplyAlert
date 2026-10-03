/**
 * Root application component.
 */

import React from 'react';
import { StatusBar } from 'react-native';
import { ErrorBoundary } from './ErrorBoundary';
import { AppProviders } from './providers/AppProviders';
import { RootNavigator } from './navigation/RootNavigator';

export function App() {
  return (
    <ErrorBoundary>
      <AppProviders>
        <StatusBar barStyle="dark-content" />
        <RootNavigator />
      </AppProviders>
    </ErrorBoundary>
  );
}
