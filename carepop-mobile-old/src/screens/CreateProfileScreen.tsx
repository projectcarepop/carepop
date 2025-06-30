import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet, KeyboardAvoidingView, Platform, Alert, ActivityIndicator } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../components/button.native';
import { theme } from '../components/theme';
import { Input } from '../components/text-input.native'; // Assuming a reusable Input component
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '../lib/validation/profile';
import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';
import type { UpdateProfilePayload } from '../lib/types';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../navigation/AppNavigator';

// Import location data
import provinceJson from '../src/data/psgc/provinces.json';
import cityJson from '../src/data/psgc/cities-municipalities.json';
import barangayJson from '../src/data/psgc/barangays.json';

// --- Option data for dropdowns ---
const civilStatusOptions = ["Single", "Married", "Divorced", "Widowed", "In a domestic partnership", "Other", "Prefer not to say"];
const genderIdentityOptions = ["Man", "Woman", "Non-binary", "Transgender Man", "Transgender Woman", "Genderqueer", "Agender", "Other", "Prefer not to say"];
const pronounsOptions = ["he/him", "she/her", "they/them", "ze/hir", "xe/xem", "Other", "Prefer not to say"];
const assignedSexOptions = ["Male", "Female", "Intersex", "Prefer not to say"];

interface PickerItem { name: string; code?: string; }
type PickerType = 'province' | 'city' | 'barangay' | 'civilStatus' | 'genderIdentity' | 'pronouns' | 'assignedSex';

const pickerTypeToTitleMap: Record<PickerType, string> = {
    province: "Province", city: "City/Municipality", barangay: "Barangay",
    civilStatus: "Civil Status", genderIdentity: "Gender Identity", pronouns: "Pronouns",
    assignedSex: "Assigned Sex at Birth"
};

export default function CreateProfileScreen() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateProfile'>>();

    const { control, handleSubmit, formState: { errors } } = useForm<ProfileFormValues>({
        resolver: zodResolver(profileSchema),
        defaultValues: {
            firstName: user?.user_metadata?.first_name || '',
            lastName: user?.user_metadata?.last_name || '',
            // Initialize other fields as needed
            middleInitial: '',
            contactNo: '',
            street: '',
            provinceCode: '',
            cityMunicipalityCode: '',
            barangayCode: '',
        }
    });

    const { mutate: submitProfile, isPending } = useMutation({
        mutationFn: (data: UpdateProfilePayload) => updateMyProfile(data),
        onSuccess: () => {
            Alert.alert("Success", "Your profile has been saved.");
            queryClient.invalidateQueries({ queryKey: ['userProfile'] }); // Optional: if you have a query for the profile
            navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
        },
        onError: (error) => {
            Alert.alert("Error", error.message || "An unexpected error occurred.");
        }
    });

    const onSubmit = (data: ProfileFormValues) => {
        // The service function expects an UpdateProfilePayload, so we map the form data.
        const payload: UpdateProfilePayload = {
            ...data,
            birthday: data.birthday.toISOString().split('T')[0], // Map to YYYY-MM-DD string
        };
        submitProfile(payload);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.screenTitle}>Create Your Profile</Text>
                    <Text style={styles.screenDescription}>This information helps us tailor your experience.</Text>
                    
                    <View style={styles.formContainer}>
                        <Controller
                            control={control}
                            name="firstName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="First Name" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.firstName?.message} required />
                            )}
                        />
                        <Controller
                            control={control}
                            name="lastName"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="Last Name" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.lastName?.message} required />
                            )}
                        />
                        {/* Add controllers for all other fields... */}
                        {/* Example for a non-string field */}
                        <Controller
                            control={control}
                            name="birthday"
                            render={({ field: { onChange, value } }) => (
                                // This would be a custom DatePicker input component
                                <Input label="Birthday" value={value?.toLocaleDateString()} error={errors.birthday?.message} onFocus={() => { /* open date picker */ }} required />
                            )}
                        />
                        <Controller
                            control={control}
                            name="contactNo"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="Contact No." onBlur={onBlur} onChangeText={onChange} value={value} error={errors.contactNo?.message} required keyboardType="phone-pad"/>
                            )}
                        />
                         <Controller
                            control={control}
                            name="street"
                            render={({ field: { onChange, onBlur, value } }) => (
                                <Input label="Street Address" onBlur={onBlur} onChangeText={onChange} value={value} error={errors.street?.message} required />
                            )}
                        />
                        {/* Placeholder for location pickers */}
                        <Input label="Province" error={errors.provinceCode?.message} required />
                        <Input label="City/Municipality" error={errors.cityMunicipalityCode?.message} required />
                        <Input label="Barangay" error={errors.barangayCode?.message} required />
                    </View>

                    <Button onPress={handleSubmit(onSubmit)} disabled={isPending} style={{ marginTop: 20 }}>
                        {isPending ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Save Profile</Text>}
                    </Button>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: theme.spacing.lg },
    screenTitle: { ...theme.typography.h1, textAlign: 'center', marginBottom: theme.spacing.sm },
    screenDescription: { ...theme.typography.body, textAlign: 'center', color: theme.colors.mutedForeground, marginBottom: theme.spacing.xl },
    formContainer: { gap: theme.spacing.md },
    buttonText: { ...theme.typography.body, fontFamily: theme.typography.fontFamilySemiBold, color: theme.colors.primaryForeground },
});