import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Feather as Icon } from '@expo/vector-icons';
import { z } from 'zod';
import { theme } from '../theme';

// Validation Schema
const logSymptomsSchema = z.object({
  mood: z.string().nullable().optional(),
  symptoms: z.array(z.string()),
  notes: z.string().nullable().optional(),
});

export type LogSymptomsFormData = z.infer<typeof logSymptomsSchema>;

// Props
type LogSymptomsFormProps = {
  onSubmit: (data: LogSymptomsFormData) => void;
  isSubmitting: boolean;
};

// Data
const moods = [
    { icon: 'smile', label: 'Happy' },
    { icon: 'meh', label: 'Neutral' },
    { icon: 'frown', label: 'Sad' },
    { icon: 'alert-circle', label: 'Anxious' },
    { icon: 'activity', label: 'Stressed' },
];
const symptomsList = [
  "Headache", "Nausea", "Fatigue", "Cramps", "Bloating", 
  "Anxiety", "Dizziness", "Backache", "Tender Breasts", "Mood Swings"
];

const LogSymptomsForm = ({ onSubmit, isSubmitting }: LogSymptomsFormProps) => {
  const { control, handleSubmit, watch, setValue } = useForm<LogSymptomsFormData>({
    resolver: zodResolver(logSymptomsSchema),
    defaultValues: {
        symptoms: [],
        mood: null,
        notes: null,
    }
  });

  const selectedSymptoms = watch('symptoms', []);
  const selectedMood = watch('mood');

  const toggleSymptom = (symptom: string) => {
    const newSymptoms = selectedSymptoms.includes(symptom)
      ? selectedSymptoms.filter(s => s !== symptom)
      : [...selectedSymptoms, symptom];
    setValue('symptoms', newSymptoms, { shouldValidate: true });
  };

  const handleSetMood = (mood: string) => {
      setValue('mood', mood === selectedMood ? null : mood, { shouldValidate: true });
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>Log Your Symptoms</Text>
      <Text style={styles.subtitle}>Let&apos;s get a quick update on how you&apos;re feeling.</Text>
      
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How&apos;s your mood?</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {moods.map(mood => (
            <TouchableOpacity key={mood.label} onPress={() => handleSetMood(mood.label)}>
                <View style={[styles.moodCard, selectedMood === mood.label && styles.moodCardSelected]}>
                    <Icon name={mood.icon as any} size={28} color={selectedMood === mood.label ? theme.colors.primary : theme.colors.secondary} />
                    <Text style={[styles.moodLabel, selectedMood === mood.label && styles.moodLabelSelected]}>{mood.label}</Text>
                </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Any symptoms to report?</Text>
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
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <TextInput
              style={styles.input}
              onBlur={onBlur}
              onChangeText={onChange}
              value={value || ''}
              placeholder="e.g., The headache started this morning and got worse after lunch..."
              placeholderTextColor={theme.colors.mutedForeground}
              multiline
              textAlignVertical='top'
            />
          )}
        />
      </View>

      <TouchableOpacity style={[styles.button, isSubmitting && styles.buttonDisabled]} onPress={handleSubmit(onSubmit)} disabled={isSubmitting}>
        {isSubmitting ? (
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
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
      ...theme.typography.body,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginBottom: theme.spacing.xl,
  },
  section: {
    marginBottom: theme.spacing.xl,
  },
  sectionTitle: {
    ...theme.typography.h4,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.md,
  },
  moodCard: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    alignItems: 'center',
    marginRight: theme.spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
    width: 80,
    height: 80,
    justifyContent: 'center',
  },
  moodCardSelected: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.destructiveMuted,
  },
  moodLabel: {
    ...theme.typography.small,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.secondary,
    marginTop: theme.spacing.sm,
  },
  moodLabelSelected: {
      color: theme.colors.primary,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  chip: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  chipText: {
    ...theme.typography.small,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.secondary,
  },
  chipTextSelected: {
    color: theme.colors.primaryForeground,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.foreground,
    minHeight: 20,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
    marginTop: theme.spacing.md,
  },
  buttonDisabled: {
      backgroundColor: theme.colors.muted,
      borderColor: theme.colors.border,
  },
  buttonText: {
    ...theme.typography.h4,
    color: theme.colors.primaryForeground,
  },
});

export default LogSymptomsForm;
