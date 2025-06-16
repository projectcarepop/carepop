import React, { useState, useEffect, useReducer, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
  Image,
} from 'react-native';
import { Button, TextInput, Card, theme } from '../components'; // Assuming theme is from ../components
import { supabase, Profile } from '../utils/supabase'; 
import { useAuth } from '../context/AuthContext'; // Import useAuth to get current profile and refresh
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants'; // <-- Import Constants

// Import Param List from Navigator
import type { MyProfileStackParamList } from '../navigation/AppNavigator';

// Import local JSON data with explicit typing (for address dropdowns)
import provinceJson from '../data/province.json';
import cityJson from '../data/city.json';
import barangayJson from '../data/barangay.json';

// Interfaces for address data (same as CreateProfileScreen)
interface Province {
  province_code: string; 
  province_name: string;
  // Other fields if present in JSON
}

interface CityMunicipality {
  city_code: string;
  city_name: string;
  province_code: string;
  // Other fields
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  // Other fields
}

// Interface for the backend DTO (mirrors UpdateProfileDto from backend)
interface UpdateProfileDto {
  firstName?: string;
  middleInitial?: string;
  lastName?: string;
  dateOfBirth?: string;      // Expected as 'YYYY-MM-DD' string
  civilStatus?: string;
  religion?: string;
  occupation?: string;
  street?: string;
  provinceCode?: string;
  cityMunicipalityCode?: string;
  barangayCode?: string;
  contactNo?: string;
  philhealthNo?: string;
  genderIdentity?: string;
  pronouns?: string;
  assignedSexAtBirth?: string;
}

const provinceData: Province[] = provinceJson as Province[];
const cityData: CityMunicipality[] = cityJson as CityMunicipality[];
const barangayData: Barangay[] = barangayJson as Barangay[];

/**
 * Props for the EditProfileScreen component.
 */
interface EditProfileScreenProps extends NativeStackScreenProps<MyProfileStackParamList, 'EditProfile'> {}

// --- State Management (useReducer) ---
// Identical state shape and actions as CreateProfileScreen

/**
 * Represents the state of the profile edit form.
 */
interface ProfileFormData {
  firstName: string;
  middleInitial: string;
  lastName: string;
  dateOfBirth: Date | null;
  displayAge: string;
  civilStatus: string;
  religion: string;
  occupation: string;
  street: string;
  selectedProvince: string; // province_code
  selectedCity: string;     // city_code
  selectedBarangay: string; // brgy_code
  contactNo: string;
  philhealthNo: string;
  genderIdentity: string;
  pronouns: string;
  assignedSexAtBirth: string;
  // Consider adding avatar_url if editing is supported
}

/**
 * Defines the possible actions to update the form state.
 */
type FormAction = 
  | { type: 'SET_FIELD'; field: keyof ProfileFormData; value: string }
  | { type: 'SET_DATE'; value: Date | null }
  | { type: 'SET_PROVINCE'; value: string }
  | { type: 'SET_CITY'; value: string }
  | { type: 'SET_BARANGAY'; value: string }
  | { type: 'INITIALIZE_FORM'; payload: Partial<ProfileFormData> }
  | { type: 'SET_PRONOUNS'; value: string }
  | { type: 'SET_ASSIGNED_SEX'; value: string };

const initialFormState: ProfileFormData = {
  firstName: '',
  middleInitial: '',
  lastName: '',
  dateOfBirth: null,
  displayAge: '',
  civilStatus: '',
  religion: '',
  occupation: '',
  street: '',
  selectedProvince: '',
  selectedCity: '',
  selectedBarangay: '',
  contactNo: '',
  philhealthNo: '',
  genderIdentity: '',
  pronouns: '',
  assignedSexAtBirth: '',
};

/**
 * Calculates age based on birth date.
 */
function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}

/**
 * Reducer function for managing the profile edit form state.
 */
