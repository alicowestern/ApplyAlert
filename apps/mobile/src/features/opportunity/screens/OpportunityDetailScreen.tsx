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
import type { ApplicationStatus } from '@applyalert/contracts';
import type { HomeStackScreenProps, ApplicationsStackScreenProps } from '../../../app/navigation/types';
import { ChevronLeft, ExternalLink, Link as LinkIcon, Trash2, Edit3, Briefcase, Building2, Clock, CheckCircle2, Archive } from 'lucide-react-native';

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
    updateStatus.mutate(
      { id, status: newStatus },
      {
        onSuccess: () => {
          if (newStatus === 'APPLIED') {
            Alert.alert("Success!", "You've successfully marked this as applied. Great job!");
          }
        }
      }
    );
  };

  const handleArchive = () => {
    Alert.alert(
      "Archive Opportunity",
      "Archive this opportunity? It will be removed from your active lists.",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Archive", 
          onPress: () => handleStatusChange('ARCHIVED')
        }
      ]
    );
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
  
  const isApplied = opportunity.status === 'APPLIED';
  const isArchived = opportunity.status === 'ARCHIVED';

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.topBar}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <ChevronLeft size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>
          <View style={styles.topActions}>
            <TouchableOpacity 
              style={styles.iconButton} 
              onPress={() => navigation.navigate('EditOpportunity', { id })}
            >
              <Edit3 size={20} color={theme.colors.textSecondary} />
            </TouchableOpacity>
            {!isArchived && (
              <TouchableOpacity style={styles.iconButton} onPress={handleArchive}>
                <Archive size={20} color={theme.colors.textSecondary} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.iconButton} onPress={handleDelete}>
              <Trash2 size={20} color={theme.colors.urgency.critical} />
            </TouchableOpacity>
          </View>
        </View>

        {/* HEADER SECTION */}
        <View style={styles.header}>
          <Typography variant="heading1" style={styles.title}>{opportunity.title}</Typography>
          
          <View style={styles.metadataRow}>
            {opportunity.organization && (
              <View style={styles.metadataItem}>
                <Building2 size={16} color={theme.colors.textSecondary} style={styles.icon} />
                <Typography variant="body" color={theme.colors.textSecondary}>
                  {opportunity.organization}
                </Typography>
              </View>
            )}
            <View style={styles.metadataItem}>
              <Briefcase size={16} color={theme.colors.textSecondary} style={styles.icon} />
              <Typography variant="body" color={theme.colors.textSecondary}>
                {opportunity.opportunityType}
              </Typography>
            </View>
          </View>

          <View style={styles.badges}>
            <StatusBadge status={opportunity.status} />
          </View>
        </View>

        {/* DEADLINE SECTION */}
        <View style={[styles.cardSection, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Typography variant="heading3" style={styles.sectionTitle}>Deadline</Typography>
          
          {isApplied ? (
            <View style={styles.appliedState}>
              <CheckCircle2 size={24} color={theme.colors.success} style={styles.icon} />
              <Typography variant="body" color={theme.colors.success}>
                Applied on {opportunity.appliedAt ? new Date(opportunity.appliedAt).toLocaleDateString() : 'time'}
              </Typography>
            </View>
          ) : (
            <>
              <View style={styles.deadlineInfoRow}>
                <DeadlineBadge urgency={urgency} daysRemaining={days} />
                {opportunity.deadline.localDate && (
                  <Typography variant="body" color={theme.colors.textSecondary} style={styles.deadlineDateText}>
                    {opportunity.deadline.localDate} {opportunity.deadline.localTime || ''}
                  </Typography>
                )}
              </View>
              {opportunity.deadline.confidence !== null && opportunity.deadline.confidence < 1 && (
                <View style={[styles.confidenceBox, { backgroundColor: theme.colors.neutral[50] }]}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    Extracted deadline. Please verify accuracy.
                  </Typography>
                  {opportunity.deadline.evidence && (
                    <Typography variant="caption" color={theme.colors.textTertiary} style={styles.evidenceText}>
                      "{opportunity.deadline.evidence}"
                    </Typography>
                  )}
                </View>
              )}
            </>
          )}
        </View>

        {/* APPLICATION SECTION */}
        {opportunity.applicationUrl && (
          <View style={[styles.cardSection, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Typography variant="heading3" style={styles.sectionTitle}>Application</Typography>
            <TouchableOpacity onPress={openUrl} style={[styles.urlBox, { backgroundColor: theme.colors.neutral[50] }]}>
              <LinkIcon size={16} color={theme.colors.primary[500]} style={styles.icon} />
              <Typography variant="bodySmall" color={theme.colors.primary[500]} numberOfLines={1} style={styles.urlText}>
                {opportunity.applicationUrl}
              </Typography>
              <ExternalLink size={16} color={theme.colors.primary[500]} />
            </TouchableOpacity>
          </View>
        )}

        {/* DETAILS SECTION */}
        <View style={[styles.cardSection, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
          <Typography variant="heading3" style={styles.sectionTitle}>Details</Typography>
          
          {opportunity.summary ? (
            <Typography variant="body" style={styles.detailText}>{opportunity.summary}</Typography>
          ) : (
            <Typography variant="body" color={theme.colors.textTertiary}>No summary provided.</Typography>
          )}

          {opportunity.location && (
            <View style={styles.detailRow}>
              <Typography variant="label" color={theme.colors.textSecondary} style={styles.detailLabel}>Location:</Typography>
              <Typography variant="body">{opportunity.location}</Typography>
            </View>
          )}
          
          {opportunity.funding && opportunity.funding.details && (
            <View style={styles.detailRow}>
              <Typography variant="label" color={theme.colors.textSecondary} style={styles.detailLabel}>Funding:</Typography>
              <Typography variant="body">{opportunity.funding.details}</Typography>
            </View>
          )}
        </View>

        {/* REMINDERS (PLACEHOLDER) */}
        {!isApplied && !isArchived && (
          <View style={[styles.cardSection, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <Typography variant="heading3" style={styles.sectionTitle}>Reminders</Typography>
            <View style={styles.reminderRow}>
              <Clock size={18} color={theme.colors.textTertiary} style={styles.icon} />
              <Typography variant="body" color={theme.colors.textSecondary}>
                Notifications coming in a future update.
              </Typography>
            </View>
          </View>
        )}

        {/* BOTTOM ACTIONS */}
        {!isArchived && !isApplied && (
          <View style={styles.primaryActions}>
            {opportunity.status === 'SAVED' && (
              <TouchableOpacity 
                style={[styles.primaryButton, { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[200], borderWidth: 1 }]}
                onPress={() => handleStatusChange('PREPARING')}
              >
                <Typography variant="label" color={theme.colors.primary[700]}>Start Preparing</Typography>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.primaryButton, { backgroundColor: theme.colors.primary[500] }]}
              onPress={() => handleStatusChange('APPLIED')}
            >
              <CheckCircle2 size={18} color={theme.colors.textInverse} style={styles.icon} />
              <Typography variant="label" color={theme.colors.textInverse}>Mark Applied</Typography>
            </TouchableOpacity>
          </View>
        )}
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
    paddingTop: 8,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  topActions: {
    flexDirection: 'row',
    gap: 16,
  },
  iconButton: {
    padding: 8,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    marginBottom: 12,
  },
  metadataRow: {
    gap: 8,
    marginBottom: 16,
  },
  metadataItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: 8,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
  },
  cardSection: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 12,
  },
  deadlineInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flexWrap: 'wrap',
  },
  deadlineDateText: {
    marginTop: 2,
  },
  confidenceBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: 8,
  },
  evidenceText: {
    marginTop: 4,
    fontStyle: 'italic',
  },
  appliedState: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  urlBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
  },
  urlText: {
    flex: 1,
    marginRight: 8,
  },
  detailText: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  detailLabel: {
    width: 80,
  },
  reminderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActions: {
    marginTop: 16,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
