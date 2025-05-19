import React, { useState, useEffect, useReducer, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView, KeyboardAvoidingView, Platform, TouchableOpacity, ActivityIndicator, SafeAreaView, Modal } from 'react-native';
import { Button, TextInput, Card, theme } from '../src/components';
import { supabase, Profile as SupabaseProfile } from '../src/utils/supabase'; // Renamed imported Profile
// import { useAuth } from '../src/context/AuthContext'; // Not strictly needed here if we get user from supabase.auth.getUser()
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native'; // Added imports
import { NativeStackNavigationProp } from '@react-navigation/native-stack'; // Added import
import { RootStackParamList } from '../src/navigation/AppNavigator'; // Corrected path
import { z } from 'zod'; // Import Zod
import { Ionicons } from '@expo/vector-icons'; // Added Ionicons

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
 * No longer receives props directly, uses route.params.
 */
// interface CreateProfileScreenProps {
//   onProfileCreated: () => void;
// }

// Define route prop type
type CreateProfileScreenRouteProp = RouteProp<RootStackParamList, 'CreateProfile'>;

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
  genderIdentity: string;
  pronouns: string;
  assignedSexAtBirth: string;
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
  | { type: 'SET_BARANGAY'; value: string }
  | { type: 'SET_GENDER_IDENTITY'; value: string }
  | { type: 'SET_PRONOUNS'; value: string }
  | { type: 'SET_ASSIGNED_SEX'; value: string };

