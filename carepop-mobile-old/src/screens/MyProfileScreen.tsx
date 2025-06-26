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
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMyProfile } from '../services/api';
import { theme } from '../components/theme';
import { Button } from '../components/button.native';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';
import type { RootStackParamList } from '../navigation/AppNavigator';
import { format } from 'date-fns';
import { Menu, LogOut } from 'lucide-react-native';

import provinces from '../data/psgc/provinces.json';
import cities from '../data/psgc/cities-municipalities.json';
import barangaysData from '../data/psgc/barangays.json';

interface Barangay { brgy_code: string; brgy_name: string; }
const barangays = barangaysData as Barangay[];

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
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'Main'>>();
  const { signOut, user: authUser } = useAuth();

  const { data: userProfile, isLoading, isError, error } = useQuery({
    queryKey: ['myProfile', authUser?.id],
    queryFn: getMyProfile,
    enabled: !!authUser,
  });

  const formattedDob = useMemo(() => {
    const dob = userProfile?.birthday;
    if (dob) {
      try {
        // Adding time to prevent timezone issues with parsing
        return format(new Date(`${dob}T00:00:00`), 'MMMM d, yyyy');
      } catch (e) {
        return 'Invalid Date';
      }
    }
    return 'Not Set';
  }, [userProfile?.birthday]);
  
  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (isError) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.value}>Error: {(error as Error).message}</Text>
      </SafeAreaView>
    );
  }

  if (!userProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.value}>Could not load user profile.</Text>
        <Button title="Go Back" onPress={() => navigation.goBack()} />
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
            <ProfileInfoRow label="First Name" value={userProfile.firstName} />
            <ProfileInfoRow label="Last Name" value={userProfile.lastName} />
            <ProfileInfoRow label="Date of Birth" value={formattedDob} />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader><CardTitle style={styles.cardTitle}>Contact & Address</CardTitle></CardHeader>
          <CardContent>
            <ProfileInfoRow label="Email" value={authUser?.email} />
            <ProfileInfoRow label="Phone Number" value={userProfile.contactNo} />
            <ProfileInfoRow label="Street Address" value={userProfile.street} />
            <ProfileInfoRow label="Province" value={userProfile.provinceCode} />
            <ProfileInfoRow label="City/Municipality" value={userProfile.cityMunicipalityCode} />
            <ProfileInfoRow label="Barangay" value={userProfile.barangayCode} />
          </CardContent>
        </Card>
        
        <Card style={styles.card}>
            <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
            <CardContent>
                <ProfileInfoRow label="Gender Identity" value={userProfile.genderIdentity} />
                <ProfileInfoRow label="Pronouns" value={userProfile.pronouns} />
                <ProfileInfoRow label="Assigned Sex at Birth" value={userProfile.assignedSexAtBirth} />
                <ProfileInfoRow label="Civil Status" value={userProfile.civilStatus} />
                <ProfileInfoRow label="Religion" value={userProfile.religion} />
                <ProfileInfoRow label="Occupation" value={userProfile.occupation} />
                <ProfileInfoRow label="PhilHealth Number" value={userProfile.philhealthNo} />
            </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title={userProfile ? "Edit Profile" : "Create Profile"}
            variant="default"
            onPress={() => navigation.navigate(userProfile ? 'EditProfile' : 'CreateProfile')}
            disabled={isLoading}
            size="xl"
          />
          <Button
            title="Log Out"
            variant="outline"
            onPress={signOut}
            disabled={isLoading}
            size="xl"
            icon={<LogOut size={18} color={theme.colors.accent} />}
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