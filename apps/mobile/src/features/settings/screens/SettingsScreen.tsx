import React from 'react';
import { StyleSheet, View, ScrollView, TouchableOpacity } from 'react-native';
import { ScreenContainer } from '../../../components/ScreenContainer';
import { Typography } from '../../../components/Typography';
import { useAppTheme } from '../../../hooks/useAppTheme';
import { SettingsStackScreenProps } from '../../../app/navigation/types';
import { ChevronRight, Archive, Bell, Palette, Info } from 'lucide-react-native';

export function SettingsScreen({ navigation }: SettingsStackScreenProps<'SettingsMain'>) {
  const theme = useAppTheme();

  return (
    <ScreenContainer>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Typography variant="heading1">Settings</Typography>
        </View>

        <View style={styles.section}>
          <Typography variant="heading3" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            Data
          </Typography>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            onPress={() => navigation.navigate('ArchivedOpportunities')}
          >
            <View style={styles.rowLeft}>
              <Archive size={20} color={theme.colors.textSecondary} />
              <Typography variant="body" style={styles.rowText}>Archived Opportunities</Typography>
            </View>
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Typography variant="heading3" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            Preferences
          </Typography>
          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}
            disabled={true}
          >
            <View style={styles.rowLeft}>
              <Bell size={20} color={theme.colors.textSecondary} />
              <Typography variant="body" style={styles.rowText}>Reminders (Coming soon)</Typography>
            </View>
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.row, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border, marginTop: 8 }]}
            disabled={true}
          >
            <View style={styles.rowLeft}>
              <Palette size={20} color={theme.colors.textSecondary} />
              <Typography variant="body" style={styles.rowText}>Appearance (Coming soon)</Typography>
            </View>
            <ChevronRight size={20} color={theme.colors.textTertiary} />
          </TouchableOpacity>
        </View>

        <View style={styles.section}>
          <Typography variant="heading3" color={theme.colors.textSecondary} style={styles.sectionTitle}>
            About
          </Typography>
          <View style={[styles.aboutBox, { backgroundColor: theme.colors.surfaceElevated, borderColor: theme.colors.border }]}>
            <View style={styles.aboutHeader}>
              <Info size={24} color={theme.colors.primary[500]} />
              <Typography variant="heading2" style={styles.aboutTitle}>ApplyAlert</Typography>
            </View>
            <Typography variant="body" color={theme.colors.textSecondary} style={styles.aboutTagline}>
              "See it. Save it. Apply on time."
            </Typography>
            <Typography variant="caption" color={theme.colors.textTertiary}>
              Version 0.0.1
            </Typography>
          </View>
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
  header: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    marginBottom: 12,
    marginLeft: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  rowText: {
    fontSize: 16,
  },
  aboutBox: {
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  aboutTitle: {
    fontSize: 20,
  },
  aboutTagline: {
    fontStyle: 'italic',
    marginBottom: 16,
    textAlign: 'center',
  },
});
