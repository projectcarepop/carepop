import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Platform, Pressable, DimensionValue, FlatList, TextInput as RNTextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView, AnimatePresence } from 'moti';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Check, Search } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';
import { supabase } from '../lib/supabaseClient';
import type { UpdateProfileApiPayload } from '../lib/types';
import { Button } from '../components/button.native';
import { Input } from '../components/text-input.native';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card.native';
import { theme } from '../components/theme';

// Import location data
import provinceJson from '../data/psgc/provinces.json';
import cityJson from '../data/psgc/cities-municipalities.json';
import barangayJson from '../data/psgc/barangays.json';

// --- Data for Pickers ---
const civilStatusOptions = ["Single", "Married", "Divorced", "Widowed"].map(o => ({ label: o, value: o }));
const genderIdentityOptions = ["Man", "Woman", "Non-binary", "Prefer not to say"].map(o => ({ label: o, value: o }));
const pronounsOptions = ["he/him", "she/her", "they/them", "Prefer not to say"].map(o => ({ label: o, value: o }));
const assignedSexOptions = ["Male", "Female", "Prefer not to say"].map(o => ({ label: o, value: o }));

type ActivePicker = 'date' | 'province' | 'city' | 'barangay' | 'civilStatus' | 'genderIdentity' | 'pronouns' | 'assignedSex' | null;

// --- Helper Components ---
const FormItem = ({ children }: { children: React.ReactNode }) => <View style={{ marginBottom: 16 }}>{children}</View>;
const FormLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
    <Text style={styles.pickerLabel}>{children}{required && <Text style={{ color: theme.colors.destructive }}> *</Text>}</Text>
);
const FormMessage = ({ error }: { error?: { message?: string } }) => (
    error?.message ? <Text style={{ color: theme.colors.destructive, marginTop: 4 }}>{error.message}</Text> : null
);

const PickerRow = ({ label, isSelected, onPress }: {label: string, isSelected: boolean, onPress: () => void}) => (
    <TouchableOpacity onPress={onPress} style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>{isSelected && <Check color={theme.colors.primaryForeground} size={14} />}</View>
        <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>{label}</Text>
    </TouchableOpacity>
);

const CustomPickerModal = ({ visible, onClose, children, height = '80%' }: { visible: boolean; onClose: () => void; children: React.ReactNode; height?: DimensionValue; }) => (
    <AnimatePresence>
      {visible && (
        <Pressable onPress={onClose} style={styles.modalBackdrop}>
          <MotiView from={{ translateY: 800 }} animate={{ translateY: 0 }} exit={{ translateY: 800 }} transition={{ type: 'timing', duration: 400 }} style={[styles.bottomSheetContainer, { height }]} onStartShouldSetResponder={() => true}>
            <View style={styles.grabber} />
            {children}
          </MotiView>
        </Pressable>
      )}
    </AnimatePresence>
);

type FormValues = {
  firstName: string; lastName: string; middleInitial: string; contactNo: string;
  birthday: Date; genderIdentity: string; pronouns: string; assignedSexAtBirth: string;
  civilStatus: string; religion: string; occupation: string; philhealthNo: string;
  street: string; provinceCode: string; cityMunicipalityCode: string; barangayCode: string;
};

