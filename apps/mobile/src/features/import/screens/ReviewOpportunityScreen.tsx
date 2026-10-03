import React, { useState } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useCreateOpportunity } from '../../../data/hooks/useOpportunityMutations';
import type { AddStackScreenProps } from '../../../app/navigation/types';
import { ChevronLeft, Info } from 'lucide-react-native';

export function ReviewOpportunityScreen({ route, navigation }: AddStackScreenProps<'ReviewOpportunity'>) {
  const { initialData } = route.params;
  const theme = useAppTheme();
  const createOpportunity = useCreateOpportunity();

  const [title, setTitle] = useState(initialData.title || '');
  const [organization, setOrganization] = useState(initialData.organization || '');
  const [url, setUrl] = useState(initialData.url || '');
  const [date, setDate] = useState(initialData.date || '');

  const handleSave = () => {
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
          type: 'TEXT',
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
          confidence: 0.8, // Indicates extraction
          userConfirmed: true,
          evidence: null,
          alternativeCandidates: [],
        },
        status: 'SAVED',
      },
      {
        onSuccess: () => {
          navigation.navigate('HomeTab', {
            screen: 'HomeMain',
          });
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
          <ChevronLeft size={20} color={theme.colors.primary[500]} />
          <Typography variant="body" color={theme.colors.primary[500]}>Back</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <Typography variant="heading1">Review Details</Typography>
          <View style={[styles.infoBox, { backgroundColor: theme.colors.primary[50], borderColor: theme.colors.primary[100] }]}>
            <Info size={16} color={theme.colors.primary[600]} style={styles.infoIcon} />
            <Typography variant="bodySmall" color={theme.colors.primary[700]} style={styles.infoText}>
              We extracted these details from your content. Please review and correct them if necessary before saving.
            </Typography>
          </View>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Typography variant="label">Title *</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Organization</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={organization}
              onChangeText={setOrganization}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Application URL</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Deadline Date</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={date}
              onChangeText={setDate}
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { backgroundColor: createOpportunity.isPending ? theme.colors.neutral[300] : theme.colors.primary[500] }
            ]}
            onPress={handleSave}
            disabled={createOpportunity.isPending}
          >
            <Typography variant="label" color={theme.colors.textInverse}>
              {createOpportunity.isPending ? 'Saving...' : 'Confirm & Save'}
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  header: {
    marginBottom: 32,
  },
  infoBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
  },
  infoIcon: {
    marginTop: 2,
    marginRight: 8,
  },
  infoText: {
    flex: 1,
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
});
