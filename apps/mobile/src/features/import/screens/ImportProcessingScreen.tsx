import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useImport, useCancelImport } from '../../../data/hooks/useImportHooks';
import { useExtraction, useTriggerExtraction } from '../../../data/hooks/useExtractionHooks';
import type { AddStackScreenProps } from '../../../app/navigation/types';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  RefreshCw,
  Slash,
} from 'lucide-react-native';

export function ImportProcessingScreen({
  route,
  navigation,
}: AddStackScreenProps<'ImportProcessing'>) {
  const { importId } = route.params;
  const theme = useAppTheme();

  const { data: imp, isLoading } = useImport(importId);
  const cancelImport = useCancelImport();

  const [extractionId, setExtractionId] = useState<string | undefined>();
  const triggerExtraction = useTriggerExtraction();
  const { data: ext } = useExtraction(extractionId, { refetchInterval: 2000 });

  const isIngesting = isLoading || imp?.status === 'PENDING' || imp?.status === 'PROCESSING';
  const isExtracting = ext?.status === 'PENDING' || ext?.status === 'PROCESSING' || (imp?.status === 'READY_FOR_EXTRACTION' && !ext);
  
  useEffect(() => {
    if (imp?.status === 'READY_FOR_EXTRACTION' && !extractionId && !triggerExtraction.isPending) {
      // Trigger extraction
      triggerExtraction.mutate({ importId: imp.id, input: {} }, {
        onSuccess: (data) => {
          setExtractionId(data.data.id);
        },
        onError: (err) => {
          console.error('Extraction trigger failed', err);
        }
      });
    }
  }, [imp?.status, imp?.id, extractionId, triggerExtraction]);

  const handleProceedToReview = () => {
    if (!ext?.data?.result) return;
    const result = ext.data.result;
    const primary = result.primaryDeadline;
    
    navigation.replace('ReviewOpportunity', {
      initialData: {
        title: result.title || imp?.fileName?.replace(/\.[^/.]+$/, '') || '',
        organization: result.organization || '',
        url: result.applicationUrl || '',
        date: primary?.date || '',
        importId: imp?.id,
        extractionId: ext.data.id,
        opportunityType: result.opportunityType || 'OTHER',
        summary: result.summary || '',
        location: result.location || '',
        funding: result.funding,
        deadline: primary,
      },
    });
  };

  const handleCancel = () => {
    if (imp?.id) {
      cancelImport.mutate(imp.id);
    }
  };

  return (
    <ScreenContainer testID="import-processing-screen">
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Typography variant="heading2">Processing Import</Typography>
          <Typography variant="bodySmall" color={theme.colors.textSecondary}>
            ID: {importId ? `${importId.slice(0, 8)}...` : ''}
          </Typography>
        </View>

        {/* Dynamic State Display */}
        {(isIngesting || isExtracting) && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            ]}
          >
            <View style={styles.spinnerContainer}>
              <ActivityIndicator size="large" color={theme.colors.primary[500]} />
            </View>
            <Typography variant="heading3" style={styles.statusTitle}>
              {isIngesting ? 'Ingesting Source...' : 'Extracting Data with AI...'}
            </Typography>
            <Typography
              variant="bodySmall"
              color={theme.colors.textSecondary}
              style={styles.statusSubtitle}
            >
              {isIngesting 
                ? 'We are safely verifying the source, acquiring text, and generating provenance evidence.' 
                : 'AI is analyzing the content and extracting structured opportunity data...'}
            </Typography>

            {isIngesting && (
              <TouchableOpacity
                testID="cancel-import-button"
                style={[
                  styles.cancelButton,
                  { borderColor: theme.colors.border, borderRadius: theme.radius.sm },
                ]}
                onPress={handleCancel}
                disabled={cancelImport.isPending}
              >
                <Slash size={16} color={theme.colors.textSecondary} style={{ marginRight: 6 }} />
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Cancel Import
                </Typography>
              </TouchableOpacity>
            )}
          </View>
        )}

        {ext?.data?.status === 'READY_FOR_REVIEW' && imp && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.primary[200] },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#DEF7EC' }]}>
              <CheckCircle2 size={36} color="#0E9F6E" />
            </View>
            <Typography variant="heading2" style={styles.statusTitle}>
              Extraction Complete
            </Typography>
            <Typography
              variant="bodySmall"
              color={theme.colors.textSecondary}
              style={styles.statusSubtitle}
            >
              Data has been successfully extracted. Ready for your review.
            </Typography>

            {/* Ingestion Evidence Summary */}
            <View
              style={[
                styles.detailsBox,
                { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
              ]}
            >
              <View style={styles.detailRow}>
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  SOURCE TYPE
                </Typography>
                <Typography variant="bodySmall" color={theme.colors.textPrimary}>
                  {imp.inputType}
                </Typography>
              </View>

              {imp.fileName && (
                <View style={styles.detailRow}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    FILE NAME
                  </Typography>
                  <Typography variant="bodySmall" color={theme.colors.textPrimary}>
                    {imp.fileName}
                  </Typography>
                </View>
              )}

              {imp.fileSize && (
                <View style={styles.detailRow}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    FILE SIZE
                  </Typography>
                  <Typography variant="bodySmall" color={theme.colors.textPrimary}>
                    {Math.round(imp.fileSize / 1024)} KB
                  </Typography>
                </View>
              )}

              {imp.contentHash && (
                <View style={styles.detailRow}>
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    CONTENT SHA-256
                  </Typography>
                  <Typography variant="caption" color={theme.colors.textSecondary}>
                    {imp.contentHash.slice(0, 16)}...
                  </Typography>
                </View>
              )}
            </View>

            <TouchableOpacity
              testID="proceed-to-review-button"
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary[600], borderRadius: theme.radius.md },
              ]}
              onPress={handleProceedToReview}
              activeOpacity={0.8}
            >
              <Typography variant="heading3" color="#FFFFFF" style={{ marginRight: 8 }}>
                Proceed to Review
              </Typography>
              <ArrowRight size={20} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}

        {(imp?.status === 'FAILED' || ext?.data?.status === 'FAILED') && imp && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.error[200] },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
              <AlertTriangle size={36} color={theme.colors.error[500]} />
            </View>
            <Typography variant="heading2" style={styles.statusTitle}>
              {imp?.status === 'FAILED' ? 'Ingestion Failed' : 'Extraction Failed'}
            </Typography>
            <Typography
              variant="bodySmall"
              color={theme.colors.textSecondary}
              style={styles.statusSubtitle}
            >
              {imp?.status === 'FAILED' ? imp.errorMessage : ext?.data?.errorMessage || 'An error occurred.'}
            </Typography>

            {imp?.errorCode && (
              <View
                style={[
                  styles.errorCodeBadge,
                  { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
                ]}
              >
                <Typography variant="caption" color={theme.colors.textSecondary}>
                  Code: {imp.errorCode}
                </Typography>
              </View>
            )}

            <View style={styles.errorActions}>
              <TouchableOpacity
                testID="retry-import-button"
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.primary[600], borderRadius: theme.radius.md },
                ]}
                onPress={() => navigation.replace('PasteInput')}
              >
                <RefreshCw size={18} color="#FFFFFF" style={{ marginRight: 8 }} />
                <Typography variant="heading3" color="#FFFFFF">
                  Try Again
                </Typography>
              </TouchableOpacity>

              <TouchableOpacity
                testID="manual-entry-fallback"
                style={[
                  styles.secondaryButton,
                  { borderColor: theme.colors.border, borderRadius: theme.radius.md },
                ]}
                onPress={() => navigation.replace('ManualAdd')}
              >
                <Typography variant="body" color={theme.colors.textPrimary}>
                  Enter Manually
                </Typography>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {imp?.status === 'CANCELLED' && (
          <View
            style={[
              styles.card,
              { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border },
            ]}
          >
            <View style={[styles.iconCircle, { backgroundColor: '#F3F4F6' }]}>
              <XCircle size={36} color={theme.colors.textSecondary} />
            </View>
            <Typography variant="heading2" style={styles.statusTitle}>
              Import Cancelled
            </Typography>
            <Typography
              variant="bodySmall"
              color={theme.colors.textSecondary}
              style={styles.statusSubtitle}
            >
              This import was cancelled before completion.
            </Typography>

            <TouchableOpacity
              style={[
                styles.actionButton,
                { backgroundColor: theme.colors.primary[600], borderRadius: theme.radius.md },
              ]}
              onPress={() => navigation.replace('AddMain')}
            >
              <Typography variant="heading3" color="#FFFFFF">
                Return to Add
              </Typography>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingVertical: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  card: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    marginVertical: 8,
  },
  spinnerContainer: {
    padding: 24,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  statusTitle: {
    textAlign: 'center',
    marginBottom: 8,
  },
  statusSubtitle: {
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 8,
  },
  detailsBox: {
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    gap: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  errorCodeBadge: {
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    marginBottom: 20,
  },
  errorActions: {
    width: '100%',
    gap: 12,
  },
  actionButton: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
  },
  secondaryButton: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
  },
});
