import React, { useState, useMemo } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert, KeyboardAvoidingView, Platform, Pressable, DimensionValue, TextInput as RNTextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView, AnimatePresence } from 'moti';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '../src/components/button.native';
import { theme } from '../src/components/theme';
import { Input as CustomInput } from '../src/components/text-input.native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Check, Search } from 'lucide-react-native';
import { Card, CardHeader, CardContent, CardTitle } from '../src/components/card.native';
import type { RootStackParamList } from '../src/navigation/AppNavigator';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { apiClient } from '../src/utils/api';
import { useAuth } from '../src/context/AuthContext';

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

// --- Helper Components ---
const CustomToast = ({ message, visible, type }: { message: string, visible: boolean, type: 'success' | 'error' }) => {
    if (!visible) return null;
    return <MotiView from={{ opacity: 0, translateY: 20 }} animate={{ opacity: 1, translateY: 0 }} exit={{ opacity: 0, translateY: 20 }} style={[styles.toastContainer, type === 'success' ? styles.toastSuccess : styles.toastError]}><Text style={styles.toastText}>{message}</Text></MotiView>;
};

const PickerLabel = ({ children, required }: { children: React.ReactNode, required?: boolean }) => (
    <Text style={styles.pickerLabel}>{children}{required && <Text style={{ color: theme.colors.destructive }}> *</Text>}</Text>
);

const PickerRow = ({ label, isSelected, onPress }: {label: string, isSelected: boolean, onPress: () => void}) => (
    <TouchableOpacity onPress={onPress} style={[styles.pickerItem, isSelected && styles.pickerItemSelected]}>
        <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>{isSelected && <Check color={theme.colors.primaryForeground} size={14} />}</View>
        <Text style={[styles.pickerItemText, isSelected && styles.pickerItemTextSelected]}>{label}</Text>
    </TouchableOpacity>
);

