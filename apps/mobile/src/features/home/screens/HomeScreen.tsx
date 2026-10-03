/**
 * Home screen â€” the main landing screen.
 *
 * Will eventually show:
 * - Urgent deadlines section
 * - Upcoming deadlines section
 */

import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';

export function HomeScreen() {
  const theme = useAppTheme();

  return (
    <ScreenContainer testID="home-screen">
      <View style={styles.header}>
        <Typography variant="heading1">ApplyAlert</Typography>
        <Typography
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          Never miss a deadline
        </Typography>
      </View>

      <View style={styles.section}>
        <Typography variant="heading3" color={theme.colors.urgency.critical}>
          Urgent
        </Typography>
        <View
          style={[
            styles.placeholder,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Typography variant="body" color={theme.colors.textTertiary} align="center">
            No urgent deadlines
          </Typography>
        </View>
      </View>

      <View style={styles.section}>
        <Typography variant="heading3">Upcoming</Typography>
        <View
          style={[
            styles.placeholder,
            {
              backgroundColor: theme.colors.surface,
              borderRadius: theme.radius.md,
              borderColor: theme.colors.border,
            },
          ]}
        >
          <Typography variant="body" color={theme.colors.textTertiary} align="center">
            Add your first opportunity to get started
          </Typography>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  subtitle: {
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  placeholder: {
    marginTop: 12,
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
