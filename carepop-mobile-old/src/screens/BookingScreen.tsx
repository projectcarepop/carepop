import React, { useState, useMemo, useCallback } from 'react';
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
import { ChevronsRight, X, Calendar as CalendarIcon, Clock, Building, Stethoscope, MapPin, CheckCircle, User } from 'lucide-react-native';
import { StackNavigationProp } from '@react-navigation/stack';
import { format } from 'date-fns';

import {
  getPublicClinics,
  getPublicServices,
  getPublicServiceCategories,
  getProvidersForService,
  getAvailableSlots,
  getAvailableDays,
  createAppointment,
  validateSlotAvailability,
  NewAppointmentPayload,
  ServiceCategory,
} from '../services/api';
import type {
  Clinic,
  Doctor,
  ServiceWithCategory,
} from '../lib/types';
import { useDebounce } from '../hooks/useDebounce';
import { theme } from '../components/theme';
import { DrawerParamList } from '../navigation/AppDrawerNavigator';
import { Card } from '../components/card.native';
import { Button } from '../components/button.native';


type BookingScreenNavigationProp = StackNavigationProp<DrawerParamList, 'Booking'>;

type Step = 'clinic' | 'service' | 'doctor' | 'datetime' | 'confirm';

interface BookingSelections {
  clinicId: string | null;
  serviceId: string | null;
  doctorId: string | null;
  date: string | null;
  time: string | null;
}

interface UIState {
  currentStep: Step;
  searchQuery: string;
  selectedCategoryId: string | null;
  isCategoryPickerVisible: boolean;
  isSuccessModalVisible: boolean;
  currentMonth: Date;
  lastRefresh: Date;
}

const STEPS = [
    { key: 'clinic' as Step, number: 1, title: 'Select a Clinic', description: 'Choose your preferred clinic location to begin.' },
    { key: 'service' as Step, number: 2, title: 'Select a Service', description: 'Pick a service available at the selected clinic.' },
    { key: 'doctor' as Step, number: 3, title: 'Select a Doctor', description: 'Choose an available healthcare provider.' },
    { key: 'datetime' as Step, number: 4, title: 'Select Date & Time', description: 'Choose a date and time that works for you.' },
    { key: 'confirm' as Step, number: 5, title: 'Confirm & Book', description: 'Review your selections and confirm your appointment.' },
];

// === HELPER FUNCTIONS ===
const formatAddress = (clinic: any): string => {
  if (!clinic) return 'Address not available';
  
  let street, city, province, zip;
  
  if (clinic.address && typeof clinic.address === 'object') {
    // Old format: nested address object
    street = clinic.address.street;
    city = clinic.address.city;
    province = clinic.address.province;
    zip = clinic.address.zip;
  } else {
    // New format: individual fields on clinic object
    street = clinic.street;
    
    const cityMunicipality = clinic.cityMunicipality || clinic.cityMunicipalityCode;
    city = typeof cityMunicipality === 'object' ? cityMunicipality?.name : cityMunicipality;
    
    const provinceData = clinic.province || clinic.provinceCode;
    province = typeof provinceData === 'object' ? provinceData?.name : provinceData;
    
    zip = clinic.zipCode || clinic.zip;
  }
  
  const parts = [street, city, province, zip].filter(Boolean);
  return parts.length > 0 ? parts.join(', ') : 'Address not available';
};

const formatDuration = (durationMinutes: number): string => {
  if (durationMinutes >= 60) {
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    return `${hours} hr${minutes > 0 ? ` ${minutes} min` : ''}`;
  }
  return `${durationMinutes} min`;
};

const createMarkedDates = (availableDays: string[] | undefined, selectedDate: string | null, primaryColor: string) => {
  const marked: { [key: string]: any } = {};
  
  if (selectedDate) {
    marked[selectedDate] = { selected: true, selectedColor: primaryColor };
  }
  
  if (availableDays) {
    availableDays.forEach((dateStr: string) => {
      if (dateStr !== selectedDate) {
        marked[dateStr] = { 
          ...marked[dateStr],
          dotColor: primaryColor,
          marked: true
        };
      } else {
        marked[dateStr] = { 
          ...marked[dateStr],
          dotColor: primaryColor,
          marked: true
        };
      }
    });
  }
  
  return marked;
};

