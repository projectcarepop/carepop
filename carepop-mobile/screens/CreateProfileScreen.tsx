import React, { useState, useEffect, useReducer } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Button, TextInput, Card, theme } from '../src/components';
import { supabase, Profile as SupabaseProfile } from '../src/utils/supabase'; // Renamed imported Profile
// import { useAuth } from '../src/context/AuthContext'; // Not strictly needed here if we get user from supabase.auth.getUser()
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';

// Import local JSON data with explicit typing
import provinceJson from '../src/data/province.json';
import cityJson from '../src/data/city.json';
import barangayJson from '../src/data/barangay.json';

// Interfaces (ensure these exactly match the JSON structure)
interface Province {
  province_code: string; 
  province_name: string;
  psgc_code: string;
  region_code: string;
}

interface CityMunicipality {
  city_code: string;
  city_name: string;
  province_code: string;
  psgc_code: string;
  region_desc: string; 
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
  region_code: string;
}

// Cast imported data to the correct array types
const provinceData: Province[] = provinceJson as Province[];
const cityData: CityMunicipality[] = cityJson as CityMunicipality[];
const barangayData: Barangay[] = barangayJson as Barangay[];

/**
 * Props for the CreateProfileScreen component.
 */
interface CreateProfileScreenProps {
  /** Callback function triggered after successful profile creation/update attempt. */
  onProfileCreated: () => void;
}

// --- State Management (useReducer) ---

/**
 * Represents the state of the profile creation form.
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
}

/**
 * Defines the possible actions to update the form state.
 */
type FormAction = 
  | { type: 'SET_FIELD'; field: keyof ProfileFormData; value: string }
  | { type: 'SET_DATE'; value: Date | null }
  | { type: 'SET_PROVINCE'; value: string }
  | { type: 'SET_CITY'; value: string }
  | { type: 'SET_BARANGAY'; value: string };

const initialState: ProfileFormData = {
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
 * @param {Date} birthDate - The date of birth.
 * @returns {number} The calculated age.
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
 * Reducer function for managing the profile form state.
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
      // Reset dependent fields when province changes
      return { ...state, selectedProvince: action.value, selectedCity: '', selectedBarangay: '' };
    case 'SET_CITY':
      // Reset dependent field when city changes
      return { ...state, selectedCity: action.value, selectedBarangay: '' };
    case 'SET_BARANGAY':
      return { ...state, selectedBarangay: action.value };
    default:
      return state;
  }
};

/**
 * Represents the structure for validation errors.
 * Keys correspond to field names in ProfileFormData.
 */
type FormErrors = Partial<Record<keyof ProfileFormData | 'general', string>>;

/**
 * Screen component for users to create their initial profile after registration.
 */
