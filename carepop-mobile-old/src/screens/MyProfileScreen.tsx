import React, { useMemo, useState, useEffect } from 'react';
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
import { useAuth } from '../context/AuthContext';
import { theme } from '../components/theme';
import { Button } from '../components/button.native';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';
import { format } from 'date-fns';
import { Menu, LogOut } from 'lucide-react-native';
import type { ProfileStackParamList } from '../navigation/ProfileNavigator';
import { supabase } from '../lib/supabaseClient';

// --- Import Location Data ---
import provinces from '../data/psgc/provinces.json';
import cities from '../data/psgc/cities-municipalities.json';
import barangays from '../data/psgc/barangays.json';

const ProfileInfoRow = ({
  label,
  value,
  isLoading,
}: {
  label: string;
  value: string | null | undefined;
  isLoading?: boolean;
}) => (
  <View style={styles.infoRow}>
    <Text style={styles.label}>{label}</Text>
    {isLoading ? <ActivityIndicator size="small" /> : <Text style={styles.value}>{value || 'Not set'}</Text>}
  </View>
);

export function MyProfileScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ProfileStackParamList>>();
  const { user, profile, authStatus } = useAuth();

  const [address, setAddress] = useState({
    province: '',
    city: '',
    barangay: '',
  });
  const [isAddressLoading, setIsAddressLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      setIsAddressLoading(true);
      const provinceName = provinces.find(p => p.province_code === profile.provinceCode)?.province_name || profile.provinceCode;
      const cityName = cities.find(c => c.city_code === profile.cityMunicipalityCode)?.city_name || profile.cityMunicipalityCode;
      const barangayName = barangays.find(b => b.brgy_code === profile.barangayCode)?.brgy_name || profile.barangayCode;
      
      setAddress({
        province: provinceName || '',
        city: cityName || '',
        barangay: barangayName || '',
      });
      setIsAddressLoading(false);
    }
  }, [profile]);

  const formattedDob = useMemo(() => {
    const dob = profile?.birthday;
    if (dob) {
      try {
        // Ensure we parse as a plain date to avoid timezone issues
        return format(new Date(dob), 'MMMM d, yyyy');
      } catch (e) {
        return 'Invalid Date';
      }
    }
    return 'Not Set';
  }, [profile?.birthday]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // The AuthContext listener will do the rest
  };

  if (authStatus === 'loading') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (authStatus !== 'authenticated' || !profile) {
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
          <CardHeader>
            <CardTitle style={styles.cardTitle}>Personal Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileInfoRow label="First Name" value={profile.firstName} />
            <ProfileInfoRow label="Last Name" value={profile.lastName} />
            <ProfileInfoRow label="Middle Initial" value={profile.middleInitial} />
            <ProfileInfoRow label="Date of Birth" value={formattedDob} />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>Contact & Address</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileInfoRow label="Email" value={user?.email} />
            <ProfileInfoRow label="Phone Number" value={profile.contactNo} />
            <ProfileInfoRow label="Street Address" value={profile.street} />
            <ProfileInfoRow label="Province" value={address.province} isLoading={isAddressLoading} />
            <ProfileInfoRow label="City/Municipality" value={address.city} isLoading={isAddressLoading} />
            <ProfileInfoRow label="Barangay" value={address.barangay} isLoading={isAddressLoading} />
          </CardContent>
        </Card>

        <Card style={styles.card}>
          <CardHeader>
            <CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle>
          </CardHeader>
          <CardContent>
            <ProfileInfoRow label="Gender Identity" value={profile.genderIdentity} />
            <ProfileInfoRow label="Pronouns" value={profile.pronouns} />
            <ProfileInfoRow label="Assigned Sex at Birth" value={profile.assignedSexAtBirth} />
            <ProfileInfoRow label="Civil Status" value={profile.civilStatus} />
            <ProfileInfoRow label="Religion" value={profile.religion} />
            <ProfileInfoRow label="Occupation" value={profile.occupation} />
            <ProfileInfoRow label="PhilHealth Number" value={profile.philhealthNo} />
          </CardContent>
        </Card>

        <View style={styles.actionsContainer}>
          <Button
            title="Edit Profile"
            variant="default"
            onPress={() => navigation.navigate('EditProfile')}
            size="xl"
            icon={<Menu size={18} color="white" />}
          />
          <Button
            title="Log Out"
            variant="outline"
            onPress={handleSignOut}
            size="xl"
            icon={<LogOut size={18} color={theme.colors.accent} />}
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
    fontWeight: '600',
    color: theme.colors.secondary,
  },
  value: {
    color: theme.colors.foreground,
    ...theme.typography.body,
    fontWeight: '500',
    flex: 2,
    textAlign: 'right',
  },
  actionsContainer: {
    marginTop: theme.spacing.lg,
  },
});