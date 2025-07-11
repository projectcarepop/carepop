import { StackNavigationProp } from '@react-navigation/stack';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { isFuture, isPast, differenceInHours } from 'date-fns';
import { CalendarPlus, ServerCrash } from 'lucide-react-native';
import React, { useMemo, useState, useCallback } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import AppointmentCard from '../components/appointments/AppointmentCard';
import { Button } from '../components/button.native';
import { ModalPicker } from '../components/core/ModalPicker';
import { theme } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import { DetailedAppointment } from '../lib/types';
import { parseISOString } from '../lib/utils/date';
import { AppointmentsStackParamList } from '../navigation/AppDrawerNavigator';
import { cancelAppointment, getMyAppointments } from '../services/api';

type MyAppointmentsScreenNavigationProp = StackNavigationProp<
  AppointmentsStackParamList,
  'MyAppointments'
>;

type MyAppointmentsScreenProps = {
  navigation: MyAppointmentsScreenNavigationProp;
};

type AppointmentWithDate = {
  original: DetailedAppointment;
  parsedDate: Date;
};

type FilterOption = 'upcoming' | 'past' | 'all';

const FILTER_OPTIONS: { label: string; value: FilterOption }[] = [
  { label: 'Upcoming Appointments', value: 'upcoming' },
  { label: 'Past Appointments', value: 'past' },
  { label: 'All Appointments', value: 'all' },
];

// === HELPER FUNCTIONS ===
const parseAppointmentsWithDates = (data: DetailedAppointment[] | undefined): AppointmentWithDate[] => {
  if (!data) return [];
  return data
    .map(apt => {
      const parsedDate = parseISOString(apt.appointmentTime);
      if (!parsedDate) {
        console.warn(`[AppointmentsScreen] Skipping appointment with invalid date: ID ${apt.id}`);
        return null;
      }
      return { original: apt, parsedDate };
    })
    .filter((apt): apt is AppointmentWithDate => apt !== null);
};

const filterAppointmentsByType = (appointments: AppointmentWithDate[], filter: FilterOption): AppointmentWithDate[] => {
  const now = new Date();
  switch (filter) {
    case 'upcoming':
      return appointments
        .filter(apt => isFuture(apt.parsedDate) || apt.parsedDate.toDateString() === now.toDateString())
        .sort((a, b) => a.parsedDate.getTime() - b.parsedDate.getTime());
    case 'past':
      return appointments
        .filter(apt => isPast(apt.parsedDate) && apt.parsedDate.toDateString() !== now.toDateString())
        .sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
    case 'all':
    default:
      return [...appointments].sort((a, b) => b.parsedDate.getTime() - a.parsedDate.getTime());
  }
};

const getEmptyStateMessage = (filter: FilterOption): string => {
  switch (filter) {
    case 'upcoming': 
      return 'You have no upcoming appointments.';
    case 'past': 
      return 'You have no past appointments.';
    default: 
      return "You don't have any appointments yet.";
  }
};

