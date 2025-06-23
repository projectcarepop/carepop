import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  Button,
  theme,
} from '../components';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, Calendar, Clock, MapPin, Stethoscope, Building } from 'lucide-react-native';
import type { AppointmentsStackParamList } from '../navigation/AppNavigator';
import api, { type Appointment } from '../utils/api';
import { format } from 'date-fns';

type AppointmentDetailScreenRouteProp = RouteProp<
  AppointmentsStackParamList,
  'AppointmentDetail'
>;

const useAppointmentDetails = (appointmentId: string) => {
  const [appointment, setAppointment] = React.useState<Appointment | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const fetchAppointment = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/appointments/my/${appointmentId}`);
        setAppointment(data);
      } catch (e: any) {
        setError(e.message || 'Failed to fetch appointment details.');
      } finally {
        setLoading(false);
      }
    };

    fetchAppointment();
  }, [appointmentId]);

  return { appointment, loading, error };
};

export const AppointmentDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<AppointmentDetailScreenRouteProp>();
  const navigation = useNavigation();
  const { appointmentId } = route.params;

  const { appointment, loading, error } = useAppointmentDetails(appointmentId);

  const handleCancelAppointment = async () => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: async () => {
            try {
              await api.delete(`/appointments/my/${appointmentId}`);
              // TODO: Add toast message for success
              navigation.goBack();
            } catch (e) {
              // TODO: Add toast message for error
              console.error(e);
            }
        }}
      ]
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (error || !appointment) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{error || 'Appointment not found.'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backButton, { top: insets.top + 10, left: insets.left + 20}]}>
          <ArrowLeft size={24} color={theme.colors.foreground} />
      </TouchableOpacity>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{
          paddingTop: insets.top + 60,
          paddingBottom: insets.bottom + 20,
          paddingHorizontal: 20,
        }}
      >
          <Card>
              <CardHeader>
                  <CardTitle style={styles.title}>{appointment.services.name}</CardTitle>
                  <CardDescription style={[styles.status, appointment.status === 'confirmed' && styles.confirmed]}>{appointment.status.replace('_', ' ')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <View style={styles.detailItem}>
                      <Calendar size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{format(new Date(appointment.appointment_date), 'MMMM dd, yyyy')} at {format(new Date(`1970-01-01T${appointment.start_time}`), 'hh:mm a')}</Text>
                  </View>
                   <View style={styles.detailItem}>
                      <Stethoscope size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{appointment.providers.first_name} {appointment.providers.last_name}</Text>
                  </View>
                  <View style={styles.detailItem}>
                      <Building size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{appointment.clinics.name}</Text>
                  </View>
                   <View style={styles.detailItem}>
                      <MapPin size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{appointment.clinics.address_line_1}</Text>
                  </View>
              </CardContent>
          </Card>

          {appointment.notes && (
            <Card style={styles.notesCard}>
                <CardHeader>
                    <CardTitle style={styles.notesTitle}>Notes for your visit</CardTitle>
                </CardHeader>
                <CardContent>
                    <Text style={styles.notesText}>{appointment.notes}</Text>
                </CardContent>
            </Card>
          )}

          <View style={styles.buttonContainer}>
              <Button title="Cancel Appointment" variant="destructive" onPress={handleCancelAppointment} />
          </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  backButton: {
    position: 'absolute',
    zIndex: 10,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
  },
  title: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.xs,
  },
  status: {
    ...theme.typography.body,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilySemiBold,
    textTransform: 'capitalize',
  },
  confirmed: {
    color: theme.colors.success,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  detailText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.md,
    flexShrink: 1,
  },
  notesCard: {
      marginTop: theme.spacing.lg,
  },
  notesTitle: {
      ...theme.typography.h4,
  },
  notesText: {
      ...theme.typography.body,
  },
  buttonContainer: {
      marginTop: theme.spacing.xl,
  }
}); 