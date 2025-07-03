import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHealthLog } from '../../services/api'; // Assuming this service function exists
import { Ionicons } from '@expo/vector-icons';
import { Feather as Icon } from '@expo/vector-icons';
import { theme } from '../../components/theme';

// --- Type Definitions ---
type Mood = {
  name: 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed';
  iconName: keyof typeof Icon.glyphMap;
};

// --- Constants ---
const MOODS: Mood[] = [
  { name: 'happy', iconName: 'smile' },
  { name: 'neutral', iconName: 'meh' },
  { name: 'sad', iconName: 'frown' },
  { name: 'anxious', iconName: 'alert-circle' },
  { name: 'stressed', iconName: 'zap' },
];

const SYMPTOMS = [
  'Headache', 'Nausea', 'Fatigue', 'Cramps', 'Bloating', 'Anxiety', 
  'Dizziness', 'Backache', 'Tender Breasts', 'Mood swings'
];

// --- The New Screen Component ---
const LogSymptomsScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  
  const [logDate] = useState(new Date()); // Use current date
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [selectedSymptoms, setSelectedSymptoms] = useState<Set<string>>(new Set());
  const [notes, setNotes] = useState('');

  const { mutate: submitHealthLog, isPending } = useMutation({
    mutationFn: createHealthLog,
    onSuccess: () => {
      Alert.alert('Success', 'Your health log has been saved.');
      queryClient.invalidateQueries({ queryKey: ['health-insights'] }); // To refresh dashboard data
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error('Failed to save health log:', error);
      Alert.alert('Error', error.message || 'Could not save your health log. Please try again.');
    },
  });

  const handleSymptomToggle = (symptom: string) => {
    setSelectedSymptoms(prev => {
      const newSet = new Set(prev);
      if (newSet.has(symptom)) {
        newSet.delete(symptom);
      } else {
        newSet.add(symptom);
      }
      return newSet;
    });
  };

  const handleSubmit = () => {
    if (!selectedMood) {
      Alert.alert('Incomplete', 'Please select a mood to continue.');
      return;
    }

    // --- The Critical Fix: Constructing the payload ---
    const payload = {
      logDate: logDate.toISOString(),
      mood: selectedMood.toLowerCase(),
      symptoms: Array.from(selectedSymptoms),
      notes: notes.trim() === '' ? null : notes.trim(),
    };
    
    // @ts-ignore - The service function expects the correct payload format now
    submitHealthLog(payload);
  };
  
  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Symptoms</Text>
      </View>

      <Text style={styles.dateText}>{logDate.toDateString()}</Text>

      {/* --- Mood Selection --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodsContainer}>
          {MOODS.map(mood => {
            const isSelected = selectedMood === mood.name;
            return (
              <TouchableOpacity
                key={mood.name}
                style={[styles.moodChip, isSelected && styles.moodChipSelected]}
                onPress={() => setSelectedMood(mood.name)}
              >
                <Icon 
                  name={mood.iconName} 
                  size={28} 
                  color={isSelected ? theme.colors.primary : theme.colors.secondary} 
                />
                <Text style={[styles.moodText, isSelected && styles.moodTextSelected]}>
                  {mood.name.charAt(0).toUpperCase() + mood.name.slice(1)}
                </Text>
              </TouchableOpacity>
            )
          })}
        </View>
      </View>

      {/* --- Symptom Selection --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Any Symptoms?</Text>
        <View style={styles.symptomsContainer}>
          {SYMPTOMS.map(symptom => (
            <TouchableOpacity
              key={symptom}
              style={[styles.symptomChip, selectedSymptoms.has(symptom) && styles.symptomChipSelected]}
              onPress={() => handleSymptomToggle(symptom)}
            >
              <Text style={[styles.symptomText, selectedSymptoms.has(symptom) && styles.symptomTextSelected]}>
                {symptom}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* --- Additional Notes --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={styles.notesInput}
          multiline
          placeholder="Anything else to add?"
          value={notes}
          onChangeText={setNotes}
          placeholderTextColor={theme.colors.secondary}
        />
      </View>

      {/* --- Submission Button --- */}
      <TouchableOpacity 
        style={[styles.submitButton, isPending && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isPending}
      >
        <Text style={styles.submitButtonText}>{isPending ? 'Saving...' : 'Save Log'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: theme.spacing.lg*2  ,
    paddingBottom: 20,
    marginTop: theme.spacing.xl*2,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    color: theme.colors.secondary,
  },
  dateText: {
    fontSize: 16,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.secondary,
    marginBottom: 15,
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moodChip: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.card,
  },
  moodChipSelected: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.primary,
  },
  moodText: {
    marginTop: 5,
    fontSize: 12,
    color: theme.colors.secondary,
  },
  moodTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  symptomsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  symptomChip: {
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  symptomChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  symptomText: {
    color: theme.colors.cardForeground,
    fontSize: 14,
  },
  symptomTextSelected: {
    color: theme.colors.primaryForeground,
    fontWeight: 'bold',
  },
  notesInput: {
    backgroundColor: theme.colors.card,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: theme.colors.secondary,
  },
  submitButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  submitButtonText: {
    color: theme.colors.primaryForeground,
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LogSymptomsScreen; 