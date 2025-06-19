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
    paddingTop: 80, // Increased padding to clear the menu button
    paddingBottom: 64, // Reduced bottom padding
  },
  menuButton: {
    position: 'absolute',
    // top is now set dynamically
    left: theme.spacing.xl,
    zIndex: 10,
    height: 48,
    width: 48,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  header: {
    marginBottom: theme.spacing['2xl'],
  },
  greetingText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    fontSize: 18,
  },
  displayNameText: {
    ...theme.typography.h1,
    fontSize: 32, // Large, welcoming headline
    lineHeight: 40,
    color: theme.colors.secondary,
  },
  card: {
    marginBottom: theme.spacing.xl,
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
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

  const quickActions: QuickAction[] = [
    { id: '1', name: 'Book a Service', icon: Stethoscope, screen: 'Book a Service' },
    { id: '2', name: 'My Records', icon: FileText, screen: 'Records' },
    { id: '3', name: 'Health Buddy', icon: HeartPulse, screen: 'Health Buddy' },
    { id: '4', name: 'My Profile', icon: User, screen: 'Profile' },
  ];

  const displayName = profile?.first_name || 'there';

  const renderQuickActionItem = ({ item }: { item: QuickAction }) => (
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
      <TouchableOpacity
        onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())}
        style={[styles.menuButton, { top: insets.top + theme.spacing.lg }]}
        accessible={true}
        accessibilityLabel="Open menu"
        accessibilityRole="button"
      >
        <Menu size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Animated.View style={animatedStyle}>
          <View style={styles.header}>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.displayNameText} numberOfLines={1}>
              {profile?.first_name || 'User'}!
            </Text>
          </View>
          
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Upcoming Appointment</CardTitle>
              <CardDescription>You have no upcoming appointments.</CardDescription>
            </CardHeader>
            <CardFooter>
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
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>

          <FlatList
            data={quickActions}
            renderItem={renderQuickActionItem}
            keyExtractor={(item) => item.id}
            horizontal
            showsHorizontalScrollIndicator={false}
            ItemSeparatorComponent={() => <View style={{ width: theme.spacing.md }} />}
          />

        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

