import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text, useTheme } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';

// Import the canonical Appointment type
import { Appointment } from '../../utils/api';

interface AppointmentCardProps {
  appointment: Appointment;
  onPress: () => void;
}

const statusDetails = {
  confirmed: { icon: 'checkmark-circle', color: '#4CAF50', text: 'Confirmed' },
  pending_confirmation: { icon: 'time-outline', color: '#FFC107', text: 'Pending' },
  cancelled: { icon: 'close-circle', color: '#F44336', text: 'Cancelled' },
  completed: { icon: 'flag-outline', color: '#2196F3', text: 'Completed' },
  no_show: { icon: 'alert-circle', color: '#9E9E9E', text: 'No Show' },
};

export const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, onPress }) => {
  const theme = useTheme();
  const detail = statusDetails[appointment.status] || statusDetails.no_show;

  return (
    <Card style={styles.card} onPress={onPress}>
      <Card.Content>
        <View style={styles.header}>
          <Text variant="titleMedium" style={styles.serviceName}>{appointment.services.name}</Text>
          <View style={[styles.statusBadge, { backgroundColor: detail.color }]}>
            <Ionicons name={detail.icon as any} size={14} color="#fff" />
            <Text style={styles.statusText}>{detail.text}</Text>
          </View>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {format(new Date(appointment.appointment_datetime), 'EEE, MMM d, yyyy')}
          </Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="time-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {format(new Date(appointment.appointment_datetime), 'h:mm a')}
          </Text>
        </View>
        <View style={styles.separator} />
        <View style={styles.infoRow}>
          <Ionicons name="location-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.infoText}>{appointment.clinics.name}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="person-outline" size={16} color={theme.colors.onSurfaceVariant} />
          <Text variant="bodyMedium" style={styles.infoText}>
            {`Dr. ${appointment.providers.first_name} ${appointment.providers.last_name}`}
          </Text>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    marginVertical: 8,
    marginHorizontal: 16,
    elevation: 2,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceName: {
    flex: 1,
    fontWeight: 'bold',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    marginLeft: 4,
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  infoText: {
    marginLeft: 8,
  },
  separator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 12,
  },
}); 