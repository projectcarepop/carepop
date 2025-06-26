import React, { useState, useEffect, useMemo } from 'react';
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
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  theme,
} from '../src/components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { useNavigation, CommonActions, DrawerActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Menu, Calendar, Clock, MapPin, AlertCircle } from 'lucide-react-native';
import type { AppointmentsStackParamList } from '../src/navigation/AppNavigator';
import Animated, { useSharedValue, useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { getMyAppointments } from '../src/services/api';
import type { DetailedAppointment } from '../src/lib/types';

type AppointmentsNavigationProp = NativeStackNavigationProp<AppointmentsStackParamList, 'MyAppointments'>;

const StatusIndicator = ({ status }: { status: string }) => {
  const statusConfig = {
    confirmed: {
      color: theme.colors.success,
      text: 'Confirmed',
    },
    completed: {
      color: theme.colors.primary,
      text: 'Completed',
    },
    cancelled: {
      color: theme.colors.destructive,
      text: 'Cancelled',
    },
    'pending_payment': {
        color: theme.colors.accent,
        text: 'Pending Payment'
    },
    'no-show': {
        color: theme.colors.mutedForeground,
        text: 'No Show'
    },
    default: {
      color: theme.colors.mutedForeground,
      text: status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' '),
    },
  };
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default;

  return (
    <View style={styles.statusContainer}>
      <View style={[styles.statusDot, { backgroundColor: config.color }]} />
      <Text style={[styles.statusText, { color: config.color }]}>{config.text}</Text>
    </View>
  );
};

const EmptyState = ({ onBook }: { onBook: () => void }) => (
  <View style={styles.emptyContainer}>
    <AlertCircle size={48} color={theme.colors.mutedForeground} />
    <Text style={styles.emptyText}>No appointments here</Text>
    <Text style={styles.emptySubText}>
      Your appointments will be shown here.
    </Text>
    <Button title="Book a Service" onPress={onBook} style={{ marginTop: theme.spacing.lg }} />
  </View>
);

const AppointmentCard: React.FC<{ item: DetailedAppointment; onPress: () => void }> = ({
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
);

const AppointmentsList: React.FC<{
  appointments: DetailedAppointment[] | undefined;
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
  refreshing: boolean;
  navigation: AppointmentsNavigationProp;
}> = ({ appointments, isLoading, isError, refetch, refreshing, navigation }) => {
  if (isLoading && !refreshing) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />;
  }

  if (isError) {
      return (
        <View style={styles.emptyContainer}>
            <AlertCircle size={48} color={theme.colors.destructive} />
            <Text style={styles.emptyText}>Something went wrong</Text>
            <Text style={styles.emptySubText}>We couldn&apos;t load your appointments. Please try again.</Text>
            <Button title="Retry" onPress={refetch} style={{ marginTop: theme.spacing.lg }} />
        </View>
      )
  }

  return (
    <FlatList
      data={appointments}
      renderItem={({ item }) => (
        <AppointmentCard
          item={item}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <EmptyState
          onBook={() =>
            navigation.dispatch(
              CommonActions.navigate({
                name: 'Main', // Corrected navigation path
                params: { screen: 'Book a Service' },
              })
            )
          }
        />
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}
    />
  );
};

const UpcomingAppointments: React.FC<{ navigation: AppointmentsNavigationProp }> = ({ navigation }) => {
    const { data, isLoading, isError, refetch, isRefetching } = useQuery({
        queryKey: ['myAppointments'],
        queryFn: getMyAppointments,
    });

    const upcomingAppointments = useMemo(() => {
        if (!data) return [];
        return data.filter(appt => new Date(appt.appointmentTime) >= new Date());
    }, [data]);

    return (
        <AppointmentsList 
            appointments={upcomingAppointments}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
            refreshing={isRefetching}
            navigation={navigation}
        />
    )
}

const PastAppointments: React.FC<{ navigation: AppointmentsNavigationProp }> = ({ navigation }) => {
    const { data, isLoading, isError, refetch, isRefetching } = useQuery({
        queryKey: ['myAppointments'],
        queryFn: getMyAppointments,
    });

    const pastAppointments = useMemo(() => {
        if (!data) return [];
        return data.filter(appt => new Date(appt.appointmentTime) < new Date());
    }, [data]);

    return (
        <AppointmentsList 
            appointments={pastAppointments}
            isLoading={isLoading}
            isError={isError}
            refetch={refetch}
            refreshing={isRefetching}
            navigation={navigation}
        />
    )
}

export const MyAppointmentsScreen: React.FC = () => {
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AppointmentsNavigationProp>();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'past', title: 'Past' },
  ]);

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const a = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    }, 100);
    return () => clearTimeout(a);
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      flex: 1,
    };
  });

  const renderScene = SceneMap({
    upcoming: () => <UpcomingAppointments navigation={navigation} />,
    past: () => <PastAppointments navigation={navigation} />,
  });

  const renderTabBar = (props: any) => (
    <TabBar
      {...props}
      indicatorStyle={{ backgroundColor: theme.colors.primary, height: 2 }}
      style={{
        backgroundColor: 'transparent',
        elevation: 0,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
      }}
      labelStyle={{
        fontFamily: theme.typography.fontFamilySemiBold,
        fontSize: 16,
        textTransform: 'capitalize',
      }}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.mutedForeground}
    />
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={styles.menuButton}
      >
        <Menu size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Appointments</Text>
      </View>
      <Animated.View style={animatedStyle}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h2,
    fontFamily: theme.typography.fontFamilyBold,
  },
  menuButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    padding: 10,
  },
  listContainer: {
    padding: theme.spacing.lg,
  },
  cardTouchable: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
   cardHeader: {
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
   },
  cardTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
    flexShrink: 1,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  },
  cardContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  cardDetailText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    flexShrink: 1,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: theme.radius.full,
    backgroundColor: theme.colors.muted,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...theme.typography.small,
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
    ...theme.typography.h3,
    fontFamily: theme.typography.fontFamilySemiBold,
    marginTop: theme.spacing.lg,
  },
  emptySubText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});
