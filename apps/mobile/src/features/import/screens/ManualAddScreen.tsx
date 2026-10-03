import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useCreateOpportunity } from '../../../data/hooks/useOpportunityMutations';
import { injectSeedData } from '../../../data/seed/devSeedData';
import { useQueryClient } from '@tanstack/react-query';
import { opportunityKeys } from '../../../data/hooks/queryKeys';
import type { AddStackScreenProps } from '../../../app/navigation/types';

export function ManualAddScreen({ navigation }: AddStackScreenProps<'ManualAdd'>) {
  const theme = useAppTheme();
  const createOpportunity = useCreateOpportunity();
  const queryClient = useQueryClient();

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState(''); // YYYY-MM-DD format manually entered for now

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('Validation Error', 'Title is required');
      return;
    }

    createOpportunity.mutate(
      {
        title: title.trim(),
        organization: organization.trim() || null,
        opportunityType: 'OTHER',
        summary: null,
        location: null,
        funding: null,
        applicationUrl: url.trim() || null,
        source: {
          type: 'MANUAL',
          url: null,
          rawText: null,
          fileName: null,
          mimeType: null,
          fileRef: null,
          importedAt: new Date().toISOString(),
        },
        deadline: {
          kind: date ? 'DATE_ONLY' : 'NONE_STATED',
          originalText: date || null,
          localDate: date || null,
          localTime: null,
          timezone: null,
          utcInstant: null,
          confidence: 1,
          userConfirmed: true,
          evidence: null,
          alternativeCandidates: [],
        },
        status: 'SAVED',
      },
      {
        onSuccess: () => {
          navigation.goBack();
          // Ideally navigate to the newly created details screen, but goBack is fine for now
        },
        onError: (err) => {
          Alert.alert('Error', err.message);
        }
      }
    );
  };

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Typography variant="body" color={theme.colors.primary[500]}>← Back</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <Typography variant="heading1">Manual Entry</Typography>
          <Typography variant="bodySmall" color={theme.colors.textSecondary}>
            For testing the domain model without AI extraction
          </Typography>
          <TouchableOpacity 
            style={styles.injectButton} 
            onPress={async () => {
              await injectSeedData();
              queryClient.invalidateQueries({ queryKey: opportunityKeys.all });
              Alert.alert('Success', 'Seed data injected!');
              navigation.goBack();
            }}
          >
            <Typography variant="label" color={theme.colors.primary[500]}>
              + Inject Seed Data
            </Typography>
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Typography variant="label">Title *</Typography>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              placeholder="e.g. Summer Internship"
              placeholderTextColor={theme.colors.textTertiary}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Organization</Typography>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              placeholder="e.g. Google"
              placeholderTextColor={theme.colors.textTertiary}
              value={organization}
              onChangeText={setOrganization}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Application URL</Typography>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              placeholder="https://..."
              placeholderTextColor={theme.colors.textTertiary}
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Deadline Date (YYYY-MM-DD)</Typography>
            <TextInput
              style={[styles.input, { borderColor: theme.colors.border, color: theme.colors.textPrimary }]}
              placeholder="2027-12-31"
              placeholderTextColor={theme.colors.textTertiary}
              value={date}
              onChangeText={setDate}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, { backgroundColor: theme.colors.primary[500] }]}
            onPress={handleSave}
            disabled={createOpportunity.isPending}
          >
            <Typography variant="label" color={theme.colors.textInverse}>
              {createOpportunity.isPending ? 'Saving...' : 'Save Opportunity'}
            </Typography>
          </TouchableOpacity>
        </View>
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
    marginBottom: 16,
    alignSelf: 'flex-start',
  },
  header: {
    marginBottom: 32,
  },
  form: {
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
  },
  saveButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  injectButton: {
    marginTop: 12,
  },
});
