import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert } from 'react-native';
import { theme } from '@repo/ui/src/theme';
import { Card, Button, TextInput } from '@repo/ui'; // Assuming TextInput is used for dates initially

export function LogPeriodScreen({ navigation }: any) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState(''); // Optional

  // TODO: Replace TextInput with a proper Date Picker component

  const handleSave = () => {
    if (!startDate) {
        Alert.alert('Error', 'Please enter at least the start date.');
        return;
    }
    // TODO: Add validation and API call
    console.log('Saving Period Log:', { startDate, endDate });
    Alert.alert('Success', 'Period Logged (Placeholder)');
    navigation.goBack();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Log Period Dates</Text>

        <Card style={styles.card}>
          <TextInput
            label="Start Date"
            value={startDate}
            onChangeText={setStartDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric" // Basic suggestion
            style={styles.input}
          />
          <TextInput
            label="End Date (Optional)"
            value={endDate}
            onChangeText={setEndDate}
            placeholder="YYYY-MM-DD"
            keyboardType="numeric"
            style={styles.input}
          />
          <Text style={styles.infoText}>Use YYYY-MM-DD format for now. A date picker will be added later.</Text>
        </Card>

        <Button 
            title="Save Dates" 
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