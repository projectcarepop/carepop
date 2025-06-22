import React, { useState, useEffect, useMemo, useLayoutEffect } from 'react';
import { View, Text, SafeAreaView, TouchableOpacity, ScrollView, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, DimensionValue, TextInput as RNTextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { MotiView, AnimatePresence } from 'moti';
import { useUser, useAuth } from '@clerk/clerk-expo';
import { Button } from '../components/button.native';
import { theme } from '../components/theme';
import { Input as CustomInput } from '../components/text-input.native';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { Check, Search, ArrowLeft } from 'lucide-react-native';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';
import api, { getClerkHeaders } from '../utils/api';

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

type PickerType = 'province' | 'city' | 'barangay' | 'civilStatus' | 'genderIdentity' | 'pronouns' | 'assignedSex';

// --- ADDED: Map for user-friendly titles ---
const pickerTypeToTitleMap: Record<PickerType, string> = {
    province: "Province",
    city: "City/Municipality",
    barangay: "Barangay",
    civilStatus: "Civil Status",
    genderIdentity: "Gender Identity",
    pronouns: "Pronouns",
    assignedSex: "Assigned Sex at Birth"
};

// --- Helper Components ---
const CustomToast = ({ message, visible, type }: { message: string, visible: boolean, type: 'success' | 'error' }) => {
    if (!visible) return null;
    return (
        <View style={[styles.toastContainer, type === 'success' ? styles.toastSuccess : styles.toastError]}>
            <Text style={styles.toastText}>{message}</Text>
        </View>
    );
};

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

const CustomPicker = ({
  visible,
  onClose,
  children,
  height = '80%'
}: {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  height?: DimensionValue;
}) => {
  return (
    <AnimatePresence>
      {visible && (
        <Pressable onPress={onClose} style={styles.modalBackdrop}>
          <MotiView
            from={{ translateY: 800 }}
            animate={{ translateY: 0 }}
            exit={{ translateY: 800 }}
            transition={{ type: 'timing', duration: 400 }}
            style={[styles.bottomSheetContainer, { height }]}
            onStartShouldSetResponder={() => true}
          >
            <View style={styles.grabber} />
            {children}
          </MotiView>
        </Pressable>
      )}
    </AnimatePresence>
  );
};

export const EditProfileScreen = () => {
    const { user, isLoaded } = useUser();
    const { getToken } = useAuth();
    const navigation = useNavigation();

    // Form State
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [middleInitial, setMiddleInitial] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState<Date | null>(null);
    const [contactNo, setContactNo] = useState('');
    const [street, setStreet] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedBarangay, setSelectedBarangay] = useState('');
    const [civilStatus, setCivilStatus] = useState('');
    const [religion, setReligion] = useState('');
    const [occupation, setOccupation] = useState('');
    const [philhealthNo, setPhilhealthNo] = useState('');
    const [genderIdentity, setGenderIdentity] = useState('');
    const [pronouns, setPronouns] = useState('');
    const [assignedSexAtBirth, setAssignedSexAtBirth] = useState('');

    // UI State
    const [isSaving, setIsSaving] = useState(false);
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

    // Effect to populate form with user data from Clerk
    useEffect(() => {
        if (user) {
            const metadata = user.publicMetadata;
            const dob = metadata.date_of_birth as string | undefined;
            
            setFirstName(user.firstName || '');
            setLastName(user.lastName || '');
            setMiddleInitial(metadata.middle_initial as string || '');
            setDateOfBirth(dob ? new Date(`${dob}T00:00:00`) : null);
            setContactNo(metadata.contact_no as string || '');
            setStreet(metadata.street as string || '');
            setSelectedProvince(provinces.find(p => p.code === metadata.province_code)?.name || '');
            setSelectedCity(cities.find(c => c.code === metadata.city_municipality_code)?.name || '');
            setSelectedBarangay(barangays.find(b => b.code === metadata.barangay_code)?.name || '');
            setCivilStatus(metadata.civil_status as string || '');
            setReligion(metadata.religion as string || '');
            setOccupation(metadata.occupation as string || '');
            setPhilhealthNo(metadata.philhealth_no as string || '');
            setGenderIdentity(metadata.gender_identity as string || '');
            setPronouns(metadata.pronouns as string || '');
            setAssignedSexAtBirth(metadata.assigned_sex_at_birth as string || '');
        }
    }, [user, isLoaded]);
    

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const profileData = {
                first_name: firstName,
                last_name: lastName,
                middle_initial: middleInitial,
                date_of_birth: dateOfBirth ? dateOfBirth.toISOString().split('T')[0] : null,
                contact_no: contactNo,
                street: street,
                province_code: provinces.find(p => p.name === selectedProvince)?.code || null,
                city_municipality_code: cities.find(c => c.name === selectedCity)?.code || null,
                barangay_code: barangays.find(b => b.code === selectedBarangay)?.code || null,
                civil_status: civilStatus,
                religion: religion,
                occupation: occupation,
                philhealth_no: philhealthNo,
                gender_identity: genderIdentity,
                pronouns: pronouns,
                assigned_sex_at_birth: assignedSexAtBirth,
                age: dateOfBirth ? new Date(new Date().getTime() - dateOfBirth.getTime()).getUTCFullYear() - 1970 : null,
            };

            await api.post('/profiles', profileData, getToken);

            await user?.reload(); // Reload user data to reflect changes
            showToast("Profile updated successfully!", 'success');
            navigation.goBack(); // Go back to the profile view screen

        } catch (error) {
            console.error("Failed to update profile:", error);
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            showToast(`Failed to update profile: ${message}`, 'error');
        } finally {
            setIsSaving(false);
        }
    };
    
    const showDatePicker = () => { setTempDate(dateOfBirth || new Date()); setDatePickerVisibility(true); };
    const handleTempDateChange = (_: DateTimePickerEvent, selectedDate?: Date) => { if (selectedDate) setTempDate(selectedDate); };
    const confirmDateSelection = () => { setDateOfBirth(tempDate); setDatePickerVisibility(false); };

    const openPicker = (type: PickerType) => {
        setPickerType(type);
        setPickerTitle(pickerTypeToTitleMap[type]);
        setSearchTerm('');
        let data: PickerItem[] = [];
        let currentSelection: PickerItem | null = null;
        switch (type) {
            case 'province': data = provinces; currentSelection = { name: selectedProvince }; break;
            case 'city':
                const provinceCode = provinces.find(p => p.name === selectedProvince)?.code;
                data = provinceCode ? cities.filter(c => c.code?.startsWith(provinceCode)) : [];
                currentSelection = { name: selectedCity }; break;
            case 'barangay':
                const cityCode = cities.find(c => c.name === selectedCity)?.code;
                data = cityCode ? barangays.filter(b => b.code?.startsWith(cityCode)) : [];
                currentSelection = { name: selectedBarangay }; break;
            case 'civilStatus': data = civilStatusOptions.map(name => ({ name })); currentSelection = { name: civilStatus }; break;
            case 'genderIdentity': data = genderIdentityOptions.map(name => ({ name })); currentSelection = { name: genderIdentity }; break;
            case 'pronouns': data = pronounsOptions.map(name => ({ name })); currentSelection = { name: pronouns }; break;
            case 'assignedSex': data = assignedSexOptions.map(name => ({ name })); currentSelection = { name: assignedSexAtBirth }; break;
        }
        setPickerData(data);
        setTempSelectedItem(currentSelection);
        setPickerVisible(true);
    };

    const handlePickerSelect = (item: PickerItem) => {
        switch (pickerType) {
            case 'province': setSelectedProvince(item.name); setSelectedCity(''); setSelectedBarangay(''); break;
            case 'city': setSelectedCity(item.name); setSelectedBarangay(''); break;
            case 'barangay': setSelectedBarangay(item.name); break;
            case 'civilStatus': setCivilStatus(item.name); break;
            case 'genderIdentity': setGenderIdentity(item.name); break;
            case 'pronouns': setPronouns(item.name); break;
            case 'assignedSex': setAssignedSexAtBirth(item.name); break;
        }
    };
    
    const handleTempPickerSelect = (item: PickerItem) => setTempSelectedItem(item);
    const confirmPickerSelection = () => { if (tempSelectedItem) { handlePickerSelect(tempSelectedItem); } setPickerVisible(false); };

    if (!isLoaded) {
        return (
            <SafeAreaView style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={{flex: 1, backgroundColor: theme.colors.background}}>
            <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
                <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
                    
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Personal Information</CardTitle></CardHeader>
                        <CardContent>
                            <CustomInput label="First Name" value={firstName} onChangeText={setFirstName} required />
                            <CustomInput label="Middle Initial" value={middleInitial} onChangeText={setMiddleInitial} maxLength={5} />
                            <CustomInput label="Last Name" value={lastName} onChangeText={setLastName} required />
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>Date of Birth</PickerLabel>
                                <TouchableOpacity onPress={showDatePicker} style={styles.pickerButton}><Text style={styles.pickerText}>{dateOfBirth ? dateOfBirth.toLocaleDateString() : 'Select Date of Birth'}</Text></TouchableOpacity>
                            </View>
                        </CardContent>
                    </Card>
                    
                    <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Contact & Address</CardTitle></CardHeader>
                        <CardContent>
                            <CustomInput label="Contact No." value={contactNo} onChangeText={setContactNo} keyboardType="phone-pad" required />
                            <CustomInput label="Street Address" value={street} onChangeText={setStreet} required />
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>Province</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('province')} style={styles.pickerButton}><Text style={styles.pickerText}>{selectedProvince || 'Select Province'}</Text></TouchableOpacity>
                            </View>
                            <View style={styles.pickerWrapper}>
                                <PickerLabel required>City/Municipality</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('city')} style={styles.pickerButton} disabled={!selectedProvince}><Text style={styles.pickerText}>{selectedCity || 'Select City/Municipality'}</Text></TouchableOpacity>
                            </View>
                             <View style={styles.pickerWrapper}>
                                <PickerLabel required>Barangay</PickerLabel>
                                <TouchableOpacity onPress={() => openPicker('barangay')} style={styles.pickerButton} disabled={!selectedCity}><Text style={styles.pickerText}>{selectedBarangay || 'Select Barangay'}</Text></TouchableOpacity>
                            </View>
                        </CardContent>
                    </Card>
                    
                     <Card style={styles.card}>
                        <CardHeader><CardTitle style={styles.cardTitle}>Identity & Other Info</CardTitle></CardHeader>
                        <CardContent>
                            <View style={styles.pickerWrapper}><PickerLabel>Civil Status</PickerLabel><TouchableOpacity onPress={() => openPicker('civilStatus')} style={styles.pickerButton}><Text style={styles.pickerText}>{civilStatus || 'Select Civil Status'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Gender Identity</PickerLabel><TouchableOpacity onPress={() => openPicker('genderIdentity')} style={styles.pickerButton}><Text style={styles.pickerText}>{genderIdentity || 'Select Gender Identity'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Pronouns</PickerLabel><TouchableOpacity onPress={() => openPicker('pronouns')} style={styles.pickerButton}><Text style={styles.pickerText}>{pronouns || 'Select Pronouns'}</Text></TouchableOpacity></View>
                            <View style={styles.pickerWrapper}><PickerLabel>Assigned Sex at Birth</PickerLabel><TouchableOpacity onPress={() => openPicker('assignedSex')} style={styles.pickerButton}><Text style={styles.pickerText}>{assignedSexAtBirth || 'Select Assigned Sex at Birth'}</Text></TouchableOpacity></View>
                            <CustomInput label="Religion" value={religion} onChangeText={setReligion} />
                            <CustomInput label="Occupation" value={occupation} onChangeText={setOccupation} />
                            <CustomInput label="PhilHealth No." value={philhealthNo} onChangeText={setPhilhealthNo} />
                        </CardContent>
                    </Card>
                     <Button title={isSaving ? "Saving..." : "Save Changes"} onPress={handleSave} disabled={isSaving} size="xl" style={{marginTop: 8}}/>
                </ScrollView>
            </KeyboardAvoidingView>
            
            <CustomPicker visible={isPickerVisible} onClose={() => setPickerVisible(false)} height="50%">
                <Text style={styles.modalHeader}>Select {pickerTitle}</Text>
                <View style={styles.searchInputContainer}>
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

            <CustomPicker visible={isDatePickerVisible} onClose={() => setDatePickerVisibility(false)} height="45%">
                <DateTimePicker value={tempDate || new Date()} mode="date" display="spinner" onChange={handleTempDateChange} textColor={theme.colors.foreground} />
                <Button title="Done" variant="default" size="xl" onPress={confirmDateSelection} style={{marginTop: 16}} />
            </CustomPicker>

            <CustomToast message={toast.message} visible={toast.visible} type={toast.type} />
        </SafeAreaView>
    );
};

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
    searchInput: {
      flex: 1,
      height: 40,
      fontSize: 16,
      color: theme.colors.foreground,
    },
    pickerItem: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.md, borderRadius: theme.radius.md, marginBottom: theme.spacing.sm },
    pickerItemSelected: { backgroundColor: 'rgba(255, 77, 109, 0.1)' },
    radioCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: theme.colors.border, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md },
    radioCircleSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    pickerItemText: { fontSize: 16, color: theme.colors.foreground },
    pickerItemTextSelected: { fontFamily: theme.typography.fontFamilySemiBold, color: theme.colors.primary },
    toastContainer: { position: 'absolute', bottom: 40, left: 20, right: 20, padding: 16, borderRadius: theme.radius.md, alignItems: 'center', justifyContent: 'center', opacity: 0.95, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.2, shadowRadius: 4 },
    toastSuccess: { backgroundColor: theme.colors.success },
    toastError: { backgroundColor: theme.colors.destructive },
    toastText: { color: theme.colors.primaryForeground, ...theme.typography.small, fontWeight: '500' },
});