const initialState: ProfileFormData = {
  firstName: '',
  middleInitial: '',
  lastName: '',
  dateOfBirth: null,
  displayAge: '',
  genderIdentity: '',
  pronouns: '',
  assignedSexAtBirth: '',
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
    case 'SET_GENDER_IDENTITY':
      return { ...state, genderIdentity: action.value };
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
 * Keys correspond to field names in ProfileFormData.
 */
type FormErrors = Partial<Record<keyof ProfileFormData | 'general', string>>;

/**
 * Screen component for users to create their initial profile after registration.
 */
// export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ onProfileCreated }) => {
export const CreateProfileScreen: React.FC = () => {
  const route = useRoute<CreateProfileScreenRouteProp>(); // Get route object
  const { onProfileCreated } = route.params; // Extract params

  const [state, dispatch] = useReducer(formReducer, initialState);
  const [isLoading, setIsLoading] = useState(false); // Renamed from 'loading' to avoid conflict if we use a more specific submitting state
  const [errors, setErrors] = useState<FormErrors | null>(null); // Store validation errors per field

  // State for controlling date/picker visibility (remains useState)
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showCivilStatusPicker, setShowCivilStatusPicker] = useState(false);
  const [showProvincePicker, setShowProvincePicker] = useState(false);
  const [showCityPicker, setShowCityPicker] = useState(false);
  const [showBarangayPicker, setShowBarangayPicker] = useState(false);
  const [showPronounsPicker, setShowPronounsPicker] = useState(false);
  const [showAssignedSexPicker, setShowAssignedSexPicker] = useState(false);

  // Memoized lists for pickers based on selections
  const [provinces] = useState<Province[]>(provinceData); // Static list

  const citiesMunicipalities = useMemo(() => {
    if (!state.selectedProvince) return [];
    return cityData.filter((city) => city.province_code === state.selectedProvince);
  }, [state.selectedProvince]);

  const barangaysList = useMemo(() => {
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
      if (Platform.OS === 'ios') { // Ensure iOS picker also closes after selection
        setShowDatePicker(false);
      }
    } else if (event.type === 'dismissed') {
      setShowDatePicker(false);
    }
  }, []);

  /**
   * Validates the profile form data.
   * @returns {FormErrors | null} An object containing errors per field, or null if valid.
   */
  const profileFormSchema = z.object({
    firstName: z.string().trim().min(1, { message: "First name is required." }),
    middleInitial: z.string().trim().max(1, { message: "Middle initial should be a single letter." }).optional().or(z.literal('')),
    lastName: z.string().trim().min(1, { message: "Last name is required." }),
    dateOfBirth: z.date({ required_error: "Date of birth is required." }),
    displayAge: z.string(), // Not directly validated, derived
    genderIdentity: z.string().trim().optional().or(z.literal('')),
    pronouns: z.string().optional().or(z.literal('')),
    assignedSexAtBirth: z.string().optional().or(z.literal('')),
    civilStatus: z.string().min(1, { message: "Civil status is required."}), // Made required for consistency if EditProfileScreen has it as such
    religion: z.string().optional().or(z.literal('')),
    occupation: z.string().optional().or(z.literal('')),
    street: z.string().trim().min(1, { message: "Street address is required." }),
    selectedProvince: z.string().min(1, { message: "Province is required." }),
    selectedCity: z.string().min(1, { message: "City/Municipality is required." }),
    selectedBarangay: z.string().min(1, { message: "Barangay is required." }),
    contactNo: z.string().trim().min(1, { message: "Contact number is required." })
                 .regex(/^09\d{9}$/, { message: "Please enter a valid 11-digit mobile number starting with 09." }),
    philhealthNo: z.string().trim().optional().or(z.literal('')),
  });
  
  const validateProfileForm = useCallback((): FormErrors | null => {
    const result = profileFormSchema.safeParse(state);
    if (!result.success) {
      const fieldErrors: FormErrors = {};
      for (const issue of result.error.issues) {
        if (issue.path.length > 0) {
          fieldErrors[issue.path[0] as keyof ProfileFormData] = issue.message;
        } else {
          fieldErrors.general = issue.message; // For global errors, if any from Zod refinement
        }
      }
      return fieldErrors;
    }
    return null;
  }, [state, profileFormSchema]);

  /**
   * Handles the submission of the profile form.
   * Validates data and attempts to insert it into the Supabase 'profiles' table.
   */
  const handleCreateProfile = async () => {
    const formValidationErrors = validateProfileForm();
    if (formValidationErrors) {
      setErrors(formValidationErrors);
      Alert.alert("Validation Error", "Please check the form for errors.");
      return;
    }
    setErrors(null);
    setIsLoading(true);

    try {
      const { data: userResponse, error: userError } = await supabase.auth.getUser();
      if (userError || !userResponse.user) {
        Alert.alert("Error", "Could not get user session. Please try logging in again.");
        setIsLoading(false);
        return;
      }
      const user = userResponse.user;

      // IMPORTANT BACKEND BLOCKER:
      // The following Supabase insert is now replaced by a call to the backend API.
      // Ensure the backend /api/users/profile PATCH endpoint is ready and
      // Constants.expoConfig.extra.backendApiUrl is correctly configured.

      const profilePayload = {
        // Personal Information
        firstName: state.firstName,
        middleInitial: state.middleInitial,
        lastName: state.lastName,
        dateOfBirth: state.dateOfBirth ? state.dateOfBirth.toISOString().split('T')[0] : null, // Format as YYYY-MM-DD
        age: state.dateOfBirth ? calculateAge(state.dateOfBirth) : null, // Recalculate here or ensure state.displayAge is numeric
        
        // SOGIE Information
        genderIdentity: state.genderIdentity,
        pronouns: state.pronouns,
        assignedSexAtBirth: state.assignedSexAtBirth,

        // Other Details
        civilStatus: state.civilStatus,
        religion: state.religion,
        occupation: state.occupation,
        
        // Address
        street: state.street,
        barangayCode: state.selectedBarangay,
        cityMunicipalityCode: state.selectedCity,
        provinceCode: state.selectedProvince,
        
        // Contact & PhilHealth
        contactNo: state.contactNo,
        philhealthNo: state.philhealthNo,
        
        // email and user_id are typically not sent in an update payload from client
        // as they are identified by the session/token on the backend.
        // The backend will use the authenticated user's ID.
      };
      
      console.log("[CreateProfileScreen] Payload to be sent to backend:", JSON.stringify(profilePayload, null, 2));
      
      // Filter out any null or empty string values if the backend expects only provided fields
      // Or ensure backend handles them appropriately
      // Attempting a fix for the linter error by being more explicit with types
      const definedProfilePayload = Object.entries(profilePayload).reduce<{[K in keyof typeof profilePayload]?: string | number}>((acc, [key, value]) => {
        if (value !== null && value !== '') {
          // Ensure value is only string or number before assigning
          if (typeof value === 'string' || typeof value === 'number') {
            // The key is asserted to be a key of profilePayload, and thus a key of acc.
            acc[key as keyof typeof profilePayload] = value;
          }
        }
        return acc;
      }, {});


      // TODO: Replace with actual API call structure from your project
      // Assuming Constants.expoConfig.extra.backendApiUrl is set up
      const backendApiUrl = process.env.EXPO_PUBLIC_BACKEND_API_URL; // Example using Expo env var
      if (!backendApiUrl) {
          Alert.alert("Configuration Error", "Backend API URL is not configured.");
          setIsLoading(false);
          return;
      }
      
      const response = await fetch(`${backendApiUrl}/api/users/profile`, {
          method: 'PATCH',
          headers: {
              'Content-Type': 'application/json',
              // The backend's authMiddleware should handle extracting the token from Supabase session
              // or you might need to explicitly pass the access token if your setup requires it.
              // For now, assuming the middleware handles it based on Supabase client-side session.
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
          },
          body: JSON.stringify(definedProfilePayload),
      });

      const responseData = await response.json();

      if (!response.ok) {
        // console.error("Profile update error response:", responseData);
        console.error("[CreateProfileScreen] Profile update failed. Status:", response.status, "Response Data:", JSON.stringify(responseData));
        
        let alertMessage = responseData.message || `An error occurred. Status: ${response.status}`;
        if (responseData.errors) {
          // Map backend errors to frontend errors state
          const backendFieldErrors: FormErrors = {};
          for (const field in responseData.errors) {
            if (Array.isArray(responseData.errors[field]) && responseData.errors[field].length > 0) {
              backendFieldErrors[field as keyof ProfileFormData] = responseData.errors[field][0]; // Take the first error message
            }
          }
          setErrors(backendFieldErrors); // Update frontend errors state
          alertMessage = "Please check the form for errors."; // General alert if specific field errors are now shown
        }

        Alert.alert(
          "Profile Update Failed", 
          alertMessage
        );
        setIsLoading(false);
        return;
      }

      Alert.alert("Profile Created/Updated", "Your profile has been successfully saved.");
      // Call the callback passed via route params
      if (onProfileCreated) {
        onProfileCreated();
      }
      // navigation.navigate('MainAppDrawer'); // Or whatever the next screen is

    } catch (error) {
      // console.error("Error creating profile:", error);
      // Log the full error object to the console for more details
      console.error("Full error object during profile creation:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
      let errorMessage = 'No specific message available.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert("Error", `An unexpected error occurred. Details: ${errorMessage}`);
    } finally {
      setIsLoading(false);
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
  const getSelectedName = useCallback((
      code: string,
      list: Array<Record<string, any>>,
      codeKey: string,
      nameKey: string
  ): string | undefined => {
      const foundItem = list.find(item => item[codeKey] === code);
      if (foundItem) {
          const value = foundItem[nameKey];
          if (typeof value === 'string' || typeof value === 'number') {
              return String(value);
          }
      }
      return undefined;
  }, []);

  // Civil status options
  const civilStatusOptions = ['Single', 'Married', 'Widowed', 'Separated', 'Divorced', 'Other'];
  const pronounOptions = ["She/Her", "He/Him", "They/Them", "Prefer to self-describe", "Prefer not to say"];
  const assignedSexOptions = ["Female", "Male", "Prefer not to say"];

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <Modal
          transparent={true}
          animationType="none"
          visible={isLoading} // Use isLoading state for modal visibility
          onRequestClose={() => { /* Modal cannot be closed by user action */ }}
        >
          <View style={styles.modalBackground}>
            <View style={styles.activityIndicatorWrapper}>
              <ActivityIndicator animating={isLoading} size="large" color={theme.colors.primary} />
              <Text style={styles.modalLoadingText}>Saving Profile...</Text>
            </View>
          </View>
        </Modal>

        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Create Profile</Text>
          <Text style={styles.subtitle}>Please complete your profile to continue.</Text>

          {errors?.general && (
            <Text style={styles.generalErrorText}>{errors.general}</Text>
          )}

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
                value={state.dateOfBirth || new Date()}
                mode="date"
                display="default"
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
            )}
            <TextInput
              label="Age"
              value={state.displayAge}
              editable={false}
              placeholder="Age"
              containerStyle={styles.input}
              placeholderTextColor={theme.colors.textMuted}
            />
          </Card>

          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>SOGIE & Civil Status</Text>
            <TextInput
              label="Gender Identity"
              value={state.genderIdentity}
              onChangeText={(text) => dispatch({ type: 'SET_GENDER_IDENTITY', value: text })}
              placeholder="e.g., Woman, Non-binary, Man"
              error={errors?.genderIdentity}
              containerStyle={styles.input}
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={[styles.label, errors?.pronouns ? styles.labelError : null]}>
              Pronouns {errors?.pronouns ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity 
                style={[styles.pickerTrigger, errors?.pronouns ? styles.inputErrorBorder : null]} 
                onPress={() => setShowPronounsPicker(true)}
              >
                <Text style={styles.pickerText}>{state.pronouns || "Select Pronouns..."}</Text>
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
                  style={{ width: '100%' }} itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Pronouns..." value="" />
                  {pronounOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            )}
            <Text style={[styles.label, errors?.assignedSexAtBirth ? styles.labelError : null]}>
              Assigned Sex at Birth {errors?.assignedSexAtBirth ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity 
                style={[styles.pickerTrigger, errors?.assignedSexAtBirth ? styles.inputErrorBorder : null]}
                onPress={() => setShowAssignedSexPicker(true)}
              >
                <Text style={styles.pickerText}>{state.assignedSexAtBirth || "Select Assigned Sex..."}</Text>
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
                  style={{ width: '100%' }} itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Assigned Sex..." value="" />
                  {assignedSexOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            )}
            <Text style={[styles.label, errors?.civilStatus ? styles.labelError : null]}>
              Civil Status {errors?.civilStatus ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity 
                style={[styles.pickerTrigger, errors?.civilStatus ? styles.inputErrorBorder : null]} 
                onPress={() => setShowCivilStatusPicker(true)}
              >
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
                  style={{ width: '100%' }} itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Civil Status..." value="" />
                  {civilStatusOptions.map((option) => (
                    <Picker.Item key={option} label={option} value={option} />
                  ))}
                </Picker>
              </View>
            )}
          </Card>
          
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Additional Details</Text>
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
            <Text style={styles.sectionTitle}>Address</Text>
            <TextInput
              label="Street Address"
              value={state.street}
              onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'street', value: text })}
              placeholder="House No., Street Name"
              error={errors?.street}
              containerStyle={styles.input}
              placeholderTextColor={theme.colors.textMuted}
            />
            <Text style={[styles.label, errors?.selectedProvince ? styles.labelError : null]}>
              Province {errors?.selectedProvince ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity 
                style={[styles.pickerTrigger, errors?.selectedProvince ? styles.inputErrorBorder : null]} 
                onPress={() => setShowProvincePicker(true)}
              >
                <Text style={styles.pickerText}>{getSelectedName(state.selectedProvince, provinces, 'province_code', 'province_name') || 'Select Province'}</Text>
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
                  style={{ width: '100%' }} itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Province..." value="" />
                  {provinces.map((province) => (
                    <Picker.Item key={province.province_code} label={province.province_name} value={province.province_code} />
                  ))}
                </Picker>
              </View>
            )}
            <Text style={[styles.label, errors?.selectedCity ? styles.labelError : null]}>
              City/Municipality {errors?.selectedCity ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity
                style={[styles.pickerTrigger, errors?.selectedCity ? styles.inputErrorBorder : null, !state.selectedProvince ? styles.pickerDisabled : null]}
                onPress={() => state.selectedProvince && setShowCityPicker(true)}
                disabled={!state.selectedProvince}
              >
                <Text style={styles.pickerText}>{getSelectedName(state.selectedCity, citiesMunicipalities, 'city_code', 'city_name') || 'Select City/Municipality'}</Text>
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
                  enabled={!!state.selectedProvince}
                  style={{ width: '100%' }} itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select City/Municipality..." value="" />
                  {citiesMunicipalities.map((city) => (
                    <Picker.Item key={city.city_code} label={city.city_name} value={city.city_code} />
                  ))}
                </Picker>
              </View>
            )}
            <Text style={[styles.label, errors?.selectedBarangay ? styles.labelError : null]}>
              Barangay {errors?.selectedBarangay ? '*' : ''}
            </Text>
            <View style={styles.fieldGroup}>
              <TouchableOpacity
                style={[styles.pickerTrigger, errors?.selectedBarangay ? styles.inputErrorBorder : null, !state.selectedCity ? styles.pickerDisabled : null]}
                onPress={() => state.selectedCity && setShowBarangayPicker(true)}
                disabled={!state.selectedCity}
              >
                <Text style={styles.pickerText}>{getSelectedName(state.selectedBarangay, barangaysList, 'brgy_code', 'brgy_name') || 'Select Barangay'}</Text>
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
                  enabled={!!state.selectedCity}
                  style={{ width: '100%' }} itemStyle={styles.pickerItem}
                >
                  <Picker.Item label="Select Barangay..." value="" />
                  {barangaysList.map((barangay) => (
                    <Picker.Item key={barangay.brgy_code} label={barangay.brgy_name} value={barangay.brgy_code} />
                  ))}
                </Picker>
              </View>
            )}
          </Card>
          
          <Card style={styles.card}>
            <Text style={styles.sectionTitle}>Contact & Identification</Text>
            <TextInput
              label="Contact Number"
              value={state.contactNo}
              onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'contactNo', value: text.replace(/[^0-9]/g, '') })}
              placeholder="e.g., 09171234567"
              keyboardType="phone-pad"
              error={errors?.contactNo}
              containerStyle={styles.input}
              placeholderTextColor={theme.colors.textMuted}
              maxLength={11}
            />
            <TextInput
              label="PhilHealth Number (Optional)"
              value={state.philhealthNo}
              onChangeText={(text) => dispatch({ type: 'SET_FIELD', field: 'philhealthNo', value: text })}
              placeholder="Enter your PhilHealth number"
              error={errors?.philhealthNo}
              containerStyle={styles.input}
              placeholderTextColor={theme.colors.textMuted}
            />
          </Card>

          <Button
            variant="primary"
            title="Save Profile"
            onPress={handleCreateProfile}
            disabled={isLoading}
            style={styles.button}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    flexGrow: 1,
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
    textAlign: 'center',
    marginTop: theme.spacing.lg,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg * 2,
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
    fontSize: theme.typography.body,
    fontWeight: '500',
    color: theme.colors.secondary,
    marginBottom: theme.spacing.xs,
  },
  labelError: {
    color: theme.colors.destructive,
  },
  fieldGroup: {
    marginBottom: theme.spacing.md,
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
    height: 48,
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
  },
  pickerDisabled: {
    backgroundColor: theme.colors.disabledBackground,
  },
  inputErrorBorder: {
    borderColor: theme.colors.destructive,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.caption,
    marginTop: theme.spacing.xs,
  },
  generalErrorText: {
    color: theme.colors.destructive,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
    fontSize: theme.typography.body,
  },
  button: {
    marginTop: theme.spacing.lg,
  },
  iosPickerDoneButton: {
    alignSelf: 'flex-end',
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
  },
  iosPickerDoneButtonText: {
    color: theme.colors.primary,
    fontSize: theme.typography.body,
    fontWeight: '600',
  },
  modalBackground: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-around',
    backgroundColor: '#00000040'
  },
  activityIndicatorWrapper: {
    backgroundColor: '#FFFFFF',
    height: 150,
    width: 150,
    borderRadius: theme.borderRadius.lg,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: theme.spacing.lg,
  },
  modalLoadingText: {
    marginTop: theme.spacing.md,
    fontSize: theme.typography.button,
    fontWeight: 'bold',
    color: theme.colors.text,
  }
}); 