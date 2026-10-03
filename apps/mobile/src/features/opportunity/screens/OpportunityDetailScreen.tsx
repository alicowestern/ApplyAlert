import React from 'react';
import { StyleSheet, View, ScrollView, ActivityIndicator, TouchableOpacity, Linking, Alert } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { DeadlineBadge } from '../../../components/DeadlineBadge';
import { StatusBadge } from '../../../components/StatusBadge';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOpportunity } from '../../../data/hooks/useOpportunityQueries';
import { useUpdateOpportunityStatus, useDeleteOpportunity } from '../../../data/hooks/useOpportunityMutations';
import { classifyDeadline } from '../../../domain/deadline-classification';
import { daysRemaining } from '../../../domain/deadline-utils';
import { getValidTransitions } from '../../../domain/status-transitions';
import type { ApplicationStatus } from '@applyalert/contracts';
import type { HomeStackScreenProps, ApplicationsStackScreenProps } from '../../../app/navigation/types';

// This screen can be reached from Home or Applications stacks
type Props = (HomeStackScreenProps<'OpportunityDetail'> | ApplicationsStackScreenProps<'OpportunityDetail'>);

export function OpportunityDetailScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const theme = useAppTheme();
  
  const { data: opportunity, isLoading } = useOpportunity(id);
  const updateStatus = useUpdateOpportunityStatus();
  const deleteOpportunity = useDeleteOpportunity();

  if (isLoading || !opportunity) {
    return (
      <ScreenContainer>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      </ScreenContainer>
    );
  }

  const handleStatusChange = (newStatus: ApplicationStatus) => {
    updateStatus.mutate({ id, status: newStatus });
  };

  const handleDelete = () => {
    Alert.alert(
      "Delete Opportunity",
      "Are you sure you want to permanently delete this opportunity?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Delete", 
          style: "destructive", 
          onPress: () => {
            deleteOpportunity.mutate(id, {
              onSuccess: () => navigation.goBack()
            });
          }
        }
      ]
    );
  };

  const openUrl = () => {
    if (opportunity.applicationUrl) {
      Linking.openURL(opportunity.applicationUrl).catch(() => {
        Alert.alert("Error", "Could not open URL");
      });
    }
  };

  const urgency = classifyDeadline(opportunity.deadline);
  const days = daysRemaining(opportunity.deadline);
  const validNextStatuses = getValidTransitions(opportunity.status);

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Typography variant="body" color={theme.colors.primary[500]}>← Back</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <View style={styles.badges}>
            <StatusBadge status={opportunity.status} />
            <DeadlineBadge urgency={urgency} daysRemaining={days} />
          </View>
          <Typography variant="caption" color={theme.colors.textTertiary} style={styles.type}>
            {opportunity.opportunityType}
          </Typography>
          <Typography variant="heading1" style={styles.title}>{opportunity.title}</Typography>
          {opportunity.organization && (
            <Typography variant="heading3" color={theme.colors.textSecondary}>
              {opportunity.organization}
            </Typography>
          )}
        </View>

        {opportunity.summary && (
          <View style={styles.section}>
            <Typography variant="heading3" style={styles.sectionTitle}>Summary</Typography>
            <Typography variant="body">{opportunity.summary}</Typography>
          </View>
        )}

        <View style={styles.section}>
          <Typography variant="heading3" style={styles.sectionTitle}>Details</Typography>
          {opportunity.location && (
            <Typography variant="body" style={styles.detailRow}>
              <Typography variant="label">Location: </Typography>
              {opportunity.location}
            </Typography>
          )}
          {opportunity.funding && opportunity.funding.details && (
            <Typography variant="body" style={styles.detailRow}>
              <Typography variant="label">Funding: </Typography>
              {opportunity.funding.details}
            </Typography>
          )}
          {opportunity.applicationUrl && (
            <TouchableOpacity onPress={openUrl} style={styles.detailRow}>
              <Typography variant="body" color={theme.colors.primary[500]}>
                Open Application URL ↗
              </Typography>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.section}>
          <Typography variant="heading3" style={styles.sectionTitle}>Deadline Info</Typography>
          <Typography variant="body" style={styles.detailRow}>
            <Typography variant="label">Type: </Typography>
            {opportunity.deadline.kind}
          </Typography>
          {opportunity.deadline.localDate && (
            <Typography variant="body" style={styles.detailRow}>
              <Typography variant="label">Date: </Typography>
              {opportunity.deadline.localDate} {opportunity.deadline.localTime || ''}
            </Typography>
          )}
          {opportunity.deadline.originalText && (
            <Typography variant="body" style={styles.detailRow}>
              <Typography variant="label">Original Text: </Typography>
              "{opportunity.deadline.originalText}"
            </Typography>
          )}
        </View>

        <View style={styles.actions}>
          <Typography variant="heading3" style={styles.sectionTitle}>Actions</Typography>
          
          <View style={styles.actionButtons}>
            {validNextStatuses.map(status => (
              <TouchableOpacity 
                key={status}
                style={[styles.actionButton, { backgroundColor: theme.colors.primary[50] }]}
                onPress={() => handleStatusChange(status)}
              >
                <Typography variant="label" color={theme.colors.primary[600]}>
                  Mark as {status}
                </Typography>
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={[styles.actionButton, { backgroundColor: theme.colors.urgency.critical + '1A' }]}
              onPress={handleDelete}
            >
              <Typography variant="label" color={theme.colors.urgency.critical}>
                Delete
              </Typography>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  centerContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingTop: 16,
  },
  backButton: {
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 32,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  type: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  detailRow: {
    marginBottom: 8,
  },
  actions: {
    marginTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E4E8EC',
    paddingTop: 24,
  },
  actionButtons: {
    gap: 12,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
});
