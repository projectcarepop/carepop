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
import { useAuth } from '../context/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { DrawerParamList } from '../navigation/AppNavigator';
import { Menu, HeartPulse, Stethoscope, Syringe, PersonStanding, Pill, FileText, User } from 'lucide-react-native';

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
    backgroundColor: theme.colors.secondary, // Use a distinct, inviting color
    marginTop: theme.spacing['2xl'],
  },
  healthBuddyCardContent: {
    alignItems: 'flex-start',
  },
  healthBuddyTitle: {
    ...theme.typography.h3,
    color: theme.colors.secondaryForeground,
  },
  healthBuddyDescription: {
    ...theme.typography.body,
    color: theme.colors.secondaryForeground,
    marginVertical: theme.spacing.md,
    lineHeight: 22,
  },
});

export const DashboardScreen: React.FC<DashboardProps> = () => {
  const { profile, isLoading: isAuthLoading } = useAuth();
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

  const displayName = profile?.first_name || 'there';

  const renderServiceItem = ({ item }: { item: HealthService }) => (
    <TouchableOpacity
      style={styles.quickActionTouchable}
      onPress={() => navigation.navigate(item.screen)}
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

  if (isAuthLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

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
            <Text style={styles.displayNameText} numberOfLines={1}>
              {profile?.first_name || 'User'}!
            </Text>
          </View>

          <Card style={styles.card}>
            <CardHeader style={styles.appointmentCardHeader}>
              <CardTitle>Upcoming Appointment</CardTitle>
              <CardDescription>You have no upcoming appointments.</CardDescription>
            </CardHeader>
            <CardFooter style={styles.appointmentCardFooter}>
              <Button
                title="Book a Service"
                onPress={() => navigation.navigate('Book a Service')}
                variant="default"
                size="lg"
                accessibilityLabel="Book a new service"
              />
            </CardFooter>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Our Services</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Book a Service')}>
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
                    <HeartPulse size={32} color={theme.colors.secondaryForeground} />
                    <CardTitle style={styles.healthBuddyTitle}>Health Buddy</CardTitle>
                </View>
            </CardHeader>
            <CardContent>
                <Text style={styles.healthBuddyDescription}>
                    Your personal guide to track your health, get reminders, and stay informed.
                </Text>
            </CardContent>
            <CardFooter>
              <Button
                title="Explore Health Buddy"
                onPress={() => navigation.navigate('Health Buddy')}
                variant="secondary"
                size="lg"
                accessibilityLabel="Explore Health Buddy features"
              />
            </CardFooter>
          </Card>

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