const CustomPicker = ({ visible, onClose, children, height = '80%' }: { visible: boolean; onClose: () => void; children: React.ReactNode; height?: DimensionValue; }) => (
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

const initialFormState = {
    firstName: '', lastName: '', middleInitial: '', dateOfBirth: null as Date | null,
    contactNo: '', street: '', selectedProvince: '', selectedCity: '', selectedBarangay: '',
    civilStatus: '', religion: '', occupation: '', philhealthNo: '',
    genderIdentity: '', pronouns: '', assignedSexAtBirth: '',
};

// --- Main Component ---
const NewCreateProfileScreen = () => {
    const { session } = useAuth();
    const queryClient = useQueryClient();
    const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList, 'CreateProfile'>>();
    
    const [formState, setFormState] = useState({
        ...initialFormState,
        firstName: session?.user?.user_metadata.first_name || '',
        lastName: session?.user?.user_metadata.last_name || '',
    });

    // UI State
    const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
    const [tempDate, setTempDate] = useState<Date | null>(null);
    const [isPickerVisible, setPickerVisible] = useState(false);
    const [pickerData, setPickerData] = useState<PickerItem[]>([]);
    const [pickerType, setPickerType] = useState<PickerType | null>(null);
    const [pickerTitle, setPickerTitle] = useState('');
    const [searchTerm, setSearchTerm] = useState('');
    const [tempSelectedItem, setTempSelectedItem] = useState<PickerItem | null>(null);
    const [toast, setToast] = useState({ visible: false, message: '', type: 'success' as 'success' | 'error' });
    
    const provinces: PickerItem[] = useMemo(() => Array.isArray(provinceJson) ? provinceJson.map((p: any) => ({ name: p.province_name, code: p.province_code })) : [], []);
    const cities: PickerItem[] = useMemo(() => Array.isArray(cityJson) ? cityJson.map((c: any) => ({ name: c.city_name, code: c.city_code })) : [], []);
    const barangays: PickerItem[] = useMemo(() => Array.isArray(barangayJson) ? barangayJson.map((b: any) => ({ name: b.brgy_name, code: b.brgy_code })) : [], []);
    
    const showToast = (message: string, type: 'success' | 'error') => {
        setToast({ visible: true, message, type });
        setTimeout(() => setToast({ visible: false, message: '', type }), 3000);
    };

    const { mutate: createProfile, isPending: isSaving } = useMutation({
        mutationFn: async (profileData: typeof formState) => {
            const { dateOfBirth } = profileData;
            if (!dateOfBirth) throw new Error("Date of birth is required.");

            const payload = {
                first_name: profileData.firstName,
                last_name: profileData.lastName,
                middle_initial: profileData.middleInitial,
                date_of_birth: dateOfBirth.toISOString().split('T')[0],
                contact_no: profileData.contactNo,
                address_line_1: profileData.street,
                province: profileData.selectedProvince,
                city: profileData.selectedCity,
                barangay: profileDatarangay,
                civil_status: profileData.civilStatus,
                religion: profileData.religion,
                occupation: profileData.occupation,
                philhealth_no: profileData.philhealthNo,
                gender_identity: profileData.genderIdentity,
                pronouns: profileData.pronouns,
                sex: profileData.assignedSexAtBirth,
            };
            
            const res = await (apiClient as any).api.me.profile.$post({ json: payload });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create profile.');
            }
            return res.json();
        },
        onSuccess: () => {
            showToast("Profile created successfully!", "success");
            queryClient.invalidateQueries({ queryKey: ['userProfile'] });
            setTimeout(() => {
                navigation.reset({ index: 0, routes: [{ name: 'Main' }] });
            }, 1500);
        },
        onError: (error) => {
            showToast((error as Error).message || "An unexpected error occurred.", "error");
        }
    });

    const handleCreateProfile = () => {
        const requiredFields: (keyof typeof formState)[] = ['firstName', 'lastName', 'dateOfBirth', 'contactNo', 'street', 'selectedProvince', 'selectedCity', 'selectedBarangay'];
        const missingField = requiredFields.find(field => !formState[field]);

        if (missingField) {
            const fieldName = missingField.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            showToast(`${fieldName} is required.`, 'error');
            return;
        }
        createProfile(formState);
    };

    // --- Picker Logic ---
    const showDatePicker = () => { setTempDate(formState.dateOfBirth || new Date()); setDatePickerVisibility(true); };
    const handleTempDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => { if (selectedDate) setTempDate(selectedDate); };
    const confirmDateSelection = () => { setFormState(s => ({...s, dateOfBirth: tempDate})); setDatePickerVisibility(false); };

    const openPicker = (type: PickerType) => {
        setPickerType(type);
        setPickerTitle(pickerTypeToTitleMap[type]);
        setSearchTerm('');
        let data: PickerItem[] = [];
        let currentSelection: PickerItem | null = null;
        switch (type) {
            case 'province': data = provinces; currentSelection = { name: formState.selectedProvince }; break;
            case 'city':
                const provinceCode = provinces.find(p => p.name === formState.selectedProvince)?.code;
                data = provinceCode ? cities.filter(c => c.code?.startsWith(provinceCode)) : [];
                currentSelection = { name: formState.selectedCity }; break;
            case 'barangay':
                const cityCode = cities.find(c => c.name === formState.selectedCity)?.code;
                data = cityCode ? barangays.filter(b => b.code?.startsWith(cityCode)) : [];
                currentSelection = { name: formState.selectedBarangay }; break;
            case 'civilStatus': data = civilStatusOptions.map(name => ({ name })); currentSelection = { name: formState.civilStatus }; break;
            case 'genderIdentity': data = genderIdentityOptions.map(name => ({ name })); currentSelection = { name: formState.genderIdentity }; break;
            case 'pronouns': data = pronounsOptions.map(name => ({ name })); currentSelection = { name: formState.pronouns }; break;
            case 'assignedSex': data = assignedSexOptions.map(name => ({ name })); currentSelection = { name: formState.assignedSexAtBirth }; break;
        }
        setPickerData(data);
        setTempSelectedItem(currentSelection);
        setPickerVisible(true);
    };

    const handlePickerSelect = (item: PickerItem) => {
        switch (pickerType) {
            case 'province': setFormState(s => ({...s, selectedProvince: item.name, selectedCity: '', selectedBarangay: ''})); break;
            case 'city': setFormState(s => ({...s, selectedCity: item.name, selectedBarangay: ''})); break;
            case 'barangay': setFormState(s => ({...s, selectedBarangay: item.name})); break;
            case 'civilStatus': setFormState(s => ({...s, civilStatus: item.name})); break;
            case 'genderIdentity': setFormState(s => ({...s, genderIdentity: item.name})); break;
            case 'pronouns': setFormState(s => ({...s, pronouns: item.name})); break;
            case 'assignedSex': setFormState(s => ({...s, assignedSexAtBirth: item.name})); break;
        }
    };
    
    const handleTempPickerSelect = (item: PickerItem) => setTempSelectedItem(item);
    const confirmPickerSelection = () => { if (tempSelectedItem) { handlePickerSelect(tempSelectedItem); } setPickerVisible(false); };

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    <Text style={styles.screenTitle}>Create Your Profile</Text>
                    <Text style={styles.screenDescription}>This information helps us tailor your experience.</Text>
                    
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Personal Information</CardTitle></CardHeader>
                        <CardContent>
                            <CustomInput label="First Name" value={formState.firstName} onChangeText={(text) => setFormState(s => ({...s, firstName: text}))} required editable={!isSaving} />
                            <CustomInput label="Middle Initial" value={formState.middleInitial} onChangeText={(text) => setFormState(s => ({...s, middleInitial: text}))} maxLength={5} editable={!isSaving} />
                            <CustomInput label="Last Name" value={formState.lastName} onChangeText={(text) => setFormState(s => ({...s, lastName: text}))} required editable={!isSaving} />
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>Date of Birth</PickerLabel>
                                <TouchableOpacity onPress={showDatePicker} style={styles.pickerButton} disabled={isSaving}><Text style={styles.pickerText}>{formState.dateOfBirth ? formState.dateOfBirth.toLocaleDateString() : 'Select Date of Birth'}</Text></TouchableOpacity>
                            </View>
                        </CardContent>
                    </Card>
                    
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Contact & Address</CardTitle></CardHeader>
                        <CardContent>
                            <CustomInput label="Contact No." value={formState.contactNo} onChangeText={(text) => setFormState(s => ({...s, contactNo: text}))} keyboardType="phone-pad" required editable={!isSaving} />
                            <CustomInput label="Street Address" value={formState.street} onChangeText={(text) => setFormState(s => ({...s, street: text}))} required editable={!isSaving} />
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>Province</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('province')} style={styles.pickerButton} disabled={isSaving}><Text style={styles.pickerText}>{formState.selectedProvince || 'Select Province'}</Text></TouchableOpacity>
                            </View>
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>City/Municipality</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('city')} style={[styles.pickerButton, !formState.selectedProvince && styles.disabledButton]} disabled={isSaving || !formState.selectedProvince}><Text style={styles.pickerText}>{formState.selectedCity || 'Select City/Municipality'}</Text></TouchableOpacity>
                            </View>
                             <View style={styles.pickerWrapper}>
                                <PickerLabel required>Barangay</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('barangay')} style={[styles.pickerButton, !formState.selectedCity && styles.disabledButton]} disabled={isSaving || !formState.selectedCity}><Text style={styles.pickerText}>{formState.selectedBarangay || 'Select Barangay'}</Text></TouchableOpacity>
                            </View>
                        </CardContent>
                    </Card>
                    
                     <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
                        <CardContent>
                            <View style={styles.pickerWrapper}><PickerLabel>Civil Status</PickerLabel><TouchableOpacity onPress={() => openPicker('civilStatus')} style={styles.pickerButton} disabled={isSaving}><Text style={styles.pickerText}>{formState.civilStatus || 'Select Civil Status'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Gender Identity</PickerLabel><TouchableOpacity onPress={() => openPicker('genderIdentity')} style={styles.pickerButton} disabled={isSaving}><Text style={styles.pickerText}>{formState.genderIdentity || 'Select Gender Identity'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Pronouns</PickerLabel><TouchableOpacity onPress={() => openPicker('pronouns')} style={styles.pickerButton} disabled={isSaving}><Text style={styles.pickerText}>{formState.pronouns || 'Select Pronouns'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Assigned Sex at Birth</PickerLabel><TouchableOpacity onPress={() => openPicker('assignedSex')} style={styles.pickerButton} disabled={isSaving}><Text style={styles.pickerText}>{formState.assignedSexAtBirth || 'Select Assigned Sex at Birth'}</Text></TouchableOpacity></View>
                            <CustomInput label="Religion" value={formState.religion} onChangeText={(text) => setFormState(s => ({...s, religion: text}))} editable={!isSaving} />
                            <CustomInput label="Occupation" value={formState.occupation} onChangeText={(text) => setFormState(s => ({...s, occupation: text}))} editable={!isSaving} />
                            <CustomInput label="PhilHealth No." value={formState.philhealthNo} onChangeText={(text) => setFormState(s => ({...s, philhealthNo: text}))} helperText="Optional. Used for insurance claims." editable={!isSaving} />
                        </CardContent>
                    </Card>
                     <View style={styles.footer}>
                        <Button title={isSaving ? 'Saving...' : 'Create Profile'} onPress={handleCreateProfile} disabled={isSaving} style={{ flex: 1 }} />
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
            
            <CustomPicker visible={isPickerVisible} onClose={() => setPickerVisible(false)} height="50%">
                <Text style={styles.modalHeader}>Select {pickerTitle}</Text>
                <View style={styles.searchInputContainer}>
                  <Search color={theme.colors.mutedForeground} size={20} style={styles.searchIcon} />
                  <RNTextInput
                    placeholder="Search..."
                    value={searchTerm}
                    onChangeText={setSearchTerm}
                    style={styles.searchInput}
                    placeholderTextColor={theme.colors.mutedForeground}
                  />
                </View>
                <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
                    {pickerData.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase())).map(item => (
                        <PickerRow key={item.name} label={item.name} isSelected={tempSelectedItem?.name === item.name} onPress={() => handleTempPickerSelect(item)} />
                    ))}
                </ScrollView>
                 <Button title="Done" variant="default" size="xl" onPress={confirmPickerSelection} style={{marginTop: 16}} />
            </CustomPicker>

            {isDatePickerVisible && (
                 <CustomPicker visible={isDatePickerVisible} onClose={() => setDatePickerVisibility(false)} height="45%">
                    <DateTimePicker value={tempDate || new Date()} mode="date" display="spinner" onChange={handleTempDateChange} textColor={theme.colors.foreground} />
                    <Button title="Done" variant="default" size="xl" onPress={confirmDateSelection} style={{marginTop: 16}} />
                </CustomPicker>
            )}

            <AnimatePresence>
                {toast.visible && <CustomToast message={toast.message} visible={toast.visible} type={toast.type} />}
            </AnimatePresence>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: { paddingVertical: theme.spacing.xl, paddingHorizontal: theme.spacing.lg, backgroundColor: theme.colors.background, paddingBottom: 40 },
    screenTitle: { ...theme.typography.h1, textAlign: 'center', marginBottom: theme.spacing.sm, color: theme.colors.secondary },
    screenDescription: { ...theme.typography.body, textAlign: 'center', color: theme.colors.foreground, marginBottom: theme.spacing.xl },
    card: { marginBottom: theme.spacing.xl },
    cardTitle: { color: theme.colors.secondary },
    pickerWrapper: { width: '100%', marginBottom: theme.spacing.lg },
    pickerLabel: { ...theme.typography.small, color: theme.colors.foreground, marginBottom: theme.spacing.sm, fontWeight: '500' },
    pickerButton: { width: '100%', height: 50, justifyContent: 'center', paddingHorizontal: theme.spacing.md, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md },
    disabledButton: { backgroundColor: theme.colors.muted, opacity: 0.7 },
    pickerText: { fontSize: 16, color: theme.colors.foreground },
    helperText: { ...theme.typography.small, color: theme.colors.mutedForeground, fontSize: 12, marginTop: theme.spacing.xs, paddingHorizontal: 4 },
    modalBackdrop: { ...StyleSheet.absoluteFillObject, justifyContent: 'flex-end', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 10 },
    bottomSheetContainer: { width: '100%', backgroundColor: theme.colors.background, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg, paddingHorizontal: theme.spacing.xl, paddingBottom: 40 },
    grabber: { width: 48, height: 5, backgroundColor: theme.colors.border, borderRadius: theme.radius.full, alignSelf: 'center', marginTop: theme.spacing.sm, marginBottom: theme.spacing.lg },
    modalHeader: { ...theme.typography.h3, marginBottom: 15, textAlign: 'center', fontFamily: theme.typography.fontFamilySemiBold },
    searchInputContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: theme.colors.card, borderRadius: theme.radius.full, paddingHorizontal: theme.spacing.lg, borderWidth: 1, borderColor: theme.colors.border, marginBottom: 16 },
    searchInput: { flex: 1, height: 40, fontSize: 16, color: theme.colors.foreground },
    searchIcon: { marginRight: theme.spacing.sm },
    pickerItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.sm },
    pickerItemSelected: { backgroundColor: 'rgba(255, 77, 109, 0.1)' },
    radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    radioCircleSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    pickerItemText: { fontSize: 16, color: theme.colors.foreground },
    pickerItemTextSelected: { fontFamily: theme.typography.fontFamilySemiBold, color: theme.colors.primary },
    toastContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, padding: 16, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', zIndex: 9999, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    toastSuccess: { backgroundColor: theme.colors.success },
    toastError: { backgroundColor: theme.colors.destructive },
    toastText: { color: theme.colors.primaryForeground, ...theme.typography.small, fontWeight: '500' },
    footer: { marginTop: theme.spacing.xl, padding: theme.spacing.lg },
});

export default NewCreateProfileScreen; 