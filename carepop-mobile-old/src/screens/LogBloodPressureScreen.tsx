import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, TextInput } from 'react-native';
import { theme } from '../components';
import { Card, Button } from '../components';
import { MaterialIcons } from '@expo/vector-icons';

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
            <View style={styles.bpInputContainer}>
                <Text style={styles.label}>Systolic (SYS)</Text>
                <TextInput
                    value={systolic}
                    onChangeText={setSystolic}
                    placeholder="e.g., 120"
                    keyboardType="numeric"
                    style={styles.bpInput}
                    placeholderTextColor={theme.colors.mutedForeground}
                />
            </View>
            <Text style={styles.bpSeparator}>/</Text>
            <View style={styles.bpInputContainer}>
                <Text style={styles.label}>Diastolic (DIA)</Text>
                <TextInput
                    value={diastolic}
                    onChangeText={setDiastolic}
                    placeholder="e.g., 80"
                    keyboardType="numeric"
                    style={styles.bpInput}
                    placeholderTextColor={theme.colors.mutedForeground}
                />
            </View>
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Pulse (BPM) (Optional)</Text>
            <TextInput
                value={pulse}
                onChangeText={setPulse}
                placeholder="e.g., 70"
                keyboardType="numeric"
                style={styles.input}
                placeholderTextColor={theme.colors.mutedForeground}
            />
          </View>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Date & Time</Text>
            <TextInput
                value={new Date(dateTime).toLocaleString()} // Display formatted date/time
                // onChangeText={setDateTime} // Requires a picker
                placeholder="Date and Time of reading"
                editable={false} // Needs a picker to be editable
                style={[styles.input, styles.disabledInput]}
            />
          </View>
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
    ...theme.typography.h2,
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  input: {
    ...theme.typography.body,
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.input,
    borderWidth: 1,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    color: theme.colors.foreground,
  },
  disabledInput: {
      backgroundColor: theme.colors.muted,
      color: theme.colors.mutedForeground,
  },
  label: {
      ...theme.typography.small,
      color: theme.colors.mutedForeground,
      marginBottom: theme.spacing.sm,
  },
  bpRow: {
      flexDirection: 'row',
      alignItems: 'flex-end', // Align labels and inputs nicely
      marginBottom: theme.spacing.md,
  },
  bpInputContainer: {
      flex: 1,
  },
  bpInput: {
      ...theme.typography.h3,
      backgroundColor: theme.colors.background,
      borderColor: theme.colors.input,
      borderWidth: 1,
      borderRadius: theme.radius.md,
      padding: theme.spacing.md,
      color: theme.colors.foreground,
      textAlign: 'center',
  },
  bpSeparator: {
      ...theme.typography.h1,
      marginHorizontal: theme.spacing.sm,
      color: theme.colors.mutedForeground,
      paddingBottom: theme.spacing.sm, // Align with input bottom
  },
  infoText: {
      ...theme.typography.small,
      color: theme.colors.mutedForeground,
      textAlign: 'center',
      marginTop: theme.spacing.sm,
  },
  saveButton: {
    marginHorizontal: theme.spacing.md,
  }
}); 