import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Typography } from './Typography';
import { useAppTheme } from '../hooks/useAppTheme';
import { type DeadlineUrgency, urgencyColor, urgencyLabel } from '../domain/deadline-classification';

interface DeadlineBadgeProps {
  urgency: DeadlineUrgency;
  daysRemaining: number | null;
}

export function DeadlineBadge({ urgency, daysRemaining }: DeadlineBadgeProps) {
  const theme = useAppTheme();
  
  const colorKey = urgencyColor(urgency) as keyof typeof theme.colors.urgency;
  const color = theme.colors.urgency[colorKey];
  
  let text = urgencyLabel(urgency);
  if (daysRemaining !== null && daysRemaining > 0) {
    text = `${daysRemaining} day${daysRemaining === 1 ? '' : 's'}`;
  }

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${color}1A`, // 10% opacity hex
          borderColor: `${color}4D`, // 30% opacity hex
          borderRadius: theme.radius.sm,
        },
      ]}
    >
      <Typography variant="caption" color={color} style={{ fontWeight: theme.typography.fontWeight.bold }}>
        {text}
      </Typography>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
});
