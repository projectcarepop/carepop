import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { format, differenceInHours } from 'date-fns';
import { Calendar, Clock, Building } from 'lucide-react-native';
import { theme } from '../theme';
import { Card } from '../card.native';
import { Badge, getStatusStyles } from '../Badge';
import type { DetailedAppointment } from '../../lib/types';
import { Button } from '../button.native';

interface AppointmentCardProps {
  appointment: Omit<DetailedAppointment, 'appointmentTime'>;
  appointmentDate: Date;
  onCancel: () => void;
  isCancelling?: boolean;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({ appointment, appointmentDate, onCancel, isCancelling }) => {
  const { status, service, clinic } = appointment;
  const displayStatus = status || 'unknown';
  const { bgColor, textColor, Icon } = getStatusStyles(displayStatus as any);

  const formattedDate = format(appointmentDate, 'eeee, MMMM dd');
  const formattedTime = format(appointmentDate, 'h:mm a');
  const statusText = displayStatus.replace(/_/g, ' ').replace('canceled by', 'cancelled by');

  // Determine if appointment can be cancelled following web restrictions
  const isCancellable = (() => {
    // Only scheduled appointments can be cancelled
    if (status !== 'scheduled') return false;
    
    // Past appointments cannot be cancelled
    if (appointmentDate <= new Date()) return false;
    
    // Must be at least 36 hours in advance (following web rules)
    try {
      const hoursUntilAppointment = differenceInHours(appointmentDate, new Date());
      return hoursUntilAppointment >= 36;
    } catch {
      return false; // If date calculation fails, disable cancellation
    }
  })();

  return (
    <Card style={styles.card}>
      <View style={styles.mainContent}>
        <View style={styles.header}>
          <Text style={styles.serviceName} numberOfLines={2}>
            {service?.name || 'Service not specified'}
          </Text>
          <Badge
            text={statusText}
            backgroundColor={bgColor}
            textColor={textColor}
            icon={<Icon size={12} color={textColor} />}
          />
        </View>

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Building size={16} color={theme.colors.secondary} />
            <Text style={styles.detailText}>{clinic?.name || 'Clinic not specified'}</Text>
          </View>
          <View style={styles.detailRow}>
            <Calendar size={16} color={theme.colors.secondary} />
            <Text style={styles.detailText}>{formattedDate}</Text>
          </View>
          <View style={styles.detailRow}>
            <Clock size={16} color={theme.colors.secondary} />
            <Text style={styles.detailText}>{formattedTime}</Text>
          </View>
        </View>
        
        {isCancellable && (
          <View style={styles.actionsContainer}>
            <Button
              variant="destructive"
              size="sm"
              onPress={onCancel}
              disabled={isCancelling}
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </Button>
          </View>
        )}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.radius.md,
    padding: 0,
    overflow: 'hidden',
    flexDirection: 'column',
  },
  mainContent: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.lg,
  },
  serviceName: {
    fontSize: 20,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.md,
  },
  detailsContainer: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  detailText: {
    marginLeft: theme.spacing.md,
    fontSize: 14,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.secondary,
  },
  actionsContainer: {
    marginTop: theme.spacing.md,
    alignItems: 'flex-start',
  },
});

export default AppointmentCard; 