import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { OpportunityCard } from '../../../components/OpportunityCard';
import { EmptyState } from '../../../components/EmptyState';
import { useOpportunitiesByStatus } from '../../../data/hooks/useOpportunityQueries';
import { SettingsStackScreenProps } from '../../../app/navigation/types';
import { ChevronLeft, Archive } from 'lucide-react-native';

export function ArchivedOpportunitiesScreen({ navigation }: SettingsStackScreenProps<'ArchivedOpportunities'>) {
  const theme = useAppTheme();
  const { data: opportunities, isLoading } = useOpportunitiesByStatus('ARCHIVED');

  const handlePress = (id: string) => {
    // Navigate back to the home stack to view detail.
    // In a deep linking setup this would be cleaner, but for now we can navigate
    // to Home's OpportunityDetail screen.
    navigation.navigate('Home', { screen: 'OpportunityDetail', params: { id } });
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <ChevronLeft size={20} color={theme.colors.primary[500]} />
          <Typography variant="body" color={theme.colors.primary[500]}>Back</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <Typography variant="heading1">Archived</Typography>
          <Typography variant="bodySmall" color={theme.colors.textSecondary}>
            Past and closed opportunities
          </Typography>
        </View>

        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          </View>
        ) : opportunities && opportunities.length > 0 ? (
          <View style={styles.list}>
            {opportunities.map((opp) => (
              <OpportunityCard key={opp.id} opportunity={opp} onPress={() => handlePress(opp.id)} />
            ))}
          </View>
        ) : (
          <EmptyState
            title="No archived opportunities"
            description="When you archive opportunities, they'll appear here."
            IconComponent={Archive}
          />
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    marginLeft: -4,
  },
  header: {
    marginBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 40,
  },
  list: {
    gap: 12,
  },
});
