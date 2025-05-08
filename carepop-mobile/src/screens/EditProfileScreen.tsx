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
} from 'react-native';
import { Button, TextInput, Card, theme } from '../components'; // Assuming theme is from ../components
import { supabase, Profile } from '../utils/supabase'; 
import { useAuth } from '../context/AuthContext'; // Import useAuth to get current profile
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import type { NavigationProp } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';

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

const provinceData: Province[] = provinceJson as Province[];
const cityData: CityMunicipality[] = cityJson as CityMunicipality[];
const barangayData: Barangay[] = barangayJson as Barangay[];

/**
 * Props for the EditProfileScreen component.
 */
interface EditProfileScreenProps {
  /** React Navigation prop for navigation actions. */
  navigation: NavigationProp<any>; // Use a more specific type if available
}

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
  | { type: 'INITIALIZE_FORM'; payload: Partial<ProfileFormData> }; // Action to load initial data

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
  const { profile: currentProfile, isLoading: isAuthLoading, authError } = useAuth();
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

  // Effect to initialize the form state when the current profile loads
  useEffect(() => {
    if (currentProfile && isInitializing) {
      console.log('[EditProfileScreen] Initializing form with profile:', currentProfile.user_id);
      // Map Profile type to ProfileFormData type
      const formData: Partial<ProfileFormData> = {
        firstName: currentProfile.first_name || '',
        middleInitial: currentProfile.middle_initial || '',
        lastName: currentProfile.last_name || '',
        // Convert date string from DB back to Date object, handle invalid dates
        dateOfBirth: currentProfile.date_of_birth ? new Date(currentProfile.date_of_birth) : null,
        civilStatus: currentProfile.civil_status || '',
        religion: currentProfile.religion || '',
        occupation: currentProfile.occupation || '',
        street: currentProfile.street || '',
        selectedProvince: currentProfile.province_code || '',
        selectedCity: currentProfile.city_municipality_code || '',
        selectedBarangay: currentProfile.barangay_code || '',
        contactNo: currentProfile.contact_no || currentProfile.phone_number || '', // Prefer contact_no
        philhealthNo: currentProfile.philhealth_no || '',
      };
      // Validate the Date object conversion
      if (formData.dateOfBirth && isNaN(formData.dateOfBirth.getTime())) {
        console.warn('[EditProfileScreen] Invalid date_of_birth string received from profile:', currentProfile.date_of_birth);
        formData.dateOfBirth = null; // Set to null if invalid
      }

      dispatch({ type: 'INITIALIZE_FORM', payload: formData });
      setIsInitializing(false); // Mark initialization complete
    } else if (!isAuthLoading && !currentProfile && isInitializing) {
        // Handle case where profile is explicitly null after loading (shouldn't happen if navigated from MyProfile?)
        console.warn('[EditProfileScreen] No current profile found after auth load.');
        setIsInitializing(false); // Stop trying to initialize
        // Optionally navigate back or show an error
        Alert.alert('Error', 'Could not load profile data to edit.', [{ text: 'OK', onPress: () => navigation.goBack() }]);
    }
  }, [currentProfile, isAuthLoading, isInitializing, navigation]); // Depend on profile data and loading state

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
   * Handles the submission of the updated profile form.
   * Validates data and attempts to update it in the Supabase 'profiles' table.
   */
  const handleUpdateProfile = async () => {
    const validationErrors = validateProfileForm();
    if (validationErrors) {
      setErrors(validationErrors);
      Alert.alert('Validation Error', 'Please check the highlighted fields.');
      return;
    }
    
    if (!currentProfile?.user_id) {
        Alert.alert('Error', 'Cannot update profile without user ID.');
        return;
    }

    setIsSaving(true);
    setErrors(null);

    // Prepare data for Supabase update, matching DB column names
    const profileDataToUpdate = {
      // user_id is used in .eq() filter, not in update payload
      first_name: state.firstName.trim(),
      middle_initial: state.middleInitial.trim() || null,
      last_name: state.lastName.trim(),
      date_of_birth: state.dateOfBirth ? state.dateOfBirth.toISOString().split('T')[0] : null,
      age: state.dateOfBirth ? calculateAge(state.dateOfBirth) : null,
      civil_status: state.civilStatus || null,
      religion: state.religion.trim() || null,
      occupation: state.occupation.trim() || null,
      street: state.street.trim(),
      province_code: state.selectedProvince,
      city_municipality_code: state.selectedCity,
      barangay_code: state.selectedBarangay,
      contact_no: state.contactNo.trim(), // Use contact_no
      philhealth_no: state.philhealthNo.trim() || null,
      // updated_at will be handled by the trigger
      // Handle avatar_url update if implemented
    };

    try {
      console.log('[EditProfileScreen] Attempting to update profile data:', profileDataToUpdate);
      
      // --- Perform Supabase Update --- 
      // Ensure DB migration has been applied first!
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileDataToUpdate)
        .eq('user_id', currentProfile.user_id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setErrors({ general: updateError.message });
        Alert.alert('Update Error', updateError.message);
      } else {
        console.log("Profile updated successfully");
        Alert.alert('Success', 'Profile updated successfully.');
        // Optionally refetch profile in AuthContext or assume context listener updates it
        // Navigate back after successful update
        navigation.goBack(); 
      }
    } catch (err: any) {
      console.error("Unexpected error updating profile:", err);
      setErrors({ general: err.message || 'An unexpected error occurred.' });
      Alert.alert('Update Error', err.message || 'An unexpected error occurred.');
    } finally {
      setIsSaving(false);
    }
  };

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
  if (isAuthLoading || isInitializing) {
     return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Editor...</Text>
      </SafeAreaView>
    );
  }
  
  // Render error state from AuthContext
  if (authError) {
     return (
      <SafeAreaView style={[styles.safeArea, styles.centered]}>
        <MaterialIcons name="error-outline" size={48} color={theme.colors.destructive} />
        <Text style={styles.errorText}>Error loading profile data: {authError.message}</Text>
      </SafeAreaView>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>Edit Your Profile</Text>
        {/* Potentially add Avatar editing here */}
        
        <Card style={styles.card}>
          {errors?.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          {/* Form Fields - Reuse structure from CreateProfileScreen, bind to reducer state */}
          <TextInput
            label="First Name *"
            value={state.firstName}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'firstName', value })}
            placeholder="e.g., Juan"
            containerStyle={styles.input}
            autoCapitalize="words"
            error={errors?.firstName}
          />
          <TextInput
            label="Middle Initial (Optional)"
            value={state.middleInitial}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'middleInitial', value })}
            placeholder="e.g., D."
            containerStyle={styles.input}
            autoCapitalize="characters"
            maxLength={1}
            error={errors?.middleInitial}
          />
          <TextInput
            label="Last Name *"
            value={state.lastName}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'lastName', value })}
            placeholder="e.g., Dela Cruz"
            containerStyle={styles.input}
            autoCapitalize="words"
            error={errors?.lastName}
          />
          
          {/* Date of Birth Picker */}
          <Text style={[styles.label, errors?.dateOfBirth && styles.errorLabel]}>Date of Birth *</Text>
          <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerButton}>
            <Text style={styles.datePickerText}>
              {state.dateOfBirth ? state.dateOfBirth.toLocaleDateString() : 'Select Date'}
            </Text>
          </TouchableOpacity>
          {errors?.dateOfBirth && <Text style={styles.inlineErrorText}>{errors.dateOfBirth}</Text>}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={state.dateOfBirth || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()}
            />
          )}

          <TextInput
            label="Age"
            value={state.displayAge}
            placeholder="--"
            editable={false}
            containerStyle={styles.input}
            error={errors?.displayAge}
          />
          
          {/* Civil Status Picker */}
          <Text style={[styles.label, errors?.civilStatus && styles.errorLabel]}>Civil Status (Optional)</Text>
          <TouchableOpacity 
            onPress={() => setShowCivilStatusPicker(!showCivilStatusPicker)}
            style={styles.customPickerButton}
          >
            <Text style={styles.customPickerButtonText}>
              {state.civilStatus || 'Select Civil Status...'}
            </Text>
          </TouchableOpacity>
          {errors?.civilStatus && <Text style={styles.inlineErrorText}>{errors.civilStatus}</Text>}
          {showCivilStatusPicker && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={state.civilStatus}
                onValueChange={(itemValue) => {
                  dispatch({ type: 'SET_FIELD', field: 'civilStatus', value: itemValue });
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Civil Status..." value="" style={styles.pickerItemPlaceholder} />
                {civilStatusOptions.map((option) => (
                  <Picker.Item key={option} label={option} value={option} style={styles.pickerItem}/>
                ))}
              </Picker>
            </View>
          )}
          
          <TextInput
            label="Religion (Optional)"
            value={state.religion}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'religion', value })}
            placeholder="e.g., Roman Catholic"
            containerStyle={styles.input}
            autoCapitalize="words"
            error={errors?.religion}
          />

          <TextInput
            label="Occupation (Optional)"
            value={state.occupation}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'occupation', value })}
            placeholder="e.g., Software Engineer"
            containerStyle={styles.input}
            autoCapitalize="words"
            error={errors?.occupation}
          />

          {/* Address Section */}
          <Text style={styles.sectionHeader}>Address *</Text>
          <TextInput
            label="Street Address / House No. *"
            value={state.street}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'street', value })}
            placeholder="e.g., 123 Rizal St., Sitio Example"
            containerStyle={styles.input}
            autoCapitalize="words"
            error={errors?.street}
          />
          
          {/* Province Picker */}
          <Text style={[styles.label, errors?.selectedProvince && styles.errorLabel]}>Province *</Text>
          <TouchableOpacity 
            onPress={() => setShowProvincePicker(!showProvincePicker)}
            style={styles.customPickerButton}
          >
            <Text style={styles.customPickerButtonText}>
              {getSelectedName(state.selectedProvince, provinces, 'province_code', 'province_name') || 'Select Province...'}
            </Text>
          </TouchableOpacity>
          {errors?.selectedProvince && <Text style={styles.inlineErrorText}>{errors.selectedProvince}</Text>}
          {showProvincePicker && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={state.selectedProvince}
                onValueChange={(itemValue) => {
                  dispatch({ type: 'SET_PROVINCE', value: itemValue });
                  setShowProvincePicker(false);
                }}
                style={styles.picker}
              >
                <Picker.Item label="Select Province..." value="" style={styles.pickerItemPlaceholder} />
                {provinces.map((prov) => (
                  <Picker.Item key={prov.province_code} label={prov.province_name} value={prov.province_code} style={styles.pickerItem}/>
                ))}
              </Picker>
            </View>
          )}

          {/* City/Municipality Picker */}
          <Text style={[styles.label, errors?.selectedCity && styles.errorLabel]}>City / Municipality *</Text>
          <TouchableOpacity 
            onPress={() => setShowCityPicker(!showCityPicker)}
            style={[styles.customPickerButton, !state.selectedProvince && styles.disabledPickerButton]} 
            disabled={!state.selectedProvince}
          >
            <Text style={styles.customPickerButtonText}>
              {getSelectedName(state.selectedCity, citiesMunicipalities, 'city_code', 'city_name') || 'Select City/Municipality...'}
            </Text>
          </TouchableOpacity>
          {errors?.selectedCity && <Text style={styles.inlineErrorText}>{errors.selectedCity}</Text>}
          {showCityPicker && !!state.selectedProvince && (
            <View style={styles.pickerContainer}>
              <Picker
                  selectedValue={state.selectedCity}
                  onValueChange={(itemValue) => {
                      dispatch({ type: 'SET_CITY', value: itemValue });
                      setShowCityPicker(false);
                  }}
                  style={styles.picker}
                  enabled={citiesMunicipalities.length > 0}
                >
                  <Picker.Item label="Select City/Municipality..." value="" style={styles.pickerItemPlaceholder} />
                  {citiesMunicipalities.map((city) => (
                    <Picker.Item key={city.city_code} label={city.city_name} value={city.city_code} style={styles.pickerItem}/>
                  ))}
              </Picker>
            </View>
          )}

          {/* Barangay Picker */}
          <Text style={[styles.label, errors?.selectedBarangay && styles.errorLabel]}>Barangay *</Text>
          <TouchableOpacity 
            onPress={() => setShowBarangayPicker(!showBarangayPicker)}
            style={[styles.customPickerButton, !state.selectedCity && styles.disabledPickerButton]} 
            disabled={!state.selectedCity}
          >
            <Text style={styles.customPickerButtonText}>
              {getSelectedName(state.selectedBarangay, barangaysList, 'brgy_code', 'brgy_name') || 'Select Barangay...'}
            </Text>
          </TouchableOpacity>
          {errors?.selectedBarangay && <Text style={styles.inlineErrorText}>{errors.selectedBarangay}</Text>}
          {showBarangayPicker && !!state.selectedCity && (
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={state.selectedBarangay}
                onValueChange={(itemValue) => {
                    dispatch({ type: 'SET_BARANGAY', value: itemValue });
                    setShowBarangayPicker(false);
                }}
                style={styles.picker}
                enabled={barangaysList.length > 0}
              >
                <Picker.Item label="Select Barangay..." value="" style={styles.pickerItemPlaceholder} />
                {barangaysList.map((brgy) => (
                    <Picker.Item key={brgy.brgy_code} label={brgy.brgy_name} value={brgy.brgy_code} style={styles.pickerItem}/>
                  ))}
              </Picker>
            </View>
          )}

          <TextInput
            label="Contact Number *"
            value={state.contactNo}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'contactNo', value })}
            placeholder="e.g., 09123456789"
            containerStyle={styles.input}
            keyboardType="phone-pad"
            maxLength={11}
            error={errors?.contactNo}
          />

          <TextInput
            label="PhilHealth No. (Optional)"
            value={state.philhealthNo}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'philhealthNo', value })}
            placeholder="e.g., 12-345678901-2"
            containerStyle={styles.input}
            keyboardType="numeric"
            error={errors?.philhealthNo}
          />

          <Button
            title="Save Changes"
            variant="primary"
            onPress={handleUpdateProfile}
            isLoading={isSaving}
            style={styles.button}
          />
           <Button
            title="Cancel"
            variant="secondary" // Or outline
            onPress={() => navigation.goBack()} // Navigate back
            style={styles.button}
            disabled={isSaving} // Disable cancel while saving
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// --- Styles --- ( Largely reusable from CreateProfileScreen, maybe some minor tweaks )
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: { // For loading/error states
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
   loadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
  },
  errorText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
  },
  headerTitle: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg, // More space after title
  },
  card: {
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.xl,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  label: {
    marginBottom: theme.spacing.xs,
    fontSize: theme.typography.body,
    color: theme.colors.text,
    fontWeight: '500',
  },
  errorLabel: {
    color: theme.colors.destructive,
  },
  inlineErrorText: {
    marginTop: -theme.spacing.sm + 4,
    marginBottom: theme.spacing.sm,
    fontSize: theme.typography.caption,
    color: theme.colors.destructive,
    marginLeft: theme.spacing.xs,
  },
  sectionHeader: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    paddingBottom: theme.spacing.xs,
  },
  datePickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    height: 44,
    justifyContent: 'center',
  },
  datePickerText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  customPickerButton: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.sm,
    marginBottom: theme.spacing.md,
    height: 44,
    justifyContent: 'center',
    backgroundColor: theme.colors.inputBackground,
  },
  disabledPickerButton: {
    backgroundColor: theme.colors.disabledBackground,
    borderColor: theme.colors.border,
  },
  customPickerButtonText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  picker: {
    height: Platform.OS === 'ios' ? 150 : 50,
  },
  pickerItem: {},
  pickerItemPlaceholder: {
    color: theme.colors.textMuted,
  },
  button: {
    marginTop: theme.spacing.md, // Consistent spacing between buttons
  },
  errorContainer: { // For general form error
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
}); 