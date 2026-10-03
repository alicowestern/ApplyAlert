import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../hooks/useAppTheme';
import { Inbox } from 'lucide-react-native';
import { LucideIcon } from 'lucide-react-native';

interface EmptyStateProps {
  title: string;
  description: string;
  IconComponent?: LucideIcon;
}

export function EmptyState({ title, description, IconComponent = Inbox }: EmptyStateProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surface,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
        },
      ]}
    >
      <View style={styles.icon}>
        <IconComponent size={48} color={theme.colors.textTertiary} strokeWidth={1.5} />
      </View>
      <Typography variant="heading3" align="center" style={styles.title}>
        {title}
      </Typography>
      <Typography variant="body" color={theme.colors.textSecondary} align="center">
        {description}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 32,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginBottom: 16,
  },
  title: {
    marginBottom: 8,
  },
});
