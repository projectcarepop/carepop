import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, DimensionValue, TextInput as RNTextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { getMyProfile, updateMyProfile } from '../services/api';
import { Button } from '../components/button.native';
import { theme } from '../components/theme';
import { Input } from '../components/text-input.native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { profileSchema, type ProfileFormValues } from '../lib/validation/profile';
import type { UpdateProfilePayload } from '../lib/types';
import { MotiView, AnimatePresence } from 'moti';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Check, ArrowLeft } from 'lucide-react-native';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';

// Import location data
import provinceJson from '../data/psgc/provinces.json';
import cityJson from '../data/psgc/cities-municipalities.json';
import barangayJson from '../data/psgc/barangays.json';

// --- Option data for dropdowns ---
const civilStatusOptions = ["Single", "Married", "Divorced", "Widowed", "In a domestic partnership", "Other", "Prefer not to say"];
const genderIdentityOptions = ["Man", "Woman", "Non-binary", "Transgender Man", "Transgender Woman", "Genderqueer", "Agender", "Other", "Prefer not to say"];
const pronounsOptions = ["he/him", "she/her", "they/them", "ze/hir", "xe/xem", "Other", "Prefer not to say"];
const assignedSexOptions = ["Male", "Female", "Intersex", "Prefer not to say"];

interface PickerItem {
  name: string;
  code?: string;
}

type PickerType = 'provinceCode' | 'cityMunicipalityCode' | 'barangayCode' | 'civilStatus' | 'genderIdentity' | 'pronouns' | 'assignedSexAtBirth';

const pickerTypeToTitleMap: Record<PickerType, string> = {
  provinceCode: "Province",
  cityMunicipalityCode: "City/Municipality",
  barangayCode: "Barangay",
  civilStatus: "Civil Status",
  genderIdentity: "Gender Identity",
  pronouns: "Pronouns",
  assignedSexAtBirth: "Assigned Sex at Birth"
};

// --- Helper Components ---
const PickerLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
    <Text style={styles.pickerLabel}>
      {children}
      {required && <Text style={{ color: theme.colors.destructive }}> *</Text>}
    </Text>
);

const PickerRow = ({ label, isSelected, onPress }: {label: string, isSelected: boolean, onPress: () => void}) => {
    return (
        <TouchableOpacity onPress={onPress} style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
            <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                {isSelected && <Check color={theme.colors.primaryForeground} size={14} />}
            </View>
            <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>{label}</Text>
        </TouchableOpacity>
    )
}

const CustomPicker = ({ visible, onClose, children, height = '80%' }: { visible: boolean; onClose: () => void; children: React.ReactNode; height?: DimensionValue; }) => {
    return (
        <AnimatePresence>
            {visible && (
                <Pressable onPress={onClose} style={styles.modalBackdrop}>
                    <MotiView from={{ translateY: 800 }} animate={{ translateY: 0 }} exit={{ translateY: 800 }} transition={{ type: 'timing', duration: 400 }} style={[styles.bottomSheetContainer, { height }]} onStartShouldSetResponder={() => true} >
                        <View style={styles.grabber} />
                        {children}
                    </MotiView>
                </Pressable>
            )}
        </AnimatePresence>
    );
};

