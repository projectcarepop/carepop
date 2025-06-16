import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

import { theme, Button } from '../components';
import { addMedication } from '../data/api/medication';
import { HealthBuddyStackParamList } from '../navigation/AppNavigator';

type AddMedicationNavigationProp = NativeStackNavigationProp<HealthBuddyStackParamList, 'AddMedicationScreen'>;

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
                        value={dosage}
                        onChangeText={setDosage}
                    />
                </View>

                <Button
                    title={isSaving ? 'Saving...' : 'Save Medication'}
                    onPress={handleSave}
                    disabled={isSaving}
                    variant="primary"
                    styleType="solid"
                    style={styles.saveButton}
                    icon={isSaving ? <ActivityIndicator color={theme.colors.background} /> : undefined}
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
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: 20,
    },
    inputGroup: {
        marginBottom: 15,
    },
    label: {
        fontSize: 16,
        color: theme.colors.textMuted,
        marginBottom: 8,
    },
    input: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 12,
        fontSize: 16,
        color: theme.colors.text,
    },
    saveButton: {
        marginTop: 20,
    },
}); 