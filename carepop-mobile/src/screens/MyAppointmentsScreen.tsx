import React, { useState, useMemo, useEffect, useCallback } from 'react';
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
  CardDescription,
  Button,
  theme,
} from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import {
  useNavigation,
  CommonActions,
  DrawerActions,
} from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Menu, Calendar, Clock, MapPin, Stethoscope, AlertCircle } from 'lucide-react-native';
import type { AppointmentsStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import api, { type Appointment } from '../utils/api';
import { format } from 'date-fns';

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

const AppointmentCard: React.FC<{ item: Appointment; onPress: () => void }> = ({
  item,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress} style={styles.cardTouchable}>
    <View style={styles.appointmentCard}>
       <CardHeader>
        <CardTitle style={styles.cardTitle}>{item.services.name}</CardTitle>
        <StatusIndicator status={item.status} />
       </CardHeader>
       <View style={styles.cardSeparator} />
       <CardContent style={styles.cardContent}>
        <View style={styles.detailRow}>
          <MapPin size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText} numberOfLines={1}>{item.clinics.name}</Text>
        </View>
        <View style={styles.detailRow}>
          <Calendar size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText}>{format(new Date(item.appointment_date), 'EEEE, MMMM dd, yyyy')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText}>{format(new Date(`1970-01-01T${item.start_time}`), 'hh:mm a')}</Text>
        </View>
      </CardContent>
    </View>
  </TouchableOpacity>
);

const EmptyState = ({ onBook }: { onBook: () => void }) => (
  <View style={styles.emptyContainer}>
    <AlertCircle size={48} color={theme.colors.mutedForeground} />
    <Text style={styles.emptyText}>No appointments here</Text>
    <Text style={styles.emptySubText}>
      Your upcoming appointments will be shown here.
    </Text>
    <Button title="Book a Service" onPress={onBook} style={{ marginTop: theme.spacing.lg }} />
  </View>
);

// --- Tab Views ---

const AppointmentsList: React.FC<{
  fetcher: () => Promise<any>;
  navigation: AppointmentsNavigationProp;
}> = ({ fetcher, navigation }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      const { data } = await fetcher();
      setAppointments(data || []);
    } catch (error) {
      console.error(error);
      // Handle error display
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [fetcher]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadAppointments();
  }, [loadAppointments]);

  if (loading && !refreshing) {
    return <ActivityIndicator style={{ marginTop: 40 }} size="large" color={theme.colors.primary} />;
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
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <EmptyState
          onBook={() =>
            navigation.dispatch(
              CommonActions.navigate({
                name: 'App',
                params: {
                  screen: 'Book a Service',
                },
              })
            )
          }
        />
      }
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    />
  );
};

// --- Main Screen Component ---

export const MyAppointmentsScreen: React.FC = () => {
  const layout = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<AppointmentsNavigationProp>();

  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: 'upcoming', title: 'Upcoming' },
    { key: 'past', title: 'Past' },
  ]);

  // Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    const a = setTimeout(() => {
      opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
      translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    }, 100); // Small delay to ensure layout is ready
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
    upcoming: () => <AppointmentsList fetcher={() => api.get('/appointments/my/future')} navigation={navigation} />,
    past: () => <AppointmentsList fetcher={() => api.get('/appointments/my/past')} navigation={navigation} />,
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
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={[
          styles.menuButton,
          { top: insets.top + theme.spacing.md, left: insets.left + theme.spacing.xl },
        ]}
      >
        <Menu size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        <View style={[styles.header, {paddingTop: insets.top + 60, paddingHorizontal: theme.spacing.xl}]}>
            <Text style={styles.headerTitle}>My Bookings</Text>
        </View>
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

// --- Styles ---

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  menuButton: {
    position: 'absolute',
    zIndex: 10,
  },
  header: {
    backgroundColor: theme.colors.background,
    paddingBottom: theme.spacing.md,
  },
  headerTitle: {
    ...theme.typography.h1,
    fontFamily: theme.typography.fontFamilyBold,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg,
    paddingBottom: 100, // Ensure space for last card
  },
  cardTouchable: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.lg, // Softer corners
    backgroundColor: theme.colors.card,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  appointmentCard: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  cardTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.foreground,
    paddingRight: 8, // Make space for status
    flexShrink: 1,
  },
  cardSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.lg,
  },
  cardContent: {
    paddingTop: theme.spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardDetailText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginLeft: theme.spacing.md,
    flexShrink: 1, // Prevent long text from pushing icons
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: theme.spacing.sm,
  },
  statusText: {
    ...theme.typography.small,
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
    marginTop: 80, // Push it down a bit
  },
  emptyText: {
    ...theme.typography.h3,
    marginTop: theme.spacing.lg,
    color: theme.colors.foreground,
    fontFamily: theme.typography.fontFamilyBold,
  },
  emptySubText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
});