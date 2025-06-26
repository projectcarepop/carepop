import React from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { theme } from '../components/theme';
import { Button } from '../components/button.native';
import { logHealthData, type HealthLogPayload } from '../services/api';
import { healthLogSchema, type HealthLogFormValues } from '../lib/validation/health';

export default function LogHealthDataScreen({ navigation }: any) {
  const queryClient = useQueryClient();
  const { control, handleSubmit, formState: { errors } } = useForm<HealthLogFormValues>({
    resolver: zodResolver(healthLogSchema),
    defaultValues: { mood: '', symptoms: '', notes: '' },
  });

  const { mutate: submitHealthLog, isPending } = useMutation({
    mutationFn: (data: HealthLogPayload) => logHealthData(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['healthAnalysis'] });
      Alert.alert('Success', 'Your health log has been saved.');
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert('Error', (error as Error).message);
    }
  });
  
  const onSubmit = (data: HealthLogFormValues) => {
    const symptomsArray = data.symptoms?.split(',').map(s => s.trim()).filter(Boolean) || [];
    submitHealthLog({
      mood: data.mood,
      symptoms: symptomsArray,
      notes: data.notes,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>How are you feeling?</Text>
        <Text style={styles.description}>Log your daily health data to get better insights from your AI Health Buddy.</Text>
        
        <View style={styles.form}>
            <Text style={styles.label}>Mood</Text>
            <Controller
              control={control}
              name="mood"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Happy, Tired, Anxious"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    autoCapitalize="words"
                />
              )}
            />
             {errors.mood && <Text style={styles.errorText}>{errors.mood.message}</Text>}

            <Text style={styles.label}>Symptoms</Text>
            <Controller
              control={control}
              name="symptoms"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Headache, Cramps, Bloating"
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                />
              )}
            />
            <Text style={styles.helperText}>Separate symptoms with a comma.</Text>

            <Text style={styles.label}>Notes</Text>
             <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                    style={[styles.input, styles.textArea]}
                    placeholder="Any additional thoughts or details..."
                    onBlur={onBlur}
                    onChangeText={onChange}
                    value={value}
                    multiline
                />
              )}
            />
        </View>

        <Button
          title={isPending ? "Saving..." : "Save Log"}
          onPress={handleSubmit(onSubmit)}
          disabled={isPending}
          style={styles.button}
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
  title: {
    ...theme.typography.h2,
    fontFamily: theme.typography.fontFamilyBold,
    marginBottom: theme.spacing.sm,
  },
  description: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
  },
  form: {
    gap: theme.spacing.md,
  },
  label: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
  },
  input: {
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.typography.body,
    color: theme.colors.foreground,
  },
  errorText: {
    color: theme.colors.destructive,
    ...theme.typography.small,
    marginTop: -theme.spacing.sm,
  },
  textArea: {
      height: 120,
      textAlignVertical: 'top',
  },
  helperText: {
      ...theme.typography.small,
      color: theme.colors.mutedForeground,
      marginTop: -theme.spacing.sm,
  },
  button: {
      marginTop: theme.spacing.xl,
  }
}); 