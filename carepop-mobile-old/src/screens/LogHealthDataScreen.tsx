import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../components/theme';
import { Button } from '../components/button.native';
import { Pill, Droplets, Smile, MessageSquare, Check, X } from 'lucide-react-native';
import api from '../utils/api';
import { useAuth } from '@clerk/clerk-expo';

type PillStatus = 'taken' | 'missed' | null;
type FlowIntensity = 'none' | 'light' | 'medium' | 'heavy' | null;
type Mood = 'happy' | 'neutral' | 'sad' | 'anxious' | 'energetic' | null;

const ALL_SYMPTOMS = ['cramps', 'bloating', 'acne', 'fatigue', 'headaches', 'nausea', 'sore breasts'];

const FormSection = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <View style={styles.sectionContainer}>
        <View style={styles.sectionHeader}>
            {icon}
            <Text style={styles.sectionTitle}>{title}</Text>
        </View>
        <View style={styles.sectionContent}>
            {children}
        </View>
    </View>
);

export default function LogHealthDataScreen({ navigation }: any) {
    const { getToken } = useAuth();
    const [pillStatus, setPillStatus] = useState<PillStatus>(null);
    const [flowIntensity, setFlowIntensity] = useState<FlowIntensity>(null);
    const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
    const [mood, setMood] = useState<Mood>(null);
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const handleSymptomToggle = (symptom: string) => {
        setSelectedSymptoms(prev => 
            prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
        );
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        const logData = {
            date: new Date().toISOString().split('T')[0], // YYYY-MM-DD
            pillStatus,
            flowIntensity,
            symptoms: selectedSymptoms,
            mood,
            notes,
        };
        
        try {
            // The api utility requires the getToken function directly
            await api.post('/health-logs', logData, getToken);
            console.log('Successfully saved log data.');
            navigation.goBack();
        } catch (error) {
            console.error('Failed to save health log:', error);
            // TODO: Add user-facing error feedback (e.g., a toast message)
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.header}>
                    <Text style={styles.headerTitle}>Log Your Day</Text>
                    <Text style={styles.headerSubtitle}>Track your health to uncover patterns.</Text>
                </View>

                <FormSection title="Pill Tracker" icon={<Pill size={20} color={theme.colors.primary} />}>
                    <View style={styles.toggleContainer}>
                        <Button title="Taken" onPress={() => setPillStatus('taken')} variant={pillStatus === 'taken' ? 'default' : 'outline'} icon={<Check size={16} />} />
                        <Button title="Missed" onPress={() => setPillStatus('missed')} variant={pillStatus === 'missed' ? 'destructive' : 'outline'} icon={<X size={16} />} />
                    </View>
                </FormSection>

                <FormSection title="Menstrual Flow" icon={<Droplets size={20} color={theme.colors.primary} />}>
                    <View style={styles.chipContainer}>
                        {(['none', 'light', 'medium', 'heavy'] as FlowIntensity[]).map(flow => (
                            <TouchableOpacity key={flow} onPress={() => setFlowIntensity(flow)} style={[styles.chip, flowIntensity === flow && styles.chipSelected]}>
                                <Text style={[styles.chipText, flowIntensity === flow && styles.chipTextSelected]}>{flow}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </FormSection>

                <FormSection title="Symptoms" icon={<Smile size={20} color={theme.colors.primary} />}>
                    <View style={styles.chipContainer}>
                        {ALL_SYMPTOMS.map(symptom => (
                            <TouchableOpacity key={symptom} onPress={() => handleSymptomToggle(symptom)} style={[styles.chip, selectedSymptoms.includes(symptom) && styles.chipSelected]}>
                                <Text style={[styles.chipText, selectedSymptoms.includes(symptom) && styles.chipTextSelected]}>{symptom}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </FormSection>

                <FormSection title="Mood" icon={<Smile size={20} color={theme.colors.primary} />}>
                    <View style={styles.chipContainer}>
                        {(['happy', 'neutral', 'sad', 'anxious', 'energetic'] as Mood[]).map(m => (
                             <TouchableOpacity key={m} onPress={() => setMood(m)} style={[styles.chip, mood === m && styles.chipSelected]}>
                                <Text style={[styles.chipText, mood === m && styles.chipTextSelected]}>{m}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </FormSection>
                
                <FormSection title="Notes" icon={<MessageSquare size={20} color={theme.colors.primary} />}>
                    <TextInput
                        style={styles.notesInput}
                        multiline
                        placeholder="Any additional thoughts, exercise, or diet notes?"
                        placeholderTextColor={theme.colors.mutedForeground}
                        value={notes}
                        onChangeText={setNotes}
                    />
                </FormSection>

                <Button 
                    title={isSaving ? 'Saving...' : 'Save Log'} 
                    onPress={handleSave} 
                    style={styles.saveButton}
                    disabled={isSaving}
                />

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        padding: theme.spacing.lg,
    },
    header: {
        marginBottom: theme.spacing.xl,
    },
    headerTitle: {
        ...theme.typography.h2,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.primary,
    },
    headerSubtitle: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        marginTop: theme.spacing.xs,
    },
    sectionContainer: {
        marginBottom: theme.spacing.xl,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    sectionTitle: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilySemiBold,
        marginLeft: theme.spacing.sm,
    },
    sectionContent: {},
    toggleContainer: {
        flexDirection: 'row',
        gap: theme.spacing.md,
    },
    chipContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    chip: {
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        backgroundColor: theme.colors.muted,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    chipSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    chipText: {
        ...theme.typography.body,
        color: theme.colors.foreground,
    },
    chipTextSelected: {
        color: theme.colors.primaryForeground,
        fontFamily: theme.typography.fontFamilySemiBold,
    },
    notesInput: {
        backgroundColor: theme.colors.input,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.md,
        minHeight: 100,
        textAlignVertical: 'top',
        ...theme.typography.body,
    },
    saveButton: {
        marginTop: theme.spacing.lg,
    }
}); 