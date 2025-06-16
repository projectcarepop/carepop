import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { theme, Button, Card, Checkbox } from '../components';
import { upsertSymptomsApi } from '../data/api/menstrual';

const SYMPTOM_OPTIONS = [
    { id: 'cramps', label: 'Cramps' },
    { id: 'bloating', label: 'Bloating' },
    { id: 'headache', label: 'Headache' },
    { id: 'fatigue', label: 'Fatigue' },
    { id: 'mood_swings', label: 'Mood Swings' },
    { id: 'acne', label: 'Acne' },
    { id: 'nausea', label: 'Nausea' },
    { id: 'back_pain', label: 'Back Pain' },
];

export function LogSymptomsScreen() {
    const navigation = useNavigation();
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [notes, setNotes] = useState('');
    const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
    const [isSaving, setIsSaving] = useState(false);

    // In a real app, you would fetch existing logs for the selected date here
    // to pre-populate the form. For simplicity, we'll start fresh each time.

    const toggleSymptom = (symptomId: string) => {
        setSelectedSymptoms(prev =>
            prev.includes(symptomId)
                ? prev.filter(id => id !== symptomId)
                : [...prev, symptomId]
        );
    };

    const handleSave = async () => {
        if (selectedSymptoms.length === 0) {
            Alert.alert('No Symptoms', 'Please select at least one symptom to log.');
            return;
        }
        setIsSaving(true);
        const success = await upsertSymptomsApi(logDate, selectedSymptoms, notes);
        if (success) {
            Alert.alert('Success', 'Your symptoms have been logged.');
            navigation.goBack();
        }
        setIsSaving(false);
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.screenTitle}>Log Symptoms</Text>
                
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Date</Text>
                    {/* Date picker would go here. For now, we default to today */}
                    <Text style={styles.dateText}>{new Date(logDate).toLocaleDateString()}</Text>
                </Card>
                
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Select Symptoms</Text>
                    <View style={styles.symptomsContainer}>
                        {SYMPTOM_OPTIONS.map(symptom => (
                            <TouchableOpacity
                                key={symptom.id}
                                style={styles.symptomChip}
                                onPress={() => toggleSymptom(symptom.id)}
                            >
                                <Checkbox
                                    checked={selectedSymptoms.includes(symptom.id)}
                                    onChange={() => toggleSymptom(symptom.id)}
                                    label={symptom.label}
                                    labelStyle={styles.symptomLabel}
                                />
                            </TouchableOpacity>
                        ))}
                    </View>
                </Card>

                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Notes (Optional)</Text>
                    <TextInput
                        style={styles.notesInput}
                        placeholder="Any additional details..."
                        value={notes}
                        onChangeText={setNotes}
                        multiline
                    />
                </Card>

                <Button
                    title={isSaving ? 'Saving...' : 'Save Log'}
                    onPress={handleSave}
                    disabled={isSaving}
                    variant="primary"
                    styleType="solid"
                    style={styles.saveButton}
                    icon={isSaving ? <ActivityIndicator color={theme.colors.background} /> : undefined}
                />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 20, paddingBottom: 40 },
    screenTitle: { fontSize: 24, fontWeight: 'bold', color: theme.colors.text, marginBottom: 20, textAlign: 'center' },
    card: { padding: 15, marginBottom: 20 },
    cardTitle: { fontSize: 18, fontWeight: '600', color: theme.colors.text, marginBottom: 10 },
    dateText: { fontSize: 16, color: theme.colors.primary },
    symptomsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start',
    },
    symptomChip: {
        width: '50%',
        marginBottom: 10,
    },
    symptomLabel: {
        fontSize: 16,
    },
    notesInput: {
        backgroundColor: theme.colors.card,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: 12,
        fontSize: 16,
        color: theme.colors.text,
        minHeight: 100,
        textAlignVertical: 'top',
    },
    saveButton: { marginTop: 10 },
}); 