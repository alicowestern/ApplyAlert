import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../hooks/useAppTheme';
import { DeadlineBadge } from './DeadlineBadge';
import { StatusBadge } from './StatusBadge';
import type { Opportunity } from '@applyalert/contracts';
import { classifyDeadline } from '../domain/deadline-classification';
import { daysRemaining } from '../domain/deadline-utils';
import { Briefcase, Building2 } from 'lucide-react-native';

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
        <Typography variant="heading3" style={styles.title} numberOfLines={2}>
          {opportunity.title}
        </Typography>
        
        {opportunity.status !== 'APPLIED' && opportunity.status !== 'ARCHIVED' && (
          <DeadlineBadge urgency={urgency} daysRemaining={days} />
        )}
      </View>

      <View style={styles.metadataRow}>
        {opportunity.organization && (
          <View style={styles.metadataItem}>
            <Building2 size={14} color={theme.colors.textTertiary} style={styles.icon} />
            <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
              {opportunity.organization}
            </Typography>
          </View>
        )}
        
        <View style={styles.metadataItem}>
          <Briefcase size={14} color={theme.colors.textTertiary} style={styles.icon} />
          <Typography variant="caption" color={theme.colors.textSecondary} numberOfLines={1}>
            {opportunity.opportunityType}
          </Typography>
        </View>
      </View>

      <View style={styles.footerRow}>
        <StatusBadge status={opportunity.status} />
      </View>
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
    gap: 12,
    marginBottom: 8,
  },
  title: {
    flex: 1,
    lineHeight: 24,
  },
  metadataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  icon: {
    marginRight: 6,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: '#E4E8EC',
    paddingTop: 12,
  },
});