const BookingScreen = () => {
  const navigation = useNavigation<BookingScreenNavigationProp>();
    const queryClient = useQueryClient();

  // === CONSOLIDATED STATE MANAGEMENT ===
  const [selections, setSelections] = useState<BookingSelections>({
    clinicId: null,
    serviceId: null,
    doctorId: null,
    date: null,
    time: null,
  });

  const [uiState, setUIState] = useState<UIState>({
    currentStep: 'clinic',
    searchQuery: '',
    selectedCategoryId: 'all',
    isCategoryPickerVisible: false,
    isSuccessModalVisible: false,
    currentMonth: new Date(),
    lastRefresh: new Date(),
  });

  const debouncedSearchQuery = useDebounce(uiState.searchQuery, 300);

  // === STATE UPDATE HELPERS ===
  const updateSelections = useCallback((updates: Partial<BookingSelections>) => {
    setSelections(prev => ({ ...prev, ...updates }));
  }, []);

  const updateUIState = useCallback((updates: Partial<UIState>) => {
    setUIState(prev => ({ ...prev, ...updates }));
  }, []);

  // === DATA FETCHING (OPTIMIZED) ===
  const { data: clinics, isLoading: isLoadingClinics } = useQuery<Clinic[], Error>({ 
    queryKey: ['publicClinics'], 
    queryFn: getPublicClinics,
    select: (data: any) => data.data || data,
  });

  const { data: serviceCategories, isLoading: isLoadingCategories } = useQuery<ServiceCategory[], Error>({
    queryKey: ['publicServiceCategories'],
    queryFn: getPublicServiceCategories,
    enabled: !!selections.clinicId,
    select: (data: any) => data.data || data,
  });

  const { data: services, isLoading: isLoadingServices } = useQuery<ServiceWithCategory[], Error>({
    queryKey: ['publicServices', selections.clinicId],
    queryFn: () => getPublicServices(selections.clinicId!),
    enabled: !!selections.clinicId,
    select: (data: any) => data.data || data,
  });
  
  const { data: doctors, isLoading: isLoadingDoctors } = useQuery<Doctor[], Error>({
    queryKey: ['providersForService', selections.serviceId, selections.clinicId],
    queryFn: () => getProvidersForService(selections.serviceId!, selections.clinicId!),
    enabled: !!selections.serviceId && !!selections.clinicId,
    select: (data: any) => data.data || data,
  });
  
  // === AVAILABILITY QUERIES (OPTIMIZED) ===
  const { data: availableDays, isLoading: isLoadingAvailableDays } = useQuery({
    queryKey: ['availableDays', selections.doctorId, selections.serviceId, selections.clinicId, format(uiState.currentMonth, 'yyyy-MM')],
    queryFn: () => {
      if (!selections.doctorId || !selections.serviceId || !selections.clinicId) return [];
      return getAvailableDays(
        selections.doctorId,
        selections.serviceId,
        selections.clinicId,
        uiState.currentMonth.getMonth() + 1, // getMonth() is 0-indexed, backend expects 1-indexed
        uiState.currentMonth.getFullYear()
      );
    },
    enabled: !!selections.doctorId && !!selections.serviceId && !!selections.clinicId,
    refetchInterval: uiState.currentStep === 'datetime' ? 60000 : false,
    refetchIntervalInBackground: false,
  });

  const { data: availableSlots, isLoading: isLoadingAvailableSlots } = useQuery({
    queryKey: ['availableSlots', selections.doctorId, selections.serviceId, selections.clinicId, selections.date],
    queryFn: () => {
      if (!selections.doctorId || !selections.serviceId || !selections.clinicId || !selections.date) return [];
      return getAvailableSlots(
        selections.doctorId,
        selections.serviceId,
        selections.clinicId,
        selections.date
      );
    },
    enabled: !!selections.doctorId && !!selections.serviceId && !!selections.clinicId && !!selections.date,
    refetchInterval: uiState.currentStep === 'datetime' ? 30000 : false,
    refetchIntervalInBackground: false,
  });


  const { mutate: bookAppointment, isPending: isBooking } = useMutation({
    mutationFn: async (appointmentData: NewAppointmentPayload) => {
      // First validate slot availability
      if (appointmentData.doctorId && appointmentData.serviceId && appointmentData.clinicId) {
        const validation = await validateSlotAvailability(
          appointmentData.doctorId,
          appointmentData.serviceId,
          appointmentData.clinicId,
          appointmentData.appointmentTime
        );
        
        if (!validation.available) {
          const error = new Error(validation.message || 'This time slot is no longer available.');
          (error as any).code = 'SLOT_UNAVAILABLE';
          throw error;
        }
      }
      
      return createAppointment(appointmentData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
      queryClient.invalidateQueries({ queryKey: ['bookedAppointments'] });
      updateUIState({ isSuccessModalVisible: true });
    },
    onError: (error: any) => {
      console.error('Booking mutation error:', JSON.stringify(error, null, 2));
      
      // Handle slot unavailability specifically
      if (error.code === 'SLOT_UNAVAILABLE' || error.message.includes('no longer available')) {
        Alert.alert(
          'Time Slot Unavailable',
          'Someone else just booked this time slot. Please select a different time.',
          [
            {
              text: 'OK',
              onPress: () => {
                // Refresh available slots and clear selected time
                queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
                queryClient.invalidateQueries({ queryKey: ['availableDays'] });
                updateSelections({ time: null });
                updateUIState({ currentStep: 'datetime' });
              }
            }
          ]
        );
      } else {
      Alert.alert('Booking Failed', error.message || 'An unexpected error occurred.');
      }
    },
  });

  // === OPTIMIZED DERIVED STATE ===
  const selectedClinic = useMemo(() => clinics?.find(c => c.id === selections.clinicId), [clinics, selections.clinicId]);
  const selectedService = useMemo(() => services?.find(s => s.id === selections.serviceId), [services, selections.serviceId]);
  const selectedDoctor = useMemo(() => doctors?.find(d => d.id === selections.doctorId), [doctors, selections.doctorId]);

  const filteredServices = useMemo(() => {
    if (!services) return [];
    
    let filtered = services;

    if (uiState.selectedCategoryId && uiState.selectedCategoryId !== 'all') {
      filtered = filtered.filter(service => service.serviceCategory?.id === uiState.selectedCategoryId);
    }

    if (debouncedSearchQuery) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(debouncedSearchQuery.toLowerCase())
      );
    }

    return filtered;
  }, [services, uiState.selectedCategoryId, debouncedSearchQuery]);

  // === OPTIMIZED CALENDAR DATES ===
  const markedDates = useMemo(() => 
    createMarkedDates(availableDays, selections.date, theme.colors.primary), 
    [availableDays, selections.date, theme.colors.primary]
  );

  const formatTo12Hour = (time24: string | null): string => {
    if (!time24) return '';
    const [hours, minutes] = time24.split(':');
    const h = parseInt(hours, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${h12}:${minutes} ${ampm}`;
  };

  // === EVENT HANDLERS (OPTIMIZED) ===
  const goToNextStep = useCallback(() => {
    const currentIndex = STEPS.findIndex(s => s.key === uiState.currentStep);
    if (currentIndex < STEPS.length - 1) {
      updateUIState({ 
        searchQuery: '', // Reset search when moving to next step
        currentStep: STEPS[currentIndex + 1].key 
      });
    }
  }, [uiState.currentStep, updateUIState]);

  const goToPreviousStep = useCallback(() => {
    const currentIndex = STEPS.findIndex(s => s.key === uiState.currentStep);
    if (currentIndex > 0) {
      updateUIState({ 
        searchQuery: '', // Reset search when moving to prev step
        currentStep: STEPS[currentIndex - 1].key 
      });
    }
  }, [uiState.currentStep, updateUIState]);

  const handleRefreshSlots = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
    queryClient.invalidateQueries({ queryKey: ['availableDays'] });
    updateUIState({ lastRefresh: new Date() });
  }, [queryClient, updateUIState]);

  const handleConfirmBooking = useCallback(() => {
    if (!selections.clinicId || !selections.serviceId || !selections.doctorId || !selections.time) {
      Alert.alert("Error", "Missing information. Please complete all steps.");
      return;
    }
    
    const payload = {
      clinicId: selections.clinicId,
      serviceId: selections.serviceId,
      appointmentTime: selections.time,
      doctorId: selections.doctorId,
    };
    
    bookAppointment(payload);
  }, [selections, bookAppointment]);

  const resetFlow = useCallback(() => {
    setSelections({
      clinicId: null,
      serviceId: null,
      doctorId: null,
      date: null,
      time: null,
    });
    setUIState({
      currentStep: 'clinic',
      searchQuery: '',
      selectedCategoryId: 'all',
      isCategoryPickerVisible: false,
      isSuccessModalVisible: false,
      currentMonth: new Date(),
      lastRefresh: new Date(),
    });
  }, []);

  // === UI COMPONENTS (OPTIMIZED) ===
  const WizardHeader = useCallback(() => {
      const stepInfo = STEPS.find(s => s.key === uiState.currentStep)!;
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
  }, [uiState.currentStep]);

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
          <TouchableOpacity onPress={() => updateSelections({ clinicId: item.id })}>
            <Card style={[styles.selectableCard, selections.clinicId === item.id && styles.selectedCard, { marginHorizontal: theme.spacing.lg }]}>
              <Text style={styles.cardTitle}>{item.name}</Text>
              <View style={styles.addressContainer}>
                <MapPin size={14} color={theme.colors.mutedForeground} />
                <Text style={styles.cardSubtitle}>{formatAddress(item)}</Text>
              </View>
            </Card>
                                            </TouchableOpacity>
                                        )}
        ListHeaderComponent={<TextInput style={[styles.searchInput, {marginHorizontal: theme.spacing.lg}]} placeholder="Search clinics..." onChangeText={(text) => updateUIState({ searchQuery: text })} value={uiState.searchQuery} />}
        ListEmptyComponent={<EmptyState icon={<Building size={48} color={theme.colors.mutedForeground}/>} message="No Clinics Found" description="We couldn't find any clinics. Please check back later." />}
        contentContainerStyle={styles.listContainer}
      />
    );
  }

  const renderServiceStep = () => {
    if (isLoadingServices) {
        return <View style={styles.listContainer}>{ [1,2,3,4].map(i => <SkeletonCard key={i} />) }</View>;
    }

    const currentCategoryName = (uiState.selectedCategoryId === 'all' || !uiState.selectedCategoryId)
        ? 'All Categories'
        : serviceCategories?.find(c=>c.id === uiState.selectedCategoryId)?.name || 'Select a Category';

                return (
        <View style={{flex: 1}}>
          {isLoadingCategories ? <ActivityIndicator style={{marginVertical: theme.spacing.lg}} /> : (
              <TouchableOpacity onPress={() => updateUIState({ isCategoryPickerVisible: true })} style={[styles.pickerInput, {marginHorizontal: theme.spacing.lg}]}>
                  <Text>{currentCategoryName}</Text>
                  <ChevronsRight color={theme.colors.mutedForeground} />
              </TouchableOpacity>
          )}
                            <FlatList
            data={filteredServices}
                                keyExtractor={(item) => item.id}
                                renderItem={({ item }) => (
              <TouchableOpacity onPress={() => updateSelections({ serviceId: item.id })}>
                <Card style={[styles.selectableCard, selections.serviceId === item.id && styles.selectedCard, { marginHorizontal: theme.spacing.lg }]}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  {item.serviceCategory?.name && (
                      <View style={styles.categoryTag}>
                          <Text style={styles.categoryTagText}>{item.serviceCategory.name}</Text>
                                        </View>
                  )}
                  {item.durationMinutes && (
                      <View style={styles.durationContainer}>
                          <Clock size={12} color={theme.colors.mutedForeground} />
                          <Text style={styles.durationText}>
                              {formatDuration(item.durationMinutes)}
                          </Text>
                      </View>
                  )}
                  <Text style={styles.cardSubtitle} numberOfLines={2}>{item.description}</Text>
                </Card>
                                    </TouchableOpacity>
                                )}
            ListHeaderComponent={<TextInput style={[styles.searchInput, {marginHorizontal: theme.spacing.lg}]} placeholder="Search services..." onChangeText={(text) => updateUIState({ searchQuery: text })} value={uiState.searchQuery} />}
            ListEmptyComponent={<EmptyState icon={<Stethoscope size={48} color={theme.colors.mutedForeground}/>} message="No Services Available" description="No services match your search or filter. Please try a different category." />}
            contentContainerStyle={styles.listContainer}
                            />
                    </View>
                );
  }

  const renderDoctorStep = () => {
    if (isLoadingDoctors) {
        return <View style={styles.listContainer}>{ [1,2,3].map(i => <SkeletonCard key={i} />) }</View>;
    }

    return (
        <FlatList
            data={doctors}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
                <TouchableOpacity onPress={() => updateSelections({ doctorId: item.id })}>
                    <Card style={[styles.selectableCard, selections.doctorId === item.id && styles.selectedCard, { marginHorizontal: theme.spacing.lg }]}>
                        <Text style={styles.cardTitle}>{item.fullName}</Text>
                        {item.specialtyText && (
                            <View style={styles.categoryTag}>
                                <Text style={styles.categoryTagText}>{item.specialtyText}</Text>
                            </View>
                        )}
                    </Card>
                </TouchableOpacity>
            )}
            ListEmptyComponent={<EmptyState icon={<User size={48} color={theme.colors.mutedForeground}/>} message="No Doctors Available" description="No healthcare providers are available for this service at the selected clinic." />}
            contentContainerStyle={styles.listContainer}
        />
    );
  }

  const renderDateTimeStep = () => (
    <View style={{ flex: 1, paddingVertical: theme.spacing.lg, paddingHorizontal: theme.spacing.lg }}>
                                   <Calendar
            onDayPress={(day: DateData) => {
          updateSelections({ date: day.dateString, time: null });
            }}
        markedDates={markedDates}
            minDate={new Date().toISOString().split('T')[0]}
        onMonthChange={(month) => updateUIState({ currentMonth: new Date(month.dateString) })}
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
            height: 300,
            }}
        />

      {(isLoadingAvailableSlots || isLoadingAvailableDays) && <ActivityIndicator style={{marginTop: theme.spacing.xl}}/>}

      {selections.date && (
            <View style={{ flex: 1 }}>
            {isLoadingAvailableSlots ? <ActivityIndicator style={{marginTop: theme.spacing.xl}}/> : (
                    <>
                        <View style={styles.timeSlotsHeaderContainer}>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Clock size={18} color={theme.colors.secondary} />
                            <Text style={styles.timeSlotsHeaderText}>
                                    Available Time Slots for {format(new Date(selections.date + 'T00:00:00'), 'MM/dd/yyyy')}
                                </Text>
                            </View>
                            <Text style={styles.lastUpdateText}>
                                Updated {format(uiState.lastRefresh, 'h:mm a')}
                                                    </Text>
                        </View>
                        <TouchableOpacity onPress={handleRefreshSlots} style={styles.refreshButton}>
                            <Text style={styles.refreshButtonText}>Refresh</Text>
                        </TouchableOpacity>
                        </View>
                        <ScrollView>
                            <View style={styles.gridContainer}>
                            {!availableSlots || availableSlots.length === 0 ? (
                                    <Text>No time slots available for this date.</Text>
                                ) : (
                                availableSlots.map((timeSlot: string) => {
                                    const timeFormatted = format(new Date(timeSlot), 'p');
                                        return (
                                        <Button key={timeSlot} variant={selections.time === timeSlot ? 'default' : 'outline'} onPress={() => updateSelections({ time: timeSlot })} style={styles.gridButton}>
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
                      <Text style={styles.summaryLabel}>Duration</Text>
                      <Text style={styles.summaryValue}>
                          {selectedService?.durationMinutes 
                              ? selectedService.durationMinutes >= 60 
                                  ? `${Math.floor(selectedService.durationMinutes / 60)} hr${selectedService.durationMinutes % 60 > 0 ? ` ${selectedService.durationMinutes % 60} min` : ''}`
                                  : `${selectedService.durationMinutes} min`
                              : 'N/A'}
                      </Text>
                  </View>
                  <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Doctor</Text>
                      <Text style={styles.summaryValue}>{selectedDoctor?.fullName}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Date</Text>
                      <Text style={styles.summaryValue}>{selections.date ? new Date(selections.date + 'T00:00:00').toDateString() : ''}</Text>
                  </View>
                  <View style={styles.summaryRow}>
                      <Text style={styles.summaryLabel}>Time</Text>
                      <Text style={styles.summaryValue}>{selections.time ? format(new Date(selections.time), 'p') : ''}</Text>
                  </View>
              </View>
          </Card>
      </View>
  );

  const renderSuccessModal = () => (
    <Modal
      animationType="slide"
      transparent={true}
      visible={uiState.isSuccessModalVisible}
      onRequestClose={resetFlow}
    >
      <View style={styles.modalBackdropConfirmation}>
        <View style={styles.modalContentConfirmation}>
          <View style={{alignItems: 'center', paddingTop: theme.spacing.lg}}>
            <CheckCircle size={48} color={theme.colors.success} strokeWidth={1.5}/>
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
    switch(uiState.currentStep) {
      case 'clinic': return renderClinicStep();
      case 'service': return renderServiceStep();
      case 'doctor': return renderDoctorStep();
      case 'datetime': return renderDateTimeStep();
      case 'confirm': return renderConfirmStep();
      default: return null;
    }
  }

  // === MAIN RENDER ===
    return (
    <SafeAreaView style={styles.container}>
      <WizardHeader />
            <View style={{flex: 1}}>
                    {renderStepContent()}
      </View>
      <View style={styles.footer}>
        {uiState.currentStep !== 'clinic' && <Button variant="outline" onPress={goToPreviousStep} style={styles.footerButton} textStyle={styles.footerBackButtonText}>Back</Button>}
        <View style={{flex:1, marginLeft: uiState.currentStep !== 'clinic' ? theme.spacing.md : 0}}>
            {uiState.currentStep === 'confirm' ? (
                <Button onPress={handleConfirmBooking} disabled={isBooking} style={styles.footerButton}>
                    {isBooking && <ActivityIndicator color={theme.colors.primaryForeground} style={{marginRight: theme.spacing.sm}}/>}
                    <Text style={styles.footerButtonText}>{isBooking ? 'Booking...' : 'Confirm & Book'}</Text>
                </Button>
            ) : (
                <Button onPress={goToNextStep} disabled={ 
                  (uiState.currentStep === 'clinic' && !selections.clinicId) || 
                  (uiState.currentStep === 'service' && !selections.serviceId) || 
                  (uiState.currentStep === 'doctor' && !selections.doctorId) || 
                  (uiState.currentStep === 'datetime' && !selections.time) 
                } style={styles.footerButton} textStyle={styles.footerButtonText}>
                    Continue
                </Button>
            )}
        </View>
            </View>

      {/* Modals */}
      <CustomPickerModal visible={uiState.isCategoryPickerVisible} onClose={() => updateUIState({ isCategoryPickerVisible: false })} title="Select a Category">
        <FlatList
            data={[{id: 'all', name: 'All Categories'}, ...(serviceCategories || [])]}
            keyExtractor={(item) => item.id}
            renderItem={({item}) => (
                <TouchableOpacity style={styles.modalItem} onPress={() => {
                    updateUIState({ selectedCategoryId: item.id, isCategoryPickerVisible: false });
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
  durationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.xs,
  },
  durationText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginLeft: theme.spacing.xs,
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
    marginVertical: theme.spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  summaryLabel: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  summaryValue: {
    ...theme.typography.small,
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
    justifyContent: 'space-between',
    marginTop: theme.spacing.xl,
    marginBottom: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
  },
  timeSlotsHeaderText: {
    ...theme.typography.h4,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
  },
  lastUpdateText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    marginLeft: theme.spacing.lg + theme.spacing.sm,
    marginTop: theme.spacing.xs,
  },
  refreshButton: {
    backgroundColor: theme.colors.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.sm,
  },
  refreshButtonText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilySemiBold,
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
    marginBottom: theme.spacing.lg,
  }
});

export default BookingScreen;