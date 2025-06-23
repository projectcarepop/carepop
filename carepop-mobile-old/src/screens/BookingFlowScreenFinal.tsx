import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../components/theme';
import { X, Building, Tag, Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useAuth } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { Calendar, DateData } from 'react-native-calendars';
import { getDay, format } from 'date-fns';

// --- Types ---
interface Clinic {
  id: string;
  name: string;
  address: string;
}

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
}

interface ScheduleSlot {
  provider_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
}

interface TimeSlot {
  time: string;
  providerId: string;
}

// --- Step Components ---

const ClinicSelectionStep = ({ onSelectClinic }: { onSelectClinic: (clinic: Clinic) => void }) => {
    const { getToken } = useAuth();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchClinics = useCallback(async () => {
        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            setError('Could not connect to services.');
            setIsLoading(false);
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication token not available.');
                setIsLoading(false);
                return;
            }
            const response = await fetch(`${backendUrl}/api/v1/public/clinics`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch clinics.');
            setClinics(data.data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [getToken]);

    useEffect(() => {
        fetchClinics();
    }, [fetchClinics]);

    if (isLoading) {
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <Animated.View layout={Layout.duration(300)}>
            <Text style={styles.stepHeader}>First, pick a clinic.</Text>
            <Text style={styles.stepSubheader}>Where would you like to get care?</Text>
            <FlatList
                data={clinics}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                    <Animated.View entering={FadeIn.delay(index * 100)}>
                        <TouchableOpacity style={styles.card} onPress={() => onSelectClinic(item)}>
                            <Building size={24} color={theme.colors.primary} />
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardSubtitle}>{item.address}</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                contentContainerStyle={{ paddingBottom: 20 }}
            />
        </Animated.View>
    );
};

const ServiceSelectionStep = ({ clinic, onSelectService }: { clinic: Clinic; onSelectService: (service: Service) => void }) => {
    const { getToken } = useAuth();
    const [services, setServices] = useState<Service[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchServices = useCallback(async () => {
        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            setError('Could not connect to services.');
            setIsLoading(false);
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication token not available.');
                setIsLoading(false);
                return;
            }
            const response = await fetch(`${backendUrl}/api/v1/public/clinics/${clinic.id}/services`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch services.');
            setServices(data.data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, clinic.id]);

    useEffect(() => {
        fetchServices();
    }, [fetchServices]);

    if (isLoading) {
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <Animated.View layout={Layout.duration(300)}>
            <Text style={styles.stepHeader}>What can we help with?</Text>
            <Text style={styles.stepSubheader}>Services offered at <Text style={{fontFamily: theme.typography.fontFamilyBold}}>{clinic.name}</Text></Text>
            <FlatList
                data={services}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                     <Animated.View entering={FadeIn.delay(index * 100)}>
                        <TouchableOpacity style={styles.card} onPress={() => onSelectService(item)}>
                            <View style={{flex: 1, marginRight: theme.spacing.sm}}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardSubtitle}>{item.description}</Text>
                            </View>
                            <Text style={styles.priceText}>{`₱${item.price}`}</Text>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                 contentContainerStyle={{ paddingBottom: 20 }}
            />
        </Animated.View>
    );
};

const DateTimeSelectionStep = ({ clinic, service, onSelectDateTime }: { clinic: Clinic; service: Service; onSelectDateTime: (date: string, timeSlot: TimeSlot) => void }) => {
    const { getToken } = useAuth();
    const [providers, setProviders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const today = new Date().toISOString().split('T')[0];

    const fetchProvidersAndSchedules = useCallback(async () => {
        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            setError('Could not connect.');
            setIsLoading(false);
            return;
        }
        try {
            const token = await getToken();
            if (!token) {
                setError('Authentication token not available.');
                setIsLoading(false);
                return;
            }
            const response = await fetch(`${backendUrl}/api/v1/public/clinics/${clinic.id}/providers?serviceId=${service.id}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch provider schedules.');
            setProviders(data.data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, clinic.id, service.id]);

    useEffect(() => {
        fetchProvidersAndSchedules();
    }, [fetchProvidersAndSchedules]);
    
    const handleDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        setSelectedTimeSlot(null);
    };
    
    const handleSelectTime = (slot: TimeSlot) => {
        setSelectedTimeSlot(slot);
        onSelectDateTime(selectedDate, slot);
    };

    const availableTimeSlots = useMemo((): TimeSlot[] => {
        if (!selectedDate || providers.length === 0) return [];
        const selectedDayOfWeek = getDay(new Date(selectedDate));
        
        const allSlots: TimeSlot[] = [];

        providers.forEach(provider => {
            const schedulesForDay = provider.schedules.filter((s: any) => s.day_of_week === selectedDayOfWeek);
            
            schedulesForDay.forEach((schedule: any) => {
                let [startHour, startMinute] = schedule.start_time.split(':').map(Number);
                const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

                let currentTime = new Date();
                currentTime.setHours(startHour, startMinute, 0);

                let endTime = new Date();
                endTime.setHours(endHour, endMinute, 0);

                while (currentTime < endTime) {
                    allSlots.push({
                        time: format(currentTime, 'hh:mm a'),
                        providerId: provider.provider_id,
                    });
                    currentTime.setMinutes(currentTime.getMinutes() + 30);
                }
            });
        });

        const uniqueSlots = Array.from(new Map(allSlots.map(slot => [slot.time, slot])).values());
        return uniqueSlots.sort((a, b) => new Date(`1970/01/01 ${a.time}`) > new Date(`1970/01/01 ${b.time}`) ? 1 : -1);
    }, [selectedDate, providers]);
    
    if (isLoading) return <ActivityIndicator size="large" color={theme.colors.primary} />;
    if (error) return <Text style={styles.errorText}>{error}</Text>;

    return (
        <Animated.View layout={Layout.duration(300)} style={{ flex: 1 }}>
           <Text style={styles.stepHeader}>When would you like to come in?</Text>
           <Text style={styles.stepSubheader}>Select a date and time that works for you.</Text>
           <ScrollView showsVerticalScrollIndicator={false}>
               <Calendar
                   onDayPress={handleDayPress}
                   markedDates={{ [selectedDate]: { selected: true, selectedColor: theme.colors.primary } }}
                   minDate={today}
                   style={styles.calendar}
                   theme={{
                       backgroundColor: theme.colors.background,
                       calendarBackground: theme.colors.card,
                       textSectionTitleColor: theme.colors.mutedForeground,
                       selectedDayBackgroundColor: theme.colors.primary,
                       selectedDayTextColor: theme.colors.primaryForeground,
                       todayTextColor: theme.colors.primary,
                       dayTextColor: theme.colors.foreground,
                       textDisabledColor: theme.colors.muted,
                       arrowColor: theme.colors.primary,
                       monthTextColor: theme.colors.foreground,
                       textDayFontFamily: theme.typography.fontFamily,
                       textMonthFontFamily: theme.typography.fontFamilyBold,
                       textDayHeaderFontFamily: theme.typography.fontFamily,
                   }}
               />
               {selectedDate && (
                   <Animated.View entering={FadeIn.duration(400)}>
                       <Text style={styles.timeHeader}>Available Times on {format(new Date(selectedDate), 'MMMM d')}</Text>
                       {availableTimeSlots.length > 0 ? (
                           <View style={styles.timeSlotGrid}>
                               {availableTimeSlots.map((slot) => (
                                   <TouchableOpacity
                                       key={slot.time}
                                       style={[
                                           styles.timeSlotButton,
                                           selectedTimeSlot?.time === slot.time && styles.timeSlotButtonSelected
                                       ]}
                                       onPress={() => handleSelectTime(slot)}
                                   >
                                       <Text style={[
                                           styles.timeSlotText,
                                           selectedTimeSlot?.time === slot.time && styles.timeSlotTextSelected
                                       ]}>{slot.time}</Text>
                                   </TouchableOpacity>
                               ))}
                           </View>
                       ) : (
                            <View style={styles.centeredMessage}>
                               <CalendarIcon size={32} color={theme.colors.mutedForeground} />
                               <Text style={styles.noSlotsText}>No available slots on this day.</Text>
                           </View>
                       )}
                   </Animated.View>
               )}
           </ScrollView>
       </Animated.View>
   );
};

const ConfirmationStep = ({ clinic, service, dateTime }: { clinic: Clinic; service: Service; dateTime: { date: string; timeSlot: TimeSlot; }}) => {
    return (
        <Animated.View layout={Layout.duration(300)}>
            <Text style={styles.stepHeader}>Review Your Booking</Text>
            <Text style={styles.stepSubheader}>One final check to make sure everything is perfect.</Text>
            <View style={styles.summaryCard}>
                <View style={styles.summaryRow}>
                    <Building size={20} color={theme.colors.mutedForeground} />
                    <Text style={styles.summaryText}>{clinic.name}</Text>
                </View>
                 <View style={styles.summaryRow}>
                    <Tag size={20} color={theme.colors.mutedForeground} />
                    <Text style={styles.summaryText}>{service.name}</Text>
                </View>
                 <View style={styles.summaryRow}>
                    <CalendarIcon size={20} color={theme.colors.mutedForeground} />
                    <Text style={styles.summaryText}>{format(new Date(dateTime.date), 'EEEE, MMMM d')} at {dateTime.timeSlot.time}</Text>
                </View>
            </View>
        </Animated.View>
    );
};

const SuccessStep = ({ onBookAnother, onViewAppointments }: { onBookAnother: () => void; onViewAppointments: () => void; }) => {
    return (
        <Animated.View style={styles.centeredMessage} entering={FadeIn.duration(500)}>
            <CheckCircle2 size={80} color={theme.colors.success} />
            <Text style={[styles.stepHeader, {marginTop: theme.spacing.lg}]}>All Set!</Text>
            <Text style={styles.stepSubheader}>Your appointment is confirmed. We have sent the details to your email.</Text>
            <TouchableOpacity style={[styles.continueButton, {width: '100%', marginTop: theme.spacing.md}]} onPress={onViewAppointments}>
                <Text style={styles.continueButtonText}>View My Appointments</Text>
            </TouchableOpacity>
             <TouchableOpacity style={[styles.secondaryButton, {width: '100%'}]} onPress={onBookAnother}>
                <Text style={styles.secondaryButtonText}>Book Another</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};


// --- Main Flow Screen ---
const STEPS = [
  { id: 'clinic', title: 'Choose Clinic' },
  { id: 'service', title: 'Select Service' },
  { id: 'datetime', title: 'Pick a Time' },
  { id: 'confirm', title: 'Confirm Details' },
  { id: 'success', title: 'Booked!' },
];

export function BookingFlowScreen() {
    const navigation = useNavigation();
    const [currentStep, setCurrentStep] = useState(0);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingError, setBookingError] = useState<string | null>(null);

    // State for selections
    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; timeSlot: TimeSlot; } | null>(null);

    const { getToken, userId } = useAuth();

    const handleNext = () => {
        if (currentStep < STEPS.length - 1) {
            setCurrentStep(currentStep + 1);
        }
    };
    
    const handleReset = () => {
        setCurrentStep(0);
        setSelectedClinic(null);
        setSelectedService(null);
        setSelectedDateTime(null);
        setIsBooking(false);
        setBookingError(null);
    }

    const handleClose = () => navigation.goBack();

    const handleSelectClinic = (clinic: Clinic) => {
        setSelectedClinic(clinic);
        handleNext();
    };

    const handleSelectService = (service: Service) => {
        setSelectedService(service);
        handleNext();
    };

    const handleSelectDateTime = (date: string, timeSlot: TimeSlot) => {
        setSelectedDateTime({ date, timeSlot });
    };
    
    const handleConfirmBooking = async () => {
        if (!selectedClinic || !selectedService || !selectedDateTime) return;
        setIsBooking(true);
        setBookingError(null);

        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            setBookingError('Cannot connect to services.');
            setIsBooking(false);
            return;
        }

        try {
            const token = await getToken();
            if (!token) {
                setBookingError('Authentication token not available.');
                setIsBooking(false);
                return;
            }

            const [time, period] = selectedDateTime.timeSlot.time.split(' ');
            let [hours, minutes] = time.split(':').map(Number);
            if (period === 'PM' && hours < 12) hours += 12;
            if (period === 'AM' && hours === 12) hours = 0;
            
            const appointmentDateTime = new Date(selectedDateTime.date);
            appointmentDateTime.setHours(hours, minutes, 0, 0);

            const response = await fetch(`${backendUrl}/api/v1/public/appointments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    clinic_id: selectedClinic.id,
                    service_id: selectedService.id,
                    provider_id: selectedDateTime.timeSlot.providerId,
                    appointment_time: appointmentDateTime.toISOString(),
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to create appointment.');
            }
            
            handleNext();
        } catch (e: any) {
            setBookingError(e.message || 'An unexpected error occurred.');
        } finally {
            setIsBooking(false);
        }
    };
    
    const renderCurrentStep = () => {
        switch (STEPS[currentStep].id) {
            case 'clinic': return <ClinicSelectionStep onSelectClinic={handleSelectClinic} />;
            case 'service': 
                if (!selectedClinic) return null;
                return <ServiceSelectionStep clinic={selectedClinic} onSelectService={handleSelectService} />;
            case 'datetime': 
                if (!selectedClinic || !selectedService) return null;
                return <DateTimeSelectionStep clinic={selectedClinic} service={selectedService} onSelectDateTime={handleSelectDateTime} />;
            case 'confirm': 
                if (!selectedClinic || !selectedService || !selectedDateTime) return null;
                return <ConfirmationStep clinic={selectedClinic} service={selectedService} dateTime={selectedDateTime} />;
            case 'success': return <SuccessStep onBookAnother={handleReset} onViewAppointments={handleClose} />;
            default: return null;
        }
    };

    const getFooterButtonText = () => {
        if (STEPS[currentStep].id === 'confirm') return isBooking ? 'Booking...' : 'Confirm & Book';
        return 'Continue';
    };

    const isFooterVisible = (STEPS[currentStep].id === 'datetime' && selectedDateTime) || STEPS[currentStep].id === 'confirm';

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <View style={styles.progressContainer}>
                     {STEPS.slice(0, -1).map((step, index) => (
                        <View 
                            key={step.id}
                            style={[
                                styles.progressSegment,
                                index <= currentStep ? styles.progressSegmentActive : {},
                            ]}
                        />
                    ))}
                </View>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <X size={24} color={theme.colors.mutedForeground} />
                </TouchableOpacity>
            </View>

            <View style={styles.contentArea}>{renderCurrentStep()}</View>

            {isFooterVisible && (
                 <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.continueButton, isBooking && {backgroundColor: theme.colors.muted}]} 
                        onPress={STEPS[currentStep].id === 'confirm' ? handleConfirmBooking : handleNext}
                        disabled={isBooking}
                    >
                        <Text style={styles.continueButtonText}>{getFooterButtonText()}</Text>
                    </TouchableOpacity>
                    {bookingError && <Text style={styles.errorTextFooter}>{bookingError}</Text>}
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: theme.spacing.md, paddingTop: theme.spacing.sm, paddingBottom: theme.spacing.md },
    progressContainer: { flex: 1, flexDirection: 'row', height: 4, backgroundColor: theme.colors.border, borderRadius: theme.radius.full, overflow: 'hidden', marginRight: theme.spacing.lg },
    progressSegment: { flex: 1, backgroundColor: 'transparent', marginHorizontal: 1, borderRadius: theme.radius.full, },
    progressSegmentActive: { backgroundColor: theme.colors.primary },
    closeButton: { padding: theme.spacing.xs, backgroundColor: theme.colors.muted, borderRadius: theme.radius.full },
    contentArea: { flex: 1, padding: theme.spacing.lg },
    footer: { padding: theme.spacing.lg, borderTopWidth: 1, borderTopColor: theme.colors.border },
    continueButton: { backgroundColor: theme.colors.primary, paddingVertical: theme.spacing.md, borderRadius: theme.radius.md, alignItems: 'center' },
    continueButtonText: { color: theme.colors.primaryForeground, ...theme.typography.h4, fontFamily: theme.typography.fontFamilyBold },
    stepHeader: { ...theme.typography.h1, fontFamily: theme.typography.fontFamilyBold, color: theme.colors.foreground, marginBottom: theme.spacing.sm, textAlign: 'center' },
    stepSubheader: { ...theme.typography.body, color: theme.colors.mutedForeground, textAlign: 'center', marginBottom: theme.spacing.xl, },
    errorText: { ...theme.typography.body, color: theme.colors.destructive, textAlign: 'center' },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    cardContent: {
        marginLeft: theme.spacing.md,
        flex: 1,
    },
    cardTitle: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilySemiBold,
        color: theme.colors.foreground,
    },
    cardSubtitle: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        marginTop: 2,
    },
    priceText: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.primary,
    },
    calendar: {
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    timeHeader: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilySemiBold,
        color: theme.colors.foreground,
        marginBottom: theme.spacing.md,
    },
    timeSlotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeSlotButton: {
        width: '32%',
        marginVertical: theme.spacing.xs,
        paddingVertical: 12,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    timeSlotButtonSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    timeSlotText: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        color: theme.colors.foreground,
    },
    timeSlotTextSelected: {
        color: theme.colors.primaryForeground,
        fontFamily: theme.typography.fontFamilySemiBold,
    },
    centeredMessage: {
        marginTop: theme.spacing.lg,
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
    },
    noSlotsText: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        marginTop: theme.spacing.sm,
    },
    summaryCard: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    summaryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    summaryText: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilySemiBold,
        color: theme.colors.foreground,
        marginLeft: theme.spacing.md,
    },
    secondaryButton: {
        marginTop: theme.spacing.md,
        paddingVertical: theme.spacing.md,
        width: '100%',
        alignItems: 'center',
    },
    secondaryButtonText: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.primary,
    },
    errorTextFooter: {
        ...theme.typography.body,
        color: theme.colors.destructive,
        textAlign: 'center',
        marginTop: theme.spacing.md,
    }
}); 