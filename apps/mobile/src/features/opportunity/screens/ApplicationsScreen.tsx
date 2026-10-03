import React, { useState } from 'react';
import { StyleSheet, View, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { OpportunityCard } from '../../../components/OpportunityCard';
import { EmptyState } from '../../../components/EmptyState';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOpportunitiesByStatus } from '../../../data/hooks/useOpportunityQueries';
import type { ApplicationStatus } from '@applyalert/contracts';
import type { ApplicationsStackScreenProps } from '../../../app/navigation/types';

const STATUS_TABS: Array<{ key: ApplicationStatus; label: string }> = [
  { key: 'SAVED', label: 'Saved' },
  { key: 'PREPARING', label: 'Preparing' },
  { key: 'APPLIED', label: 'Applied' },
];

export function ApplicationsScreen({ navigation }: ApplicationsStackScreenProps<'ApplicationsMain'>) {
  const theme = useAppTheme();
  const [activeTab, setActiveTab] = useState<ApplicationStatus>('SAVED');
  
  const { data: opportunities, isLoading } = useOpportunitiesByStatus(activeTab);

  const handlePress = (id: string) => {
    navigation.navigate('OpportunityDetail', { id });
  };

  return (
    <ScreenContainer testID="applications-screen" noPadding>
      <View style={[styles.header, { paddingHorizontal: theme.spacing.lg }]}>
        <Typography variant="heading1">Applications</Typography>
      </View>

      <View style={[styles.tabs, { borderBottomColor: theme.colors.border, paddingHorizontal: theme.spacing.lg }]}>
        {STATUS_TABS.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              testID={`tab-${tab.key.toLowerCase()}`}
              style={[
                styles.tab,
                isActive && styles.activeTab,
                isActive && { borderBottomColor: theme.colors.primary[500] },
              ]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Typography
                variant="label"
                color={isActive ? theme.colors.primary[500] : theme.colors.textSecondary}
              >
                {tab.label}
              </Typography>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={[styles.content, { paddingHorizontal: theme.spacing.lg }]}>
        {isLoading ? (
          <View style={styles.centerContent}>
            <ActivityIndicator size="large" color={theme.colors.primary[500]} />
          </View>
        ) : opportunities && opportunities.length > 0 ? (
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
            {opportunities.map(opp => (
              <OpportunityCard key={opp.id} opportunity={opp} onPress={() => handlePress(opp.id)} />
            ))}
          </ScrollView>
        ) : (
          <EmptyState 
            title={`No ${activeTab.toLowerCase()} applications`} 
            description="Opportunities will appear here as you change their status." 
            icon="📂" 
          />
        )}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomWidth: 2,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 24,
  },
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
