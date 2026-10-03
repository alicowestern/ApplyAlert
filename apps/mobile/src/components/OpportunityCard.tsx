import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../hooks/useAppTheme';
import { DeadlineBadge } from './DeadlineBadge';
import { StatusBadge } from './StatusBadge';
import type { Opportunity } from '@applyalert/contracts';
import { classifyDeadline } from '../domain/deadline-classification';
import { daysRemaining } from '../domain/deadline-utils';

interface OpportunityCardProps {
  opportunity: Opportunity;
  onPress: () => void;
}

export function OpportunityCard({ opportunity, onPress }: OpportunityCardProps) {
  const theme = useAppTheme();
  
  const urgency = classifyDeadline(opportunity.deadline);
  const days = daysRemaining(opportunity.deadline);

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPress}
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.surfaceElevated,
          borderColor: theme.colors.border,
          borderRadius: theme.radius.md,
          ...theme.shadows.sm,
        },
      ]}
    >
      <View style={styles.headerRow}>
        <View style={styles.badges}>
          <StatusBadge status={opportunity.status} />
          {opportunity.status !== 'APPLIED' && opportunity.status !== 'ARCHIVED' && (
            <DeadlineBadge urgency={urgency} daysRemaining={days} />
          )}
        </View>
        <Typography variant="caption" color={theme.colors.textTertiary}>
          {opportunity.opportunityType}
        </Typography>
      </View>

      <Typography variant="heading3" style={styles.title} numberOfLines={2}>
        {opportunity.title}
      </Typography>

      {opportunity.organization && (
        <Typography variant="bodySmall" color={theme.colors.textSecondary} numberOfLines={1}>
          {opportunity.organization}
        </Typography>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderWidth: 1,
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  title: {
    marginBottom: 4,
  },
});
