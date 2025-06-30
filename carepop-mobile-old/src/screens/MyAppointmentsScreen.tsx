import React, { useState, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  useWindowDimensions,
  RefreshControl,
} from 'react-native';
import {
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  theme,
} from '../components';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation, NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getMyAppointments } from '../services/api';
import type { DetailedAppointment } from '../lib/types';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../utils/supabase';
import type { BookingStackParamList } from '../navigation/BookingNavigator';

// Widen the type to include the sibling navigator
export type AppointmentsStackParamList = {
  MyAppointments: undefined;
  AppointmentDetail: { appointmentId: string };
  Booking: NavigatorScreenParams<BookingStackParamList>;
};

type AppointmentsNavigationProp = NativeStackNavigationProp<AppointmentsStackParamList, 'MyAppointments'>;

const StatusIndicator = ({ status }: { status: string }) => {
  const statusConfig = useMemo(() => ({
    CONFIRMED: { color: theme.colors.success, text: 'Confirmed' },
    COMPLETED: { color: theme.colors.primary, text: 'Completed' },
    CANCELLED: { color: theme.colors.destructive, text: 'Cancelled' },
    PENDING: { color: theme.colors.accent, text: 'Pending' },
    'NO-SHOW': { color: theme.colors.mutedForeground, text: 'No Show' },
  }), []);

  const config = statusConfig[status.toUpperCase() as keyof typeof statusConfig] || {
    color: theme.colors.mutedForeground,
    text: status.charAt(0).toUpperCase() + status.slice(1).replace(/_/g, ' '),
  };

  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};
StatusIndicator.displayName = 'StatusIndicator';


const AppointmentCard: React.FC<{ item: DetailedAppointment; onPress: () => void }> = React.memo(({
  item,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={styles.cardTouchable}>
    <View style={styles.appointmentCard}>
       <CardHeader>
        <CardTitle style={styles.cardTitle}>{item.service.name}</CardTitle>
        <StatusIndicator status={item.status} />
       </CardHeader>
       <View style={styles.cardSeparator} />
       <CardContent style={styles.cardContent}>
        <View style={styles.detailRow}>
          <MapPin size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText} numberOfLines={1}>{item.clinic.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText}>{format(new Date(item.appointmentTime), 'EEEE, MMMM dd, yyyy')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText}>{format(new Date(item.appointmentTime), 'hh:mm a')}</Text>
        </View>
      </CardContent>
    </View>
  </TouchableOpacity>
));

AppointmentCard.displayName = 'AppointmentCard';

const EmptyState = ({ onBook }: { onBook: () => void }) => (
  <View style={styles.emptyContainer}>
    <AlertCircle size={48} color={theme.colors.mutedForeground} />
    <Text style={styles.emptyText}>No appointments found.</Text>
    <Text style={styles.emptySubText}>
      When you book appointments, they will appear here.
    </Text>
    <Button title="Book New Appointment" onPress={onBook} style={{ marginTop: theme.spacing.lg }} />
  </View>
);
EmptyState.displayName = 'EmptyState';

const AppointmentsList: React.FC<{
  appointments: DetailedAppointment[];
  onRefresh: () => void;
  refreshing: boolean;
}> = ({ appointments, onRefresh, refreshing }) => {
  const navigation = useNavigation<AppointmentsNavigationProp>();

  const handleBookPress = () => {
    navigation.navigate('Booking', { screen: 'ServiceSelection' });
  };
  
  return (
    <FlatList
      data={appointments}
      renderItem={({ item }) => (
        <AppointmentCard
          item={item}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        />
      )}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={<EmptyState onBook={handleBookPress} />}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.colors.primary]} tintColor={theme.colors.primary} />}
    />
  );
};
AppointmentsList.displayName = "AppointmentsList"

