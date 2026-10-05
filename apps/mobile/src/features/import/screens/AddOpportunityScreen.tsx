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
import type { AddStackScreenProps } from '../../../app/navigation/types';
import { Link, Image as ImageIcon, FileText, PenTool, LucideIcon, Lock } from 'lucide-react-native';

interface ImportOptionProps {
  IconComponent: LucideIcon;
  label: string;
  description: string;
  onPress?: () => void;
  testID: string;
  disabled?: boolean;
}

function ImportOption({ IconComponent, label, description, onPress, testID, disabled = false }: ImportOptionProps) {
  const theme = useAppTheme();

  return (
    <TouchableOpacity
      testID={testID}
      style={[
        styles.option,
        {
          backgroundColor: disabled ? theme.colors.surface : theme.colors.surfaceElevated,
          borderRadius: theme.radius.md,
          borderColor: theme.colors.border,
          opacity: disabled ? 0.7 : 1,
        },
      ]}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={disabled}
    >
      <View style={styles.optionIcon}>
        <IconComponent size={24} color={disabled ? theme.colors.textTertiary : theme.colors.primary[600]} />
      </View>
      <View style={styles.optionText}>
        <View style={styles.labelRow}>
          <Typography variant="heading3" color={disabled ? theme.colors.textSecondary : theme.colors.textPrimary}>
            {label}
          </Typography>
          {disabled && (
            <View style={[styles.comingSoonBadge, { backgroundColor: theme.colors.neutral[200], borderRadius: theme.radius.xs }]}>
              <Lock size={10} color={theme.colors.textSecondary} style={{ marginRight: 2 }} />
              <Typography variant="caption" color={theme.colors.textSecondary} style={{ fontSize: 10 }}>Coming soon</Typography>
            </View>
          )}
        </View>
        <Typography variant="bodySmall" color={theme.colors.textSecondary}>
          {description}
        </Typography>
      </View>
    </TouchableOpacity>
  );
}

export function AddOpportunityScreen({ navigation }: AddStackScreenProps<'AddMain'>) {
  const theme = useAppTheme();


  const handleManualAdd = () => {
    navigation.navigate('ManualAdd');
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
          IconComponent={Link}
          label="Paste Link or Text"
          description="Paste a URL or text containing opportunity details"
          disabled={false}
          onPress={() => navigation.navigate('PasteInput')}
        />

        <ImportOption
          testID="import-option-image"
          IconComponent={ImageIcon}
          label="Image"
          description="Select a screenshot or photo of the opportunity"
          disabled={true}
        />

        <ImportOption
          testID="import-option-pdf"
          IconComponent={FileText}
          label="PDF Document"
          description="Select a PDF with opportunity details"
          disabled={true}
        />

        <ImportOption
          testID="import-option-manual"
          IconComponent={PenTool}
          label="Manual Entry"
          description="Type details manually"
          onPress={handleManualAdd}
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
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    flex: 1,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  comingSoonBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 8,
  },
});
