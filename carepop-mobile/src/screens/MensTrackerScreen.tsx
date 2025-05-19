import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { theme } from '../components';
import { Card, Button } from '../components'; // Import Card and Button
import { Ionicons } from '@expo/vector-icons';

// Placeholder screen for Menstrual Cycle Tracking
export function MensTrackerScreen({ navigation }: any) {
  // TODO: Add state for cycle data, predictions, symptoms etc.
  const [lastPeriodStart, setLastPeriodStart] = useState('2024-09-10'); // Example state
  const [cycleLength, setCycleLength] = useState(28); // Example state

  const handleLogPeriod = () => {
    // TODO: Implement logic to log period start/end date
    navigation.navigate('LogPeriod'); // Navigate to LogPeriodScreen
  };

  const handleLogSymptoms = () => {
    // TODO: Implement logic to log symptoms for a specific day
    navigation.navigate('LogSymptoms'); // Navigate to LogSymptomsScreen
  };

  const calculatePrediction = () => {
    // Basic placeholder prediction logic
    if (lastPeriodStart && cycleLength) {
        const startDate = new Date(lastPeriodStart);
        startDate.setDate(startDate.getDate() + cycleLength);
        return startDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } 
    return 'N/A';
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.sectionTitle}>Current Cycle</Text>
          <Text style={styles.infoText}>Last Period Started: {lastPeriodStart || 'Not logged'}</Text>
          <Text style={styles.infoText}>Average Cycle Length: {cycleLength || 'N/A'} days</Text>
          <Text style={styles.predictionText}>Predicted Next Period: {calculatePrediction()}</Text>
          {/* TODO: Add more detailed cycle view (e.g., current day, fertile window) */}
        </Card>

        <Card style={styles.card}>
           <Text style={styles.sectionTitle}>Log Information</Text>
           <Button title="Log Period Start/End" onPress={handleLogPeriod} style={styles.actionButton} />
           <Button title="Log Symptoms / Notes" onPress={handleLogSymptoms} style={styles.actionButton} />
        </Card>
        
        <Button 
            title="View Calendar" 
            onPress={() => { /* Navigate to calendar view */ }}
            variant="secondary"
            styleType="outline"
            style={styles.calendarButton}
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
    paddingTop: theme.spacing.md, // Add padding top if needed
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  infoText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.sm,
  },
  predictionText: {
    fontSize: theme.typography.body,
    fontWeight: 'bold',
    color: theme.colors.primary, // Highlight prediction
    marginTop: theme.spacing.sm,
  },
  actionButton: {
      marginBottom: theme.spacing.md, // Space between log buttons
  },
  calendarButton: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
  }
}); 