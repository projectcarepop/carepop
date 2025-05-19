import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert } from 'react-native';
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

  // Component for the header content
  const ListHeader = () => (
    <Text style={styles.subtitle}>Today&apos;s Schedule</Text>
  );

  // Component for the footer content
  const ListFooter = () => (
    <View style={styles.footerContainer}>
      <Button 
        title="Add New Medication" 
        onPress={() => navigation.navigate('AddMedication')} // Ensure 'AddMedication' matches route name
        style={styles.actionButton}
      />
      <Button 
        title="View Full Schedule / History" 
        onPress={() => { Alert.alert("Coming Soon!", "This feature is under development."); /* TODO: Navigate to history screen */ }}
        variant="secondary"
        styleType="outline"
        style={styles.actionButton}
      />
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Remove ScrollView */}
      {/* Use FlatList as the main container */}
      <FlatList
        style={styles.container} // Apply container styles to FlatList
        contentContainerStyle={styles.contentContainer} // Add padding if needed inside the list
        data={meds}
        renderItem={renderMedicationItem}
        keyExtractor={item => item.id}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.placeholderText}>No medications scheduled for today.</Text>
            {/* Render footer even when list is empty */}
            <ListFooter /> 
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />} // Add separator if Card styling is removed/changed
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: { // Style for the FlatList itself
    flex: 1,
  },
  contentContainer: { // Style for the content *inside* the FlatList
    paddingBottom: theme.spacing.lg, // Ensure space at the bottom
  },
  subtitle: {
    fontSize: theme.typography.subheading,
    fontWeight: '600', // Semibold
    color: theme.colors.text,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.md, // Add margin top since it's now the header
  },
  medItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md, 
    backgroundColor: theme.colors.card, // Use card background if needed
    marginHorizontal: theme.spacing.md, // Keep horizontal margin like the card
    marginBottom: theme.spacing.sm, // Add space between items
    borderRadius: theme.borderRadius.md, // Add border radius if mimicking card
    elevation: 1, // Optional: add shadow like card
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
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
      marginBottom: theme.spacing.md, // Adjust spacing
  },
  footerContainer: { // Container for footer buttons
    marginTop: theme.spacing.lg, // Add space above buttons
  },
  emptyContainer: { // Container for empty state + footer
    flex: 1, // Take available space if needed
    alignItems: 'center', // Center empty text
    paddingTop: theme.spacing.xl, // Add some padding top
  },
  separator: { // Optional: if you want lines between items without the card
    height: 1,
    backgroundColor: theme.colors.border,
    marginHorizontal: theme.spacing.md,
  }
}); 