const formReducer = (state: ProfileFormData, action: FormAction): ProfileFormData => {
  switch (action.type) {
    case 'SET_FIELD':
      return { ...state, [action.field]: action.value };
    case 'SET_DATE': {
      const age = action.value ? calculateAge(action.value).toString() : '';
      return { ...state, dateOfBirth: action.value, displayAge: age };
    }
    case 'SET_PROVINCE':
      return { ...state, selectedProvince: action.value, selectedCity: '', selectedBarangay: '' };
    case 'SET_CITY':
      return { ...state, selectedCity: action.value, selectedBarangay: '' };
    case 'SET_BARANGAY':
      return { ...state, selectedBarangay: action.value };
    case 'INITIALIZE_FORM':
      // Merge initial data, calculating age if DOB is present
      const initialDob = action.payload.dateOfBirth;
      const initialAge = initialDob ? calculateAge(initialDob).toString() : '';
      return { 
        ...state, 
        ...action.payload, 
        displayAge: initialAge, 
      };
    case 'SET_PRONOUNS':
      return { ...state, pronouns: action.value };
    case 'SET_ASSIGNED_SEX':
      return { ...state, assignedSexAtBirth: action.value };
    default:
      return state;
  }
};

/**
 * Represents the structure for validation errors.
 */
type FormErrors = Partial<Record<keyof ProfileFormData | 'general', string>>;

/**
 * Screen component for users to edit their existing profile.
 */
