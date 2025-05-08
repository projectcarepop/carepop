import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { theme, Card, Button } from '../components'; // Assuming theme is also exported from ../components/index.ts
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import type { Profile } from '../utils/supabase'; // Import the updated Profile type directly
import type { NavigationProp } from '@react-navigation/native'; // For navigation prop typing

// Data for address pickers - temporary until we decide how to display full names
import provinceJson from '../data/province.json';
import cityJson from '../data/city.json';
import barangayJson from '../data/barangay.json';

// Temporary Profile type extension for MyProfileScreen until AuthContext provides full profile
// This acknowledges that the full profile data might not yet be on the object from AuthContext.
// interface DisplayProfile extends SupabaseProfileType {
//   first_name?: string | null;
//   last_name?: string | null;
//   avatar_url?: string | null;
//   date_of_birth?: string | null;
//   civil_status?: string | null;
//   religion?: string | null;
//   occupation?: string | null;
//   contact_no?: string | null;
//   street?: string | null;
//   province_code?: string | null;
//   city_municipality_code?: string | null;
//   barangay_code?: string | null;
//   philhealth_no?: string | null;
//   // Add any other fields CreateProfileScreen collects
// }

interface Province {
  province_code: string;
  province_name: string;
}
interface CityMunicipality {
  city_code: string;
  city_name: string;
}
interface Barangay {
  brgy_code: string;
  brgy_name: string;
}
const provinceData: Province[] = provinceJson as Province[];
const cityData: CityMunicipality[] = cityJson as CityMunicipality[];
const barangayData: Barangay[] = barangayJson as Barangay[];

/**
 * Props for the MyProfileScreen component.
 */
interface MyProfileScreenProps {
  /** React Navigation prop for navigating to other screens. */
  navigation: NavigationProp<any>; // Use a more specific type if your route params are defined
}

/**
 * Calculates age based on a date of birth string.
 * @param {string | null | undefined} dob - The date of birth string (e.g., "YYYY-MM-DD").
 * @returns {number | string} The calculated age, or "N/A" if DOB is invalid.
 */
const calculateAge = (dob: string | null | undefined): number | string => {
  if (!dob) return "N/A";
  const birthDate = new Date(dob);
  if (isNaN(birthDate.getTime())) return "N/A"; // Invalid date

  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : "N/A";
};

/**
 * Helper to get the display name for a selected code from a list.
 */
const getAddressPartName = (
    code: string | null | undefined,
    list: Array<any>,
    codeKey: string,
    nameKey: string
): string => {
    if (!code) return 'N/A';
    const item = list.find(i => i[codeKey] === code);
    return item?.[nameKey] || code; // Return code if name not found for robustness
};

/**
 * MyProfileScreen displays the authenticated user's profile information.
 * It fetches data from AuthContext and provides navigation to edit the profile.
 */
