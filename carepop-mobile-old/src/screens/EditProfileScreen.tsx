import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Platform, Pressable, DimensionValue, FlatList, TextInput as RNTextInput, KeyboardAvoidingView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView, AnimatePresence } from 'moti';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller, FieldValues, UseControllerProps } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Check, Search } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';
import { supabase } from '../utils/supabase';
import type { Profile, UpdateProfileApiPayload, UpdateProfilePayload } from '../lib/types';
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

const pickerKeyToFormField: { [key in Exclude<ActivePicker, 'date' | null>]: keyof FormValues } = {
    province: 'provinceCode',
    city: 'cityMunicipalityCode',
    barangay: 'barangayCode',
    civilStatus: 'civilStatus',
    genderIdentity: 'genderIdentity',
    pronouns: 'pronouns',
    assignedSex: 'assignedSexAtBirth',
};

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
        <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>{label}</Text>
        {isSelected && <Check color={theme.colors.primary} size={20} />}
    </TouchableOpacity>
);

const CustomPickerModal = ({
  visible,
  onClose,
  options,
  onConfirm,
  title,
  selectedValue,
  showSearch,
}: {
  visible: boolean;
  onClose: () => void;
  options: { label: string; value: any }[];
  onConfirm: (value: any) => void;
  title: string;
  selectedValue: any;
  showSearch: boolean;
}) => {
    const [tempValue, setTempValue] = useState(selectedValue);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredOptions = options.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));

    const handleConfirm = () => {
        onConfirm(tempValue);
        onClose();
    };

    // Reset temp value when modal is opened
    React.useEffect(() => {
        if (visible) {
            setTempValue(selectedValue);
            setSearchTerm(''); // also reset search term
        }
    }, [visible, selectedValue]);

    return (
      <AnimatePresence>
        {visible && (
          <Pressable onPress={onClose} style={styles.modalBackdrop}>
            <MotiView from={{ translateY: 800 }} animate={{ translateY: 0 }} exit={{ translateY: 800 }} transition={{ type: 'timing', duration: 400 }} style={styles.bottomSheetContainer} onStartShouldSetResponder={() => true}>
              <View style={styles.bottomSheetHeader}>
                  <Text style={styles.bottomSheetTitle}>{title}</Text>
              </View>
              
              {showSearch && (
                  <View style={styles.searchContainer}>
                      <Search size={20} color={theme.colors.mutedForeground} />
                      <RNTextInput
                          style={styles.searchInput}
                          placeholder="Search..."
                          placeholderTextColor={theme.colors.mutedForeground}
                          value={searchTerm}
                          onChangeText={setSearchTerm}
                      />
                  </View>
              )}
              
              <FlatList
                  data={filteredOptions}
                  keyExtractor={(item) => item.value}
                  renderItem={({ item }) => (
                      <PickerRow label={item.label} isSelected={tempValue === item.value} onPress={() => setTempValue(item.value)} />
                  )}
                  style={styles.pickerList}
              />

              <View style={styles.bottomSheetFooter}>
                  <Button title="Done" onPress={handleConfirm} style={styles.bottomSheetButton} textStyle={styles.bottomSheetButtonText} />
              </View>
            </MotiView>
          </Pressable>
        )}
      </AnimatePresence>
    );
};

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
        mutationFn: (data: UpdateProfilePayload) => updateMyProfile(supabase, data),
        onSuccess: (updatedProfile) => {
            updateProfileInContext(updatedProfile);
            Toast.show({type: 'success', text1: 'Profile Updated', text2: 'Your information has been saved.'});
            navigation.goBack();
        },
        onError: (error) => {
            Toast.show({type: 'error', text1: 'Update Failed', text2: (error as Error).message});
        },
    });

    const onSubmit = (data: FormValues) => {
        const payload: UpdateProfilePayload = {
            ...data,
            birthday: data.birthday.toISOString().split('T')[0],
        };
        updateProfile(payload);
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
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
                keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
            >
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.screenTitle}>Edit Profile</Text>
                    <Text style={styles.screenSubTitle}>
                        Keep your personal and medical information up to date.
                    </Text>
                    
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Personal Information</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="firstName" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>First Name</FormLabel>
                                    <Input placeholder="Enter your first name" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="middleInitial" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Middle Initial</FormLabel>
                                    <Input placeholder="M.I." {...field} value={field.value ?? ''} onChangeText={field.onChange} maxLength={5} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="lastName" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Last Name</FormLabel>
                                    <Input placeholder="Enter your last name" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
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
                    
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Contact & Address</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="contactNo" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Contact Number</FormLabel>
                                    <Input placeholder="e.g. 09171234567" {...field} value={field.value ?? ''} onChangeText={field.onChange} keyboardType="phone-pad" editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="street" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Street Address</FormLabel>
                                    <Input placeholder="House No., Street, Subdivision" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="provinceCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Province</FormLabel>
                                     <TouchableOpacity onPress={() => setActivePicker('province')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value ?? '', provinceOptions, 'Select Province')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="cityMunicipalityCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>City/Municipality</FormLabel>
                                     <TouchableOpacity onPress={() => setActivePicker('city')} style={[styles.pickerButton, !watchedProvinceCode && styles.disabledButton]} disabled={isPending || !watchedProvinceCode}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value ?? '', cityOptions, 'Select City/Municipality')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                             <Controller name="barangayCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Barangay</FormLabel>
                                     <TouchableOpacity onPress={() => setActivePicker('barangay')} style={[styles.pickerButton, !watchedCityCode && styles.disabledButton]} disabled={isPending || !watchedCityCode}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value ?? '', barangayOptions, 'Select Barangay')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                    
                     <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="civilStatus" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Civil Status</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('civilStatus')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value ?? '', civilStatusOptions, 'Select Civil Status')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="genderIdentity" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Gender Identity</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('genderIdentity')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value ?? '', genderIdentityOptions, 'Select Gender Identity')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="pronouns" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Pronouns</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('pronouns')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value ?? '', pronounsOptions, 'Select Pronouns')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                             <Controller name="assignedSexAtBirth" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Assigned Sex at Birth</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('assignedSex')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value ?? '', assignedSexOptions, 'Select Assigned Sex at Birth')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="religion" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Religion</FormLabel>
                                    <Input placeholder="e.g. Roman Catholic, Agnostic" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="occupation" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Occupation</FormLabel>
                                    <Input placeholder="e.g. Software Engineer, Doctor" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="philhealthNo" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>PhilHealth Number</FormLabel>
                                    <Input placeholder="Enter PhilHealth No. (optional)" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                    <View style={styles.footer}>
                        <Button
                            title={isPending ? "Saving..." : "Save Changes"}
                            onPress={handleSubmit(onSubmit)}
                            isLoading={isPending}
                            fullWidth
                            style={styles.bottomSheetButton}
                            textStyle={styles.bottomSheetButtonText}
                            icon={<Check size={18} color={theme.colors.primaryForeground} />}
                        />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>

             {/* Unified Modal for all pickers */}
            <CustomPickerModal
                visible={!!activePicker && activePicker !== 'date'}
                onClose={() => setActivePicker(null)}
                title={modalTitle}
                options={modalOptions}
                selectedValue={activePicker && activePicker !== 'date' ? watch(pickerKeyToFormField[activePicker]) : null}
                showSearch={['province', 'city', 'barangay'].includes(activePicker || '')}
                onConfirm={(value) => {
                    if (activePicker && activePicker !== 'date') {
                        const fieldName = pickerKeyToFormField[activePicker];
                        setValue(fieldName, value, { shouldValidate: true, shouldDirty: true });
                        
                        // Reset dependent fields
                        if (fieldName === 'provinceCode') {
                            setValue('cityMunicipalityCode', '', { shouldDirty: true });
                            setValue('barangayCode', '', { shouldDirty: true });
                        }
                        if (fieldName === 'cityMunicipalityCode') {
                            setValue('barangayCode', '', { shouldDirty: true });
                        }
                    }
                }}
            />

            {activePicker === 'date' && (
                <DateTimePicker
                    value={watch('birthday') || new Date()}
                    mode="date"
                    display="spinner"
                    onChange={(event, date) => {
                        setActivePicker(null);
                        if (date) {
                            setValue('birthday', date, { shouldValidate: true });
                        }
                    }}
                />
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 16, paddingBottom: 100 },
    screenTitle: { ...theme.typography.h2, textAlign: 'center', marginBottom: theme.spacing.sm, marginTop: theme.spacing.lg, color: theme.colors.secondary },
    screenSubTitle: {
        ...theme.typography.body,
        textAlign: 'center',
        color: theme.colors.mutedForeground,
        marginBottom: theme.spacing.xl,
    },
    card: { marginBottom: theme.spacing.lg },
    cardTitle: {
        color: theme.colors.secondary,
    },
    footer: { padding: theme.spacing.lg },
    pickerButton: {
        backgroundColor: theme.colors.input,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        justifyContent: 'center',
    },
    pickerText: { ...theme.typography.body, color: theme.colors.foreground },
    disabledButton: { opacity: 0.5, backgroundColor: theme.colors.muted },
    modalBackdrop: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
        zIndex: 10,
    },
    bottomSheetContainer: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        padding: theme.spacing.lg * 2,
        height: '60%',
    },
    bottomSheetHeader: {
        alignItems: 'center',
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
        marginBottom: theme.spacing.sm,
    },
    bottomSheetTitle: {
        ...theme.typography.h3,
        color: theme.colors.foreground,
    },
    pickerList: {
        marginVertical: theme.spacing.md,
    },
    pickerItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    pickerItemText: {
        ...theme.typography.body,
        color: theme.colors.foreground,
    },
    pickerItemTextSelected: {
        ...theme.typography.h4,
        color: theme.colors.primary,
    },
    pickerItemSelected: {}, // Keep for structure, can add background color if needed
    radioCircle: {
        width: 20, height: 20, borderRadius: 10,
        borderWidth: 2, borderColor: theme.colors.primary,
        alignItems: 'center', justifyContent: 'center', marginRight: theme.spacing.md,
    },
    radioCircleSelected: {
        backgroundColor: theme.colors.primary,
    },
    bottomSheetFooter: {
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    bottomSheetButton: {
        height: 52,
        borderRadius: theme.radius.md,
    },
    bottomSheetButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.input,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        marginVertical: theme.spacing.md,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.body,
        paddingVertical: theme.spacing.md,
        paddingLeft: theme.spacing.sm,
        color: theme.colors.foreground,
    },
    pickerLabel: { 
        ...theme.typography.small, 
        fontWeight: '500',
        color: theme.colors.foreground,
        marginBottom: theme.spacing.sm,
    },
    grabber: {
        width: 60,
        height: 5,
        backgroundColor: theme.colors.border,
        borderRadius: theme.radius.full,
        alignSelf: 'center',
        marginBottom: theme.spacing.md,
    }
});