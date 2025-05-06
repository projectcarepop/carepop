import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { theme } from '@repo/ui/src/theme';
import { Card, Button, TextInput } from '@repo/ui';

export function LogSymptomsScreen({ navigation }: any) {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // Default to today
  const [symptoms, setSymptoms] = useState('');

  // TODO: Add Date Picker
  // TODO: Consider pre-defined symptom tags/checklist

  const handleSave = () => {
     if (!symptoms) {
        Alert.alert('Error', 'Please describe your symptoms.');
        return;
    }
    // TODO: Add validation and API call
    console.log('Saving Symptoms Log:', { date, symptoms });
    Alert.alert('Success', 'Symptoms Logged (Placeholder)');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Log Symptoms</Text>

        <Card style={styles.card}>
           <TextInput
            label="Date"
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            style={styles.input}
            // editable={false} // If using a date picker later
          />
          <TextInput
            label="Symptoms / Notes"
            value={symptoms}
            onChangeText={setSymptoms}
            placeholder="e.g., Headache, tired"
            multiline
            numberOfLines={4}
            style={[styles.input, styles.textArea]}
          />
           <Text style={styles.infoText}>Use YYYY-MM-DD format for date for now.</Text>
        </Card>

        <Button 
            title="Save Symptoms" 
            onPress={handleSave} 
            style={styles.saveButton}
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
    flex: 1,
    paddingVertical: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  textArea: {
    height: 100, // Adjust height for multiline input
    textAlignVertical: 'top', // Align text to the top for multiline
  },
   infoText: {
      fontSize: theme.typography.caption,
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
  },
  saveButton: {
    marginHorizontal: theme.spacing.md,
  }
}); 