export function MyProfileScreen({ navigation }: MyProfileScreenProps) {
  const { profile, isLoading, authError, session } = useAuth();
  const [isPhilHealthVisible, setIsPhilHealthVisible] = useState(false);

  const navigateToEditProfile = () => {
    // TODO: Confirm 'EditProfileScreen' is the correct route name in MyProfileStackNav
    navigation.navigate('EditProfile'); 
  };

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Profile...</Text>
      </SafeAreaView>
    );
  }

  if (authError) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <MaterialIcons name="error-outline" size={48} color={theme.colors.destructive} />
        <Text style={styles.errorText}>Error loading profile: {authError.message}</Text>
        {/* Optionally, add a retry button or sign-out button here */}
      </SafeAreaView>
    );
  }

  if (!profile) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <MaterialIcons name="person-off" size={48} color={theme.colors.textMuted} />
        <Text style={styles.placeholderText}>No profile data found.</Text>
        <Text style={styles.placeholderSubText}>
          Please complete your profile or try logging in again.
        </Text>
        {/* TODO: Add a button to navigate to CreateProfileScreen if appropriate */}
        {/* Or a sign out button from useAuth().signOut */} 
      </SafeAreaView>
    );
  }

  // Format date of birth for display
  const formattedDob = profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A';
  const age = calculateAge(profile.date_of_birth);

  // Construct full address (basic example)
  const provinceName = getAddressPartName(profile.province_code, provinceData, 'province_code', 'province_name');
  const cityName = getAddressPartName(profile.city_municipality_code, cityData, 'city_code', 'city_name');
  const barangayName = getAddressPartName(profile.barangay_code, barangayData, 'brgy_code', 'brgy_name');
  
  const fullAddress = [
    profile.street,
    barangayName !== profile.barangay_code ? barangayName : null, // Show name if resolved, otherwise it might be shown by code if not found
    cityName !== profile.city_municipality_code ? cityName : null,
    provinceName !== profile.province_code ? provinceName : null,
  ].filter(Boolean).join(', ') || 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.headerBar}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Profile</Text>
        <View style={{ width: 24 }} /> {/* Spacer for centering title */}
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.profileHeaderContainer}>
            <Image
                // TODO: Replace with dynamic avatar_url from profile if available
                source={{ uri: profile.avatar_url || 'https://via.placeholder.com/100' }} 
                style={styles.profileImage}
            />
            <Text style={styles.profileName}>{`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || (profile.username || 'User Name')}</Text>
            {session?.user?.email && <Text style={styles.profileEmail}>{session.user.email}</Text>}
            <Button 
                title="Edit Profile"
                onPress={navigateToEditProfile}
                variant="secondary" 
                styleType="outline"
                style={styles.editButton}
            />
        </View>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow label="Age:" value={age.toString()} />
          <InfoRow label="Date of Birth:" value={formattedDob} />
          <InfoRow label="Civil Status:" value={profile.civil_status || 'N/A'} />
          <InfoRow label="Religion:" value={profile.religion || 'N/A'} />
          <InfoRow label="Occupation:" value={profile.occupation || 'N/A'} />
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <InfoRow label="Contact No:" value={profile.contact_no || profile.phone_number || 'N/A'} />
          {/* Email is shown in header, could be repeated here if desired */}
        </Card>

        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Address</Text>
          <InfoRow label="Street:" value={profile.street || 'N/A'} />
          <InfoRow label="Barangay:" value={barangayName} />
          <InfoRow label="City/Municipality:" value={cityName} />
          <InfoRow label="Province:" value={provinceName} />
          {/* <Text style={styles.fullAddressText}>{fullAddress}</Text> */}
        </Card>
        
        <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Identification</Text>
            <InfoRow 
                label="PhilHealth No:" 
                value={isPhilHealthVisible ? (profile.philhealth_no || 'N/A') : '********'} 
                trailingIcon={ 
                    <TouchableOpacity onPress={() => setIsPhilHealthVisible(!isPhilHealthVisible)}>
                        <Ionicons 
                            name={isPhilHealthVisible ? 'eye-off-outline' : 'eye-outline'} 
                            size={20} 
                            color={theme.colors.textMuted} 
                        />
                    </TouchableOpacity>
                }
            />
        </Card>

        {/* Placeholder sections for future data like Allergies, Medications from profile */}
        {/* <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Health Information</Text>
          <Text style={styles.placeholderText}>Allergies, Medications (To be implemented)</Text>
        </Card> */}

      </ScrollView>
    </SafeAreaView>
  );
}

/**
 * Reusable component to display a row of information.
 */
const InfoRow: React.FC<{ label: string; value: string | number; trailingIcon?: React.ReactNode }> = ({ label, value, trailingIcon }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}</Text>
    <View style={styles.infoValueContainer}>
        <Text style={styles.infoValue}>{value}</Text>
        {trailingIcon && <View style={styles.iconContainer}>{trailingIcon}</View>} 
    </View>
  </View>
);

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.secondary,
  },
  container: {
    flex: 1,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.card,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.border,
  },
  profileName: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  profileEmail: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  editButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderColor: theme.colors.primary,
    borderWidth: 1,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
  },
  infoLabel: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.sm,
  },
  infoValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
  },
  infoValue: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    textAlign: 'right',
  },
  iconContainer: {
    marginLeft: theme.spacing.sm,
  },
  fullAddressText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    marginTop: theme.spacing.xs,
    lineHeight: theme.typography.body * 1.4,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  placeholderSubText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginTop: theme.spacing.xs,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
  },
  errorText: {
    color: theme.colors.destructive,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
}); 