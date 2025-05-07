import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, Alert, TouchableOpacity, Platform } from 'react-native';
import { theme } from '../components';
import { Card, Button, TextInput } from '../components';
import { MaterialIcons } from '@expo/vector-icons';

export function ServiceBookingScreen({ route, navigation }: any) {
  // Get the service name passed from the previous screen
  const { serviceName } = route.params || { serviceName: 'Service' }; // Default title if param is missing

  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // TODO: Replace placeholders with actual selection components (Dropdown, DatePicker, TimePicker)

  const handleConfirmBooking = () => {
    if (!selectedProvider || !selectedDate || !selectedTime) {
        Alert.alert('Missing Information', 'Please select a provider, date, and time.');
        return;
    }
    // TODO: Add API call to submit booking
    console.log('Booking Confirmed (Placeholder):', { 
        service: serviceName,
        provider: selectedProvider,
        date: selectedDate,
        time: selectedTime,
        notes 
    });
    Alert.alert('Booking Confirmed', `Your appointment for ${serviceName} has been requested.`);
    // Navigate back to Dashboard or a confirmation screen
    navigation.navigate('Dashboard'); // Navigate back to the main Dashboard drawer item
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        <Text style={styles.title}>Book: {serviceName}</Text>

        <Card style={styles.card}>
          <Text style={styles.label}>Select Provider</Text>
          {/* Placeholder for Provider Selection */}
          <View style={styles.placeholderBox}>
             <Text style={styles.placeholderText}>(Provider Dropdown/List Here)</Text>
          </View>
          {/* Example setting state - replace with actual component interaction */}
           <Button title="Select Dr. Anya" onPress={() => setSelectedProvider('Dr. Anya')} size="sm" style={{marginBottom: 10}}/>

          <Text style={styles.label}>Select Date</Text>
          {/* Placeholder for Date Selection */}
          <View style={styles.placeholderBox}>
             <Text style={styles.placeholderText}>(Date Picker Here)</Text>
          </View>
          <Button title="Select Oct 30, 2024" onPress={() => setSelectedDate('2024-10-30')} size="sm" style={{marginBottom: 10}}/>

          <Text style={styles.label}>Select Time</Text>
          {/* Placeholder for Time Selection */}
          <View style={styles.placeholderBox}>
             <Text style={styles.placeholderText}>(Time Slot Picker Here)</Text>
          </View>
           <Button title="Select 10:00 AM" onPress={() => setSelectedTime('10:00 AM')} size="sm" style={{marginBottom: 10}}/>

          <TextInput
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder={`Any specific requests or information for your ${serviceName} appointment?`}
            multiline
            numberOfLines={3}
            style={[styles.input, styles.textArea]}
          />
        </Card>

        <Button 
            title="Confirm Booking" 
            onPress={handleConfirmBooking} 
            style={styles.confirmButton}
            disabled={!selectedProvider || !selectedDate || !selectedTime} // Disable if required fields aren't selected
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
    marginHorizontal: theme.spacing.md, // Prevent title being too wide
  },
  card: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md,
  },
  label: {
    fontSize: theme.typography.subheading,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  placeholderBox: {
      backgroundColor: theme.colors.border, // Subtle background
      borderRadius: theme.borderRadius.md,
      padding: theme.spacing.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.sm, // Space before placeholder selection button
  },
  placeholderText: {
      color: theme.colors.textMuted,
      fontSize: theme.typography.body,
  },
  input: {
    marginTop: theme.spacing.md, // Add margin above input if it follows a placeholder
  },
  textArea: {
    height: 80, 
    textAlignVertical: 'top', 
  },
  confirmButton: {
    marginHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  }
}); 