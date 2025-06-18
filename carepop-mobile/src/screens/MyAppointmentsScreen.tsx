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
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { Menu, Calendar, Clock } from 'lucide-react-native';
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

// --- Appointment Card Component ---

const AppointmentCard: React.FC<{ item: Appointment; isPast?: boolean, onPress: () => void }> = ({
  item,
  isPast,
  onPress,
}) => (
  <TouchableOpacity onPress={onPress}>
    <Card style={styles.appointmentCard}>
      <CardHeader>
        <CardTitle style={styles.cardTitle}>{item.services.name}</CardTitle>
        <CardDescription style={styles.cardDescription}>{item.clinics.name}</CardDescription>
      </CardHeader>
      <CardContent style={styles.cardContent}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText}>{format(new Date(item.appointment_date), 'MMMM dd, yyyy')}</Text>
        </View>
        <View style={styles.detailRow}>
          <Clock size={16} color={theme.colors.mutedForeground} />
          <Text style={styles.cardDetailText}>{format(new Date(`1970-01-01T${item.start_time}`), 'hh:mm a')}</Text>
        </View>
      </CardContent>
      {!isPast && (
        <CardContent>
           <Text style={[styles.status, item.status === 'confirmed' && styles.confirmed]}>{item.status.replace('_', ' ')}</Text>
        </CardContent>
      )}
    </Card>
  </TouchableOpacity>
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
    return <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.colors.primary} />;
  }

  return (
    <FlatList
      data={appointments}
      renderItem={({ item }) => (
        <AppointmentCard
          item={item}
          isPast={new Date(item.appointment_date) < new Date()}
          onPress={() => navigation.navigate('AppointmentDetail', { appointmentId: item.id })}
        />
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListEmptyComponent={
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No appointments found.</Text>
        </View>
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
      indicatorStyle={{ backgroundColor: theme.colors.primary, height: 3, borderRadius: 3 }}
      style={{
        backgroundColor: theme.colors.background,
        borderBottomWidth: 1,
        borderColor: theme.colors.border,
        elevation: 0,
      }}
      labelStyle={{
        fontFamily: theme.typography.fontFamilySemiBold,
        fontSize: 16,
      }}
      activeColor={theme.colors.primary}
      inactiveColor={theme.colors.mutedForeground}
    />
  );

  return (
    <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
      <TouchableOpacity
        onPress={() => navigation.getParent<DrawerNavigationProp<DrawerParamList>>()?.toggleDrawer()}
        style={[
          styles.menuButton,
          { top: insets.top + theme.spacing.sm, left: insets.left + theme.spacing.xl },
        ]}
      >
        <Menu size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        <Text
          style={[
            styles.headerTitle,
            {
              paddingTop: insets.top + 60,
              paddingLeft: insets.left + theme.spacing.xl,
              paddingRight: insets.right + theme.spacing.xl,
            },
          ]}
        >
          My Bookings
        </Text>
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
  menuButton: {
    position: 'absolute',
    zIndex: 10,
    backgroundColor: theme.colors.background,
    width: 44,
    height: 44,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  headerTitle: {
    ...theme.typography.h1,
    fontFamily: theme.typography.fontFamilyBold,
    paddingBottom: theme.spacing.md,
    backgroundColor: theme.colors.background,
  },
  listContainer: {
    padding: theme.spacing.xl,
  },
  appointmentCard: {
    marginBottom: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    backgroundColor: theme.colors.card,
  },
  cardTitle: {
    fontFamily: theme.typography.fontFamilySemiBold,
    fontSize: 18,
  },
  cardDescription: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
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
    ...theme.typography.small,
    marginLeft: theme.spacing.sm,
    color: theme.colors.foreground,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  status: {
    ...theme.typography.small,
    fontFamily: theme.typography.fontFamilySemiBold,
    textTransform: 'capitalize',
    textAlign: 'right',
  },
   confirmed: {
    color: theme.colors.success,
  }
});