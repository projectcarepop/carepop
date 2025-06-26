import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, TouchableOpacity, ScrollView, SectionList, Platform, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme, Button } from '../components';
import { getPublicServices, getPublicClinics, getPublicAvailability, createAppointment } from '../services/api';
import type { Service, Clinic, AvailabilitySlot, NewAppointment } from '../lib/types';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

export function BookingScreen() {
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSlot, setSelectedSlot] = useState<{ doctorId: string; time: string } | null>(null);

  const [showDatePicker, setShowDatePicker] = useState(Platform.OS === 'ios');

  const navigation = useNavigation();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Step 1: Fetch services
  const { 
    data: services, 
    isLoading: isLoadingServices, 
  } = useQuery<Service[], Error>({
    queryKey: ['publicServices'],
    queryFn: getPublicServices,
  });

  // Step 2: Fetch clinics
  const {
    data: clinics,
    isLoading: isLoadingClinics,
  } = useQuery<Clinic[], Error>({
    queryKey: ['clinics', selectedService?.id],
    queryFn: () => getPublicClinics(selectedService!.id),
    enabled: !!selectedService,
  });
  
  // Step 3: Fetch availability
  const {
    data: availability,
    isLoading: isLoadingAvailability,
  } = useQuery<AvailabilitySlot[], Error>({
    queryKey: ['availability', selectedService?.id, selectedClinic?.id, format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => getPublicAvailability({
      serviceId: selectedService!.id,
      clinicId: selectedClinic!.id,
      date: format(selectedDate, 'yyyy-MM-dd'),
    }),
    enabled: !!selectedService && !!selectedClinic,
  });
  
  // Step 4: Create Appointment Mutation
  const { mutate: submitAppointment, isPending: isSubmitting } = useMutation({
    mutationFn: (newAppointment: NewAppointment) => createAppointment(newAppointment),
    onSuccess: () => {
      Alert.alert('Success', 'Your appointment has been booked successfully!');
      // Invalidate queries to refetch appointments on the dashboard
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      navigation.goBack();
    },
    onError: (error) => {
      Alert.alert('Booking Failed', error.message || 'An unexpected error occurred. Please try again.');
    },
  });

  const handleConfirmBooking = () => {
    if (!user || !selectedService || !selectedClinic || !selectedSlot) {
      Alert.alert('Error', 'Missing information. Please start over.');
      return;
    }

    const [hour, minute] = selectedSlot.time.split(':').map(Number);
    const appointmentDate = new Date(selectedDate);
    appointmentDate.setHours(hour);
    appointmentDate.setMinutes(minute);
    appointmentDate.setSeconds(0);
    appointmentDate.setMilliseconds(0);

    const newAppointment: NewAppointment = {
      patientId: user.id,
      serviceId: selectedService.id,
      clinicId: selectedClinic.id,
      doctorId: selectedSlot.doctorId,
      appointmentTime: appointmentDate.toISOString(),
    };
    
    submitAppointment(newAppointment);
  };

  const handleSelectService = (service: Service) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleSelectClinic = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setStep(3);
  };
  
  const handleSelectSlot = (doctorId: string, time: string) => {
    setSelectedSlot({ doctorId, time });
    setStep(4);
  };

  const onDateChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS === 'android') {
        setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleGoBack = () => {
    if (step > 1) {
      if (step === 2) setSelectedService(null);
      if (step === 3) setSelectedClinic(null);
      if (step === 4) setSelectedSlot(null);
      setStep(step - 1);
    } else {
      navigation.goBack();
    }
  };
  
  // --- UI Components for each step ---

  const Step1_SelectService = () => (
    <FlatList
      data={services}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleSelectService(item)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.description}</Text>
            <Text style={styles.cardPrice}>${item.price}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={() => <Text style={styles.stepTitle}>Step 1: Select a Service</Text>}
      ListEmptyComponent={() => isLoadingServices ? <ActivityIndicator/> : <Text>No services found.</Text>}
    />
  );

  const Step2_SelectClinic = () => (
    <FlatList
      data={clinics}
      renderItem={({ item }) => (
        <TouchableOpacity style={styles.card} onPress={() => handleSelectClinic(item)}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.cardDescription}>{item.address ? JSON.stringify(item.address) : 'No address provided'}</Text>
        </TouchableOpacity>
      )}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContainer}
      ListHeaderComponent={() => <Text style={styles.stepTitle}>Step 2: Select a Clinic</Text>}
      ListEmptyComponent={() => isLoadingClinics ? <ActivityIndicator/> : <Text>No clinics found for this service.</Text>}
    />
  );
  
  const Step3_SelectDoctorAndTime = () => (
    <ScrollView>
      <Text style={styles.stepTitle}>Step 3: Select Date & Time</Text>
      
      <Button
        title={`Selected Date: ${format(selectedDate, 'MMM d, yyyy')}`}
        onPress={() => setShowDatePicker(true)}
        variant="outline"
        style={{marginBottom: theme.spacing.lg}}
      />
      {Platform.OS === 'android' && showDatePicker && (
        <DateTimePicker value={selectedDate} mode="date" display="default" onChange={onDateChange} minimumDate={new Date()} />
      )}
      {Platform.OS === 'ios' && (
         <DateTimePicker value={selectedDate} mode="date" display="spinner" onChange={onDateChange} minimumDate={new Date()} />
      )}

      {isLoadingAvailability && <ActivityIndicator size="large" color={theme.colors.primary} style={styles.centered} />}
      
      {availability && (
        <SectionList
          sections={availability.map(doc => ({ title: doc.doctorName, data: doc.slots, doctorId: doc.doctorId }))}
          keyExtractor={(item, index) => item + index}
          renderSectionHeader={({ section: { title } }) => <Text style={styles.sectionHeader}>{title}</Text>}
          renderItem={({ item, section }) => (
            <TouchableOpacity style={styles.slotButton} onPress={() => handleSelectSlot(section.doctorId, item)}>
              <Text style={styles.slotText}>{item}</Text>
            </TouchableOpacity>
          )}
          contentContainerStyle={styles.slotsContainer}
        />
      )}
    </ScrollView>
  );

  const Step4_Confirmation = () => {
    const doctorName = availability?.find(doc => doc.doctorId === selectedSlot?.doctorId)?.doctorName;
    return (
        <ScrollView style={styles.container}>
            <Text style={styles.stepTitle}>Step 4: Confirm Your Booking</Text>
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Service:</Text>
                    <Text style={styles.summaryValue}>{selectedService?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Clinic:</Text>
                    <Text style={styles.summaryValue}>{selectedClinic?.name}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Doctor:</Text>
                    <Text style={styles.summaryValue}>{doctorName}</Text>
                </View>
                <View style={styles.summaryRow}>
                    <Text style={styles.summaryLabel}>Date & Time:</Text>
                    <Text style={styles.summaryValue}>
                        {format(selectedDate, 'MMM d, yyyy')} at {selectedSlot?.time}
                    </Text>
                </View>
            </View>
            <Button 
                title={isSubmitting ? 'Booking...' : 'Confirm & Book Appointment'} 
                onPress={handleConfirmBooking}
                disabled={isSubmitting}
            />
        </ScrollView>
    );
  };

  const renderContent = () => {
    switch (step) {
      case 1: return <Step1_SelectService />;
      case 2: return <Step2_SelectClinic />;
      case 3: return <Step3_SelectDoctorAndTime />;
      case 4: return <Step4_Confirmation />;
      default: return null;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleGoBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Book an Appointment</Text>
      </View>
      {renderContent()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  container: { flex: 1, paddingHorizontal: theme.spacing.lg },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    fontFamily: theme.typography.fontFamilyBold,
  },
  stepTitle: {
    ...theme.typography.h2,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
  },
  listContainer: {
    paddingVertical: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.foreground,
  },
  cardDescription: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginTop: theme.spacing.xs,
  },
  cardPrice: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilyBold,
    color: theme.colors.primary,
    textAlign: 'right',
    marginTop: theme.spacing.md,
  },
  sectionHeader: {
    ...theme.typography.h4,
    backgroundColor: theme.colors.muted,
    padding: theme.spacing.md,
    marginTop: theme.spacing.lg,
    borderRadius: theme.radius.md,
  },
  slotsContainer: {
    paddingVertical: theme.spacing.lg,
  },
  slotButton: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    margin: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  slotText: {
    ...theme.typography.body,
    textAlign: 'center',
  },
  summaryCard: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.secondary,
  },
  summaryValue: {
    ...theme.typography.body,
    color: theme.colors.foreground,
    flexShrink: 1,
    textAlign: 'right',
  },
}); 