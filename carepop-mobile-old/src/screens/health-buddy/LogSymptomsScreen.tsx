import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createHealthLog } from '../../services/api'; // Assuming this service function exists
import { Ionicons } from '@expo/vector-icons';

// --- Type Definitions ---
type Mood = {
  name: 'happy' | 'neutral' | 'sad' | 'anxious' | 'stressed';
  emoji: string;
};

// --- Constants ---
const MOODS: Mood[] = [
  { name: 'happy', emoji: '😊' },
  { name: 'neutral', emoji: '😐' },
  { name: 'sad', emoji: '😢' },
  { name: 'anxious', emoji: '😟' },
  { name: 'stressed', emoji: '😫' },
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

  const { mutate: submitHealthLog, isLoading } = useMutation(createHealthLog, {
    onSuccess: () => {
      Alert.alert('Success', 'Your health log has been saved.');
      queryClient.invalidateQueries('health-insights'); // To refresh dashboard data
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
            <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Symptoms</Text>
      </View>

      <Text style={styles.dateText}>{logDate.toDateString()}</Text>

      {/* --- Mood Selection --- */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How are you feeling?</Text>
        <View style={styles.moodsContainer}>
          {MOODS.map(mood => (
            <TouchableOpacity
              key={mood.name}
              style={[styles.moodChip, selectedMood === mood.name && styles.moodChipSelected]}
              onPress={() => setSelectedMood(mood.name)}
            >
              <Text style={styles.moodEmoji}>{mood.emoji}</Text>
              <Text style={[styles.moodText, selectedMood === mood.name && styles.moodTextSelected]}>
                {mood.name.charAt(0).toUpperCase() + mood.name.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
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
          placeholderTextColor="#999"
        />
      </View>

      {/* --- Submission Button --- */}
      <TouchableOpacity 
        style={[styles.submitButton, isLoading && styles.submitButtonDisabled]} 
        onPress={handleSubmit}
        disabled={isLoading}
      >
        <Text style={styles.submitButtonText}>{isLoading ? 'Saving...' : 'Save Log'}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

// --- Styles ---
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 50,
    paddingBottom: 20,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginLeft: 16,
    color: '#333',
  },
  dateText: {
    fontSize: 16,
    color: '#666',
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
    color: '#444',
    marginBottom: 15,
  },
  moodsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodChip: {
    alignItems: 'center',
    padding: 10,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    width: 65,
  },
  moodChipSelected: {
    backgroundColor: '#E6F3FF',
    borderColor: '#007AFF',
  },
  moodEmoji: {
    fontSize: 28,
  },
  moodText: {
    marginTop: 5,
    fontSize: 12,
    color: '#666',
  },
  moodTextSelected: {
    color: '#007AFF',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  symptomChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  symptomText: {
    color: '#333',
    fontSize: 14,
  },
  symptomTextSelected: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  notesInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    padding: 15,
    minHeight: 100,
    textAlignVertical: 'top',
    fontSize: 16,
    color: '#333',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 15,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40,
  },
  submitButtonDisabled: {
    backgroundColor: '#B0D7FF',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default LogSymptomsScreen; 