import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { useCreateTextImport, useCreateUrlImport, useCreateFileImport } from '../../../data/hooks/useImportHooks';
import type { AddStackScreenProps } from '../../../app/navigation/types';
import { FileText, Link, Image as ImageIcon, File, X, ArrowRight } from 'lucide-react-native';

export function SharePreviewScreen({
  route,
  navigation,
}: AddStackScreenProps<'SharePreview'>) {
  const { sharedContent } = route.params;
  const theme = useAppTheme();
  const createTextImport = useCreateTextImport();
  const createUrlImport = useCreateUrlImport();
  const createFileImport = useCreateFileImport();
  const [isUploading, setIsUploading] = useState(false);

  const isPending = createTextImport.isPending || createUrlImport.isPending || createFileImport.isPending;

  const handleCancel = () => {
    // Optionally clean up temp files here if needed
    navigation.replace('AddMain');
  };

  const handleAnalyze = async () => {
    setIsUploading(true);
    try {
      if (sharedContent.type === 'URL') {
        createUrlImport.mutate({
          url: sharedContent.url || '',
        }, {
          onSuccess: (data) => {
            navigation.replace('ImportProcessing', { importId: data.id });
          },
          onError: (err) => {
            setIsUploading(false);
            Alert.alert('Upload Failed', err.message);
          }
        });
      } else if (sharedContent.type === 'TEXT') {
        createTextImport.mutate({
          text: sharedContent.text || '',
        }, {
          onSuccess: (data) => {
            navigation.replace('ImportProcessing', { importId: data.id });
          },
          onError: (err) => {
            setIsUploading(false);
            Alert.alert('Upload Failed', err.message);
          }
        });
      } else if (sharedContent.files && sharedContent.files.length > 0) {
        const file = sharedContent.files[0];
        if (!file) return;

        // Ensure uri starts with file://
        const fileUri = file.uri;
        
        // Use FormData for file upload
        const formData = new FormData();
        formData.append('inputType', 'FILE');
        formData.append('file', {
          uri: fileUri,
          type: file.mimeType || 'application/octet-stream',
          name: file.fileName || 'shared_file',
        } as any);

        createFileImport.mutate(formData, {
          onSuccess: (data: any) => {
            navigation.replace('ImportProcessing', { importId: data.id });
          },
          onError: (err: any) => {
            setIsUploading(false);
            Alert.alert('Upload Failed', err.message);
          }
        });
      }
    } catch {
      setIsUploading(false);
      Alert.alert('Error', 'An unexpected error occurred.');
    }
  };

  const renderPreview = () => {
    switch (sharedContent.type) {
      case 'TEXT':
        return (
          <View style={styles.previewBox}>
            <FileText size={24} color={theme.colors.textSecondary} style={styles.previewIcon} />
            <Typography variant="body" numberOfLines={6}>
              {sharedContent.text}
            </Typography>
          </View>
        );
      case 'URL':
        return (
          <View style={styles.previewBox}>
            <Link size={24} color={theme.colors.textSecondary} style={styles.previewIcon} />
            <Typography variant="body" style={{ color: theme.colors.primary[600] }}>
              {sharedContent.url}
            </Typography>
          </View>
        );
      case 'IMAGE':
      case 'PDF':
      case 'MULTIPLE':
        const file = sharedContent.files?.[0];
        return (
          <View style={styles.previewBox}>
            {sharedContent.type === 'IMAGE' ? (
              <ImageIcon size={24} color={theme.colors.textSecondary} style={styles.previewIcon} />
            ) : (
              <File size={24} color={theme.colors.textSecondary} style={styles.previewIcon} />
            )}
            <Typography variant="body">
              {file?.fileName || 'Shared Document'}
            </Typography>
            <Typography variant="caption" color={theme.colors.textSecondary}>
              {file?.size ? `${Math.round(file.size / 1024)} KB` : ''}
            </Typography>
            {sharedContent.files && sharedContent.files.length > 1 && (
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ marginTop: 8 }}>
                + {sharedContent.files.length - 1} more file(s) (only first will be analyzed)
              </Typography>
            )}
          </View>
        );
      default:
        return (
          <Typography variant="body">Unknown content type</Typography>
        );
    }
  };

  return (
    <ScreenContainer testID="share-preview-screen">
      <View style={styles.container}>
        <Typography variant="heading2" style={styles.title}>
          Analyze this opportunity?
        </Typography>

        <Typography variant="bodySmall" color={theme.colors.textSecondary} style={styles.subtitle}>
          Shared from: {sharedContent.sourcePackage || 'another app'}
        </Typography>

        {renderPreview()}

        <View style={styles.actions}>
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton, { backgroundColor: theme.colors.primary[600] }]}
            onPress={handleAnalyze}
            disabled={isUploading || isPending}
          >
            <Typography variant="label" color="#FFFFFF" style={{ marginRight: 8 }}>
              {isUploading || isPending ? 'Importing...' : 'Analyze Opportunity'}
            </Typography>
            {!(isUploading || isPending) && <ArrowRight size={18} color="#FFFFFF" />}
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.secondaryButton, { borderColor: theme.colors.border }]}
            onPress={handleCancel}
            disabled={isUploading || isPending}
          >
            <X size={18} color={theme.colors.textSecondary} style={{ marginRight: 8 }} />
            <Typography variant="label" color={theme.colors.textSecondary}>
              Cancel
            </Typography>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
  },
  previewBox: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 8,
    padding: 16,
    backgroundColor: '#F9FAFB',
    minHeight: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
  },
  previewIcon: {
    marginBottom: 12,
  },
  actions: {
    gap: 16,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 8,
  },
  primaryButton: {
    elevation: 2,
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: 'transparent',
  },
});
