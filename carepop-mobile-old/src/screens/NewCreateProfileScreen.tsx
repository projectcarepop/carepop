import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Platform, Pressable, FlatList, TextInput as RNTextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView, AnimatePresence } from 'moti';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import Toast from 'react-native-toast-message';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Check, Search } from 'lucide-react-native';

import { useAuth } from '../context/AuthContext';
import { updateMyProfile } from '../services/api';
import type { UpdateProfilePayload } from '../lib/types';
import { supabase } from '../lib/supabaseClient';

import { Button } from '../components/button.native';
import { Input as CustomInput } from '../components/text-input.native';
import { Card, CardContent, CardHeader, CardTitle } from '../components/card.native';
import { theme } from '../components/theme';

// --- Import Location Data ---
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

    React.useEffect(() => {
        if (visible) {
            setTempValue(selectedValue);
            setSearchTerm('');
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

export default function NewCreateProfileScreen() {
    const { updateProfileInContext } = useAuth();

    const { control, handleSubmit, setValue, watch, formState: { errors } } = useForm<FormValues>({
        defaultValues: {
            firstName: '', lastName: '', middleInitial: '', contactNo: '',
            birthday: new Date(), genderIdentity: '', pronouns: '', assignedSexAtBirth: '',
            civilStatus: '', religion: '', occupation: '', philhealthNo: '',
            street: '', provinceCode: '', cityMunicipalityCode: '', barangayCode: '',
        },
    });

    const { mutate: createProfile, isPending } = useMutation({
        mutationFn: (data: UpdateProfilePayload) => updateMyProfile(supabase, data),
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
        const payload: UpdateProfilePayload = {
            ...data,
            birthday: data.birthday.toISOString().split('T')[0],
        };
        createProfile(payload);
    };
    
    const [activePicker, setActivePicker] = useState<ActivePicker>(null);
    const [searchTerm, setSearchTerm] = useState('');
    
    const provinceOptions = useMemo(() => Array.isArray(provinceJson) ? provinceJson.map((p: any) => ({ label: p.province_name, value: p.province_code })) : [], []);
    const cityOptions = useMemo(() => Array.isArray(cityJson) ? cityJson.map((c: any) => ({ label: c.city_name, value: c.city_code })) : [], []);
    const barangayOptions = useMemo(() => Array.isArray(barangayJson) ? barangayJson.map((b: any) => ({ label: b.brgy_name, value: b.brgy_code })) : [], []);

    const watchedProvinceCode = watch('provinceCode');
    const watchedCityCode = watch('cityMunicipalityCode');

    const filteredModalOptions = useMemo(() => {
        let options: { label: string; value: string; }[] = [];
        switch (activePicker) {
            case 'province': options = provinceOptions; break;
            case 'city': options = watchedProvinceCode ? cityOptions.filter(c => c.value.startsWith(watchedProvinceCode)) : []; break;
            case 'barangay': options = watchedCityCode ? barangayOptions.filter(b => b.value.startsWith(watchedCityCode)) : []; break;
            case 'civilStatus': options = civilStatusOptions; break;
            case 'genderIdentity': options = genderIdentityOptions; break;
            case 'pronouns': options = pronounsOptions; break;
            case 'assignedSex': options = assignedSexOptions; break;
        }
        return options.filter(item => item.label.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [activePicker, searchTerm, provinceOptions, cityOptions, barangayOptions, watchedProvinceCode, watchedCityCode]);
    
    const getDisplayValue = (value: string | undefined, options: {label: string, value: string}[], placeholder: string) => {
        if (!value) return placeholder;
        return options.find(opt => opt.value === value)?.label || placeholder;
    };

    const handleConfirmPicker = (selectedValue: any) => {
        if (activePicker && activePicker !== 'date') {
            const fieldName = pickerKeyToFormField[activePicker];
            setValue(fieldName, selectedValue, { shouldValidate: true });
        }
        setActivePicker(null);
    };

    const pickerKeyToFormField: { [key in Exclude<ActivePicker, 'date' | null>]: keyof FormValues } = {
        province: 'provinceCode', city: 'cityMunicipalityCode', barangay: 'barangayCode',
        civilStatus: 'civilStatus', genderIdentity: 'genderIdentity', pronouns: 'pronouns',
        assignedSex: 'assignedSexAtBirth',
    };

    const modalTitle = useMemo(() => {
        switch (activePicker) {
            case 'province': return 'Select Province';
            case 'city': return 'Select City/Municipality';
            case 'barangay': return 'Select Barangay';
            case 'civilStatus': return 'Select Civil Status';
            case 'genderIdentity': return 'Select Gender Identity';
            case 'pronouns': return 'Select Pronouns';
            case 'assignedSex': return 'Select Assigned Sex at Birth';
            default: return '';
        }
    }, [activePicker]);

    return (
        <SafeAreaView style={styles.safeArea}>
            <KeyboardAwareScrollView extraScrollHeight={Platform.OS === 'ios' ? 100 : 0}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
                    <Text style={styles.screenTitle}>Create Your Profile</Text>
                    <Text style={styles.screenDescription}>
                        Please provide some basic information to get started. All fields can be updated later.
                    </Text>
                    
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Personal Information</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="firstName" control={control} rules={{ required: 'First name is required' }} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>First Name</FormLabel>
                                    <CustomInput placeholder="Enter your first name" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="middleInitial" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Middle Initial</FormLabel>
                                    <CustomInput placeholder="M.I." {...field} value={field.value ?? ''} onChangeText={field.onChange} maxLength={5} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="lastName" control={control} rules={{ required: 'Last name is required' }} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Last Name</FormLabel>
                                    <CustomInput placeholder="Enter your last name" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="birthday" control={control} rules={{ required: 'Date of birth is required' }} render={({ field, fieldState }) => (
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
                             <Controller name="contactNo" control={control} rules={{ required: 'Contact number is required' }} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel required>Contact Number</FormLabel>
                                    <CustomInput placeholder="e.g., 09171234567" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} keyboardType="phone-pad" />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="street" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Street Address</FormLabel>
                                    <CustomInput placeholder="House No., Street, Subdivision" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="provinceCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Province</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('province')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, provinceOptions, 'Select Province')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="cityMunicipalityCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>City/Municipality</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('city')} style={styles.pickerButton} disabled={isPending || !watchedProvinceCode}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, cityOptions, 'Select City/Municipality')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="barangayCode" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Barangay</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('barangay')} style={styles.pickerButton} disabled={isPending || !watchedCityCode}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, barangayOptions, 'Select Barangay')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>

                     <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
                        <CardContent>
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
                             <Controller name="civilStatus" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Civil Status</FormLabel>
                                    <TouchableOpacity onPress={() => setActivePicker('civilStatus')} style={styles.pickerButton} disabled={isPending}>
                                        <Text style={styles.pickerText}>{getDisplayValue(field.value, civilStatusOptions, 'Select Civil Status')}</Text>
                                    </TouchableOpacity>
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                            <Controller name="religion" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Religion</FormLabel>
                                    <CustomInput placeholder="e.g., Roman Catholic" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                             <Controller name="occupation" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>Occupation</FormLabel>
                                    <CustomInput placeholder="e.g., Software Engineer" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                             <Controller name="philhealthNo" control={control} render={({ field, fieldState }) => (
                                <FormItem>
                                    <FormLabel>PhilHealth Number (Optional)</FormLabel>
                                    <CustomInput placeholder="Enter your PhilHealth number" {...field} value={field.value ?? ''} onChangeText={field.onChange} editable={!isPending} keyboardType="number-pad" />
                                    <FormMessage error={fieldState.error} />
                                </FormItem>
                            )} />
                        </CardContent>
                    </Card>
                    
                    <Button 
                        onPress={handleSubmit(onSubmit)} 
                        disabled={isPending}
                        isLoading={isPending}
                        style={styles.submitButton}
                        size='xl'
                    >
                        Save and Continue
                    </Button>
                </ScrollView>
            </KeyboardAwareScrollView>
            
            {activePicker === 'date' && (
                <Controller name="birthday" control={control} render={({ field }) => (
                    <DateTimePicker
                        value={field.value ? new Date(field.value) : new Date()}
                        mode="date"
                        display="spinner"
                        onChange={(_, date) => {
                            setActivePicker(null);
                            if (date) field.onChange(date);
                        }}
                        maximumDate={new Date()}
                    />
                )} />
            )}

            <CustomPickerModal
              visible={!!activePicker && activePicker !== 'date'}
              onClose={() => setActivePicker(null)}
              options={filteredModalOptions}
              onConfirm={handleConfirmPicker}
              title={modalTitle}
              selectedValue={activePicker && activePicker !== 'date' ? watch(pickerKeyToFormField[activePicker]) : ''}
              showSearch={['province', 'city', 'barangay'].includes(activePicker || '')}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: theme.spacing.lg, paddingTop: theme.spacing.xl, paddingBottom: 60 },
    screenTitle: { ...theme.typography.h1, marginBottom: theme.spacing.sm, textAlign: 'center', color:theme.colors.secondary },
    screenDescription: { ...theme.typography.body, color: theme.colors.mutedForeground, textAlign: 'center', marginBottom: theme.spacing.xl },
    card: { marginBottom: theme.spacing.lg, },
    cardTitle: { color: theme.colors.secondary },
    submitButton: { marginTop: theme.spacing.xl },
    pickerButton: {
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      paddingHorizontal: theme.spacing.lg,
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.input,
    },
    pickerText: {
      color: theme.colors.foreground,
    },
    modalBackdrop: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'flex-end',
    },
    bottomSheetContainer: {
        backgroundColor: theme.colors.card,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        maxHeight: '80%',
        paddingBottom: 40,
    },
    bottomSheetHeader: {
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    bottomSheetTitle: {
        ...theme.typography.h3,
        textAlign: 'center',
    },
    pickerList: {
        paddingHorizontal: theme.spacing.lg,
    },
    pickerItem: {
        paddingVertical: theme.spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    pickerItemText: {
        ...theme.typography.body,
        fontSize: 16,
    },
    pickerItemSelected: {
        // You can add styles for selected item, e.g., background color
    },
    pickerItemTextSelected: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamilyBold,
    },
    bottomSheetFooter: {
        padding: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    bottomSheetButton: {},
    bottomSheetButtonText: {},
    pickerLabel: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        color: theme.colors.secondary,
        marginBottom: theme.spacing.sm,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.input,
        borderRadius: theme.radius.md,
        margin: theme.spacing.lg,
        paddingHorizontal: theme.spacing.md,
    },
    searchInput: {
        flex: 1,
        ...theme.typography.body,
        paddingVertical: theme.spacing.md,
        paddingLeft: theme.spacing.sm,
        color: theme.colors.foreground,
    }
});