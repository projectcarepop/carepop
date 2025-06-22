import React, { useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  SafeAreaView,
  TouchableOpacity,
} from 'react-native';
import { useNavigation, DrawerActions } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { theme } from '../components/theme';
import { Button } from '../components/button.native';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { format } from 'date-fns';
import { Menu } from 'lucide-react-native';

import provinces from '../data/psgc/provinces.json';
import cities from '../data/psgc/cities-municipalities.json';
import barangaysData from '../data/psgc/barangays.json';

interface Barangay { brgy_code: string; brgy_name: string; }
const barangays = barangaysData as Barangay[];

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  RootStackParamList,
  'Main'
>;

const ProfileInfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || 'Not set'}</Text>
  </View>
);

export function MyProfileScreen() {
  const navigation = useNavigation<ProfileScreenNavigationProp>();
  const { user, isLoaded } = useUser();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    try {
      await signOut();
      // The RootAppNavigator will automatically handle navigating to the Auth flow.
    } catch (e) {
      console.error('Failed to sign out', e);
    }
  };

  const formattedDob = useMemo(() => {
    const dob = user?.publicMetadata?.date_of_birth as string | undefined;
    if (dob && dob.trim().length > 0) {
      try {
        return format(new Date(`${dob}T00:00:00`), 'MMMM d, yyyy');
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
      }
    }
    return null;
  }, [user?.publicMetadata?.date_of_birth]);

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!user) {
    // This case should ideally not be reached if the screen is protected by the navigator
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.value}>Could not load user profile.</Text>
      </SafeAreaView>
    );
  }

  const publicMetadata = user.publicMetadata || {};

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <TouchableOpacity 
          onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} 
          style={styles.menuButton}
        >
            <Menu size={28} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.screenTitle}>My Profile</Text>
        <Text style={styles.screenDescription}>
          View your personal information and manage your account.
        </Text>

        <Card style={styles.card}>
          <CardHeader><CardTitle style={styles.cardTitle}>Personal Information</CardTitle></CardHeader>
          <CardContent>
            <ProfileInfoRow label="First Name" value={user.firstName} />
            <ProfileInfoRow label="Last Name" value={user.lastName} />
            <ProfileInfoRow label="Date of Birth" value={formattedDob} />
            <ProfileInfoRow label="Age" value={(publicMetadata.age as number)?.toString()} />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader><CardTitle style={styles.cardTitle}>Contact & Address</CardTitle></CardHeader>
          <CardContent>
            <ProfileInfoRow label="Email" value={user.primaryEmailAddress?.emailAddress} />
            <ProfileInfoRow label="Phone Number" value={publicMetadata.contact_no as string} />
            <ProfileInfoRow label="Street Address" value={publicMetadata.street as string} />
            <ProfileInfoRow label="Province" value={provinces.find(p => p.province_code === publicMetadata.province_code)?.province_name} />
            <ProfileInfoRow label="City/Municipality" value={cities.find(c => c.city_code === publicMetadata.city_municipality_code)?.city_name} />
            <ProfileInfoRow label="Barangay" value={barangays.find(b => b.brgy_code === publicMetadata.barangay_code)?.brgy_name} />
          </CardContent>
        </Card>
        
        <Card style={styles.card}>
            <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
            <CardContent>
                <ProfileInfoRow label="Gender Identity" value={publicMetadata.gender_identity as string} />
                <ProfileInfoRow label="Pronouns" value={publicMetadata.pronouns as string} />
                <ProfileInfoRow label="Assigned Sex at Birth" value={publicMetadata.assigned_sex_at_birth as string} />
                <ProfileInfoRow label="Civil Status" value={publicMetadata.civil_status as string} />
                <ProfileInfoRow label="Religion" value={publicMetadata.religion as string} />
                <ProfileInfoRow label="Occupation" value={publicMetadata.occupation as string} />
                <ProfileInfoRow label="PhilHealth Number" value={publicMetadata.philhealth_no as string} />
            </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title="Edit Profile"
            variant="default"
            onPress={() => navigation.navigate('EditProfile')}
            disabled={!isLoaded}
            size="xl"
          />
          <Button
            title="Log Out"
            variant="destructive"
            onPress={handleLogout}
            disabled={!isLoaded}
            size="xl"
            style={{ marginTop: theme.spacing.md }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  menuButton: {
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    paddingVertical: theme.spacing.xl,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    paddingBottom: 40,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
  },
  screenTitle: {
    ...theme.typography.h1,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    color: theme.colors.secondary,
  },
  screenDescription: {
    ...theme.typography.body,
    textAlign: 'center',
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xl,
  },
  card: {
    marginBottom: theme.spacing.xl,
  },
  cardTitle: {
    color: theme.colors.secondary,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  label: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    flex: 1,
  },
  value: {
    ...theme.typography.body,
    fontWeight: '500',
    color: theme.colors.foreground,
    flex: 2,
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: theme.spacing.lg,
  },
});