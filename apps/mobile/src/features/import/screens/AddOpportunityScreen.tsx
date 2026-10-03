/**
 * Add Opportunity screen — where users import opportunities.
 *
 * Will eventually support:
 * - Paste link/text
 * - Pick image
 * - Pick PDF
 * - Receive shared content
 */

import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';

interface ImportOptionProps {
  icon: string;
  label: string;
  description: string;
  onPress: () => void;
  testID: string;
}

function ImportOption({ icon, label, description, onPress, testID }: ImportOptionProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.option,
        {
          backgroundColor: theme.colors.surface,
          borderRadius: theme.radius.md,
          borderColor: theme.colors.border,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Typography variant="heading2" style={styles.optionIcon}>
        {icon}
      </Typography>
      <View style={styles.optionText}>
        <Typography variant="heading3">{label}</Typography>
        <Typography variant="bodySmall" color={theme.colors.textSecondary}>
          {description}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

export function AddOpportunityScreen() {
  const theme = useAppTheme();

  const handlePasteLink = () => {
    // Will be implemented in a future task
  };

  const handlePickImage = () => {
    // Will be implemented in a future task
  };

  const handlePickPdf = () => {
    // Will be implemented in a future task
  };

  return (
    <ScreenContainer testID="add-opportunity-screen">
      <View style={styles.header}>
        <Typography variant="heading1">Add Opportunity</Typography>
        <Typography
          variant="bodySmall"
          color={theme.colors.textSecondary}
          style={styles.subtitle}
        >
          Share or paste an opportunity and we&apos;ll extract the details
        </Typography>
      </View>

      <View style={styles.options}>
        <ImportOption
          testID="import-option-paste"
          icon="🔗"
          label="Paste Link or Text"
          description="Paste a URL or text containing opportunity details"
          onPress={handlePasteLink}
        />

        <ImportOption
          testID="import-option-image"
          icon="📷"
          label="Image"
          description="Select a screenshot or photo of the opportunity"
          onPress={handlePickImage}
        />

        <ImportOption
          testID="import-option-pdf"
          icon="📄"
          label="PDF Document"
          description="Select a PDF with opportunity details"
          onPress={handlePickPdf}
        />
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingTop: 16,
    paddingBottom: 24,
  },
  subtitle: {
    marginTop: 4,
  },
  options: {
    gap: 12,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
  },
  optionIcon: {
    marginRight: 16,
  },
  optionText: {
    flex: 1,
  },
});
