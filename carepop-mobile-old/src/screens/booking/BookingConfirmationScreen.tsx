import React, { useContext } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp, CommonActions } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { format, parseISO } from 'date-fns';
import { Calendar, Clock, MapPin, Stethoscope } from 'lucide-react-native';

import { theme } from '../../components/theme';
import { getPublicClinicById, getPublicServiceById, createAppointment, NewAppointmentPayload } from '../../services/api';
import { BookingStackParamList } from '../../navigation/BookingNavigator';
import { Card } from '../../components/card.native';
import { Button } from '../../components/button.native';
import { AuthContext } from '../../context/AuthContext';
import { Clinic, ServiceWithCategory } from '../../lib/types';

type ConfirmationRouteProp = RouteProp<BookingStackParamList, 'BookingConfirmation'>;
type ConfirmationNavigationProp = NativeStackNavigationProp<BookingStackParamList, 'BookingConfirmation'>;

export default function BookingConfirmationScreen() {
  const navigation = useNavigation<ConfirmationNavigationProp>();
  const route = useRoute<ConfirmationRouteProp>();
  const { clinicId, serviceId, dateTime } = route.params;
  const queryClient = useQueryClient();
  const { user } = useContext(AuthContext);

  // Fetch details for the summary view using efficient queries
  const { data: clinic, isLoading: isLoadingClinic } = useQuery<Clinic, Error>({
    queryKey: ['publicClinic', clinicId],
    queryFn: () => getPublicClinicById(clinicId),
    enabled: !!clinicId,
  });

  const { data: service, isLoading: isLoadingService } = useQuery<ServiceWithCategory, Error>({
    queryKey: ['publicService', serviceId],
    queryFn: () => getPublicServiceById(serviceId),
    enabled: !!serviceId,
  });

  const { mutate: submitBooking, isPending } = useMutation({
    mutationFn: (payload: NewAppointmentPayload) => createAppointment(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] }); // Invalidate for dashboard refetch
      // Navigate to the success screen with appointment details
      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: 'BookingSuccess', params: { appointmentDetails: data } }],
        })
      );
    },
    onError: (error) => {
      Alert.alert("Booking Failed", error.message || "Could not book the appointment.");
    },
  });

  const handleConfirmBooking = () => {
    if (!user) {
      Alert.alert("Authentication Error", "You must be logged in to book an appointment.");
      return;
    }
    const payload = { clinicId, serviceId, appointmentTime: dateTime, patientId: user.id };
    submitBooking(payload);
  };

  const isLoading = isLoadingClinic || isLoadingService;

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  const SummaryRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string | undefined }) => (
    <View style={styles.row}>
      <Icon color={theme.colors.primary} size={20} style={styles.icon} />
      <View>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.value}>{value || 'N/A'}</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Confirm Your Booking</Text>
          <Text style={styles.subtitle}>Step 4 of 4 - Almost there!</Text>
        </View>

        <Card style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Appointment Summary</Text>
          <View style={styles.separator} />
          <SummaryRow icon={Stethoscope} label="Service" value={service?.name} />
          <SummaryRow icon={MapPin} label="Clinic" value={clinic?.name} />
          <SummaryRow icon={Calendar} label="Date" value={format(parseISO(dateTime), 'EEEE, MMMM d, yyyy')} />
          <SummaryRow icon={Clock} label="Time" value={format(parseISO(dateTime), 'h:mm a')} />
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button onPress={handleConfirmBooking} disabled={isPending}>
          {isPending ? <ActivityIndicator color={theme.colors.primaryForeground} /> : "Confirm & Book Now"}
        </Button>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  scrollContainer: { flexGrow: 1, padding: theme.spacing.lg },
  header: { marginBottom: theme.spacing.xl },
  title: { ...theme.typography.h2, color: theme.colors.foreground, textAlign: 'center' },
  subtitle: { ...theme.typography.body, color: theme.colors.mutedForeground, textAlign: 'center', marginTop: theme.spacing.xs },
  summaryCard: { padding: 0, overflow: 'hidden' },
  cardTitle: { ...theme.typography.h4, padding: theme.spacing.lg },
  separator: { height: 1, backgroundColor: theme.colors.border },
  row: { flexDirection: 'row', alignItems: 'center', padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  icon: { marginRight: theme.spacing.lg },
  label: { ...theme.typography.small, color: theme.colors.mutedForeground },
  value: { ...theme.typography.body, fontFamily: theme.typography.fontFamilySemiBold, color: theme.colors.foreground, marginTop: 2 },
  footer: { padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border, backgroundColor: theme.colors.background },
}); 