import React from 'react';
import { View, Text, SafeAreaView, ScrollView, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';

import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';
import type { UpdateProfilePayload } from '../lib/types';

import { Button } from '../components/button.native';
import { Input as CustomInput } from '../components/text-input.native';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card.native';
import { theme } from '../components/theme';

type FormValues = {
  firstName: string;
  lastName: string;
  middleInitial: string;
  contactNo: string;
};

export default function NewCreateProfileScreen() {
    const { updateProfileInContext } = useAuth();
    const navigation = useNavigation();

    const { control, handleSubmit } = useForm<FormValues>({
        defaultValues: {
            firstName: '',
            lastName: '',
            middleInitial: '',
            contactNo: '',
        },
    });

    const { mutate: createProfile, isPending } = useMutation({
        mutationFn: (data: FormValues) => {
            const payload: UpdateProfilePayload = { ...data };
            return updateMyProfile(payload);
        },
        onSuccess: (updatedProfileFromApi) => {
            updateProfileInContext(updatedProfileFromApi);
            Toast.show({
                type: 'success',
                text1: 'Profile Created!',
                text2: 'Welcome! Your profile has been created.',
            });
        },
        onError: (error) => {
            Toast.show({
                type: 'error',
                text1: 'Creation Failed',
                text2: (error as Error).message || 'An unexpected error occurred.',
            });
        },
    });

    const onSubmit = (data: FormValues) => {
        createProfile(data);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAwareScrollView>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.screenTitle}>Create Your Profile</Text>
                    <Text style={styles.screenDescription}>
                        Please provide some basic information to get started.
                    </Text>

                    <Card style={styles.card}>
                        <CardHeader><CardTitle>Your Information</CardTitle></CardHeader>
                        <CardContent>
                            <Controller
                              control={control}
                              name="firstName"
                              render={({ field: { onChange, onBlur, value } }) => (
                                <CustomInput label="First Name" onBlur={onBlur} onChangeText={onChange} value={value} required editable={!isPending}/>
                              )}
                            />
                             <Controller
                              control={control}
                              name="middleInitial"
                              render={({ field: { onChange, onBlur, value } }) => (
                                <CustomInput label="Middle Initial" onBlur={onBlur} onChangeText={onChange} value={value} editable={!isPending}/>
                              )}
                            />
                            <Controller
                              control={control}
                              name="lastName"
                              render={({ field: { onChange, onBlur, value } }) => (
                                <CustomInput label="Last Name" onBlur={onBlur} onChangeText={onChange} value={value} required editable={!isPending}/>
                              )}
                            />
                            <Controller
                                control={control}
                                name="contactNo"
                                render={({ field: { onChange, onBlur, value } }) => (
                                    <CustomInput label="Contact No" onBlur={onBlur} onChangeText={onChange} value={value} keyboardType="phone-pad" required editable={!isPending}/>
                                )}
                            />
                        </CardContent>
                    </Card>
                    
                    <Button 
                        onPress={handleSubmit(onSubmit)} 
                        disabled={isPending}
                        isLoading={isPending}
                        style={styles.submitButton}
                    >
                        Save and Continue
                    </Button>
                </ScrollView>
            </KeyboardAwareScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: theme.spacing.lg, paddingTop: theme.spacing.xl * 2 },
    screenTitle: { ...theme.typography.h1, marginBottom: theme.spacing.sm, textAlign: 'center' },
    screenDescription: { ...theme.typography.body, color: theme.colors.mutedForeground, textAlign: 'center', marginBottom: theme.spacing.xl },
    card: { marginBottom: theme.spacing.lg },
    submitButton: { marginTop: theme.spacing.xl }
});