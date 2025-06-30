import React from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { getPublicClinics } from '../services/api';
import { theme } from '../components/theme';
import type { Clinic } from '../lib/types';
import { Card, CardHeader, CardTitle, CardContent } from '../components/card.native';

const ClinicListItem: React.FC<{ item: Clinic }> = ({ item }) => (
  <Card style={styles.clinicCard}>
    <CardHeader>
      <CardTitle>{item.name}</CardTitle>
    </CardHeader>
    <CardContent>
      <Text style={styles.clinicInfo}>{item.address?.street || 'Address not available'}</Text>
    </CardContent>
  </Card>
);

export const ClinicFinderScreen: React.FC = () => {
  const { data: clinics, isLoading, isError, error } = useQuery({
    queryKey: ['publicClinics'],
    queryFn: getPublicClinics,
  });

  const renderContent = () => {
    if (isLoading) {
      return <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centered} />;
    }

    if (isError) {
      return <Text style={styles.errorText}>Error: {(error as Error).message}</Text>;
    }

    return (
      <FlatList
        data={clinics}
        renderItem={({ item }) => <ClinicListItem item={item} />}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={<Text style={styles.subtitle}>No clinics found.</Text>}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Clinic Finder</Text>
        <Text style={styles.subtitle}>Find a clinic near you.</Text>
      </View>
      <View style={styles.content}>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  content: {
    flex: 1,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.foreground,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  clinicCard: {
    marginBottom: theme.spacing.md,
  },
  clinicInfo: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
});
