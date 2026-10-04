import React, { useState, useEffect } from 'react';
import { StyleSheet, View, TextInput, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useOpportunity } from '../../../data/hooks/useOpportunityQueries';
import { useUpdateOpportunity } from '../../../data/hooks/useOpportunityMutations';
import type { HomeStackScreenProps, ApplicationsStackScreenProps } from '../../../app/navigation/types';
import { z } from 'zod';
import { ChevronLeft } from 'lucide-react-native';

const FormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  organization: z.string().optional(),
  url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Must be in YYYY-MM-DD format')
    .optional()
    .or(z.literal('')),
  summary: z.string().optional(),
  location: z.string().optional(),
});

type Props = (HomeStackScreenProps<'EditOpportunity'> | ApplicationsStackScreenProps<'EditOpportunity'>);

export function EditOpportunityScreen({ route, navigation }: Props) {
  const { id } = route.params;
  const theme = useAppTheme();
  
  const { data: opportunity, isLoading } = useOpportunity(id);
  const updateOpportunity = useUpdateOpportunity();

  const [title, setTitle] = useState('');
  const [organization, setOrganization] = useState('');
  const [url, setUrl] = useState('');
  const [date, setDate] = useState('');
  const [summary, setSummary] = useState('');
  const [location, setLocation] = useState('');

  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (opportunity) {
      setTitle(opportunity.title);
      setOrganization(opportunity.organization || '');
      setUrl(opportunity.applicationUrl || '');
      setDate(opportunity.deadline.localDate || '');
      setSummary(opportunity.summary || '');
      setLocation(opportunity.location || '');
    }
  }, [opportunity]);

  if (isLoading || !opportunity) {
    return (
      <ScreenContainer>
        <View style={styles.centerContent}>
          <ActivityIndicator size="large" color={theme.colors.primary[500]} />
        </View>
      </ScreenContainer>
    );
  }

  const handleSave = () => {
    setErrors({});
    const result = FormSchema.safeParse({ title, organization, url, date, summary, location });
    
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0].toString()] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    updateOpportunity.mutate(
      {
        id: opportunity.id,
        updates: {
          title: title.trim(),
          organization: organization.trim() || null,
          summary: summary.trim() || null,
          location: location.trim() || null,
          applicationUrl: url.trim() || null,
          deadline: {
            ...opportunity.deadline,
            kind: date ? 'DATE_ONLY' : 'NONE_STATED',
            originalText: date || opportunity.deadline.originalText,
            localDate: date || null,
          },
        },
      },
      {
        onSuccess: () => {
          navigation.goBack();
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
          <Typography variant="body" color={theme.colors.primary[500]}>Cancel</Typography>
        </TouchableOpacity>

        <View style={styles.header}>
          <Typography variant="heading1">Edit Opportunity</Typography>
        </View>

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Typography variant="label">Title *</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: errors.title ? theme.colors.error : theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={title}
              onChangeText={setTitle}
            />
            {errors.title && <Typography variant="caption" color={theme.colors.error}>{errors.title}</Typography>}
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
                { borderColor: errors.url ? theme.colors.error : theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={url}
              onChangeText={setUrl}
              keyboardType="url"
              autoCapitalize="none"
            />
            {errors.url && <Typography variant="caption" color={theme.colors.error}>{errors.url}</Typography>}
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Deadline Date (YYYY-MM-DD)</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: errors.date ? theme.colors.error : theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={date}
              onChangeText={setDate}
            />
            {errors.date && <Typography variant="caption" color={theme.colors.error}>{errors.date}</Typography>}
          </View>
          
          <View style={styles.inputGroup}>
            <Typography variant="label">Location</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: theme.colors.border, color: theme.colors.textPrimary }
              ]}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          <View style={styles.inputGroup}>
            <Typography variant="label">Summary</Typography>
            <TextInput
              style={[
                styles.input, 
                { borderColor: theme.colors.border, color: theme.colors.textPrimary, minHeight: 80, textAlignVertical: 'top' }
              ]}
              value={summary}
              onChangeText={setSummary}
              multiline
            />
          </View>

          <TouchableOpacity 
            style={[
              styles.saveButton, 
              { backgroundColor: updateOpportunity.isPending ? theme.colors.neutral[300] : theme.colors.primary[500] }
            ]}
            onPress={handleSave}
            disabled={updateOpportunity.isPending}
          >
            <Typography variant="label" color={theme.colors.textInverse}>
              {updateOpportunity.isPending ? 'Saving...' : 'Save Changes'}
            </Typography>
          </TouchableOpacity>
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
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
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
});
