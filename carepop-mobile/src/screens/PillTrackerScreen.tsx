import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
import { theme } from '../components'; // Corrected theme import
import { Card, Button, Checkbox } from '../components'; // Import necessary components
import { MaterialIcons } from '@expo/vector-icons';

// Placeholder data
const dummyMedications = [
  { id: 'm1', name: 'Metformin 500mg', time: '8:00 AM', taken: false },
  { id: 'm2', name: 'Lisinopril 10mg', time: '8:00 AM', taken: true },
  { id: 'm3', name: 'Vitamin D 1000IU', time: '12:00 PM', taken: false },
  { id: 'm4', name: 'Metformin 500mg', time: '8:00 PM', taken: false },
];

type Medication = typeof dummyMedications[0];

export function PillTrackerScreen({ navigation }: any) {
  // State to manage medication taken status (use dummy data for now)
  const [meds, setMeds] = useState(dummyMedications);

  const toggleTaken = (id: string) => {
    setMeds(currentMeds => 
      currentMeds.map(med => 
        med.id === id ? { ...med, taken: !med.taken } : med
      )
    );
    // TODO: Add API call to update status in backend
  };

  const renderMedicationItem = ({ item }: { item: Medication }) => (
    <View style={styles.medItemContainer}>
        <Checkbox 
            checked={item.taken} 
            onChange={() => toggleTaken(item.id)} 
            label={``} // Label handled by Text components
        />
        <View style={styles.medTextContainer}>
            <Text style={styles.medName}>{item.name}</Text>
            <Text style={styles.medTime}>Due: {item.time}</Text>
        </View>
        {/* Optional: Add reminder/snooze button? */}
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.subtitle}>Today's Schedule</Text>

        <Card style={styles.card}>
          <FlatList
            data={meds}
            renderItem={renderMedicationItem}
            keyExtractor={item => item.id}
            ListEmptyComponent={<Text style={styles.placeholderText}>No medications scheduled for today.</Text>}
          />
        </Card>

         <Button 
          title="Add New Medication" 
          onPress={() => navigation.navigate('AddMedication')}
          style={styles.actionButton}
         />

         <Button 
          title="View Full Schedule / History" 
          onPress={() => { /* TODO: Navigate to history screen */ }}
          variant="secondary"
          styleType="outline"
          style={styles.actionButton}
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
  subtitle: {
    fontSize: theme.typography.subheading,
    fontWeight: '600', // Semibold
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.sm, // Adjust padding for list items
  },
  medItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  medTextContainer: {
    marginLeft: theme.spacing.sm,
    flex: 1, // Allow text to wrap
  },
  medName: {
    fontSize: theme.typography.body,
    fontWeight: '500',
    color: theme.colors.text,
  },
  medTime: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    padding: theme.spacing.md,
  },
  actionButton: {
      marginHorizontal: theme.spacing.md,
      marginBottom: theme.spacing.lg,
      marginTop: theme.spacing.sm,
  }
}); 