export function EditProfileScreen() {
    const { profile, updateProfileInContext } = useAuth();
    const navigation = useNavigation();

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            firstName: profile?.firstName || '', lastName: profile?.lastName || '', middleInitial: profile?.middleInitial || '',
            contactNo: profile?.contactNo || '', birthday: profile?.birthday ? new Date(profile.birthday) : new Date(),
            genderIdentity: profile?.genderIdentity || '', pronouns: profile?.pronouns || '', assignedSexAtBirth: profile?.assignedSexAtBirth || '',
            civilStatus: profile?.civilStatus || '', religion: profile?.religion || '', occupation: profile?.occupation || '',
            philhealthNo: profile?.philhealthNo || '', street: profile?.street || '', provinceCode: profile?.provinceCode || '',
            cityMunicipalityCode: profile?.cityMunicipalityCode || '', barangayCode: profile?.barangayCode || '',
        },
    });

    const { mutate: updateProfile, isPending } = useMutation({
        mutationFn: (data: FormValues) => {
          if (!profile) throw new Error("Profile not loaded");
          
          const payloadForApi: UpdateProfileApiPayload = {
            first_name: data.firstName,
            last_name: data.lastName,
            middle_initial: data.middleInitial,
            contact_no: data.contactNo,
            birthday: data.birthday.toISOString().split('T')[0],
            gender_identity: data.genderIdentity,
            pronouns: data.pronouns,
            civil_status: data.civilStatus,
            assigned_sex_at_birth: data.assignedSexAtBirth,
            religion: data.religion,
            occupation: data.occupation,
            philhealth_no: data.philhealthNo,
            street: data.street,
            province_code: data.provinceCode,
            city_municipality_code: data.cityMunicipalityCode,
            barangay_code: data.barangayCode,
          };
          
          console.log("Transformed snake_case payload being sent to API:", payloadForApi);

          return updateMyProfile(supabase, payloadForApi);
        },
        onSuccess: (updatedProfile) => {
            updateProfileInContext(updatedProfile);
            Toast.show({type: 'success', text1: 'Profile Updated'});
            navigation.goBack();
        },
        onError: (error) => {
            Toast.show({type: 'error', text1: 'Update Failed', text2: (error as Error).message});
        },
    });

    const onSubmit = (data: FormValues) => {
        console.log("Form data submitted:", data);
        updateProfile(data);
    };
    
    const [activePicker, setActivePicker] = useState<ActivePicker>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const provinceOptions = useMemo(() => Array.isArray(provinceJson) ? provinceJson.map((p: any) => ({ label: p.province_name, value: p.province_code })) : [], []);
    const cityOptions = useMemo(() => Array.isArray(cityJson) ? cityJson.map((c: any) => ({ label: c.city_name, value: c.city_code })) : [], []);
    const barangayOptions = useMemo(() => Array.isArray(barangayJson) ? barangayJson.map((b: any) => ({ label: b.brgy_name, value: b.brgy_code })) : [], []);

    const watchedProvinceCode = watch('provinceCode');
    const watchedCityCode = watch('cityMunicipalityCode');

    let modalTitle = '';
    let modalOptions: { label: string; value: string; }[] = [];

    switch (activePicker) {
        case 'province': modalTitle = 'Select Province'; modalOptions = provinceOptions; break;
        case 'city': modalTitle = 'Select City/Municipality'; modalOptions = watchedProvinceCode ? cityOptions.filter(c => c.value.startsWith(watchedProvinceCode)) : []; break;
        case 'barangay': modalTitle = 'Select Barangay'; modalOptions = watchedCityCode ? barangayOptions.filter(b => b.value.startsWith(watchedCityCode)) : []; break;
        case 'civilStatus': modalTitle = 'Select Civil Status'; modalOptions = civilStatusOptions; break;
        case 'genderIdentity': modalTitle = 'Select Gender Identity'; modalOptions = genderIdentityOptions; break;
        case 'pronouns': modalTitle = 'Select Pronouns'; modalOptions = pronounsOptions; break;
        case 'assignedSex': modalTitle = 'Select Assigned Sex at Birth'; modalOptions = assignedSexOptions; break;
    }
    
    const filteredOptions = modalOptions.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const getDisplayValue = (value: string, options: {label: string, value: string}[], placeholder: string) => {
        if (!value) return placeholder;
        return options.find(opt => opt.value === value)?.label || placeholder;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAwareScrollView>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.screenTitle}>Edit Profile</Text>
                    
                    <Card style={styles.card}><CardHeader><CardTitle>Personal Information</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="firstName" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>First Name</FormLabel>
                                    <Input placeholder="Enter your first name" {...field} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="middleInitial" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Middle Initial</FormLabel>
                                    <Input placeholder="M.I." {...field} onChangeText={field.onChange} maxLength={5} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="lastName" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Last Name</FormLabel>
                                    <Input placeholder="Enter your last name" {...field} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="birthday" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Date of Birth</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('date')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{field.value ? new Date(field.value).toLocaleDateString() : 'Select Date of Birth'}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )}/>
                        </CardContent>
                    </Card>
                    
                    <Card style={styles.card}><CardHeader><CardTitle>Contact & Address</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="contactNo" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Contact Number</FormLabel>
                                    <Input placeholder="e.g. 09171234567" {...field} onChangeText={field.onChange} keyboardType="phone-pad" editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="street" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Street Address</FormLabel>
                                    <Input placeholder="House No., Street, Subdivision" {...field} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="provinceCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Province</FormLabel>
                                     <TouchableOpacity onPress={() => setActivePicker('province')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, provinceOptions, 'Select Province')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="cityMunicipalityCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>City/Municipality</FormLabel>
                                     <TouchableOpacity onPress={() => setActivePicker('city')} style={[styles.pickerButton, !watchedProvinceCode && styles.disabledButton]} disabled={isPending || !watchedProvinceCode}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, cityOptions, 'Select City/Municipality')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                             <Controller name="barangayCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Barangay</FormLabel>
                                     <TouchableOpacity onPress={() => setActivePicker('barangay')} style={[styles.pickerButton, !watchedCityCode && styles.disabledButton]} disabled={isPending || !watchedCityCode}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, barangayOptions, 'Select Barangay')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                    
                     <Card style={styles.card}><CardHeader><CardTitle>Identity & Other Info</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="civilStatus" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Civil Status</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('civilStatus')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, civilStatusOptions, 'Select Civil Status')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="genderIdentity" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Gender Identity</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('genderIdentity')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, genderIdentityOptions, 'Select Gender Identity')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="pronouns" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Pronouns</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('pronouns')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, pronounsOptions, 'Select Pronouns')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                             <Controller name="assignedSexAtBirth" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Assigned Sex at Birth</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('assignedSex')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, assignedSexOptions, 'Select Assigned Sex')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="religion" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Religion</FormLabel>
                                    <Input placeholder="e.g. Roman Catholic" {...field} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="occupation" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Occupation</FormLabel>
                                    <Input placeholder="e.g. Software Engineer" {...field} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="philhealthNo" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>PhilHealth No.</FormLabel>
                                    <Input placeholder="Enter your PhilHealth number" {...field} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <Button 
                        title="Save Changes"
                        variant="default"
                        size="xl"
                        icon={<Check size={18} color="white" />}
                        onPress={handleSubmit(onSubmit)}
                        disabled={isPending}
                        isLoading={isPending}
                        style={styles.submitButton}
                    />
                </ScrollView>
            </KeyboardAwareScrollView>
            
            <CustomPickerModal visible={activePicker !== null} onClose={() => setActivePicker(null)} height={activePicker === 'date' ? '45%' : '80%'}>
                {activePicker === 'date' ? (
                  <>
                    <DateTimePicker 
                        value={watch('birthday') || new Date()} 
                        mode="date" 
                        display="spinner" 
                        onChange={(_, d) => {
                            if (d) {
                                setValue('birthday', d, { shouldDirty: true });
                            }
                        }}
                        textColor={theme.colors.foreground} 
                    />
                    <Button title="Done" onPress={() => setActivePicker(null)} style={{ marginTop: 16 }}/>
                  </>
                ) : (
                    <View style={{ flex: 1 }}>
                        <Text style={styles.modalTitle}>{modalTitle}</Text>
                        <View style={styles.searchContainer}>
                            <Search size={20} color={theme.colors.mutedForeground} style={{position: 'absolute', left: 12, top: 12}} />
                            <RNTextInput
                                placeholder="Search..."
                                value={searchTerm}
                                onChangeText={setSearchTerm}
                                style={styles.searchInput}
                                placeholderTextColor={theme.colors.mutedForeground}
                            />
                        </View>
                        <FlatList
                            data={filteredOptions}
                            keyExtractor={item => item.value}
                            renderItem={({ item }) => {
                                const fieldName = Object.entries({
                                    province: 'provinceCode', city: 'cityMunicipalityCode', barangay: 'barangayCode',
                                    civilStatus: 'civilStatus', genderIdentity: 'genderIdentity', pronouns: 'pronouns', assignedSex: 'assignedSexAtBirth'
                                }).find(([key]) => key === activePicker)?.[1] as keyof FormValues | undefined;

                                if (!fieldName) return null;
                                
                                return (
                                    <PickerRow 
                                        label={item.label} 
                                        isSelected={watch(fieldName) === item.value} 
                                        onPress={() => {
                                            setValue(fieldName, item.value, { shouldValidate: true, shouldDirty: true });
                                            if (fieldName === 'provinceCode') { setValue('cityMunicipalityCode', '', { shouldDirty: true }); setValue('barangayCode', '', { shouldDirty: true }); }
                                            if (fieldName === 'cityMunicipalityCode') setValue('barangayCode', '', { shouldDirty: true });
                                            setActivePicker(null);
                                        }} 
                                    />
                                );
                            }}
                        />
                    </View>
                )}
            </CustomPickerModal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 16, paddingBottom: 100 },
    screenTitle: { fontSize: 28, fontWeight: 'bold', color: theme.colors.foreground, marginBottom: 20 },
    card: { marginBottom: 20 },
    pickerLabel: { fontSize: 14, fontWeight: '500', color: theme.colors.foreground, marginBottom: 8 },
    pickerButton: {
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: 8,
        padding: 12,
        backgroundColor: theme.colors.input,
        justifyContent: 'center',
    },
    disabledButton: { backgroundColor: '#e0e0e0' },
    pickerText: { color: theme.colors.foreground, fontSize: 16 },
    submitButton: { marginTop: 20 },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheetContainer: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        padding: 16,
    },
    grabber: {
        width: 40,
        height: 5,
        borderRadius: 2.5,
        backgroundColor: theme.colors.border,
        alignSelf: 'center',
        marginBottom: 16,
    },
    modalTitle: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', marginBottom: 16, color: theme.colors.foreground },
    searchContainer: { marginBottom: 16, position: 'relative' },
    searchInput: {
        height: 44,
        paddingLeft: 40,
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: theme.colors.border,
        color: theme.colors.foreground,
    },
    pickerItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    pickerItemSelected: { /* No specific style needed here now */ },
    pickerItemText: { fontSize: 16, color: theme.colors.foreground, marginLeft: 12 },
    pickerItemTextSelected: { fontWeight: 'bold', color: theme.colors.primary },
    radioCircle: { width: 20, height: 20, borderRadius: 10, borderWidth: 2, borderColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' },
    radioCircleSelected: { backgroundColor: theme.colors.primary }
});