export const MyAppointmentsScreen: React.FC = () => {
  const layout = useWindowDimensions();
  const { authStatus } = useAuth(); // We only need the status to enable/disable the query
  const navigation = useNavigation<AppointmentsNavigationProp>();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'past', title: 'Past' },
  ]);

  const { data: allAppointments, isLoading, isError, error, refetch, isRefetching } = useQuery({
      // The query is dependent on the user being authenticated.
      queryKey: ['myAppointments', authStatus],
      queryFn: () => {
        // Pass the singleton client directly to the service function.
        return getMyAppointments(supabase);
      },
      // Only run the query if the user is fully authenticated.
      enabled: authStatus === 'authenticated',
  });

  const { upcomingAppointments, pastAppointments } = useMemo(() => {
    if (!allAppointments) {
      return { upcomingAppointments: [], pastAppointments: [] };
    }
    const now = new Date();
    const upcoming = allAppointments.filter(appt => new Date(appt.appointmentTime) >= now);
    const past = allAppointments.filter(appt => new Date(appt.appointmentTime) < now);
    return { 
      upcomingAppointments: upcoming.sort((a, b) => new Date(a.appointmentTime).getTime() - new Date(b.appointmentTime).getTime()),
      pastAppointments: past.sort((a, b) => new Date(b.appointmentTime).getTime() - new Date(a.appointmentTime).getTime()),
    };
  }, [allAppointments]);

  const renderScene = useMemo(() => SceneMap({
    upcoming: () => <AppointmentsList appointments={upcomingAppointments} onRefresh={refetch} refreshing={isRefetching} />,
    past: () => <AppointmentsList appointments={pastAppointments} onRefresh={refetch} refreshing={isRefetching} />,
  }), [upcomingAppointments, pastAppointments, refetch, isRefetching]);

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary, height: 2.5 }}
      style={styles.tabBar}
      labelStyle={styles.tabBarLabel}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.mutedForeground}
    />
  );

  React.useLayoutEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <Button 
          title="Book New" 
          onPress={() => navigation.navigate('Booking', { screen: 'ServiceSelection' })}
          variant="ghost"
          size="sm"
        />
      ),
    });
  }, [navigation]);

  if (isLoading && !isRefetching) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError) {
    return (
      <View style={styles.errorContainer}>
        <AlertCircle size={48} color={theme.colors.destructive} />
        <Text style={styles.errorText}>Could not load appointments.</Text>
        <Text style={styles.errorSubText}>
          {error instanceof Error ? error.message : 'An unexpected error occurred.'}
        </Text>
        <Button title="Retry" onPress={() => refetch()} style={{ marginTop: theme.spacing.lg }} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        initialLayout={{ width: layout.width }}
        renderTabBar={renderTabBar}
        style={styles.tabView}
      />
    </View>
  );
};
MyAppointmentsScreen.displayName = "MyAppointmentsScreen"

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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
  },
  errorText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  errorSubText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
    textAlign: 'center',
  },
  tabView: {
    flex: 1,
  },
  tabBar: {
    backgroundColor: theme.colors.background,
    elevation: 0,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
  },
  tabBarLabel: {
    fontFamily: theme.typography.fontFamilySemiBold,
    fontSize: 16,
    textTransform: 'capitalize',
  },
  listContainer: {
    flexGrow: 1,
    padding: theme.spacing.md,
  },
  cardTouchable: {
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.lg,
  },
  appointmentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: 'hidden',
  },
  cardTitle: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.cardForeground,
    flex: 1,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  cardContent: {
    paddingTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardDetailText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.mutedForeground,
    flexShrink: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
    borderRadius: theme.radius.full,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    fontSize: 12,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    minHeight: 400,
  },
  emptyText: {
    fontSize: 18,
    fontFamily: theme.typography.fontFamilySemiBold,
    marginTop: theme.spacing.md,
    color: theme.colors.foreground,
  },
  emptySubText: {
    fontSize: 14,
    fontFamily: theme.typography.fontFamily,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});