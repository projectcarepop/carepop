import React, { useEffect, useMemo } from 'react';
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
import { useUser } from '@clerk/clerk-expo';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions, CommonActions } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../navigation/AppNavigator';
import { Menu, HeartPulse, Stethoscope, Syringe, PersonStanding, Pill, FileText, User, Droplets, Bell, BookHeart } from 'lucide-react-native';

type DashboardNavigationProp = DrawerNavigationProp<DrawerParamList>;
type DashboardProps = {};

interface QuickAction {
  id: string;
  name: string;
  icon: React.ElementType;
  screen: keyof DrawerParamList;
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

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: {
    paddingHorizontal: theme.spacing.xl,
    paddingTop: theme.spacing.lg, // Adjusted for non-sticky menu
    paddingBottom: theme.spacing['2xl'],
  },
  menuButton: {
    alignSelf: 'flex-start', // Position to the left
    marginBottom: theme.spacing.lg, // Space between button and header
    // Removed absolute positioning
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: theme.spacing.xl, // Reduced margin a bit
  },
  greetingText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    fontSize: 20, // Slightly larger
  },
  displayNameText: {
    ...theme.typography.h1,
    fontSize: 36, // Increased size
    lineHeight: 44, // Adjusted line height
    color: theme.colors.secondary,
  },
  card: {
    marginTop: theme.spacing.lg, // Added top margin for spacing
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
  },
  appointmentCard: {
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    backgroundColor: 'transparent',
  },
  appointmentCardTitle: {
    color: theme.colors.secondary,
  },
  appointmentCardDescription: {
    color: theme.colors.foreground,
    opacity: 0.8,
  },
  appointmentCardHeader: {
    paddingBottom: theme.spacing.lg, // Add space between header and footer
  },
  appointmentCardFooter: {
    paddingTop: 0, // Remove default top padding
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    ...theme.typography.h3,
    color: theme.colors.foreground,
  },
  seeAllText: {
    ...theme.typography.small,
    color: theme.colors.accent,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  quickActionsList: {
    marginHorizontal: -theme.spacing.sm, // Negative margin to offset item padding
  },
  quickActionContentContainer: {
    paddingHorizontal: theme.spacing.sm,
  },
  quickActionTouchable: {
    borderRadius: theme.radius.lg,
  },
  quickActionItem: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    width: 130,
    height: 110,
  },
  quickActionText: {
    ...theme.typography.small,
    color: theme.colors.foreground,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  healthBuddyCard: {
    marginTop: theme.spacing['2xl'],
    borderWidth: 1,
    borderColor: theme.colors.secondary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
  },
  healthBuddyCardContent: {
    alignItems: 'flex-start',
  },
  healthBuddyTitle: {
    ...theme.typography.h3,
    color: theme.colors.secondary,
  },
  healthBuddyDescription: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    marginVertical: theme.spacing.md,
    lineHeight: 22,
  },
  healthToolsContainer: {
    marginTop: theme.spacing.lg,
  },
  healthToolCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'transparent',
    paddingVertical: theme.spacing.sm,
  },
  healthToolIconContainer: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.full,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.lg,
  },
  healthToolTextContainer: {
    flex: 1,
  },
  healthToolTitle: {
    ...theme.typography.h4,
    color: theme.colors.foreground,
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  healthToolDescription: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginTop: 2,
  },
  toolSeparator: {
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.xs,
  }
});

