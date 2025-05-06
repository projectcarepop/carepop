import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { theme } from '@repo/ui/src/theme';
import { Card, Button, TextInput } from '@repo/ui';

export function LogBloodPressureScreen({ navigation }: any) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [pulse, setPulse] = useState('');
  const [dateTime, setDateTime] = useState(new Date().toISOString()); // Default to now

  // TODO: Add Date/Time Picker

  const handleSave = () => {
     if (!systolic || !diastolic) {
        Alert.alert('Error', 'Please enter both Systolic and Diastolic values.');
        return;
    }
    // Basic validation for numbers
    if (isNaN(Number(systolic)) || isNaN(Number(diastolic)) || (pulse && isNaN(Number(pulse)))) {
        Alert.alert('Error', 'Please enter valid numbers for readings.');
        return;
    }

    // TODO: Add API call
    console.log('Saving BP Log:', { systolic, diastolic, pulse, dateTime });
    Alert.alert('Success', 'Blood Pressure Logged (Placeholder)');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Log Blood Pressure</Text>

        <Card style={styles.card}>
          <View style={styles.bpRow}>
            <TextInput
                label="Systolic (SYS)"
                value={systolic}
                onChangeText={setSystolic}
                placeholder="e.g., 120"
                keyboardType="numeric"
                style={styles.bpInput}
            />
            <Text style={styles.bpSeparator}>/</Text>
            <TextInput
                label="Diastolic (DIA)"
                value={diastolic}
                onChangeText={setDiastolic}
                placeholder="e.g., 80"
                keyboardType="numeric"
                style={styles.bpInput}
            />
          </View>
          <TextInput
            label="Pulse (BPM) (Optional)"
            value={pulse}
            onChangeText={setPulse}
            placeholder="e.g., 70"
            keyboardType="numeric"
            style={styles.input}
          />
          <TextInput
            label="Date & Time"
            value={new Date(dateTime).toLocaleString()} // Display formatted date/time
            // onChangeText={setDateTime} // Requires a picker
            placeholder="Date and Time of reading"
            editable={false} // Needs a picker to be editable
            style={styles.input}
          />
          <Text style={styles.infoText}>Date/Time defaults to now. A picker will be added later.</Text>
        </Card>

        <Button 
            title="Save Reading" 
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
  bpRow: {
      flexDirection: 'row',
      alignItems: 'flex-end', // Align labels and inputs nicely
      marginBottom: theme.spacing.md,
  },
  bpInput: {
      flex: 1, // Allow inputs to take equal space
  },
  bpSeparator: {
      fontSize: theme.typography.heading, // Make slash large
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.textMuted,
      paddingBottom: theme.spacing.sm, // Align with input bottom
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