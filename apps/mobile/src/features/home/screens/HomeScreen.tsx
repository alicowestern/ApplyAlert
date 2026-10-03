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

  // Filter urgent vs upcoming
  const urgent = [];
  const upcoming = [];

  if (opportunities) {
    for (const opp of opportunities) {
      if (opp.status === 'APPLIED' || opp.status === 'ARCHIVED') continue;

      const urgency = classifyDeadline(opp.deadline);
      if (urgency === 'TODAY' || urgency === 'URGENT' || urgency === 'SOON' || urgency === 'OVERDUE') {
        urgent.push(opp);
      } else {
        upcoming.push(opp);
      }
    }
  }

  return (
    <ScreenContainer testID="home-screen">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
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
              icon="✅" 
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
              description={urgent.length > 0 ? "All your opportunities are urgent." : "Add your first opportunity to get started."}
              icon="📅"
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
