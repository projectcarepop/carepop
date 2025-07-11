import { useQuery } from '@tanstack/react-query';
import { FileSearch, ServerCrash } from 'lucide-react-native';
import React, { useMemo, useState, useCallback } from 'react';
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

// === HELPER FUNCTIONS ===
const filterRecordsByType = (records: MedicalRecordWithRelations[] | undefined, filter: MedicalRecordType | 'all'): MedicalRecordWithRelations[] => {
  if (!records) return [];
  if (filter === 'all') return records;
  return records.filter(record => record.recordType === filter);
};

const formatRecordType = (type: MedicalRecordType): string => {
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getEmptyStateMessage = (filter: MedicalRecordType | 'all'): string => {
  if (filter === 'all') return "You have no medical records yet.";
  return `You have no ${formatRecordType(filter).toLowerCase()} records yet.`;
};

const MyMedicalRecordsScreen = () => {
  const navigation = useNavigation<NavigationProps>();
  const { authStatus } = useAuth();
  const [filter, setFilter] = useState<MedicalRecordType | 'all'>('all');

  // === DATA FETCHING ===
  const {
    data: records,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['myMedicalRecords'],
    queryFn: getMyMedicalRecords,
    enabled: authStatus === 'authenticated',
    select: (data: any) => data as MedicalRecordWithRelations[], // Type assertion for API response
  });

  // === OPTIMIZED DERIVED STATE ===
  const filteredRecords = useMemo(() => 
    filterRecordsByType(records, filter), 
    [records, filter]
  );

  // === OPTIMIZED EVENT HANDLERS ===
  const handleViewDetails = useCallback((recordId: string) => {
    // @ts-ignore - TS doesn't know about RecordDetail in the DrawerParamList
    navigation.navigate('RecordDetail', { recordId });
  }, [navigation]);

  const handleFilterChange = useCallback((value: MedicalRecordType | 'all') => {
    setFilter(value);
  }, []);

  // === OPTIMIZED COMPONENTS ===
  const renderRecord = useCallback(({ item }: { item: MedicalRecordWithRelations }) => (
    <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
      <MedicalRecordCard 
        record={item} 
        onPress={() => handleViewDetails(item.id)} 
      />
    </View>
  ), [handleViewDetails]);

  const EmptyState = useCallback(() => {
    const message = getEmptyStateMessage(filter);
    
    return (
    <View style={styles.emptyStateContainer}>
      <FileSearch size={48} color={theme.colors.mutedForeground} />
        <Text style={styles.emptyStateMessage}>{message}</Text>
    </View>
  );
  }, [filter]);

  const ListHeader = useCallback(() => (
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
          onValueChange={handleFilterChange}
        />
      </View>
    </View>
  ), [filter, handleFilterChange]);

  // === LOADING STATE ===
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

  // === ERROR STATE ===
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

  // === MAIN RENDER ===
  return (
    <SafeAreaView style={styles.container}>
      <FlatList
        data={filteredRecords}
        renderItem={renderRecord}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        contentContainerStyle={{ flexGrow: 1, paddingTop: 0 }}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        removeClippedSubviews={true}
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={10}
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
