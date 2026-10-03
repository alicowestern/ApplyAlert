import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../hooks/useAppTheme';
import { type DeadlineUrgency, urgencyLabel } from '../domain/deadline-classification';
import { Clock, Calendar, AlertTriangle, Infinity as InfinityIcon } from 'lucide-react-native';

interface DeadlineBadgeProps {
  urgency: DeadlineUrgency;
  daysRemaining: number | null;
}

export function DeadlineBadge({ urgency, daysRemaining }: DeadlineBadgeProps) {
  const theme = useAppTheme();
  
  // Map urgency to deadline token key
  let deadlineKey: keyof typeof theme.colors.deadline = 'upcoming';
  let Icon = Calendar;

  switch (urgency) {
    case 'OVERDUE':
      deadlineKey = 'overdue';
      Icon = AlertTriangle;
      break;
    case 'TODAY':
      deadlineKey = 'today';
      Icon = Clock;
      break;
    case 'URGENT':
      deadlineKey = 'urgent';
      Icon = Clock;
      break;
    case 'SOON':
      deadlineKey = 'soon';
      Icon = Clock;
      break;
    case 'UPCOMING':
      deadlineKey = 'upcoming';
      Icon = Calendar;
      break;
    case 'ROLLING':
      deadlineKey = 'rolling';
      Icon = InfinityIcon;
      break;
    case 'AMBIGUOUS':
      deadlineKey = 'ambiguous';
      Icon = AlertTriangle;
      break;
  }

  const { bg, text } = theme.colors.deadline[deadlineKey];
  
  let labelText = urgencyLabel(urgency);
  if (daysRemaining !== null && daysRemaining > 0) {
    labelText = `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: bg,
          borderRadius: theme.radius.sm,
        },
      ]}
    >
      <Icon color={text} size={14} style={styles.icon} />
      <Typography variant="caption" color={text} style={{ fontWeight: theme.typography.fontWeight.bold }}>
        {labelText}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  icon: {
    marginRight: 2,
  },
});
