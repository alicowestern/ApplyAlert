import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useCreateTextImport, useCreateUrlImport } from '../../../data/hooks/useImportHooks';
import type { AddStackScreenProps } from '../../../app/navigation/types';
import { ChevronLeft, Globe, FileText, Sparkles } from 'lucide-react-native';

export function PasteInputScreen({ route, navigation }: AddStackScreenProps<'PasteInput'>) {
  const initialMode = route.params?.mode || 'URL';
  const [mode, setMode] = useState<'URL' | 'TEXT'>(initialMode);
  const [inputUrl, setInputUrl] = useState('');
  const [inputText, setInputText] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const theme = useAppTheme();
  const createUrlImport = useCreateUrlImport();
  const createTextImport = useCreateTextImport();

  const isSubmitting = createUrlImport.isPending || createTextImport.isPending;

  const handleSubmit = () => {
    setErrorMessage(null);

    if (mode === 'URL') {
      const trimmed = inputUrl.trim();
      if (!trimmed) {
        setErrorMessage('Please enter a URL');
        return;
      }
      if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://')) {
        setErrorMessage('URL must begin with http:// or https://');
        return;
      }

      createUrlImport.mutate(
        { url: trimmed },
        {
          onSuccess: (data) => {
            navigation.replace('ImportProcessing', { importId: data.id });
          },
          onError: (err) => {
            setErrorMessage(err.message || 'Failed to submit URL');
          },
        },
      );
    } else {
      const trimmed = inputText.trim();
      if (!trimmed) {
        setErrorMessage('Please paste or type opportunity text');
        return;
      }
      if (trimmed.length < 10) {
        setErrorMessage('Text must be at least 10 characters');
        return;
      }

      createTextImport.mutate(
        { text: trimmed },
        {
          onSuccess: (data) => {
            navigation.replace('ImportProcessing', { importId: data.id });
          },
          onError: (err) => {
            setErrorMessage(err.message || 'Failed to submit text');
          },
        },
      );
    }
  };

  return (
    <ScreenContainer testID="paste-input-screen">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.keyboardContainer}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              style={styles.backButton}
              testID="paste-back-button"
            >
              <ChevronLeft size={24} color={theme.colors.textPrimary} />
            </TouchableOpacity>
            <Typography variant="heading2">Import Opportunity</Typography>
          </View>

          {/* Mode Switcher */}
          <View
            style={[
              styles.segmentContainer,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <TouchableOpacity
              style={[
                styles.segmentButton,
                mode === 'URL' && {
                  backgroundColor: theme.colors.primary[500],
                  borderRadius: theme.radius.sm,
                },
              ]}
              onPress={() => {
                setMode('URL');
                setErrorMessage(null);
              }}
              testID="tab-url-mode"
            >
              <Globe
                size={16}
                color={mode === 'URL' ? '#FFFFFF' : theme.colors.textSecondary}
                style={styles.segmentIcon}
              />
              <Typography
                variant="bodySmall"
                color={mode === 'URL' ? '#FFFFFF' : theme.colors.textSecondary}
                style={styles.segmentLabel}
              >
                Website Link
              </Typography>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.segmentButton,
                mode === 'TEXT' && {
                  backgroundColor: theme.colors.primary[500],
                  borderRadius: theme.radius.sm,
                },
              ]}
              onPress={() => {
                setMode('TEXT');
                setErrorMessage(null);
              }}
              testID="tab-text-mode"
            >
              <FileText
                size={16}
                color={mode === 'TEXT' ? '#FFFFFF' : theme.colors.textSecondary}
                style={styles.segmentIcon}
              />
              <Typography
                variant="bodySmall"
                color={mode === 'TEXT' ? '#FFFFFF' : theme.colors.textSecondary}
                style={styles.segmentLabel}
              >
                Pasted Text
              </Typography>
            </TouchableOpacity>
          </View>

          {/* Form */}
          {mode === 'URL' ? (
            <View style={styles.inputSection}>
              <Typography variant="caption" color={theme.colors.textSecondary} style={styles.inputLabel}>
                PASTE OPPORTUNITY LINK
              </Typography>
              <TextInput
                testID="url-input"
                style={[
                  styles.urlInput,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: errorMessage ? theme.colors.error[500] : theme.colors.border,
                    color: theme.colors.textPrimary,
                    borderRadius: theme.radius.md,
                  },
                ]}
                placeholder="https://example.com/fellowship-2026"
                placeholderTextColor={theme.colors.textTertiary}
                value={inputUrl}
                onChangeText={setInputUrl}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
                editable={!isSubmitting}
              />
              <Typography variant="caption" color={theme.colors.textTertiary} style={styles.hint}>
                We will fetch the page, strip clutter, and prepare the content for AI analysis.
              </Typography>
            </View>
          ) : (
            <View style={styles.inputSection}>
              <View style={styles.labelRow}>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  PASTE JOB / GRANT / FELLOWSHIP TEXT
                </Typography>
                <Typography variant="caption" color={theme.colors.textTertiary}>
                  {inputText.length} chars
                </Typography>
              </View>
              <TextInput
                testID="text-input"
                style={[
                  styles.textAreaInput,
                  {
                    backgroundColor: theme.colors.surfaceElevated,
                    borderColor: errorMessage ? theme.colors.error[500] : theme.colors.border,
                    color: theme.colors.textPrimary,
                    borderRadius: theme.radius.md,
                  },
                ]}
                placeholder="Paste the announcement, email, or requirements here..."
                placeholderTextColor={theme.colors.textTertiary}
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
                editable={!isSubmitting}
              />
            </View>
          )}

          {errorMessage && (
            <View style={[styles.errorBanner, { backgroundColor: theme.colors.error[50] || '#FEE2E2' }]}>
              <Typography variant="bodySmall" color={theme.colors.error[500]}>
                {errorMessage}
              </Typography>
            </View>
          )}

          {/* Submit Action */}
          <TouchableOpacity
            testID="submit-import-button"
            style={[
              styles.submitButton,
              {
                backgroundColor: isSubmitting ? theme.colors.primary[300] : theme.colors.primary[600],
                borderRadius: theme.radius.md,
              },
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
            activeOpacity={0.8}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <View style={styles.submitContent}>
                <Sparkles size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Typography variant="heading3" color="#FFFFFF">
                  {mode === 'URL' ? 'Acquire Page & Ingest' : 'Ingest Content'}
                </Typography>
              </View>
            )}
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  keyboardContainer: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 12,
  },
  backButton: {
    padding: 4,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    padding: 4,
    borderRadius: 8,
    marginVertical: 16,
  },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  segmentIcon: {
    marginRight: 6,
  },
  segmentLabel: {
    fontWeight: '600',
  },
  inputSection: {
    marginTop: 8,
    marginBottom: 16,
  },
  inputLabel: {
    marginBottom: 8,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  urlInput: {
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
  },
  textAreaInput: {
    borderWidth: 1,
    padding: 16,
    fontSize: 15,
    minHeight: 180,
  },
  hint: {
    marginTop: 8,
    lineHeight: 18,
  },
  errorBanner: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  submitButton: {
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  submitContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