const MyAppointmentsScreen: React.FC<MyAppointmentsScreenProps> = ({ navigation }) => {
  const queryClient = useQueryClient();
  const { authStatus } = useAuth();
  const [filter, setFilter] = useState<FilterOption>('upcoming');

  // === DATA FETCHING ===
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isRefetching,
  } = useQuery<DetailedAppointment[], Error>({
    queryKey: ['myAppointments'],
    queryFn: getMyAppointments,
    enabled: authStatus === 'authenticated',
  });

  const cancelMutation = useMutation({
    mutationFn: (appointmentId: string) => cancelAppointment(appointmentId),
    onSuccess: () => {
      Alert.alert('Success', 'Your appointment has been successfully cancelled.');
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
    },
    onError: (err: Error) => {
      Alert.alert('Cancellation Failed', err.message || 'An unexpected error occurred.');
    },
  });

  // === OPTIMIZED DERIVED STATE ===
  const appointmentsWithDates = useMemo(() => 
    parseAppointmentsWithDates(data), 
    [data]
  );

  const filteredAppointments = useMemo(() => 
    filterAppointmentsByType(appointmentsWithDates, filter), 
    [appointmentsWithDates, filter]
  );

  // === OPTIMIZED EVENT HANDLERS ===
  const handleCancelAppointment = useCallback((appointmentId: string) => {
    Alert.alert(
      'Confirm Cancellation',
      'Are you sure you want to cancel this appointment? This action cannot be undone.\n\nPlease note: Appointments can only be cancelled up to 36 hours in advance.',
      [
        { text: 'Back', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: () => cancelMutation.mutate(appointmentId),
        },
      ]
    );
  }, [cancelMutation]);

  const handleBookNewAppointment = useCallback(() => {
    const parentNavigator = navigation.getParent();
    if (parentNavigator) {
      parentNavigator.navigate('Booking');
    }
  }, [navigation]);

  const handleFilterChange = useCallback((value: FilterOption) => {
    setFilter(value);
  }, []);

  // === OPTIMIZED COMPONENTS ===
  const renderAppointment = useCallback(({ item }: { item: AppointmentWithDate }) => (
    <View style={{ paddingHorizontal: theme.spacing.lg, marginBottom: theme.spacing.md }}>
      <AppointmentCard
        appointment={item.original}
        appointmentDate={item.parsedDate}
        onCancel={() => handleCancelAppointment(item.original.id)}
        isCancelling={cancelMutation.isPending && cancelMutation.variables === item.original.id}
      />
    </View>
  ), [handleCancelAppointment, cancelMutation.isPending, cancelMutation.variables]);

  const EmptyState = useCallback(() => {
    const message = getEmptyStateMessage(filter);
    
    return (
      <View style={styles.emptyStateContainer}>
        <CalendarPlus size={48} color={theme.colors.primary} />
        <Text style={styles.emptyStateMessage}>{message}</Text>
        <Button
          variant="default"
          size="lg"
          onPress={handleBookNewAppointment}
          style={{ marginTop: theme.spacing.lg }}
        >
          Book New Appointment
        </Button>
      </View>
    );
  }, [filter, handleBookNewAppointment]);
  
  const ListHeader = useCallback(() => (
     <View style={styles.filterContainer}>
        <ModalPicker<FilterOption>
          label="Filter Appointments"
          options={FILTER_OPTIONS}
          selectedValue={filter}
          onValueChange={handleFilterChange}
        />
      </View>
  ), [filter, handleFilterChange]);

  // === LOADING STATE ===
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  // === ERROR STATE ===
  if (isError) {
    return (
      <View style={styles.emptyStateContainer}>
        <ServerCrash size={48} color={theme.colors.destructive} />
        <Text style={styles.emptyStateMessage}>Could not fetch appointments</Text>
        <Text style={styles.errorText}>{error?.message}</Text>
        <Button variant="outline" onPress={() => refetch()} style={{ marginTop: 20 }}>
          Try Again
        </Button>
      </View>
    );
  }

  // === MAIN RENDER ===
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>My Appointments</Text>
        <Text style={styles.headerDescription}>
          Review your upcoming visits and access your appointment history.
        </Text>
      </View>
      <FlatList
        data={filteredAppointments}
        renderItem={renderAppointment}
        keyExtractor={item => item.original.id}
        ListHeaderComponent={ListHeader}
        ListEmptyComponent={EmptyState}
        refreshControl={<RefreshControl refreshing={isRefetching} onRefresh={refetch} />}
        contentContainerStyle={{ flexGrow: 1 }}
      />
    </SafeAreaView>
  );
};

// === STYLES ===
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  headerContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerTitle: {
    fontSize: 28,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
  },
  headerDescription: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  filterContainer: {
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
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

export default MyAppointmentsScreen; 