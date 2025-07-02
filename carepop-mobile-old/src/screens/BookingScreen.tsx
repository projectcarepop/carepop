import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  SafeAreaView,
  Alert,
  ScrollView,
  Modal,
} from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigation } from '@react-navigation/native';
import { Calendar, DateData } from 'react-native-calendars';
import { ChevronsRight, X, Calendar as CalendarIcon, Clock, Building, Stethoscope, MapPin, CheckCircle } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import {
    startOfMonth,
    endOfMonth,
    format,
    isSameDay,
    parseISO,
    setHours,
    setMinutes,
    setSeconds,
    addMinutes,
    isBefore,
} from 'date-fns';

import {
  getPublicClinics,
  getPublicServices,
  getPublicServiceCategories,
  getClinicBookedAppointments,
  createAppointment,
  NewAppointmentPayload,
  ServiceCategory,
} from '../services/api';
import type {
  Clinic,
  ServiceWithCategory,
} from '../lib/types';
import { useDebounce } from '../hooks/useDebounce';
import { theme } from '../components/theme';
import { DrawerParamList } from '../navigation/AppDrawerNavigator';
import { Card } from '../components/card.native';
import { Button } from '../components/button.native';


type BookingScreenNavigationProp = StackNavigationProp<DrawerParamList, 'Booking'>;

type Step = 'clinic' | 'service' | 'datetime' | 'confirm';

const STEPS = [
    { key: 'clinic' as Step, number: 1, title: 'Select a Clinic', description: 'Choose your preferred clinic location to begin.' },
    { key: 'service' as Step, number: 2, title: 'Select a Service', description: 'Pick a service available at the selected clinic.' },
    { key: 'datetime' as Step, number: 3, title: 'Select Date & Time', description: 'Choose a date and time that works for you.' },
    { key: 'confirm' as Step, number: 4, title: 'Confirm & Book', description: 'Review your selections and confirm your appointment.' },
];

