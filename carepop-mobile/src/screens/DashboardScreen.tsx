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
} from '../src/components/card.native';
import { Button } from '../src/components/button.native';
import { theme } from '../src/components/theme';
import { useAuth } from '../src/context/AuthContext';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { TabParamList } from '../src/navigation/AppNavigator';
import { Menu, HeartPulse, Stethoscope, Syringe, PersonStanding, Pill } from 'lucide-react-native';

type DashboardNavigationProp = BottomTabNavigationProp<TabParamList, 'Dashboard'>;
type DashboardProps = {};

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

export const DashboardScreen: React.FC<DashboardProps> = () => {
  const { profile, isLoading: isAuthLoading } = useAuth();
  const navigation = useNavigation<DashboardNavigationProp>();
  const insets = useSafeAreaInsets();
  const isLoadingServices = false;

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

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: { flex: 1, backgroundColor: theme.colors.background },
        container: {
          paddingHorizontal: theme.spacing.xl,
          paddingTop: insets.top + 60,
          paddingBottom: 110, // Adjust padding to lift content above the tab bar
        },
        menuButton: {
          position: 'absolute',
          top: insets.top + theme.spacing.md,
          left: insets.left + theme.spacing.lg,
          zIndex: 1,
        },
        greetingText: {
          ...theme.typography.body,
          color: theme.colors.mutedForeground,
          fontFamily: theme.typography.fontFamily,
          fontSize: 24,
        },
        displayNameText: {
          ...theme.typography.h1,
          fontSize: 36,
          lineHeight: 44,
          color: theme.colors.secondary,
          fontFamily: theme.typography.fontFamilyBold,
          marginBottom: theme.spacing.lg,
        },
        card: {
          marginBottom: theme.spacing.lg,
        },
        servicesList: {
          paddingVertical: theme.spacing.md,
        },
        serviceItemBox: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.md,
          marginRight: theme.spacing.md,
          alignItems: 'center',
          justifyContent: 'center',
          width: 140,
          height: 100,
        },
        serviceItemText: {
          ...theme.typography.small,
          color: theme.colors.foreground,
          textAlign: 'center',
          marginTop: theme.spacing.sm,
          fontFamily: theme.typography.fontFamilyMedium,
        },
        statsContainer: {
          flexDirection: 'row',
          justifyContent: 'space-around',
          paddingVertical: theme.spacing.md,
        },
        statItem: {
          alignItems: 'center',
        },
        statValue: {
          ...theme.typography.h2,
          color: theme.colors.accent,
          fontFamily: theme.typography.fontFamilyBold,
        },
        statLabel: {
          ...theme.typography.small,
          color: theme.colors.mutedForeground,
          marginTop: theme.spacing.xs,
          fontFamily: theme.typography.fontFamily,
        },
        sectionHeader: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: theme.spacing.xl,
          marginBottom: theme.spacing.sm,
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
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: theme.spacing.lg,
        },
        headerTextContainer: {
          flexDirection: 'column',
        },
      }),
    [insets]
  );

  const services: HealthService[] = [
    { id: '1', name: 'Family Planning', icon: getIconForService('Family Planning') },
    { id: '2', name: 'Contraceptive Pills', icon: getIconForService('Contraceptive Pills') },
    { id: '3', name: 'IUD Insertion', icon: getIconForService('IUD Insertion') },
    { id: '4', name: 'HIV Testing', icon: getIconForService('HIV Testing') },
  ];

  const displayName = profile?.first_name || 'there';

  const renderServiceItem = ({ item }: { item: HealthService }) => (
    <TouchableOpacity
      style={styles.serviceItemBox}
      onPress={() =>
        navigation.navigate('BookAppointment', {
          screen: 'ServiceSelection',
          params: { clinicId: 'preselected-clinic-id', serviceId: item.id },
        })
      }
    >
      <item.icon color={theme.colors.accent} size={28} />
      <Text style={styles.serviceItemText}>{item.name}</Text>
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
        style={styles.menuButton}
      >
        <Menu size={24} color={theme.colors.foreground} />
      </TouchableOpacity>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Animated.View style={[styles.container, animatedStyle]}>
          <View style={styles.header}>
            <View style={styles.headerTextContainer}>
              <Text style={styles.greetingText}>Welcome back,</Text>
              <Text style={styles.displayNameText} numberOfLines={1}>
                {profile?.first_name || 'User'}
              </Text>
            </View>
          </View>
          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Upcoming Appointment</CardTitle>
              <CardDescription>You have no upcoming appointments.</CardDescription>
            </CardHeader>
            <CardFooter>
              <Button
                title="Book Now"
                onPress={() => navigation.navigate('BookAppointment', { screen: 'ClinicSelection' })}
                variant="default"
                size="lg"
              />
            </CardFooter>
          </Card>

          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Health Services</Text>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          
          {isLoadingServices ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <FlatList
              data={services}
              renderItem={renderServiceItem}
              keyExtractor={(item) => item.id}
              horizontal={true}
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.servicesList}
            />
          )}

          <Card style={styles.card}>
            <CardHeader>
              <CardTitle>Health Journey</CardTitle>
              <CardDescription>Your recent health stats.</CardDescription>
            </CardHeader>
            <CardContent>
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>2</Text>
                  <Text style={styles.statLabel}>Visits</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>12</Text>
                  <Text style={styles.statLabel}>Entries</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>3</Text>
                  <Text style={styles.statLabel}>Records</Text>
                </View>
              </View>
            </CardContent>
          </Card>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
};

