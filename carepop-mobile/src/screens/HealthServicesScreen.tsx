import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Alert, SafeAreaView, ViewStyle } from 'react-native';
import { theme } from '../components';
import { Card, Button } from '../components'; // Keep Button for potential next step
import { MaterialIcons } from '@expo/vector-icons';

// Placeholder data - replace with fetched data later
const dummyServices = [
  { id: 's1', name: 'General Consultation' },
  { id: 's2', name: 'SRH Check-up' },
  { id: 's3', name: 'Mental Health Support' },
  { id: 's4', name: 'Follow-up Visit' },
  // Add more services as needed
];

// Define service type
type HealthService = {
  id: string;
  name: string;
};

// Rename component to HealthServicesScreen
export function HealthServicesScreen() {
  const [selectedService, setSelectedService] = useState<HealthService | null>(null);
  // Remove states for provider, date, time

  const handleSelectService = (service: HealthService) => {
    setSelectedService(service);
    console.log('Selected Service:', service);
    // TODO: Navigate to the next step (e.g., Provider selection) or show confirmation
    Alert.alert("Service Selected", `You selected: ${service.name}.\nNext step would be selecting a provider/date/time.`);
  };

  // Component to render each service item
  const ServiceItem: React.FC<{ item: HealthService; onPress: () => void }> = ({ item, onPress }) => {
    const isSelected = selectedService?.id === item.id;
    // Define the style conditionally, filtering out falsy values
    const cardStyle = [
        styles.serviceCard, 
        isSelected && styles.selectedCard
    ].filter(Boolean) as ViewStyle[]; // Filter out false and assert type

    return (
      <TouchableOpacity onPress={onPress}>
        <Card style={cardStyle}> 
          <Text style={styles.serviceText}>{item.name}</Text>
        </Card>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>Select a Health Service</Text>
        
        <FlatList
          data={dummyServices}
          renderItem={({ item }) => (
            <ServiceItem 
              item={item} 
              onPress={() => handleSelectService(item)} 
            />
          )}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No services available.</Text>}
          contentContainerStyle={styles.listContent}
        />

        {/* REMOVED problematic commented-out button */}
        
      </View>
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
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    marginTop: theme.spacing.sm, // Adjust top margin
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.lg,
  },
  serviceCard: {
    marginBottom: theme.spacing.md,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryMuted,
  },
  serviceText: {
    fontSize: theme.typography.body,
    fontWeight: '500',
    color: theme.colors.text,
    textAlign: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
  nextButton: {
    marginTop: theme.spacing.lg,
  },
}); 