import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  CardDescription,
} from '../components/card.native';
import { Button } from '../components/button.native';
import { theme } from '../components/theme';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions, CommonActions } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../navigation/AppNavigator';
import { Menu, HeartPulse, Stethoscope, Syringe, PersonStanding, Pill, FileText, User, Droplets, Bell, BookHeart, Calendar, Map, CheckCircle, XCircle, Smile, Meh, Frown, PlusCircle, AlertCircle } from 'lucide-react-native';
import { getMyAppointments } from '../services/api';
import type { DetailedAppointment } from '../lib/types';

type DashboardNavigationProp = DrawerNavigationProp<DrawerParamList>;
type DashboardProps = {};

interface QuickAction {
  id: string;
  name: string;
  icon: React.ElementType;
  screen: keyof DrawerParamList;
  iconColor: string;
}

interface HealthService {
  id: string;
  name: string;
  icon: React.ElementType;
  screen: keyof DrawerParamList;
}

interface HealthBuddyTool {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  screen: keyof DrawerParamList;
}

interface HealthStatusData {
    pillLogged: boolean;
    moodLogged: boolean;
    cycleLogged: boolean;
}

const getIconForService = (serviceName: string): React.ElementType => {
  const name = serviceName.toLowerCase();
  if (name.includes('planning')) return HeartPulse;
  if (name.includes('contraceptive')) return Pill;
  if (name.includes('iud')) return Syringe;
  if (name.includes('prenatal')) return PersonStanding;
  if (name.includes('pap smear')) return Stethoscope;
  if (name.includes('hiv')) return HeartPulse;
  if (name.includes('gender-affirming')) return PersonStanding;
  return Stethoscope;
};

// Simplified data structure
const quickActions: QuickAction[] = [
  { id: '1', name: 'Book Appointment', icon: Calendar, screen: 'Book a Service', iconColor: theme.colors.primary },
  { id: '2', name: 'Clinic Finder', icon: Map, screen: 'Clinic Finder', iconColor: theme.colors.secondary },
  { id: '3', name: 'Health Buddy', icon: BookHeart, screen: 'Health Buddy', iconColor: theme.colors.primary },
  { id: '4', name: 'My Records', icon: FileText, screen: 'Records', iconColor: theme.colors.secondary },
];

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    flex: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  menuButton: {
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTexts: {
    flex: 1,
    alignItems: 'flex-start',
    paddingLeft: theme.spacing.md,
  },
  greetingText: {
    ...theme.typography.body,
    paddingTop: theme.spacing.md,
    color: theme.colors.mutedForeground,
    fontSize: 24,
  },
  displayNameText: {
    ...theme.typography.h2,
    color: theme.colors.primary,
    paddingTop: theme.spacing.md,
    fontFamily: theme.typography.interFontFamilyBold,
    fontSize: 40,
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingVertical: theme.spacing.lg,
  },
  cardShadow: {
    shadowColor: theme.colors.foreground,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 3,
  },
  appointmentCard: {
    padding: theme.spacing.lg*1.2,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  appointmentTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.secondary,
  },
  appointmentDetails: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
  },
  insightCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
  },
  insightTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
  },
  insightText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  healthBuddyCard: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.lg,
  },
  healthBuddyTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.lg,
  },
  separator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  healthStatusContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statusItem: {
    alignItems: 'center',
  },
  statusText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.sm,
  },
  quickActionsContainer: {
  },
  quickActionsTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.lg,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickActionTouchable: {
    width: '48%',
    marginBottom: theme.spacing.md,
  },
  quickActionItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 120,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  quickActionText: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fontFamilyMedium,
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
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
  },
});

export const DashboardScreen: React.FC<DashboardProps> = () => {
  const { user } = useAuth();
  const navigation = useNavigation<DashboardNavigationProp>();
  const insets = useSafeAreaInsets();
  const opacity = useSharedValue(0);

  const { data: appointments, isLoading, isError, error } = useQuery<DetailedAppointment[], Error>({
    queryKey: ['myAppointments'],
    queryFn: () => getMyAppointments(),
  });

  const upcomingAppointment = appointments?.[0];

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  useEffect(() => {
    opacity.value = withTiming(1, {
      duration: 800,
      easing: Easing.out(Easing.ease),
    });
  }, []);

  const WelcomeHeader = () => (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <Animated.View style={[styles.container, animatedStyle]}>
        <View style={styles.header}>
          <View style={styles.headerTexts}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.displayNameText} numberOfLines={1}>
              {user?.firstName || 'User'}
            </Text>
          </View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.dispatch(DrawerActions.openDrawer())}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Menu size={32} color={theme.colors.foreground} />
          </TouchableOpacity>
        </View>
      </Animated.View>
    </SafeAreaView>
  );

  const UpcomingAppointment = () => {
    if (isLoading) {
      return (
        <View style={styles.appointmentCard}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      );
    }

    if (isError) {
      return (
        <View style={[styles.appointmentCard, { backgroundColor: theme.colors.destructiveMuted }]}>
          <Text style={styles.appointmentTitle}>Error</Text>
          <Text style={styles.appointmentDetails}>
            Could not load appointments. Please try again later.
          </Text>
        </View>
        
      );
    }

    if (!upcomingAppointment) {
      return (
        <View style={styles.appointmentCard}>
          <Text style={styles.appointmentTitle}>No Upcoming Appointments</Text>
          <Text style={styles.appointmentDetails}>You&apos;re all clear! Book a new appointment anytime.</Text>
          <Button
            title="Set an appointment"
            variant="secondary"
            size="xl"
            onPress={() => navigation.navigate('Book a Service')}
            style={{ marginTop: theme.spacing.lg }}
          />
        </View>
      );
    }
    
    return (
      <View style={styles.appointmentCard}>
        <Text style={styles.appointmentTitle}>Next Appointment</Text>
        <Text style={styles.appointmentDetails}>
          {new Date(upcomingAppointment.appointmentTime).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </Text>
         <Text style={styles.appointmentDetails}>
           With {upcomingAppointment.doctor.fullName} at {upcomingAppointment.clinic.name}
        </Text>
      </View>
    );
  };

  const QuickActions = () => (
    <View style={styles.quickActionsContainer}>
      <Text style={styles.quickActionsTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity 
            key={action.id}
            style={styles.quickActionTouchable}
            onPress={() => navigation.navigate(action.screen)}
          >
            <View style={styles.quickActionItem}>
              <action.icon size={32} color={action.iconColor} />
              <Text style={styles.quickActionText}>{action.name}</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );

  if (isLoading) {
    return <View style={styles.loadingContainer}><ActivityIndicator size="large" /></View>;
  }

  if (isError) {
    return <View style={styles.errorContainer}><Text style={styles.errorText}>Error: {(error as Error).message}</Text></View>;
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
      >
        <WelcomeHeader />
        <Animated.View style={[styles.content, animatedStyle]}>
          <UpcomingAppointment />
          <QuickActions />
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