export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ onProfileCreated }) => {
  const [state, dispatch] = useReducer(formReducer, initialState);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors | null>(null); // Store validation errors per field

  // State for controlling date/picker visibility (remains useState)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCivilStatusPicker, setShowCivilStatusPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);

  // Memoized lists for pickers based on selections
  const [provinces] = useState<Province[]>(provinceData); // Static list

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
  const handleDateChange = (event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (event.type === 'set' && selectedDate) {
      dispatch({ type: 'SET_DATE', value: selectedDate });
      // Auto-close picker on iOS after selection
      if (Platform.OS === 'ios') { 
          setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      // User cancelled the picker
      setShowDatePicker(false); 
    }
  };

  /**
   * Validates the profile form data.
   * @returns {FormErrors | null} An object containing errors per field, or null if valid.
   */
  const validateProfileForm = (): FormErrors | null => {
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
    } else if (!/^09\d{9}$/.test(state.contactNo.trim())) { // Basic PH mobile format
        currentErrors.contactNo = 'Please enter a valid 11-digit mobile number starting with 09.';
    }
    if (state.middleInitial.trim().length > 1) {
      currentErrors.middleInitial = 'Middle initial should be a single letter.';
    }
    // Optional: Add PhilHealth format validation if needed
    // const philhealthRegex = /^\d{2}-\d{9}-\d{1}$/;
    // if (state.philhealthNo.trim() && !philhealthRegex.test(state.philhealthNo.trim())) {
    //   currentErrors.philhealthNo = 'Invalid PhilHealth format (e.g., 12-345678901-2).';
    // }

    return Object.keys(currentErrors).length > 0 ? currentErrors : null;
  };

  /**
   * Handles the submission of the profile form.
   * Validates data and attempts to insert it into the Supabase 'profiles' table.
   */
  const handleCreateProfile = async () => {
    const formValidationErrors = validateProfileForm();
    if (formValidationErrors) {
      setErrors(formValidationErrors);
      Alert.alert("Validation Error", "Please correct the errors before submitting.");
      return;
    }

    setLoading(true);
    setErrors(null);

    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();

      if (userError || !user) {
        console.error("Error fetching user:", userError);
        setErrors({ general: "Could not identify user. Please try logging out and back in." });
        setLoading(false);
        return;
      }

      // Ensure all fields match the Supabase 'profiles' table schema
      // and that data types are correct (e.g., date as ISO string).
      const profileDataToSave = {
        user_id: user.id, // This is crucial
        first_name: state.firstName,
        middle_initial: state.middleInitial || null, // Handle empty string as null if DB expects null
        last_name: state.lastName,
        // Ensure date_of_birth is formatted as YYYY-MM-DD if your DB stores it as a date/text type
        // If it's a timestamp, new Date().toISOString() is fine.
        date_of_birth: state.dateOfBirth ? state.dateOfBirth.toISOString().split('T')[0] : null,
        age: state.dateOfBirth ? calculateAge(state.dateOfBirth) : null,
        civil_status: state.civilStatus || null,
        religion: state.religion || null,
        occupation: state.occupation || null,
        street: state.street || null,
        province_code: state.selectedProvince || null,
        city_municipality_code: state.selectedCity || null,
        barangay_code: state.selectedBarangay || null,
        contact_no: state.contactNo || null,
        philhealth_no: state.philhealthNo || null,
        // Add any other fields like avatar_url if applicable, defaulting to null or initial value
        // username: state.username || null, // Example if you had a username field
      };

      console.log("[CreateProfileScreen] Attempting to update profile data:", JSON.stringify(profileDataToSave, null, 2));

      // Assuming your trigger created a row, we update it.
      // If not, you might need an upsert or a check then insert/update.
      const { error: updateError } = await supabase
        .from('profiles')
        .update(profileDataToSave)
        .eq('user_id', user.id);

      if (updateError) {
        console.error("Error updating profile:", updateError);
        setErrors({ general: `Failed to update profile: ${updateError.message}` });
        // Alert.alert("Error", `Failed to update profile: ${updateError.message}`);
      } else {
        console.log("[CreateProfileScreen] Profile updated successfully!");
        Alert.alert("Success", "Profile created successfully!");
        onProfileCreated(); // Trigger context refresh and navigation
      }
    } catch (e) {
      console.error("Unexpected error in handleCreateProfile:", e);
      const message = e instanceof Error ? e.message : "An unexpected error occurred.";
      setErrors({ general: `An unexpected error occurred: ${message}` });
      // Alert.alert("Error", "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Helper to get the display name for a selected code from a list.
   * @param code The selected code (e.g., province_code).
   * @param list The list of items (e.g., provinceData).
   * @param codeKey The key in the list items containing the code.
   * @param nameKey The key in the list items containing the display name.
   * @returns The display name or undefined.
   */
  const getSelectedName = (
      code: string,
      list: Array<any>,
      codeKey: string,
      nameKey: string
  ): string | undefined => {
      return list.find(item => item[codeKey] === code)?.[nameKey];
  };

  // Civil status options
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced', 'Other'];

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.keyboardAvoidingContainer}
    >
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.formContainer}> 
          <Text style={styles.title}>Create Your Profile</Text>
          <Text style={styles.subtitle}>Complete your details to personalize your experience.</Text>

          {errors?.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}

          <TextInput
            label="First Name *"
            value={state.firstName}
            // Use dispatch to update state
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'firstName', value })}
            placeholder="e.g., Juan"
            containerStyle={styles.input}
            autoCapitalize="words"
            error={errors?.firstName} // Show field-specific error
          />

          <TextInput
            label="Middle Initial (Optional)"
            value={state.middleInitial}
            onChangeText={(value) => dispatch({ type: 'SET_FIELD', field: 'middleInitial', value })}
            placeholder="e.g., D."
            containerStyle={styles.input}
            autoCapitalize="characters"
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
          {/* Display field-specific error below button */}
          {errors?.dateOfBirth && <Text style={styles.inlineErrorText}>{errors.dateOfBirth}</Text>}
          {showDatePicker && (
            <DateTimePicker
              testID="dateTimePicker"
              value={state.dateOfBirth || new Date()} // Default to today if null
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              maximumDate={new Date()} // Prevent selecting future dates
            />
          )}

          <TextInput
            label="Age"
            value={state.displayAge}
            placeholder="--"
            editable={false} // Age is calculated
            containerStyle={styles.input}
            error={errors?.displayAge} // Although not directly validated, show error if DOB has one?
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
                  // Consider auto-hiding picker on selection
                  // setShowCivilStatusPicker(false);
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
            title="Save Profile"
            variant="primary"
            onPress={handleCreateProfile}
            isLoading={loading}
            style={styles.button}
            // Disable button if backend update is needed and not yet done?
            // disabled={true} // Example if we want to force block until backend ready
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingContainer: {
    flex: 1,
    backgroundColor: theme.colors.background, 
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContentContainer: { // Renamed from mainContainer for clarity
    flexGrow: 1, // Ensures content can scroll if it overflows
    justifyContent: 'center', // Added back to match LoginScreen
    padding: theme.spacing.lg * 1.5,  // Match LoginScreen padding
    paddingTop: theme.spacing.xl * 3.5, // Removed extra top padding
    paddingBottom: theme.spacing.lg * 3, // Match LoginScreen padding
  },
  formContainer: { // New container for form elements if more structure is needed
    // Potentially add specific styles here if needed, for now it's structural
  },
  title: {
    fontSize: theme.typography.heading, // Changed from title to heading
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.md, // Increased margin
  },
  subtitle: {
    fontSize: theme.typography.subheading,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl, // Increased margin
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
  errorLabel: { // Style for labels associated with an error
    color: theme.colors.destructive,
  },
  inlineErrorText: { // Style for errors displayed directly below the input/picker button
    marginTop: -theme.spacing.sm + 4, // Adjust negative margin to position below button
    marginBottom: theme.spacing.sm, // Add space before next element
    fontSize: theme.typography.caption,
    color: theme.colors.destructive,
    marginLeft: theme.spacing.xs, // Align slightly with input text
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
    height: 44, // Match TextInput height
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
  pickerContainer: { // Optional container for styling the picker area if needed
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    overflow: 'hidden', // Helps contain the picker visuals
  },
  picker: {
    // Style the picker itself if needed (height, color etc)
    // Note: Styling Picker directly has limitations across platforms
    // backgroundColor: theme.colors.inputBackground, // May not work reliably
    height: Platform.OS === 'ios' ? 150 : 50, // Adjust height as needed, especially for iOS wheel
  },
  pickerItem: {
    // Style picker items if needed (e.g., font size on iOS)
    // fontSize: theme.typography.body, // Example for iOS
  },
  pickerItemPlaceholder: {
    // Style the placeholder item specifically
    color: theme.colors.textMuted,
    // fontSize: theme.typography.body, // Example for iOS
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.caption,
    fontWeight: 'bold',
  },
}); 