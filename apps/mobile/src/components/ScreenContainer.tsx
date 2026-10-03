/**
 * ScreenContainer — standard wrapper for all screens.
 *
 * Provides consistent padding, safe area handling,
 * and background color.
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAppTheme } from '../hooks/useAppTheme';

interface ScreenContainerProps {
  children: React.ReactNode;
  /** If true, uses edge-to-edge layout without padding. */
  noPadding?: boolean;
  /** Test ID for testing. */
  testID?: string;
}

export function ScreenContainer({ children, noPadding = false, testID }: ScreenContainerProps) {
  const theme = useAppTheme();

  return (
    <SafeAreaView
      testID={testID}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.content,
          !noPadding && { paddingHorizontal: theme.spacing.lg },
        ]}
      >
        {children}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
