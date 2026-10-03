import React from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { OpportunityCard } from '../../../components/OpportunityCard';
import { EmptyState } from '../../../components/EmptyState';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useSortedOpportunities } from '../../../data/hooks/useOpportunityQueries';
import { classifyDeadline } from '../../../domain/deadline-classification';
import type { HomeStackScreenProps } from '../../../app/navigation/types';
import { CheckCircle2, Calendar } from 'lucide-react-native';

export function HomeScreen({ navigation }: HomeStackScreenProps<'HomeMain'>) {
  const theme = useAppTheme();
  const { data: opportunities, isLoading } = useSortedOpportunities();

  const handlePress = (id: string) => {
    navigation.navigate('OpportunityDetail', { id });
  };

  if (isLoading) {
    return (
      <ScreenContainer>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      </ScreenContainer>
    );
  }

  // Filter urgent vs upcoming vs needs attention
  const urgent = [];
  const upcoming = [];
  const needsAttention = [];
  
  let preparingCount = 0;

  if (opportunities) {
    for (const opp of opportunities) {
      if (opp.status === 'APPLIED' || opp.status === 'ARCHIVED') continue;
      
      if (opp.status === 'PREPARING') preparingCount++;

      const urgency = classifyDeadline(opp.deadline);
      if (urgency === 'AMBIGUOUS') {
        needsAttention.push(opp);
      } else if (urgency === 'TODAY' || urgency === 'URGENT' || urgency === 'SOON' || urgency === 'OVERDUE') {
        urgent.push(opp);
      } else {
        upcoming.push(opp);
      }
    }
  }


  if (opportunities && opportunities.length === 0) {
    return (
      <ScreenContainer testID="home-screen">
        <View style={styles.centerContent}>
          <EmptyState 
            title="Never lose track of an opportunity again." 
            description="Add an opportunity and ApplyAlert will help you keep its deadline in sight." 
          />
        </View>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer testID="home-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="heading1">Good morning</Typography>
          <Typography
            variant="bodySmall"
            color={theme.colors.textSecondary}
            style={styles.subtitle}
          >
            Your opportunities
          </Typography>
          
          <View style={styles.summaryContainer}>
            <View style={styles.summaryItem}>
              <Typography variant="heading3" color={theme.colors.urgency.critical}>{urgent.length}</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>urgent</Typography>
            </View>
            <View style={styles.summaryItem}>
              <Typography variant="heading3">{upcoming.length}</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>upcoming</Typography>
            </View>
            <View style={styles.summaryItem}>
              <Typography variant="heading3" color={theme.colors.primary[600]}>{preparingCount}</Typography>
              <Typography variant="caption" color={theme.colors.textSecondary}>preparing</Typography>
            </View>
          </View>
        </View>

        {needsAttention.length > 0 && (
          <View style={styles.section}>
            <Typography variant="heading3" color={theme.colors.info} style={styles.sectionTitle}>
              Needs Attention
            </Typography>
            {needsAttention.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} onPress={() => handlePress(opp.id)} />
            ))}
          </View>
        )}

        <View style={styles.section}>
          <Typography variant="heading3" color={theme.colors.urgency.critical} style={styles.sectionTitle}>
            Urgent
          </Typography>
          {urgent.length > 0 ? (
            urgent.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} onPress={() => handlePress(opp.id)} />
            ))
          ) : (
            <EmptyState 
              title="No urgent deadlines" 
              description="You're all caught up for now." 
              IconComponent={CheckCircle2}
            />
          )}
        </View>

        <View style={styles.section}>
          <Typography variant="heading3" style={styles.sectionTitle}>
            Upcoming
          </Typography>
          {upcoming.length > 0 ? (
            upcoming.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} onPress={() => handlePress(opp.id)} />
            ))
          ) : (
            <EmptyState 
              title="No upcoming opportunities" 
              description={urgent.length > 0 ? "All your opportunities are urgent." : "No upcoming deadlines."}
              IconComponent={Calendar}
            />
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  subtitle: {
    marginTop: 4,
  },
  summaryContainer: {
    flexDirection: 'row',
    gap: 24,
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E4E8EC',
  },
  summaryItem: {
    alignItems: 'flex-start',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
