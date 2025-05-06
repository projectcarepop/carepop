import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { theme } from '@repo/ui/src/theme';
import { Card, Button, TextInput } from '@repo/ui'; // Changed Input to TextInput

export function AddMedicationScreen({ navigation }: any) { // Add navigation prop
  const [name, setName] = useState('');
  const [dosage, setDosage] = useState('');
  const [frequency, setFrequency] = useState('');
  const [time, setTime] = useState(''); // Could use a time picker later

  const handleSave = () => {
    // TODO: Add validation and API call to save medication
    if (!name || !dosage || !frequency || !time) {
        Alert.alert('Error', 'Please fill in all fields.');
        return;
    }
    console.log('Saving Medication:', { name, dosage, frequency, time });
    Alert.alert('Success', 'Medication Added (Placeholder)');
    navigation.goBack(); // Go back after saving
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Add New Medication</Text>

        <Card style={styles.card}>
          <TextInput
            label="Medication Name"
            value={name}
            onChangeText={setName}
            placeholder="e.g., Metformin"
            style={styles.input}
          />
          <TextInput
            label="Dosage"
            value={dosage}
            onChangeText={setDosage}
            placeholder="e.g., 500mg"
            style={styles.input}
          />
          <TextInput
            label="Frequency"
            value={frequency}
            onChangeText={setFrequency}
            placeholder="e.g., Twice daily"
            style={styles.input}
          />
          <TextInput
            label="Time(s)"
            value={time}
            onChangeText={setTime}
            placeholder="e.g., 8:00 AM, 8:00 PM"
            style={styles.input}
          />
        </Card>
        
        <Button 
            title="Save Medication" 
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
  saveButton: {
    marginHorizontal: theme.spacing.md,
  }
}); 