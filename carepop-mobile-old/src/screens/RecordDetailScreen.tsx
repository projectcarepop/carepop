import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView } from 'react-native';
import { theme } from '../components/theme';

export const RecordDetailScreen = () => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Record Detail</Text>
        <Text style={styles.placeholderText}>
          Details for a specific medical record will be displayed here.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: 24,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.lg,
  },
  placeholderText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
  },
}); 