import React from 'react';
import { StyleSheet, Text, View, ScrollView, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
import type { AppointmentsStackParamList } from '../navigation/AppDrawerNavigator';
import { getAppointmentById, cancelAppointment } from '../services/api';
import { format } from 'date-fns';
import type { DetailedAppointment } from '../lib/types';

// === HELPER FUNCTIONS ===
const formatClinicAddress = (clinic: any): string => {
  if (!clinic) return 'Address not available';
  
  // Cast to any to access all possible address field variations
  const c = clinic as any;
  
  // Option 1: Use full_address if available (Supabase format)
  if (c.full_address) {
    return c.full_address;
  }
  
  // Option 2: Build from individual Supabase fields
  if (c.street_address || c.locality || c.region) {
    const parts = [c.street_address, c.locality, c.region].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  // Option 3: Handle address as JSONB object (Drizzle format)
  if (c.address && typeof c.address === 'object') {
    const addr = c.address;
    const parts = [
      addr.street, 
      addr.city || addr.cityMunicipality, 
      addr.province,
      addr.barangay
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  // Option 4: Handle individual address fields (legacy format)
  if (c.street || c.cityMunicipality) {
    const cityName = typeof c.cityMunicipality === 'string' 
      ? c.cityMunicipality 
      : c.cityMunicipality?.name;
    const provinceName = typeof c.province === 'string'
      ? c.province
      : c.province?.name;
    const parts = [c.street, cityName, provinceName].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  return 'Address not available';
};

type AppointmentDetailScreenRouteProp = RouteProp<
  AppointmentsStackParamList,
  'AppointmentDetail'
>;

export const AppointmentDetailScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const route = useRoute<AppointmentDetailScreenRouteProp>();
  const navigation = useNavigation();
  const queryClient = useQueryClient();
  const { appointmentId } = route.params;

  const { data: appointment, isLoading, isError, error } = useQuery({
    queryKey: ['appointment', appointmentId],
    queryFn: () => getAppointmentById(appointmentId),
    enabled: !!appointmentId,
  });

  const { mutate: cancel, isPending: isCanceling } = useMutation({
    mutationFn: () => cancelAppointment(appointmentId),
    onSuccess: () => {
      // Invalidate queries to refetch appointments list on the previous screen
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      navigation.goBack();
    },
    onError: (e) => {
      Alert.alert("Error", (e as Error).message || "Failed to cancel appointment.");
    }
  });

  const handleCancelAppointment = () => {
    Alert.alert(
      "Confirm Cancellation",
      "Are you sure you want to cancel this appointment?",
      [
        { text: "No", style: "cancel" },
        { text: "Yes, Cancel", style: "destructive", onPress: () => cancel() }
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  if (isError || !appointment) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text style={styles.errorText}>{(error as Error)?.message || 'Appointment not found.'}</Text>
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
                  <CardTitle style={styles.title}>{appointment.service.name}</CardTitle>
                  <CardDescription style={[styles.status, appointment.status === 'scheduled' && styles.confirmed]}>{appointment.status.replace(/_/g, ' ')}</CardDescription>
              </CardHeader>
              <CardContent>
                  <View style={styles.detailItem}>
                      <Calendar size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{format(new Date(appointment.appointmentTime), 'MMMM dd, yyyy')} at {format(new Date(appointment.appointmentTime), 'hh:mm a')}</Text>
                  </View>
                   <View style={styles.detailItem}>
                      <Stethoscope size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{appointment.doctor.fullName}</Text>
                  </View>
                  <View style={styles.detailItem}>
                      <Building size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{appointment.clinic.name}</Text>
                  </View>
                   <View style={styles.detailItem}>
                      <MapPin size={20} color={theme.colors.primary} />
                      <Text style={styles.detailText}>{formatClinicAddress(appointment.clinic)}</Text>
                  </View>
              </CardContent>
          </Card>

          {/* This assumes notes are part of the detailed appointment type */}
          {/* <Card style={styles.notesCard}> ... </Card> */}

          <View style={styles.buttonContainer}>
              <Button title="Cancel Appointment" variant="destructive" onPress={handleCancelAppointment} isLoading={isCanceling} disabled={isCanceling} />
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