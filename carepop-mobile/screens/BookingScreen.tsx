import React from 'react';
import { View, Text, StyleSheet, FlatList, SafeAreaView, Alert, TouchableOpacity } from 'react-native';
import { theme } from '../src/components';
import { Card, Button } from '../src/components'; // Use Card component for styling and Button
import { MaterialIcons } from '@expo/vector-icons';

interface BookingScreenProps {
  navigation?: any;
}

// Define a type for our placeholder appointment data
type Appointment = {
  id: string;
  date: string;
  time: string;
  doctor: string;
  service: string;
  status: 'Upcoming' | 'Past' | 'Cancelled'; // Example status
};

// Placeholder data
const dummyAppointments: Appointment[] = [
  {
    id: '1',
    date: '2024-09-15',
    time: '10:30 AM',
    doctor: 'Dr. Anya Sharma',
    service: 'General Consultation',
    status: 'Upcoming',
  },
  {
    id: '2',
    date: '2024-09-18',
    time: '02:00 PM',
    doctor: 'Dr. Ben Carter',
    service: 'SRH Check-up',
    status: 'Upcoming',
  },
  {
    id: '3',
    date: '2024-08-20',
    time: '09:00 AM',
    doctor: 'Dr. Anya Sharma',
    service: 'Follow-up Visit',
    status: 'Past',
  },
   {
    id: '4',
    date: '2024-08-05',
    time: '04:00 PM',
    doctor: 'Dr. Chloe Davis',
    service: 'Mental Health Support',
    status: 'Cancelled',
  },
];

// Component to render each appointment item
const AppointmentItem: React.FC<{ item: Appointment }> = ({ item }) => {
  // Function to show details in an alert
  const handleViewDetails = () => {
    const details = 
`Service: ${item.service}
Doctor: ${item.doctor}
Date: ${item.date}
Time: ${item.time}
Status: ${item.status}`;
    
    Alert.alert("Appointment Details", details);
  };

  return (
    <Card style={styles.appointmentCard}>
      <View style={styles.cardContent}>
        <Text style={styles.serviceText}>{item.service}</Text>
        <Text style={styles.detailText}>Date: {item.date}</Text>
        <Text style={styles.detailText}>Time: {item.time}</Text>
        <Text style={styles.detailText}>Doctor: {item.doctor}</Text>
        <View style={styles.statusContainer}>
          <Text style={[styles.statusText, styles[item.status]]}>{item.status}</Text>
        </View>
      </View>
      <Button 
        title="View Details" 
        onPress={handleViewDetails} 
        variant="secondary"
        styleType="outline"
        style={styles.detailsButton}
      />
    </Card>
  );
}

export const BookingScreen: React.FC<BookingScreenProps> = ({ navigation }) => {
  // TODO: Add state for filtering (Upcoming, Past, Cancelled)
  // TODO: Fetch real appointment data
  const appointmentsToDisplay = dummyAppointments; // Use dummy data for now

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Text style={styles.title}>My Bookings</Text>
        {/* TODO: Add filter buttons/tabs here */}
        <FlatList
          data={appointmentsToDisplay}
          renderItem={({ item }) => <AppointmentItem item={item} />}
          keyExtractor={(item) => item.id}
          ListEmptyComponent={<Text style={styles.emptyText}>No appointments found.</Text>}
          contentContainerStyle={styles.listContent}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flex: 1,
    padding: theme.spacing.md, // Adjusted padding
  },
  title: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  listContent: {
    paddingBottom: theme.spacing.lg, // Add padding at the bottom of the list
  },
  appointmentCard: {
    marginBottom: theme.spacing.md,
    padding: 0,
  },
  cardContent: {
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.sm,
  },
  serviceText: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  statusContainer: {
    marginTop: theme.spacing.sm,
    alignSelf: 'flex-start',
    paddingVertical: theme.spacing.xs / 2,
    paddingHorizontal: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm ?? 4,
  },
  statusText: {
    fontSize: theme.typography.caption,
    fontWeight: 'bold',
  },
  detailsButton: {
    marginTop: theme.spacing.sm,
    margin: theme.spacing.md,
    marginBottom: theme.spacing.md,
  },
  // Status-specific styles
  Upcoming: {
    color: theme.colors.primary, // Example color
  },
  Past: {
    color: theme.colors.textMuted,
  },
  Cancelled: {
    color: theme.colors.destructive, 
  },
  emptyText: {
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    color: theme.colors.textMuted,
    fontSize: theme.typography.body,
  },
}); 