export const DashboardScreen: React.FC<DashboardProps> = () => {
  const { user, isLoaded } = useUser();
  const navigation = useNavigation<DashboardNavigationProp>();
  const insets = useSafeAreaInsets();

  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500 });
    translateY.value = withTiming(0, {
      duration: 500,
      easing: Easing.out(Easing.exp),
    });
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

  const services: HealthService[] = [
    { id: '1', name: 'Family Planning', icon: HeartPulse, screen: 'Book a Service' },
    { id: '2', name: 'Contraceptives', icon: Pill, screen: 'Book a Service' },
    { id: '3', name: 'IUD Insertion', icon: Syringe, screen: 'Book a Service' },
    { id: '4', name: 'Prenatal Care', icon: PersonStanding, screen: 'Book a Service' },
    { id: '5', name: 'Pap Smear', icon: Stethoscope, screen: 'Book a Service' },
  ];

  const healthBuddyTools: HealthBuddyTool[] = [
    {
      id: '1',
      name: 'Menstrual Tracker',
      description: 'Log your cycle and symptoms',
      icon: Droplets,
      screen: 'Health Buddy',
    },
    {
      id: '2',
      name: 'Medication Reminders',
      description: 'Never miss a dose again',
      icon: Bell,
      screen: 'Health Buddy',
    },
    {
      id: '3',
      name: 'Symptom Diary',
      description: 'Keep a log of how you feel',
      icon: BookHeart,
      screen: 'Health Buddy',
    },
  ];

  const renderServiceItem = ({ item }: { item: HealthService }) => (
    <TouchableOpacity
      style={styles.quickActionTouchable}
      onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'App', params: { screen: 'Book a Service' }}))}
      accessible={true}
      accessibilityLabel={item.name}
      accessibilityRole="button"
    >
      <View style={styles.quickActionItem}>
        <item.icon color={theme.colors.accent} size={32} />
        <Text style={styles.quickActionText}>{item.name}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHealthToolItem = ({ item }: { item: HealthBuddyTool }) => (
    <TouchableOpacity
      style={styles.healthToolCard}
      onPress={() => navigation.navigate(item.screen)}
      accessible={true}
      accessibilityLabel={`${item.name}. ${item.description}`}
      accessibilityRole="button"
    >
      <View style={styles.healthToolIconContainer}>
        <item.icon color={theme.colors.secondary} size={24} />
      </View>
      <View style={styles.healthToolTextContainer}>
        <Text style={styles.healthToolTitle}>{item.name}</Text>
        <Text style={styles.healthToolDescription}>{item.description}</Text>
      </View>
    </TouchableOpacity>
  );

  if (isLoaded) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.container}
        >
          <Animated.View style={animatedStyle}>
            <TouchableOpacity
              onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
              style={styles.menuButton}
              accessible={true}
              accessibilityLabel="Open menu"
              accessibilityRole="button"
            >
              <Menu size={28} color={theme.colors.foreground} />
            </TouchableOpacity>
            
            <View style={styles.header}>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.displayNameText}>{user?.fullName || 'User'}</Text>
            </View>

            <Card style={[styles.card, styles.appointmentCard]}>
              <CardHeader style={styles.appointmentCardHeader}>
                <CardTitle style={styles.appointmentCardTitle}>Upcoming Appointment</CardTitle>
                <CardDescription style={styles.appointmentCardDescription}>You have no upcoming appointments.</CardDescription>
              </CardHeader>
              <CardFooter style={styles.appointmentCardFooter}>
                <Button
                  title="Book a Service"
                  onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'App', params: { screen: 'Book a Service' }}))}
                  variant="default"
                  size="lg"
                  accessibilityLabel="Book a new service"
                />
              </CardFooter>
            </Card>

            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Our Services</Text>
              <TouchableOpacity onPress={() => navigation.dispatch(CommonActions.navigate({ name: 'App', params: { screen: 'Book a Service' }}))}>
                  <Text style={styles.seeAllText}>See All</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
            />

            <Card style={styles.healthBuddyCard}>
              <CardHeader>
                <View style={styles.healthBuddyCardContent}>
                  <HeartPulse size={32} color={theme.colors.secondary} />
                  <CardTitle style={styles.healthBuddyTitle}>Health Buddy</CardTitle>
                </View>
              </CardHeader>
              <CardContent>
                <Text style={styles.healthBuddyDescription}>
                  Your personal guide to track your health, get reminders, and stay
                  informed.
                </Text>
                <View style={styles.healthToolsContainer}>
                  <FlatList
                    data={healthBuddyTools}
                    renderItem={renderHealthToolItem}
                    keyExtractor={(item) => item.id}
                    scrollEnabled={false} // Disable scroll for this list as it's inside a ScrollView
                    ItemSeparatorComponent={() => <View style={styles.toolSeparator} />}
                  />
                </View>
              </CardContent>
            </Card>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  } else {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }
};

