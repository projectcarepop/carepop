import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { theme } from '../../components/theme';
import { useNavigation } from '@react-navigation/native';

const symptomsList = [
  "Headache", "Nausea", "Fatigue", "Cramps", "Bloating", 
  "Anxiety", "Dizziness", "Backache", "Tender Breasts", "Mood Swings"
];

const LogSymptomsScreen = () => {
  const navigation = useNavigation();
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const toggleSymptom = (symptom: string) => {
    setSelectedSymptoms(prev => 
      prev.includes(symptom) 
        ? prev.filter(s => s !== symptom) 
        : [...prev, symptom]
    );
  };

  const handleSave = () => {
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.goBack();
    }, 1500);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>Log Your Symptoms</Text>
      <Text style={styles.subtitle}>Select any symptoms you're experiencing and add notes if you'd like.</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Common Symptoms</Text>
        <View style={styles.symptomGrid}>
          {symptomsList.map(symptom => (
            <TouchableOpacity key={symptom} onPress={() => toggleSymptom(symptom)}>
              <View style={[styles.chip, selectedSymptoms.includes(symptom) && styles.chipSelected]}>
                <Text style={[styles.chipText, selectedSymptoms.includes(symptom) && styles.chipTextSelected]}>
                  {symptom}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Notes</Text>
        <TextInput
          style={styles.input}
          value={notes}
          onChangeText={setNotes}
          placeholder="e.g., The headache started this morning..."
          placeholderTextColor={theme.colors.mutedForeground}
          multiline
        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color={theme.colors.primaryForeground} />
        ) : (
          <Text style={styles.buttonText}>Save Log</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  contentContainer: {
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  chip: {
    backgroundColor: theme.colors.muted,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  chipTextSelected: {
    color: theme.colors.primaryForeground,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.foreground,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    ...theme.typography.h4,
    color: theme.colors.primaryForeground,
  },
});

export default LogSymptomsScreen; 