export const EditProfileScreen = () => {
    const { user: authUser } = useAuth();
    const navigation = useNavigation();
    const queryClient = useQueryClient();

    const { data: userProfile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['myProfile', authUser?.id],
        queryFn: getMyProfile,
        enabled: !!authUser,
    });

    const { control, handleSubmit, reset, setValue, watch } = useForm<ProfileFormValues>();

    const watchAllFields = watch();

    // UI State
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [pickerData, setPickerData] = useState<PickerItem[]>([]);
    const [pickerType, setPickerType] = useState<PickerType | null>(null);
    const [pickerTitle, setPickerTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedItem, setTempSelectedItem] = useState<PickerItem | null>(null);
    
    const provinces: PickerItem[] = useMemo(() => Array.isArray(provinceJson) ? provinceJson.map((p: any) => ({ name: p.province_name, code: p.province_code })) : [], []);
    const cities: PickerItem[] = useMemo(() => Array.isArray(cityJson) ? cityJson.map((c: any) => ({ name: c.city_name, code: c.city_code })) : [], []);
    const barangays: PickerItem[] = useMemo(() => Array.isArray(barangayJson) ? barangayJson.map((b: any) => ({ name: b.brgy_name, code: b.brgy_code })) : [], []);

    useLayoutEffect(() => {
        navigation.setOptions({
            headerStyle: { backgroundColor: theme.colors.background },
            headerShadowVisible: false,
            headerTitle: 'Edit Profile',
            headerLeft: () => (
                <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginLeft: 8 }}>
                    <ArrowLeft size={30} color={theme.colors.secondary} />
                </TouchableOpacity>
            ),
        });
    }, [navigation]);
    
    useEffect(() => {
        if (userProfile) {
            reset({
                ...userProfile,
                birthday: userProfile.birthday ? new Date(userProfile.birthday) : new Date(),
            });
        }
    }, [userProfile, reset]);
    
    const { mutate: submitProfileUpdate, isPending: isSaving } = useMutation({
        mutationFn: (data: UpdateProfilePayload) => updateMyProfile(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['myProfile', authUser?.id] });
            Alert.alert('Success', 'Profile updated successfully!');
            navigation.goBack();
        },
        onError: (error) => {
            Alert.alert('Error', (error as Error).message || "An unexpected error occurred.");
        }
    });

    const onSubmit = (data: ProfileFormValues) => {
        const payload: UpdateProfilePayload = {
            ...data,
            birthday: data.birthday.toISOString().split('T')[0],
        };
        submitProfileUpdate(payload);
    };

    const showDatePicker = () => {
        setTempDate(watchAllFields.birthday || new Date());
        setDatePickerVisibility(true);
    };
    
    const handleTempDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => {
        if (selectedDate) setTempDate(selectedDate);
    };

    const confirmDateSelection = () => {
        if(tempDate) setValue('birthday', tempDate);
        setDatePickerVisibility(false);
    };

    const openPicker = (type: PickerType) => {
        setPickerType(type);
        setPickerTitle(pickerTypeToTitleMap[type]);
        setSearchTerm('');
        let data: PickerItem[] = [];
        let currentSelection: PickerItem | null = null;
        
        const currentValue = watchAllFields[type];

        switch (type) {
            case 'provinceCode':
                data = provinces;
                currentSelection = provinces.find(p => p.code === currentValue) || null;
                break;
            case 'cityMunicipalityCode':
                const provinceCode = watchAllFields.provinceCode;
                data = provinceCode ? cities.filter(c => c.code?.startsWith(provinceCode)) : [];
                currentSelection = cities.find(c => c.code === currentValue) || null;
                break;
            case 'barangayCode':
                const cityCode = watchAllFields.cityMunicipalityCode;
                data = cityCode ? barangays.filter(b => b.code?.startsWith(cityCode)) : [];
                currentSelection = barangays.find(b => b.code === currentValue) || null;
                break;
            case 'civilStatus': data = civilStatusOptions.map(name => ({ name })); currentSelection = { name: currentValue }; break;
            case 'genderIdentity': data = genderIdentityOptions.map(name => ({ name })); currentSelection = { name: currentValue }; break;
            case 'pronouns': data = pronounsOptions.map(name => ({ name })); currentSelection = { name: currentValue }; break;
            case 'assignedSexAtBirth': data = assignedSexOptions.map(name => ({ name })); currentSelection = { name: currentValue }; break;
        }
        setPickerData(data);
        setTempSelectedItem(currentSelection);
        setPickerVisible(true);
    };

    const handleTempPickerSelect = (item: PickerItem) => setTempSelectedItem(item);
    
    const confirmPickerSelection = () => {
        if (tempSelectedItem && pickerType) {
            const valueToSet = tempSelectedItem.code || tempSelectedItem.name;
            setValue(pickerType, valueToSet);
            // Reset dependent fields
            if (pickerType === 'provinceCode') {
                setValue('cityMunicipalityCode', '');
                setValue('barangayCode', '');
            }
            if (pickerType === 'cityMunicipalityCode') {
                setValue('barangayCode', '');
            }
        }
        setPickerVisible(false);
    };

    if (isLoadingProfile) {
      return <SafeAreaView style={styles.loadingContainer}><ActivityIndicator size="large" color={theme.colors.primary} /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Personal Information</CardTitle></CardHeader>
                        <CardContent>
                             <Controller name="firstName" control={control} render={({ field: { onChange, value } }) => <Input label="First Name" value={value} onChangeText={onChange} required />} />
                             <Controller name="middleInitial" control={control} render={({ field: { onChange, value } }) => <Input label="Middle Initial" value={value} onChangeText={onChange} maxLength={5} />} />
                             <Controller name="lastName" control={control} render={({ field: { onChange, value } }) => <Input label="Last Name" value={value} onChangeText={onChange} required />} />
                             <View style={styles.pickerWrapper}>
                                 <PickerLabel required>Date of Birth</PickerLabel>
                                 <TouchableOpacity onPress={showDatePicker} style={styles.pickerButton}><Text style={styles.pickerText}>{watchAllFields.birthday ? new Date(watchAllFields.birthday).toLocaleDateString() : 'Select Date of Birth'}</Text></TouchableOpacity>
                             </View>
                        </CardContent>
                    </Card>

                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Contact & Address</CardTitle></CardHeader>
                        <CardContent>
                            <Controller name="contactNo" control={control} render={({ field: { onChange, value } }) => <Input label="Contact No." value={value} onChangeText={onChange} keyboardType="phone-pad" required />} />
                            <Controller name="street" control={control} render={({ field: { onChange, value } }) => <Input label="Street Address" value={value} onChangeText={onChange} required />} />
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>Province</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('provinceCode')} style={styles.pickerButton}><Text style={styles.pickerText}>{provinces.find(p=>p.code === watchAllFields.provinceCode)?.name || 'Select Province'}</Text></TouchableOpacity>
                            </View>
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>City/Municipality</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('cityMunicipalityCode')} style={styles.pickerButton} disabled={!watchAllFields.provinceCode}><Text style={styles.pickerText}>{cities.find(c=>c.code === watchAllFields.cityMunicipalityCode)?.name || 'Select City/Municipality'}</Text></TouchableOpacity>
                            </View>
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>Barangay</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('barangayCode')} style={styles.pickerButton} disabled={!watchAllFields.cityMunicipalityCode}><Text style={styles.pickerText}>{barangays.find(b=>b.code === watchAllFields.barangayCode)?.name || 'Select Barangay'}</Text></TouchableOpacity>
                            </View>
                        </CardContent>
                    </Card>
                    
                    <Card style={styles.card}>
                         <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
                         <CardContent>
                            <View style={styles.pickerWrapper}><PickerLabel>Civil Status</PickerLabel><TouchableOpacity onPress={() => openPicker('civilStatus')} style={styles.pickerButton}><Text style={styles.pickerText}>{watchAllFields.civilStatus || 'Select Civil Status'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Gender Identity</PickerLabel><TouchableOpacity onPress={() => openPicker('genderIdentity')} style={styles.pickerButton}><Text style={styles.pickerText}>{watchAllFields.genderIdentity || 'Select Gender Identity'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Pronouns</PickerLabel><TouchableOpacity onPress={() => openPicker('pronouns')} style={styles.pickerButton}><Text style={styles.pickerText}>{watchAllFields.pronouns || 'Select Pronouns'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Assigned Sex at Birth</PickerLabel><TouchableOpacity onPress={() => openPicker('assignedSexAtBirth')} style={styles.pickerButton}><Text style={styles.pickerText}>{watchAllFields.assignedSexAtBirth || 'Select Assigned Sex at Birth'}</Text></TouchableOpacity></View>
                            <Controller name="religion" control={control} render={({ field: { onChange, value } }) => <Input label="Religion" value={value} onChangeText={onChange} />} />
                            <Controller name="occupation" control={control} render={({ field: { onChange, value } }) => <Input label="Occupation" value={value} onChangeText={onChange} />} />
                            <Controller name="philhealthNo" control={control} render={({ field: { onChange, value } }) => <Input label="PhilHealth No." value={value} onChangeText={onChange} />} />
                         </CardContent>
                    </Card>

                    <Button title={isSaving ? "Saving..." : "Save Changes"} onPress={handleSubmit(onSubmit)} disabled={isSaving} size="xl" style={{marginTop: 8}}/>
                </ScrollView>
            </KeyboardAvoidingView>

            <CustomPicker visible={isPickerVisible} onClose={() => setPickerVisible(false)} height="50%">
                <Text style={styles.modalHeader}>Select {pickerTitle}</Text>
                <View style={styles.searchInputContainer}>
                    <RNTextInput placeholder="Search..." value={searchTerm} onChangeText={setSearchTerm} style={styles.searchInput} placeholderTextColor={theme.colors.mutedForeground} />
                </View>
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {pickerData.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                        <PickerRow key={item.name} label={item.name} isSelected={tempSelectedItem?.name === item.name} onPress={() => handleTempPickerSelect(item)} />
                    ))}
                </ScrollView>
                <Button title="Done" variant="default" size="xl" onPress={confirmPickerSelection} style={{marginTop: 16}} />
            </CustomPicker>

            <CustomPicker visible={isDatePickerVisible} onClose={() => setDatePickerVisibility(false)} height="45%">
                <DateTimePicker value={tempDate || new Date()} mode="date" display="spinner" onChange={handleTempDateChange} textColor={theme.colors.foreground} />
                <Button title="Done" variant="default" size="xl" onPress={confirmDateSelection} style={{marginTop: 16}} />
            </CustomPicker>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background },
    container: { paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.background, paddingBottom: 40 },
    card: { marginBottom: theme.spacing.xl },
    cardTitle: { color: theme.colors.secondary },
    pickerWrapper: { width: '100%', marginBottom: theme.spacing.lg },
    pickerLabel: { ...theme.typography.small, color: theme.colors.foreground, marginBottom: theme.spacing.sm, fontWeight: '500' },
    pickerButton: { width: '100%', height: 50, justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md },
    pickerText: { fontSize: 16, color: theme.colors.foreground },
    helperText: { ...theme.typography.small, color: theme.colors.mutedForeground, fontSize: 12, marginTop: theme.spacing.xs, paddingHorizontal: 4 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
    bottomSheetContainer: { width: '100%', backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg, paddingHorizontal: theme.spacing.xl, paddingBottom: 40 },
    grabber: { width: 48, height: 5, backgroundColor: theme.colors.border, borderRadius: theme.radius.full, alignSelf: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg },
    modalHeader: { ...theme.typography.h3, marginBottom: 15, textAlign: 'center', fontFamily: theme.typography.fontFamilySemiBold },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
    searchInput: { flex: 1, height: 40, fontSize: 16, color: theme.colors.foreground, },
    pickerItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.sm },
    pickerItemSelected: { backgroundColor: 'rgba(255, 77, 109, 0.1)' },
    radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    radioCircleSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    pickerItemText: { fontSize: 16, color: theme.colors.foreground },
    pickerItemTextSelected: { fontFamily: theme.typography.fontFamilySemiBold, color: theme.colors.primary },
});