const BookingScreen = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();
    const queryClient = useQueryClient();

  // State Management
  const [currentStep, setCurrentStep] = useState<Step>('clinic');
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>('all');
  const [isCategoryPickerVisible, setCategoryPickerVisible] = useState(false);
  const [isSuccessModalVisible, setSuccessModalVisible] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  // --- Data Fetching using React Query ---
  const { data: clinics, isLoading: isLoadingClinics } = useQuery<Clinic[], Error>({ 
    queryKey: ['publicClinics'], 
    queryFn: getPublicClinics,
    select: (data: any) => data.data || data,
  });
  const { data: serviceCategories, isLoading: isLoadingCategories } = useQuery<ServiceCategory[], Error>({
    queryKey: ['publicServiceCategories'],
    queryFn: getPublicServiceCategories,
    enabled: !!selectedClinicId,
    select: (data: any) => data.data || data,
  });
  const { data: services, isLoading: isLoadingServices } = useQuery<ServiceWithCategory[], Error>({
    queryKey: ['publicServices', selectedClinicId],
    queryFn: () => getPublicServices(selectedClinicId!),
    enabled: !!selectedClinicId,
    select: (data: any) => data.data || data,
  });
  
  // --- NEW: Core Data Fetching Logic ---
  const { data: bookedAppointments, isLoading: isLoadingBookedAppointments } = useQuery({
    queryKey: ['bookedAppointments', selectedClinicId, format(currentMonth, 'yyyy-MM')],
    queryFn: () => {
      if (!selectedClinicId) return { data: [] };
      const startDate = startOfMonth(currentMonth).toISOString();
      const endDate = endOfMonth(currentMonth).toISOString();
      return getClinicBookedAppointments({ clinicId: selectedClinicId, startDate, endDate });
    },
    enabled: !!selectedClinicId,
    select: (res) => (res?.data ?? []).map(appt => ({
        ...appt,
        appointmentTime: parseISO(appt.appointmentTime) // Ensure dates are Date objects
    })),
  });


  const { mutate: bookAppointment, isPending: isBooking } = useMutation({
    mutationFn: (appointmentData: NewAppointmentPayload) => createAppointment(appointmentData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['bookedAppointments'] }); // NEW
      setSuccessModalVisible(true);
    },
    onError: (error: Error) => {
      console.error('Booking mutation error:', JSON.stringify(error, null, 2));
      Alert.alert('Booking Failed', error.message || 'An unexpected error occurred.');
    },
  });

  // --- Derived State ---
  const selectedClinic = useMemo(() => clinics?.find(c => c.id === selectedClinicId), [clinics, selectedClinicId]);
  const selectedService = useMemo(() => services?.find(s => s.id === selectedServiceId), [services, selectedServiceId]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    let filtered = services;

    if (selectedCategoryId && selectedCategoryId !== 'all') {
      filtered = filtered.filter(service => service.serviceCategory?.id === selectedCategoryId);
    }

    if (debouncedSearchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [services, selectedCategoryId, debouncedSearchQuery]);

  // --- NEW: Core Availability Calculation ---
  const availableTimeSlots = useMemo(() => {
    if (!selectedDate || !selectedService || !bookedAppointments) {
      return [];
    }
    
    const serviceDuration = selectedService.durationMinutes ?? 30;
    const dayAsDateObj = parseISO(selectedDate);
    const workDayStart = setHours(setMinutes(setSeconds(dayAsDateObj, 0), 0), 9); // 9:00 AM
    const workDayEnd = setHours(setMinutes(setSeconds(dayAsDateObj, 0), 0), 17); // 5:00 PM (17:00)

    const potentialSlots: Date[] = [];
    let currentSlot = workDayStart;
    while (isBefore(currentSlot, workDayEnd)) {
        potentialSlots.push(currentSlot);
        currentSlot = addMinutes(currentSlot, serviceDuration);
    }

    const bookedSlotsSet = new Set(
        bookedAppointments
            .filter(appt => isSameDay(appt.appointmentTime, dayAsDateObj))
            .map(appt => appt.appointmentTime.toISOString())
    );

    const availableSlots = potentialSlots.filter(
        slot => !bookedSlotsSet.has(slot.toISOString())
    );

    return availableSlots;
  }, [selectedDate, selectedService, bookedAppointments]);

  const formatAddress = (address: any): string => {
    if (!address) {
      return 'Address not available';
    }
    if (typeof address === 'string') {
      return address;
    }
    if (typeof address === 'object') {
      const { street, city, zip } = address;
      return [street, city, zip].filter(Boolean).join(', ');
    }
    return 'Address not available';
  };

  const formatTo12Hour = (time24: string | null): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${h12}:${minutes} ${ampm}`;
  };

  // --- Event Handlers ---
  const goToNextStep = () => {
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    if (currentIndex < STEPS.length - 1) {
      setSearchQuery(''); // Reset search when moving to next step
      setCurrentStep(STEPS[currentIndex + 1].key);
    }
  };

  const goToPreviousStep = () => {
    const currentIndex = STEPS.findIndex(s => s.key === currentStep);
    if (currentIndex > 0) {
      setSearchQuery(''); // Reset search when moving to prev step
      setCurrentStep(STEPS[currentIndex - 1].key);
    }
  };

    const handleConfirmBooking = () => {
    if (!selectedClinicId || !selectedServiceId || !selectedTime) {
      Alert.alert("Error", "Missing information. Please complete all steps.");
      return;
    }
    
    const payload = {
      clinicId: selectedClinicId,
      serviceId: selectedServiceId,
      appointmentTime: selectedTime,
      doctorId: '02ab0a6b-b366-4c10-9b75-623a5be46f1d',
    };
    
    bookAppointment(payload);
  };

  const resetFlow = () => {
    setCurrentStep('clinic');
    setSelectedClinicId(null);
    setSelectedServiceId(null);
    setSelectedDate(null);
    setSelectedTime(null);
    setSearchQuery('');
    setSelectedCategoryId('all');
    setSuccessModalVisible(false);
    setCurrentMonth(new Date());
  };

  // --- UI Components ---
  const WizardHeader = () => {
      const stepInfo = STEPS.find(s => s.key === currentStep)!;
      const progress = (stepInfo.number / STEPS.length) * 100;

      return (
        <View style={styles.wizardHeader}>
          <Text style={styles.wizardStepText}>Step {stepInfo.number} of {STEPS.length}</Text>
          <Text style={styles.wizardTitle}>{stepInfo.title}</Text>
          <Text style={styles.wizardDescription}>{stepInfo.description}</Text>
          <View style={styles.progressBarContainer}>
            <View style={[styles.progressBar, { width: `${progress}%` }]} />
          </View>
        </View>
      );
  };

  const SkeletonCard = () => (
    <View style={styles.skeletonCard}>
      <View style={styles.skeletonLineLg} />
      <View style={styles.skeletonLineSm} />
    </View>
  );

  const EmptyState = ({ icon, message, description }: { icon: React.ReactNode, message: string, description: string }) => (
    <View style={styles.emptyStateContainer}>
      {icon}
      <Text style={styles.emptyStateMessage}>{message}</Text>
      <Text style={styles.emptyStateDescription}>{description}</Text>
    </View>
  );

  const CustomPickerModal = ({ visible, onClose, children, title }: { visible: boolean, onClose: () => void, children: React.ReactNode, title: string }) => (
      <Modal animationType="slide" transparent={true} visible={visible} onRequestClose={onClose}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>{title}</Text>
                <TouchableOpacity onPress={onClose} style={styles.modalCloseButton}>
                    <X size={24} color={theme.colors.secondary} />
                </TouchableOpacity>
            </View>
            {children}
          </View>
        </View>
      </Modal>
  );

  // --- Step Render Functions ---

  const renderClinicStep = () => {
    if (isLoadingClinics) {
        return <View style={styles.listContainer}>{ [1,2,3,4].map(i => <SkeletonCard key={i} />) }</View>;
    }
                return (
                                    <FlatList
        data={clinics?.filter(c => c.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))}
                                        keyExtractor={(item) => item.id}
                                        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedClinicId(item.id)}>
            <Card style={[styles.selectableCard, selectedClinicId === item.id && styles.selectedCard, { marginHorizontal: theme.spacing.lg }]}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.addressContainer}>
                <MapPin size={14} color={theme.colors.mutedForeground} />
                <Text style={styles.cardSubtitle}>{formatAddress(item.address)}</Text>
              </View>
            </Card>
                                            </TouchableOpacity>
                                        )}
        ListHeaderComponent={<TextInput style={[styles.searchInput, {marginHorizontal: theme.spacing.lg}]} placeholder="Search clinics..." onChangeText={setSearchQuery} value={searchQuery} />}
        ListEmptyComponent={<EmptyState icon={<Building size={48} color={theme.colors.mutedForeground}/>} message="No Clinics Found" description="We couldn't find any clinics. Please check back later." />}
        contentContainerStyle={styles.listContainer}
      />
    );
  }

  const renderServiceStep = () => {
    if (isLoadingServices) {
        return <View style={styles.listContainer}>{ [1,2,3,4].map(i => <SkeletonCard key={i} />) }</View>;
    }

    const currentCategoryName = (selectedCategoryId === 'all' || !selectedCategoryId)
        ? 'All Categories'
        : serviceCategories?.find(c=>c.id === selectedCategoryId)?.name || 'Select a Category';

                return (
        <View style={{flex: 1}}>
          {isLoadingCategories ? <ActivityIndicator style={{marginVertical: theme.spacing.lg}} /> : (
              <TouchableOpacity onPress={() => setCategoryPickerVisible(true)} style={[styles.pickerInput, {marginHorizontal: theme.spacing.lg}]}>
                  <Text>{currentCategoryName}</Text>
                  <ChevronsRight color={theme.colors.mutedForeground} />
              </TouchableOpacity>
          )}
                            <FlatList
            data={filteredServices}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
              <TouchableOpacity onPress={() => setSelectedServiceId(item.id)}>
                <Card style={[styles.selectableCard, selectedServiceId === item.id && styles.selectedCard, { marginHorizontal: theme.spacing.lg }]}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.serviceCategory?.name && (
                      <View style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{item.serviceCategory.name}</Text>
                                        </View>
                  )}
                  <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description}</Text>
                </Card>
                                    </TouchableOpacity>
                                )}
            ListHeaderComponent={<TextInput style={[styles.searchInput, {marginHorizontal: theme.spacing.lg}]} placeholder="Search services..." onChangeText={setSearchQuery} value={searchQuery} />}
            ListEmptyComponent={<EmptyState icon={<Stethoscope size={48} color={theme.colors.mutedForeground}/>} message="No Services Available" description="No services match your search or filter. Please try a different category." />}
            contentContainerStyle={styles.listContainer}
                            />
                    </View>
                );
  }

  const renderDateTimeStep = () => (
    <View style={{ flex: 1, paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.lg }}>
                                   <Calendar
            onDayPress={(day: DateData) => {
              setSelectedDate(day.dateString);
              setSelectedTime(null);
            }}
            markedDates={{ [selectedDate || '']: { selected: true, selectedColor: theme.colors.primary } }}
            minDate={new Date().toISOString().split('T')[0]}
            onMonthChange={(month) => setCurrentMonth(new Date(month.dateString))}
            theme={{
                arrowColor: theme.colors.primary,
                todayTextColor: theme.colors.foreground,
                monthTextColor: theme.colors.primary,
                dayTextColor: theme.colors.foreground,
                textDayFontFamily: theme.typography.fontFamily,
                textMonthFontFamily: theme.typography.fontFamilySemiBold,
                textDayHeaderFontFamily: theme.typography.fontFamilySemiBold,
            }}
            style={{
                borderWidth: 1,
                borderColor: theme.colors.border,
                borderRadius: theme.radius.md,
                marginBottom: theme.spacing.md,
                marginHorizontal: theme.spacing.md,
                paddingHorizontal: theme.spacing.lg,
            }}
        />

        {(isLoadingBookedAppointments) && <ActivityIndicator style={{marginTop: theme.spacing.xl}}/>}

                            {selectedDate && (
            <View style={{ flex: 1 }}>
                {isLoadingBookedAppointments ? <ActivityIndicator style={{marginTop: theme.spacing.xl}}/> : (
                    <>
                        <View style={styles.timeSlotsHeaderContainer}>
                            <Clock size={18} color={theme.colors.secondary} />
                            <Text style={styles.timeSlotsHeaderText}>
                                Available Time Slots for {new Date(selectedDate + 'T00:00:00').toDateString()}
                                                    </Text>
                        </View>
                        <ScrollView>
                            <View style={styles.gridContainer}>
                                {availableTimeSlots.length === 0 ? (
                                    <Text>No time slots available for this date.</Text>
                                ) : (
                                    availableTimeSlots.map(time => {
                                        const timeAsString = time.toISOString();
                                        const timeFormatted = format(time, 'p');
                                        return (
                                            <Button key={timeAsString} variant={selectedTime === timeAsString ? 'default' : 'outline'} onPress={() => setSelectedTime(timeAsString)} style={styles.gridButton}>
                                                {timeFormatted}
                                            </Button>
                                        )
                                    })
                                )}
                            </View>
                        </ScrollView>
                    </>
                )}
                            </View>
                        )}
                    </View>
                );

  const renderConfirmStep = () => (
      <View style={{padding: theme.spacing.lg}}>
          <Card style={{padding: theme.spacing.lg*2, borderRadius: theme.radius.md}}>
              <Text style={{...theme.typography.h3, color: theme.colors.mutedForeground, fontFamily: theme.typography.fontFamilySemiBold}}>Appointment Summary</Text>
              <View style={styles.summaryContainer}>
                  <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Clinic</Text>
                      <Text style={styles.summaryValue}>{selectedClinic?.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Service</Text>
                      <Text style={styles.summaryValue}>{selectedService?.name}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Date</Text>
                      <Text style={styles.summaryValue}>{selectedDate ? new Date(selectedDate + 'T00:00:00').toDateString() : ''}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Time</Text>
                      <Text style={styles.summaryValue}>{selectedTime ? format(parseISO(selectedTime), 'p') : ''}</Text>
                  </View>
              </View>
          </Card>
      </View>
  );

  const renderSuccessModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isSuccessModalVisible}
      onRequestClose={resetFlow}
    >
      <View style={styles.modalBackdropConfirmation}>
        <View style={styles.modalContentConfirmation}>
          <View style={{alignItems: 'center', paddingTop: theme.spacing.lg}}>
            <CheckCircle size={64} color={theme.colors.success} strokeWidth={1.5}/>
            <Text style={styles.successModalTitle}>Booking Confirmed!</Text>
            <Text style={styles.successModalSubtitle}>Your appointment is scheduled. A confirmation has been sent to your email.</Text>
          </View>

          {/* Re-using the confirmation step for the summary */}
          {renderConfirmStep()}
          
          <View style={styles.successModalButtonContainer}>
            <Button
              variant="outline"
              onPress={() => {
                resetFlow();
                navigation.navigate('Appointments');
              }}
              style={styles.footerButton}
            >
              View My Appointments
            </Button>
            <View style={{width: theme.spacing.md}} />
            <Button
              onPress={resetFlow}
              style={styles.footerButton}
            >
              Book Another
            </Button>
          </View>
        </View>
      </View>
    </Modal>
  )

  const renderStepContent = () => {
    switch(currentStep) {
      case 'clinic': return renderClinicStep();
      case 'service': return renderServiceStep();
      case 'datetime': return renderDateTimeStep();
      case 'confirm': return renderConfirmStep();
      default: return null;
    }
  }

  // Main Render
    return (
    <SafeAreaView style={styles.container}>
      <WizardHeader />
            <View style={{flex: 1}}>
                    {renderStepContent()}
      </View>
      <View style={styles.footer}>
        {currentStep !== 'clinic' && <Button variant="outline" onPress={goToPreviousStep} style={styles.footerButton} textStyle={styles.footerBackButtonText}>Back</Button>}
        <View style={{flex:1, marginLeft: currentStep !== 'clinic' ? theme.spacing.md : 0}}>
            {currentStep === 'confirm' ? (
                <Button onPress={handleConfirmBooking} disabled={isBooking} style={styles.footerButton}>
                    {isBooking && <ActivityIndicator color={theme.colors.primaryForeground} style={{marginRight: theme.spacing.sm}}/>}
                    <Text style={styles.footerButtonText}>{isBooking ? 'Booking...' : 'Confirm & Book'}</Text>
                </Button>
            ) : (
                <Button onPress={goToNextStep} disabled={ (currentStep === 'clinic' && !selectedClinicId) || (currentStep === 'service' && !selectedServiceId) || (currentStep === 'datetime' && !selectedTime) } style={styles.footerButton} textStyle={styles.footerButtonText}>
                    Continue
                </Button>
            )}
        </View>
            </View>

      {/* Modals */}
      <CustomPickerModal visible={isCategoryPickerVisible} onClose={() => setCategoryPickerVisible(false)} title="Select a Category">
        <FlatList
            data={[{id: 'all', name: 'All Categories'}, ...(serviceCategories || [])]}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => {
                    setSelectedCategoryId(item.id);
                    setCategoryPickerVisible(false);
                }}>
                    <Text style={styles.modalItemText}>{item.name}</Text>
                </TouchableOpacity>
            )}
        />
      </CustomPickerModal>

      {renderSuccessModal()}

        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background },
  wizardHeader: { padding: theme.spacing.lg, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  wizardStepText: { ...theme.typography.xsmall, color: theme.colors.mutedForeground, textTransform: 'uppercase', letterSpacing: 0.5 },
  wizardTitle: { ...theme.typography.h2, color: theme.colors.secondary, marginTop: theme.spacing.xs },
  wizardDescription: { ...theme.typography.body, color: theme.colors.mutedForeground, marginTop: theme.spacing.sm },
  progressBarContainer: { height: 4, backgroundColor: theme.colors.border, borderRadius: theme.radius.full, marginTop: theme.spacing.lg, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: theme.colors.primary, borderRadius: theme.radius.full },
  listContainer: { paddingVertical: theme.spacing.lg, flexGrow: 1 },
  footer: { flexDirection: 'row', padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border },
  footerButton: {
    height: 48,
    borderRadius: theme.radius.md,
    
  },
  footerButtonText: {
    fontSize: 16,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.accentForeground,
  },
  footerBackButtonText: {
    color: theme.colors.primary,
  },
  selectableCard: { marginBottom: theme.spacing.md, padding: theme.spacing.lg, borderRadius: theme.radius.md },
  selectedCard: { borderWidth: 2, borderColor: theme.colors.primary },
  cardTitle: { ...theme.typography.h4, color: theme.colors.cardForeground },
  cardSubtitle: { ...theme.typography.small, color: theme.colors.mutedForeground, marginTop: theme.spacing.xs, marginLeft: theme.spacing.xs, flexShrink: 1 },
  addressContainer: { flexDirection: 'row', alignItems: 'center', marginTop: theme.spacing.xs },
  categoryTag: {
    backgroundColor: theme.colors.muted,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.full,
    marginTop: theme.spacing.xs,
    alignSelf: 'flex-start',
  },
  categoryTagText: {
    ...theme.typography.xsmall,
    color: theme.colors.mutedForeground,
    fontWeight: '500',
  },

  searchInput: { ...theme.typography.body, backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.md, padding: theme.spacing.md, marginBottom: theme.spacing.lg },
  pickerInput: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: theme.colors.card, borderWidth: 1, borderColor: theme.colors.border, borderRadius: theme.radius.sm, padding: theme.spacing.md, marginBottom: theme.spacing.lg },

  gridContainer: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    marginTop: theme.spacing.md, 
    paddingHorizontal: theme.spacing.lg, 
  },
  gridButton: { 
    width: '32%',
    marginBottom: theme.spacing.md,
    borderRadius: theme.radius.md, 
    padding: theme.spacing.md 
  },

  summaryContainer: {
    marginVertical: theme.spacing.lg,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  summaryValue: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
    color: theme.colors.secondary,
    textAlign: 'right',
    flexShrink: 1,
    marginLeft: theme.spacing.md,
  },
  summaryPriceContainer: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between', 
    marginTop: theme.spacing.md, 
    paddingTop: theme.spacing.md 
  },
  summaryPriceLabel: { ...theme.typography.h4, color: theme.colors.secondary },
  summaryPrice: { ...theme.typography.h3, color: theme.colors.primary },

  skeletonCard: { backgroundColor: theme.colors.muted, borderRadius: theme.radius.md, padding: theme.spacing.lg, marginBottom: theme.spacing.md, height: 80 },
  skeletonLineLg: { height: 20, backgroundColor: theme.colors.border, borderRadius: theme.radius.sm, marginBottom: theme.spacing.sm },
  skeletonLineSm: { height: 16, backgroundColor: theme.colors.border, borderRadius: theme.radius.sm, width: '60%' },

  emptyStateContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: theme.spacing.xl, marginTop: 50 },
  emptyStateMessage: { ...theme.typography.h3, marginTop: theme.spacing.lg, color: theme.colors.secondary },
  emptyStateDescription: { ...theme.typography.body, color: theme.colors.mutedForeground, textAlign: 'center', marginTop: theme.spacing.sm },

  modalBackdrop: { flex: 1, justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.5)' },
  modalBackdropConfirmation: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: theme.spacing.sm },
  modalContentConfirmation: { backgroundColor: theme.colors.card, borderRadius: theme.radius.md, padding: theme.spacing.md, maxHeight: '90%' },
  modalContent: { backgroundColor: theme.colors.card, borderTopLeftRadius: theme.radius.lg, borderTopRightRadius: theme.radius.lg, padding: theme.spacing.lg, maxHeight: '80%' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: theme.spacing.md, borderBottomWidth: 1, borderBottomColor: theme.colors.border },
  modalTitle: { ...theme.typography.h3, color: theme.colors.secondary },
  modalCloseButton: { padding: theme.spacing.xs },
  modalItem: { paddingVertical: theme.spacing.md },
  modalItemText: { ...theme.typography.body },

  errorText: { ...theme.typography.body, color: theme.colors.destructive, textAlign: 'center', padding: theme.spacing.lg },

  timeSlotsHeaderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
  },
  timeSlotsHeaderText: {
    ...theme.typography.h4,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
  },

  // Success Modal Styles
  successModalContent: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    margin: theme.spacing.lg,
    width: '90%',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5
  },
  successModalTitle: {
    ...theme.typography.h2,
    color: theme.colors.secondary,
    marginTop: theme.spacing.lg,
    marginBottom: theme.spacing.sm,
  },
  successModalSubtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  successModalButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  }
});

export default BookingScreen;