export const EditProfileScreen: React.FC<EditProfileScreenProps> = ({ navigation }) => {
  const { 
    profile: currentProfile, 
    isLoading: isAuthLoading, 
    authError,
    refreshUserProfile, // Keep for potential direct use if needed elsewhere, or for error recovery
    session,
    manuallySetProfile // <-- Get manuallySetProfile from useAuth()
  } = useAuth(); 
  const [state, dispatch] = useReducer(formReducer, initialFormState);
  const [isSaving, setIsSaving] = useState(false); // Saving state
  const [isInitializing, setIsInitializing] = useState(true); // State to track form initialization
  const [errors, setErrors] = useState<FormErrors | null>(null);

  // State for controlling date/picker visibility
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCivilStatusPicker, setShowCivilStatusPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);
  // SOGIE Picker Visibility State
  const [showPronounsPicker, setShowPronounsPicker] = useState(false);
  const [showAssignedSexPicker, setShowAssignedSexPicker] = useState(false);

  // State to store the initial profile data loaded into the form
  const [initialFormData, setInitialFormData] = useState<Partial<ProfileFormData> | null>(null);
  
  // Effect to initialize the form state and localAvatarUri when the current profile loads
  useEffect(() => {
    if (currentProfile && isInitializing) {
      console.log('[EditProfileScreen] Initializing form with profile:', currentProfile.user_id);
      const formData: Partial<ProfileFormData> = {
        firstName: currentProfile.first_name || '',
        middleInitial: currentProfile.middle_initial || '',
        lastName: currentProfile.last_name || '',
        dateOfBirth: currentProfile.date_of_birth ? new Date(currentProfile.date_of_birth) : null,
        civilStatus: currentProfile.civil_status || '',
        religion: currentProfile.religion || '',
        occupation: currentProfile.occupation || '',
        street: currentProfile.street || '',
        selectedProvince: currentProfile.province_code || '',
        selectedCity: currentProfile.city_municipality_code || '',
        selectedBarangay: currentProfile.barangay_code || '',
        contactNo: currentProfile.contact_no || currentProfile.phone_number || '',
        philhealthNo: currentProfile.philhealth_no || '',
        genderIdentity: currentProfile.gender_identity || '',
        pronouns: currentProfile.pronouns || '',
        assignedSexAtBirth: currentProfile.assigned_sex_at_birth || '',
      };
      if (formData.dateOfBirth && isNaN(formData.dateOfBirth.getTime())) {
        console.warn('[EditProfileScreen] Invalid date_of_birth string received from profile:', currentProfile.date_of_birth);
        formData.dateOfBirth = null;
      }

      setInitialFormData(formData);
      dispatch({ type: 'INITIALIZE_FORM', payload: formData });
      setIsInitializing(false);
    } else if (!isAuthLoading && !currentProfile && isInitializing) {
      console.warn('[EditProfileScreen] No current profile found after auth load.');
      setIsInitializing(false);
      Alert.alert('Error', 'Could not load profile data to edit.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }, [currentProfile, isAuthLoading, isInitializing, navigation]);

  // Memoized lists for pickers (same as CreateProfileScreen)
  const [provinces] = useState<Province[]>(provinceData);
  const citiesMunicipalities = React.useMemo(() => {
    if (!state.selectedProvince) return [];
    return cityData.filter((city) => city.province_code === state.selectedProvince);
  }, [state.selectedProvince]);
  const barangaysList = React.useMemo(() => {
    if (!state.selectedCity) return [];
    return barangayData.filter((barangay) => barangay.city_code === state.selectedCity);
  }, [state.selectedCity]);

  /**
   * Handles changes from the DateTimePicker.
   */
  const handleDateChange = useCallback((event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      dispatch({ type: 'SET_DATE', value: selectedDate });
      if (Platform.OS === 'ios') {
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  }, []);

  /**
   * Validates the profile form data (can reuse validation logic from CreateProfileScreen).
   */
  const validateProfileForm = useCallback((): FormErrors | null => {
    const currentErrors: FormErrors = {};
    if (!state.firstName.trim()) currentErrors.firstName = 'First name is required.';
    if (!state.lastName.trim()) currentErrors.lastName = 'Last name is required.';
    if (!state.dateOfBirth) currentErrors.dateOfBirth = 'Date of birth is required.';
    if (!state.street.trim()) currentErrors.street = 'Street address is required.';
    if (!state.selectedProvince) currentErrors.selectedProvince = 'Province is required.';
    if (!state.selectedCity) currentErrors.selectedCity = 'City/Municipality is required.';
    if (!state.selectedBarangay) currentErrors.selectedBarangay = 'Barangay is required.';
    if (!state.contactNo.trim()) {
        currentErrors.contactNo = 'Contact number is required.';
    } else if (!/^09\d{9}$/.test(state.contactNo.trim())) {
        currentErrors.contactNo = 'Please enter a valid 11-digit mobile number starting with 09.';
    }
    if (state.middleInitial.trim().length > 1) {
      currentErrors.middleInitial = 'Middle initial should be a single letter.';
    }
    return Object.keys(currentErrors).length > 0 ? currentErrors : null;
  }, [state]); // Depend on state for validation

  /**
   * Checks if the form data has changed compared to the initial data.
   * Uses JSON stringify for a simple deep comparison, suitable for this form data.
   */
  const hasFormChanged = useCallback((): boolean => {
    if (!initialFormData) return false; // Can't compare if initial data wasn't loaded

    // Create a comparable object from the current state
    const currentStateData: Partial<ProfileFormData> = {
      firstName: state.firstName,
      middleInitial: state.middleInitial,
      lastName: state.lastName,
      // Compare dates by time value to handle Date object comparison issues
      dateOfBirth: state.dateOfBirth ? new Date(state.dateOfBirth.toISOString().split('T')[0]) : null,
      civilStatus: state.civilStatus,
      religion: state.religion,
      occupation: state.occupation,
      street: state.street,
      selectedProvince: state.selectedProvince,
      selectedCity: state.selectedCity,
      selectedBarangay: state.selectedBarangay,
      contactNo: state.contactNo,
      philhealthNo: state.philhealthNo,
      genderIdentity: state.genderIdentity,
      pronouns: state.pronouns,
      assignedSexAtBirth: state.assignedSexAtBirth,
    };

    const initialComparableData = {
        ...initialFormData,
        dateOfBirth: initialFormData.dateOfBirth ? new Date(initialFormData.dateOfBirth.toISOString().split('T')[0]) : null,
    };

    // Basic comparison (might need refinement for edge cases like null vs empty string)
    return JSON.stringify(currentStateData) !== JSON.stringify(initialComparableData);
  }, [state, initialFormData]);

  /**
   * Handles the submission of the profile update form.
   */
  const handleUpdateProfile = useCallback(async () => {
    const formHasChanged = hasFormChanged();

    if (!formHasChanged) {
      console.log('[EditProfileScreen] No changes detected, navigating back.');
      navigation.navigate('MyProfileMain');
      return;
    }

    const validationErrors = validateProfileForm();
    if (validationErrors) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
      return;
    }

    setErrors(null);
    setIsSaving(true);

    if (!currentProfile?.user_id) {
      Alert.alert('Error', 'User ID not found. Cannot update profile.');
      setIsSaving(false);
      return;
    }

    if (!session || !session.access_token) {
      Alert.alert('Authentication Error', 'No active session found. Please log in again.');
      setIsSaving(false);
      return;
    }

    // Prepare data object with DB column names (as before)
    // Note: The DTO for the backend expects camelCase keys, but our current `updates` object
    //       is already structured with snake_case keys for direct Supabase update.
    //       CORRECTION: Backend DTO `UpdateProfileDto` expects camelCase. We will send camelCase.
    const updatesPayload: UpdateProfileDto = { // Use the DTO type from backend if available, or define inline
      firstName: state.firstName,
      middleInitial: state.middleInitial || undefined, // Send undefined if empty, or null based on DTO
      lastName: state.lastName,
      dateOfBirth: state.dateOfBirth ? state.dateOfBirth.toISOString().split('T')[0] : undefined,
      // age is calculated by the backend, not sent from client
      civilStatus: state.civilStatus || undefined,
      religion: state.religion || undefined,
      occupation: state.occupation || undefined,
      street: state.street || undefined,
      provinceCode: state.selectedProvince || undefined,
      cityMunicipalityCode: state.selectedCity || undefined,
      barangayCode: state.selectedBarangay || undefined,
      contactNo: state.contactNo || undefined,
      philhealthNo: state.philhealthNo || undefined,
      genderIdentity: state.genderIdentity || undefined,
      pronouns: state.pronouns || undefined,
      assignedSexAtBirth: state.assignedSexAtBirth || undefined,
    };

    // Remove undefined properties to ensure they are not sent in the update payload
    // This helps if the backend DTO expects optional fields to be absent rather than null/empty string
    Object.keys(updatesPayload).forEach(key => {
      const K = key as keyof typeof updatesPayload;
      if (updatesPayload[K] === undefined || updatesPayload[K] === '') { 
        delete updatesPayload[K];
      }
    });

    // Retrieve backend API URL from Expo constants correctly
    const backendBaseUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
    if (!backendBaseUrl) {
      Alert.alert('Configuration Error', 'Backend API URL is not configured.');
      setIsSaving(false);
      return;
    }
    const apiUrl = `${backendBaseUrl}/api/v1/public/users/profile`;

    console.log(`[EditProfileScreen] Attempting to update profile via API: ${apiUrl}`);
    console.log(`[EditProfileScreen] Payload:`, JSON.stringify(updatesPayload));

    try {
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(updatesPayload),
      });

      const responseData = await response.json();

      if (response.ok) {
        console.log('[EditProfileScreen] Profile updated successfully via API:', responseData);

        // Manually set the profile data in AuthContext with the nested 'data' object from the backend response
        manuallySetProfile(responseData.data as Profile); // <-- CORRECTED: Pass responseData.data

        // Navigate immediately to MyProfileMain
        navigation.navigate('MyProfileMain');
      } else {
        console.error('[EditProfileScreen] API error updating profile:', responseData);
        const errorMessage = responseData.message || responseData.details || 'Failed to update profile via API.';
        setErrors({ general: errorMessage });
        Alert.alert('API Error', errorMessage);
      }
    } catch (error: any) {
      console.error('[EditProfileScreen] Network or unexpected error updating profile:', error);
      setErrors({ general: error.message || 'An unexpected network error occurred.' });
      Alert.alert('Error', `Failed to update profile: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSaving(false);
    }
  }, [state, currentProfile, navigation, validateProfileForm, manuallySetProfile, hasFormChanged, session]); // Added manuallySetProfile, removed refreshUserProfile from deps

  /**
   * Helper to get the display name for a selected code from a list.
   */
  const getSelectedName = useCallback((
      code: string,
      list: Array<any>,
      codeKey: string,
      nameKey: string
  ): string | undefined => {
      return list.find(item => item[codeKey] === code)?.[nameKey];
  }, []);

  // Civil status options
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced', 'Other'];

  // Render loading state while auth context is loading or form is initializing
  if (isInitializing || isAuthLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading Profile...</Text>
        </View>
      </SafeAreaView>
    );
  }
  
  // Render error state from AuthContext
  if (!currentProfile) {
     return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
            <Text style={styles.errorText}>Could not load profile data.</Text>
            {/* Optionally add a button to retry or go back */}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView 
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Edit Profile</Text> 

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Personal Information</Text>
            
            <TextInput
              label="First Name"
              value={state.firstName}
              onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'firstName', value: text })}
              placeholder="Enter your first name"
              error={errors?.firstName}
              containerStyle={styles.input}
              placeholderTextColor={theme.colors.textMuted}
            />
             <TextInput
                label="Middle Initial"
                value={state.middleInitial}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'middleInitial', value: text })}
                placeholder="M.I."
                maxLength={1}
                error={errors?.middleInitial}
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />
            <TextInput
                label="Last Name"
                value={state.lastName}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'lastName', value: text })}
                placeholder="Enter your last name"
                error={errors?.lastName}
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />

            {/* Date of Birth Picker Trigger - Manual Label still needed */}
            <Text style={[styles.label, errors?.dateOfBirth ? styles.labelError : null]}>
                Date of Birth {errors?.dateOfBirth ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity style={[styles.pickerTrigger, errors?.dateOfBirth ? styles.inputErrorBorder : null]} onPress={() => setShowDatePicker(true)}>
                  <Text style={styles.pickerText}>{state.dateOfBirth ? state.dateOfBirth.toLocaleDateString() : 'Select Date'}</Text>
                  <Ionicons name="calendar-outline" size={20} color={theme.colors.text} />
              </TouchableOpacity>
              {errors?.dateOfBirth && <Text style={styles.errorText}>{errors.dateOfBirth}</Text>}
            </View>

            {showDatePicker && (
                <DateTimePicker
                    value={state.dateOfBirth || new Date()} // Default to today if null
                    mode="date"
                    display="default"
                    onChange={handleDateChange}
                    maximumDate={new Date()} // Cannot be born in the future
                />
            )}
            {/* Display Age */}
             <TextInput
                label="Age"
                value={state.displayAge}
                editable={false}
                placeholder="Age"
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />

            {/* Civil Status Picker - User Specified Style */}
            <Text style={[styles.label, errors?.civilStatus ? styles.labelError : null]}>
                Civil Status {errors?.civilStatus ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity style={[styles.pickerTrigger, errors?.civilStatus ? styles.inputErrorBorder : null]} onPress={() => setShowCivilStatusPicker(true)}>
                  <Text style={styles.pickerText}>{state.civilStatus || 'Select Civil Status'}</Text>
                  <Ionicons name="caret-down-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              {errors?.civilStatus && <Text style={styles.errorText}>{errors.civilStatus}</Text>}
            </View>
            {showCivilStatusPicker && (
                 <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={state.civilStatus}
                        onValueChange={(itemValue) => {
                            if (itemValue) dispatch({ type: 'SET_FIELD', field: 'civilStatus', value: itemValue });
                            setShowCivilStatusPicker(false);
                        }}
                        style={{ width: '100%' }}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Select Civil Status..." value="" />
                        <Picker.Item label="Single" value="Single" />
                        <Picker.Item label="Married" value="Married" />
                        <Picker.Item label="Widowed" value="Widowed" />
                        <Picker.Item label="Separated" value="Separated" />
                        <Picker.Item label="Divorced" value="Divorced" />
                        <Picker.Item label="Other" value="Other" />
                    </Picker>
                </View>
            )}

            <TextInput
                label="Religion"
                value={state.religion}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'religion', value: text })}
                placeholder="Enter your religion (optional)"
                error={errors?.religion}
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />
             <TextInput
                label="Occupation"
                value={state.occupation}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'occupation', value: text })}
                placeholder="Enter your occupation (optional)"
                error={errors?.occupation}
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>SOGIE Information</Text>

            {/* Assigned Sex at Birth Picker - User Specified Style */}
            <Text style={[styles.label, errors?.assignedSexAtBirth ? styles.labelError : null]}>
                Assigned Sex at Birth {errors?.assignedSexAtBirth ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity style={[styles.pickerTrigger, errors?.assignedSexAtBirth ? styles.inputErrorBorder : null]} onPress={() => setShowAssignedSexPicker(true)}>
                  <Text style={styles.pickerText}>{state.assignedSexAtBirth || 'Select Assigned Sex'}</Text>
                  <Ionicons name="caret-down-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              {errors?.assignedSexAtBirth && <Text style={styles.errorText}>{errors.assignedSexAtBirth}</Text>}
            </View>
            {showAssignedSexPicker && (
                 <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={state.assignedSexAtBirth}
                        onValueChange={(itemValue) => {
                            if (itemValue) dispatch({ type: 'SET_ASSIGNED_SEX', value: itemValue });
                            setShowAssignedSexPicker(false);
                        }}
                        style={{ width: '100%' }}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Select Assigned Sex..." value="" />
                        <Picker.Item label="Female" value="Female" />
                        <Picker.Item label="Male" value="Male" />
                        <Picker.Item label="Prefer not to say" value="Prefer not to say" />
                    </Picker>
                </View>
            )}

            {/* Gender Identity Picker - User Specified Style */}
            <TextInput
              label="Gender Identity"
              value={state.genderIdentity}
              onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'genderIdentity', value: text })}
              placeholder="Enter your gender identity (optional)"
              error={errors?.genderIdentity}
              containerStyle={styles.input}
              placeholderTextColor={theme.colors.textMuted}
            />

            {/* Pronouns Picker - User Specified Style */}
            <Text style={[styles.label, errors?.pronouns ? styles.labelError : null]}>
                Pronouns {errors?.pronouns ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity style={[styles.pickerTrigger, errors?.pronouns ? styles.inputErrorBorder : null]} onPress={() => setShowPronounsPicker(true)}>
                  <Text style={styles.pickerText}>{state.pronouns || 'Select Pronouns'}</Text>
                  <Ionicons name="caret-down-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              {errors?.pronouns && <Text style={styles.errorText}>{errors.pronouns}</Text>}
            </View>
            {showPronounsPicker && (
                 <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={state.pronouns}
                        onValueChange={(itemValue) => {
                            if (itemValue) dispatch({ type: 'SET_PRONOUNS', value: itemValue });
                            setShowPronounsPicker(false);
                        }}
                        style={{ width: '100%' }}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Select Pronouns..." value="" />
                        <Picker.Item label="She/Her" value="She/Her" />
                        <Picker.Item label="He/Him" value="He/Him" />
                        <Picker.Item label="They/Them" value="They/Them" />
                        <Picker.Item label="Prefer to self-describe" value="Prefer to self-describe" />
                        <Picker.Item label="Prefer not to say" value="Prefer not to say" />
                    </Picker>
                </View>
            )}

          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
             <TextInput
                label="Street Address"
                value={state.street}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'street', value: text })}
                placeholder="House No., Street Name"
                error={errors?.street}
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />

            {/* Province Picker Trigger */}
            <Text style={[styles.label, errors?.selectedProvince ? styles.labelError : null]}>
                Province {errors?.selectedProvince ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity style={[styles.pickerTrigger, errors?.selectedProvince ? styles.inputErrorBorder : null]} onPress={() => setShowProvincePicker(true)}>
                  <Text style={styles.pickerText}>{provinces.find(p => p.province_code === state.selectedProvince)?.province_name || 'Select Province'}</Text>
                  <Ionicons name="caret-down-outline" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              {errors?.selectedProvince && <Text style={styles.errorText}>{errors.selectedProvince}</Text>}
            </View>
            {showProvincePicker && (
                 <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={state.selectedProvince}
                        onValueChange={(itemValue) => {
                             if (itemValue) dispatch({ type: 'SET_PROVINCE', value: itemValue });
                            setShowProvincePicker(false);
                        }}
                         style={{ width: '100%' }}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Select Province..." value="" />
                        {provinces.map((province) => (
                            <Picker.Item key={province.province_code} label={province.province_name} value={province.province_code} />
                        ))}
                    </Picker>
                 </View>
            )}

            {/* City/Municipality Picker Trigger */}            
            <Text style={[styles.label, errors?.selectedCity ? styles.labelError : null]}>
                City/Municipality {errors?.selectedCity ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity
                  style={[styles.pickerTrigger, errors?.selectedCity ? styles.inputErrorBorder : null, !state.selectedProvince ? styles.pickerDisabled : null]}
                  onPress={() => state.selectedProvince && setShowCityPicker(true)}
                  disabled={!state.selectedProvince}
              >
                  <Text style={styles.pickerText}>{citiesMunicipalities.find(c => c.city_code === state.selectedCity)?.city_name || 'Select City/Municipality'}</Text>
                  <Ionicons name="caret-down-outline" size={24} color={!state.selectedProvince ? theme.colors.disabled : theme.colors.text} />
              </TouchableOpacity>
              {errors?.selectedCity && <Text style={styles.errorText}>{errors.selectedCity}</Text>}
            </View>
            {showCityPicker && (
                 <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={state.selectedCity}
                        onValueChange={(itemValue) => {
                            if (itemValue) dispatch({ type: 'SET_CITY', value: itemValue });
                            setShowCityPicker(false);
                        }}
                        enabled={!!state.selectedProvince} // Ensure province is selected
                         style={{ width: '100%' }}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Select City/Municipality..." value="" />
                        {citiesMunicipalities.map((city) => (
                            <Picker.Item key={city.city_code} label={city.city_name} value={city.city_code} />
                        ))}
                    </Picker>
                </View>
            )}

            {/* Barangay Picker Trigger */}            
             <Text style={[styles.label, errors?.selectedBarangay ? styles.labelError : null]}>
                Barangay {errors?.selectedBarangay ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity
                  style={[styles.pickerTrigger, errors?.selectedBarangay ? styles.inputErrorBorder : null, !state.selectedCity ? styles.pickerDisabled : null]}
                  onPress={() => state.selectedCity && setShowBarangayPicker(true)}
                  disabled={!state.selectedCity}
              >
                  <Text style={styles.pickerText}>{barangaysList.find(b => b.brgy_code === state.selectedBarangay)?.brgy_name || 'Select Barangay'}</Text>
                  <Ionicons name="caret-down-outline" size={24} color={!state.selectedCity ? theme.colors.disabled : theme.colors.text} />
              </TouchableOpacity>
               {errors?.selectedBarangay && <Text style={styles.errorText}>{errors.selectedBarangay}</Text>}
            </View>
            {showBarangayPicker && (
                 <View style={styles.pickerContainer}>
                    <Picker
                        selectedValue={state.selectedBarangay}
                        onValueChange={(itemValue) => {
                            if (itemValue) dispatch({ type: 'SET_BARANGAY', value: itemValue });
                            setShowBarangayPicker(false);
                        }}
                        enabled={!!state.selectedCity} // Ensure city is selected
                         style={{ width: '100%' }}
                        itemStyle={styles.pickerItem}
                    >
                        <Picker.Item label="Select Barangay..." value="" />
                        {barangaysList.map((barangay) => (
                            <Picker.Item key={barangay.brgy_code} label={barangay.brgy_name} value={barangay.brgy_code} />
                        ))}
                    </Picker>
                </View>
            )}

             <TextInput
                label="Contact Number"
                value={state.contactNo}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'contactNo', value: text.replace(/[^0-9]/g, '') })}
                placeholder="e.g., 09171234567"
                keyboardType="phone-pad"
                error={errors?.contactNo}
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />
          </Card>

          <Card style={styles.card}>
             <Text style={styles.sectionTitle}>Other Information</Text>
             <TextInput
                label="PhilHealth Number (Optional)"
                value={state.philhealthNo}
                onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'philhealthNo', value: text.replace(/[^0-9]/g, '') })}
                placeholder="Enter your PhilHealth number"
                keyboardType="numeric"
                error={errors?.philhealthNo}
                containerStyle={styles.input}
                placeholderTextColor={theme.colors.textMuted}
            />
          </Card>

          {/* General Error Display */} 
          {errors?.general && <Text style={styles.generalErrorText}>{errors.general}</Text>}

          {/* Update Button */} 
          <Button 
            variant="primary" 
            title="Update"
            onPress={handleUpdateProfile}
            disabled={isSaving || isInitializing}
            style={styles.button}
            isLoading={isSaving}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

// --- Styles --- ( Largely reusable from CreateProfileScreen, maybe some minor tweaks )
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background, // Match background color
  },
  container: {
    flex: 1,
    // backgroundColor: theme.colors.background, // Removed to allow contentContainer to control background
  },
  contentContainer: {
    padding: theme.spacing.lg, // Changed from .md to .lg
    backgroundColor: theme.colors.background, // Set background on content container for full scroll area
    flexGrow: 1, // Ensure it grows to fill ScrollView
  },
  title: {
    fontSize: theme.typography.subheading, // Aligned with LoginScreen
    fontWeight: 'bold',
    color: theme.colors.secondary,      // Aligned with LoginScreen (secondary color)
    marginBottom: theme.spacing.lg,     // Aligned with LoginScreen
    textAlign: 'center',
  },
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
    color: theme.colors.secondary,
  },
  input: {
    marginBottom: theme.spacing.md, 
  },
  label: {
    fontSize: theme.typography.body, // Aligned with TextInput label
    fontWeight: '500', // Aligned with TextInput label
    color: theme.colors.secondary, // Aligned with TextInput label
    marginBottom: theme.spacing.xs, 
  },
  labelError: {
    color: theme.colors.destructive,
  },
  pickerTrigger: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  pickerText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    backgroundColor: theme.colors.inputBackground,
  },
   pickerItem: {
      // Style individual Picker items if needed (e.g., on iOS)
     // height: 120, // Example for iOS item height
   },
   pickerDisabled: {
    backgroundColor: theme.colors.disabledBackground,
   },
  inputErrorBorder: {
      borderColor: theme.colors.destructive,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.caption, // Consistent with TextInput component
    marginTop: theme.spacing.xs,
  },
  generalErrorText: {
    color: theme.colors.destructive,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
      marginTop: theme.spacing.md,
      fontSize: 16,
      color: theme.colors.textMuted,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
  },
  sectionHeader: {
    fontSize: theme.typography.subheading,
  },
  pickerToggleButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    height: 44,
  },
  pickerToggleButtonText: {
    fontSize: 16,
    color: theme.colors.text,
  },
  picker: {
    width: '100%',
  },
  divider: { // Added divider style from CreateProfileScreen
    height: 1,
    backgroundColor: theme.colors.border,
    marginVertical: theme.spacing.lg,
  },
  // Added safeArea style
}); 