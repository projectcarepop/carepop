import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme, Button } from '../components';
import { addMedication } from '../data/api/medication';
import { HealthBuddyStackParamList } from '../navigation/AppNavigator';

type AddMedicationNavigationProp = NativeStackNavigationProp<HealthBuddyStackParamList, 'AddMedication'>;

export function AddMedicationScreen() {
    const navigation = useNavigation<AddMedicationNavigationProp>();
    const [name, setName] = useState('');
    const [dosage, setDosage] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async () => {
        if (!name.trim()) {
            Alert.alert('Required', 'Please enter a medication name.');
            return;
        }

        setIsSaving(true);
        const newMed = await addMedication(name.trim(), dosage.trim());
        setIsSaving(false);

        if (newMed) {
            Alert.alert('Success', `${newMed.name} has been added to your list.`);
            navigation.goBack();
        }
        // Error alerts are handled in the API function
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.screenTitle}>Add New Medication</Text>
                
                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Medication Name</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., Lisinopril"
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={name}
                        onChangeText={setName}
                        autoCapitalize="words"
                    />
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.label}>Dosage (Optional)</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="e.g., 10mg, once daily"
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={dosage}
                        onChangeText={setDosage}
                    />
                </View>

                <Button
                    title={isSaving ? 'Saving...' : 'Save Medication'}
                    onPress={handleSave}
                    disabled={isSaving}
                    style={styles.saveButton}
                    icon={isSaving ? <ActivityIndicator color={theme.colors.primaryForeground} /> : undefined}
                />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        flex: 1,
        padding: 20,
    },
    screenTitle: {
        ...theme.typography.h2,
        color: theme.colors.foreground,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        marginBottom: 8,
    },
    input: {
        ...theme.typography.body,
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        padding: 12,
        color: theme.colors.foreground,
    },
    saveButton: {
        marginTop: 20,
    },
}); 