import { useQuery } from '@tanstack/react-query';
import { FileSearch, ServerCrash } from 'lucide-react-native';
import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { DrawerScreenProps } from '@react-navigation/drawer';
import { DrawerParamList } from '../navigation/AppDrawerNavigator';
import { Button } from '../components/button.native';
import { ModalPicker } from '../components/core/ModalPicker';
import MedicalRecordCard from '../components/records/MedicalRecordCard';
import { theme } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import { MedicalRecordType, MedicalRecordWithRelations } from '../lib/types';
import { getMyMedicalRecords } from '../services/api';

type NavigationProps = DrawerScreenProps<DrawerParamList, 'Records'>['navigation'];

const FILTER_OPTIONS: { label: string; value: MedicalRecordType | 'all' }[] = [
  { label: 'All Records', value: 'all' },
  { label: 'Doctor Notes', value: 'DOCTOR_NOTE' },
  { label: 'Prescriptions', value: 'PRESCRIPTION' },
  { label: 'Lab Results & Documents', value: 'CLINICAL_DOCUMENT' },
];

const MyMedicalRecordsScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const { authStatus } = useAuth();
  const [filter, setFilter] = useState<MedicalRecordType | 'all'>('all');

  const {
    data: records,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<MedicalRecordWithRelations[], Error>({
    queryKey: ['myMedicalRecords'],
    queryFn: getMyMedicalRecords,
    enabled: authStatus === 'authenticated',
  });

  const filteredRecords = useMemo(() => {
    if (!records) return [];
    if (filter === 'all') {
      return records;
    }
    return records.filter(record => record.recordType === filter);
  }, [records, filter]);

  const handleViewDetails = (recordId: string) => {
    // This assumes that a 'RecordDetail' screen is available in the navigation stack.
    // If 'Records' is part of another stack (like a RecordsStack), this will work.
    // If not, the navigator needs to be adjusted.
    // @ts-ignore - TS doesn't know about RecordDetail in the DrawerParamList, which is correct.
    // We are relying on a parent navigator to handle this.
    navigation.navigate('RecordDetail', { recordId });
  };

  const EmptyState = () => (
    <View style={styles.emptyStateContainer}>
      <FileSearch size={48} color={theme.colors.mutedForeground} />
      <Text style={styles.emptyStateMessage}>You have no medical records yet.</Text>
    </View>
  );

  const ListHeader = () => (
    <View style={styles.headerContainer}>
      <Text style={styles.headerTitle}>My Medical Records</Text>
      <Text style={styles.headerDescription}>
        Review your complete health history and clinical documents.
      </Text>
      <View style={styles.filterContainer}>
        <ModalPicker
          label="Filter by Type"
          options={FILTER_OPTIONS}
          selectedValue={filter}
          onValueChange={(value) => setFilter(value as MedicalRecordType | 'all')}
        />
      </View>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <ListHeader />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.container}>
        <ListHeader />
        <View style={styles.emptyStateContainer}>
          <ServerCrash size={48} color={theme.colors.destructive} />
          <Text style={styles.emptyStateMessage}>Could not fetch records</Text>
          <Text style={styles.errorText}>{error?.message}</Text>
          <Button variant="outline" onPress={() => refetch()} style={{ marginTop: 20 }}>
            Try Again
          </Button>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredRecords}
        renderItem={({ item }) => (
          <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
            <MedicalRecordCard record={item} onPress={() => handleViewDetails(item.id)} />
          </View>
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    backgroundColor: theme.colors.card,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
  },
  headerDescription: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
  },
  filterContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  emptyStateMessage: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.destructive,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
});

export default MyMedicalRecordsScreen;
