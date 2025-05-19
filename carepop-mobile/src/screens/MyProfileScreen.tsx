import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity, Image, ActivityIndicator, Alert } from 'react-native';
import { theme, Card, Button } from '../components'; // Assuming theme is also exported from ../components/index.ts
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import type { Profile } from '../utils/supabase'; // Import the updated Profile type directly
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Import navigation prop type
import { MyProfileStackParamList } from '../navigation/AppNavigator'; // Corrected Import Path to AppNavigator

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

// Re-add calculateAge function
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

// Re-add getAddressPartName function
/**
 * Helper to get the display name for a selected code from a list.
 */
const getAddressPartName = (
    code: string | null | undefined,
    list: any[],
    codeKey: string,
    nameKey: string
): string => {
    if (!code) return '-'; // Return dash instead of N/A for missing parts
    const item = list.find(i => i[codeKey] === code);
    return item?.[nameKey] || code; // Return code if name not found for robustness
};

/**
 * @description Screen to display the user's profile information.
 * It fetches data from AuthContext and provides navigation to edit the profile.
 */
export function MyProfileScreen() {
  const { profile, isLoading, authError, session, signOut } = useAuth();
  const [isPhilHealthVisible, setIsPhilHealthVisible] = useState(false);
  // Use the useNavigation hook with the specific stack param list and screen name
  const navigation = useNavigation<NativeStackNavigationProp<MyProfileStackParamList, 'MyProfileMain'>>();

  const navigateToEditProfile = () => {
    console.log('[MyProfileScreen] Navigating to EditProfile...');
    navigation.navigate('EditProfile'); // Use the navigation object from the hook
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
      </SafeAreaView>
    );
  }

  // Calculate display values using helpers
  const displayAge = calculateAge(profile.date_of_birth);
  const displayBarangay = getAddressPartName(profile.barangay_code, barangayData, 'brgy_code', 'brgy_name');
  const displayCity = getAddressPartName(profile.city_municipality_code, cityData, 'city_code', 'city_name');
  const displayProvince = getAddressPartName(profile.province_code, provinceData, 'province_code', 'province_name');

  // Format date of birth for display
  const formattedDob = profile.date_of_birth ? new Date(profile.date_of_birth).toLocaleDateString() : 'N/A';

  // Construct full address (basic example)
  const fullAddress = [
    profile.street,
    displayBarangay !== profile.barangay_code ? displayBarangay : null, // Show name if resolved, otherwise it might be shown by code if not found
    displayCity !== profile.city_municipality_code ? displayCity : null,
    displayProvince !== profile.province_code ? displayProvince : null,
  ].filter(Boolean).join(', ') || 'N/A';

  return (
    <SafeAreaView style={styles.safeArea}>

      <ScrollView style={styles.container}>
        <View style={styles.profileHeaderContainer}>
            <Text style={styles.profileName}>{`${profile.first_name || ''} ${profile.last_name || ''}`.trim() || (profile.username || 'User Name')}</Text>
            {session?.user?.email && <Text style={styles.profileEmail}>{session.user.email}</Text>}
            <Button 
                title="Edit Profile"
                onPress={navigateToEditProfile}
                variant="primary" // Changed to primary for consistency?
                styleType="outline" // Keep outline style?
                style={styles.editButton} // Keep custom style for now
                // textStyle={styles.editButtonText} // Removed textStyle prop
            />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <InfoRow label="Age:" value={displayAge.toString()} />
          <InfoRow label="Date of Birth:" value={formattedDob} />
          <InfoRow label="Middle Initial:" value={profile.middle_initial || 'N/A'} />
          <InfoRow label="Gender Identity:" value={profile.gender_identity || 'N/A'} />
          <InfoRow label="Pronouns:" value={profile.pronouns || 'N/A'} />
          <InfoRow label="Assigned Sex at Birth:" value={profile.assigned_sex_at_birth || 'N/A'} />
          <InfoRow label="Civil Status:" value={profile.civil_status || 'N/A'} />
          <InfoRow label="Religion:" value={profile.religion || 'N/A'} />
          <InfoRow label="Occupation:" value={profile.occupation || 'N/A'} />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          {session?.user?.email && (
            <InfoRow label="Email:" value={session.user.email} />
          )}
          <InfoRow label="Phone:" value={profile.contact_no || 'N/A'} />
        </View>

        <View style={styles.sectionContainer}>
          <Text style={styles.sectionTitle}>Address</Text>
          <InfoRow label="Street:" value={profile.street || 'N/A'} />
          <InfoRow label="Barangay:" value={displayBarangay} />
          <InfoRow label="City/Municipality:" value={displayCity} />
          <InfoRow label="Province:" value={displayProvince} />
        </View>
        
        <View style={styles.sectionContainer}>
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
        </View>

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
    backgroundColor: theme.colors.background, // Use background color
  },
  headerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between', 
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.card, // Or theme.colors.background?
  },
  backButton: {
    padding: theme.spacing.xs,
  },
  headerTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.text, // Use default text color or secondary?
  },
  container: {
    flex: 1,
  },
  profileHeaderContainer: {
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.card, // Or another suitable background
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    marginBottom: theme.spacing.md,
  },
  avatar: { // Style for the avatar image
    width: 100,
    height: 100,
    borderRadius: 50, // Makes it circular
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.border, // Placeholder background color
  },
  profileName: {
    fontSize: theme.typography.heading, // Corrected: Use heading instead of h2
    fontWeight: 'bold',
    color: theme.colors.text, // Use default text color
    marginBottom: theme.spacing.xs,
    marginTop: theme.spacing.lg, // Added margin top since avatar is removed
  },
  profileEmail: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg, // More space before button
  },
  editButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.xs, // Slightly less vertical padding
    paddingHorizontal: theme.spacing.lg, // Keep horizontal padding
    borderColor: theme.colors.primary, // Match primary button outline?
    borderWidth: 1,
    borderRadius: theme.borderRadius.md, // Consistent rounding
  },
  // Removed Card style, using sectionContainer instead
  sectionContainer: {
    backgroundColor: theme.colors.card, // Use card background
    borderRadius: theme.borderRadius.md,
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg, // Space between sections
    padding: theme.spacing.lg, // More padding inside section
    overflow: 'hidden', // For potential future styling
  },
  sectionTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.secondary, // Or primary?
    marginBottom: theme.spacing.md,
    // Removed border from section title, section container provides boundary
    // borderBottomWidth: 1,
    // borderBottomColor: theme.colors.border,
    // paddingBottom: theme.spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm, // Keep vertical padding
    // borderBottomWidth: 1, // Optional: add subtle separator between rows
    // borderBottomColor: theme.colors.borderLight, // Use a lighter border color
  },
  infoLabel: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginRight: theme.spacing.md, // More space after label
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