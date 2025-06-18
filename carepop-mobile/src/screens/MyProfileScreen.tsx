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
import { useAuth } from '../context/AuthContext';
import { theme } from '../components/theme';
import { Button } from '../components/button.native';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';
import type { ProfileStackParamList } from '../navigation/AppNavigator';
import { format } from 'date-fns';
import { Menu } from 'lucide-react-native';

import provinces from '../data/psgc/provinces.json';
import cities from '../data/psgc/cities-municipalities.json';
import barangaysData from '../data/psgc/barangays.json';

interface Barangay { brgy_code: string; brgy_name: string; }
const barangays = barangaysData as Barangay[];

type ProfileScreenNavigationProp = NativeStackNavigationProp<
  ProfileStackParamList,
  'MyProfile'
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
  const { session, profile, signOut, isLoading, isSaving } = useAuth();

  const formattedDob = useMemo(() => {
    // Ensure profile and date_of_birth are not null or an empty string.
    if (profile?.date_of_birth && profile.date_of_birth.trim().length > 0) {
      try {
        // Supabase returns YYYY-MM-DD string, which is parsed as UTC.
        // Add time to treat it as local date to prevent off-by-one day issues.
        return format(new Date(`${profile.date_of_birth}T00:00:00`), 'MMMM d, yyyy');
      } catch (error) {
        console.error('Error formatting date:', error);
        return 'Invalid Date';
      }
    }
    return null;
  }, [profile?.date_of_birth]);

  if (isLoading && !profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.value}>Could not load profile.</Text>
      </SafeAreaView>
    );
  }

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
            <ProfileInfoRow label="First Name" value={profile.first_name} />
            <ProfileInfoRow label="Middle Initial" value={profile.middle_initial} />
            <ProfileInfoRow label="Last Name" value={profile.last_name} />
            <ProfileInfoRow label="Date of Birth" value={formattedDob} />
            <ProfileInfoRow label="Age" value={profile.age?.toString()} />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader><CardTitle style={styles.cardTitle}>Contact & Address</CardTitle></CardHeader>
          <CardContent>
            <ProfileInfoRow label="Email" value={session?.user?.email} />
            <ProfileInfoRow label="Phone Number" value={profile.contact_no} />
            <ProfileInfoRow label="Street Address" value={profile.street} />
            <ProfileInfoRow label="Province" value={provinces.find(p => p.province_code === profile.province_code)?.province_name} />
            <ProfileInfoRow label="City/Municipality" value={cities.find(c => c.city_code === profile.city_municipality_code)?.city_name} />
            <ProfileInfoRow label="Barangay" value={barangays.find(b => b.brgy_code === profile.barangay_code)?.brgy_name} />
          </CardContent>
        </Card>
        
        <Card style={styles.card}>
            <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
            <CardContent>
                <ProfileInfoRow label="Gender Identity" value={profile.gender_identity} />
                <ProfileInfoRow label="Pronouns" value={profile.pronouns} />
                <ProfileInfoRow label="Assigned Sex at Birth" value={profile.assigned_sex_at_birth} />
                <ProfileInfoRow label="Civil Status" value={profile.civil_status} />
                <ProfileInfoRow label="Religion" value={profile.religion} />
                <ProfileInfoRow label="Occupation" value={profile.occupation} />
                <ProfileInfoRow label="PhilHealth Number" value={profile.philhealth_no} />
            </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title="Edit Profile"
            variant="default"
            onPress={() => navigation.navigate('EditProfile')}
            disabled={isSaving}
            size="xl"
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