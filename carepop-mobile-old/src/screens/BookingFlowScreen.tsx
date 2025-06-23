import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, FlatList, ActivityIndicator, ScrollView, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { theme } from '../components/theme';
import { X, Building, Tag, Calendar as CalendarIcon, CheckCircle2, ArrowLeft, User } from 'lucide-react-native';
import Animated, { FadeIn, FadeOut, Layout } from 'react-native-reanimated';
import { useAuth } from '@clerk/clerk-expo';
import Constants from 'expo-constants';
import { Calendar, DateData } from 'react-native-calendars';
import { getDay, format, addMonths, subMonths } from 'date-fns';
import { Picker } from '@react-native-picker/picker';

// --- Types ---
interface Clinic {
  id: string;
  name: string;
  address: string;
}

interface Provider {
  id: string;
  full_name: string;
  specialty: string;
  photo_url: string | null;
  schedules: any[] | null;
}

interface Service {
    id: string;
    name: string;
    description: string;
    price: number;
}

interface TimeSlot {
  time: string;
  providerId: string;
}

// --- Step Components ---

const renderCalendarHeader = (date: any) => {
    const headerText = date.toString('MMMM, yyyy');
    return (
        <TouchableOpacity style={styles.calendarHeader}>
            <Text style={styles.calendarHeaderText}>{headerText}</Text>
        </TouchableOpacity>
    );
};

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

const ProviderSelectionStep = ({ clinic, service, onSelectProvider }: { clinic: Clinic; service: Service; onSelectProvider: (provider: Provider) => void }) => {
    const { getToken } = useAuth();
    const [providers, setProviders] = useState<Provider[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProviders = useCallback(async () => {
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
            if (!response.ok) throw new Error(data.message || 'Failed to fetch providers.');
            setProviders(data.data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, clinic.id, service.id]);

    useEffect(() => {
        fetchProviders();
    }, [fetchProviders]);

    if (isLoading) {
        return <ActivityIndicator size="large" color={theme.colors.primary} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    if (providers.length === 0) {
        return (
            <Animated.View style={styles.centeredMessage} layout={Layout.duration(300)}>
                <Text style={styles.stepHeader}>No Providers Available</Text>
                <Text style={styles.stepSubheader}>There are currently no providers available for this service. Please try another service or clinic.</Text>
            </Animated.View>
        );
    }

    return (
        <Animated.View layout={Layout.duration(300)}>
            <Text style={styles.stepHeader}>Choose a Provider</Text>
            <Text style={styles.stepSubheader}>Who would you like to see?</Text>
            <FlatList
                data={providers}
                keyExtractor={(item) => item.id}
                renderItem={({ item, index }) => (
                     <Animated.View entering={FadeIn.delay(index * 100)}>
                        <TouchableOpacity style={styles.card} onPress={() => onSelectProvider(item)}>
                            <View style={styles.cardContent}>
                                <Text style={styles.cardTitle}>{item.full_name}</Text>
                                <Text style={styles.cardSubtitle}>{item.specialty}</Text>
                            </View>
                        </TouchableOpacity>
                    </Animated.View>
                )}
                 contentContainerStyle={{ paddingBottom: 20 }}
            />
        </Animated.View>
    );
};

const DateTimeSelectionStep = ({ provider, onSelectDateTime }: { provider: Provider; onSelectDateTime: (date: string, timeSlot: TimeSlot) => void }) => {
    const { getToken } = useAuth();
    const [availableDates, setAvailableDates] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState('');
    const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
    const [isPickerVisible, setIsPickerVisible] = useState(false);
    const [pickerYear, setPickerYear] = useState(currentMonth.getFullYear());
    const [pickerMonth, setPickerMonth] = useState(currentMonth.getMonth());

    const fetchSchedules = useCallback(async (year: number, month: number) => {
        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            setError('Could not connect to services.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const token = await getToken();
            if (!token) {
                 setError('Authentication token not available.');
                 setIsLoading(false);
                 return;
            }
            const response = await fetch(`${backendUrl}/api/v1/public/providers/${provider.id}/availability?year=${year}&month=${month + 1}`, {
                headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch schedules.');
            setAvailableDates(data.data?.availableDates || []);
             // Placeholder for fetching time slots for a given date
            if (data.data?.availableDates.length > 0) {
                // Fetch time slots for the first available date as a default
            }

        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [getToken, provider.id]);

    useEffect(() => {
        const today = new Date();
        fetchSchedules(today.getFullYear(), today.getMonth());
    }, [fetchSchedules]);
    
    // Mock fetching time slots when a date is selected
    useEffect(() => {
        if (selectedDate) {
            // In a real app, you would fetch this from the backend
            const mockTimeSlots = [
                { time: '09:00:00', providerId: provider.id },
                { time: '10:00:00', providerId: provider.id },
                { time: '11:00:00', providerId: provider.id },
                { time: '13:00:00', providerId: provider.id },
            ];
            setTimeSlots(mockTimeSlots);
        } else {
            setTimeSlots([]);
        }
    }, [selectedDate, provider.id]);

    const markedDates = useMemo(() => {
        const marks: { [key: string]: any } = {};
        availableDates.forEach(date => {
            marks[date] = { disabled: false, marked: true, dotColor: theme.colors.primary };
        });
        if (selectedDate) {
            marks[selectedDate] = { ...marks[selectedDate], selected: true, selectedColor: theme.colors.primary, disabled: false };
        }
        return marks;
    }, [availableDates, selectedDate]);


    const handleDayPress = (day: DateData) => {
        if (availableDates.includes(day.dateString)) {
            setSelectedDate(day.dateString);
            setSelectedTimeSlot(null);
        }
    };

    const handleSelectTime = (slot: TimeSlot) => {
        setSelectedTimeSlot(slot);
        onSelectDateTime(selectedDate, slot);
    };
    
    const handleMonthChange = (date: DateData) => {
        const newMonth = new Date(date.dateString);
        setCurrentMonth(newMonth);
        fetchSchedules(newMonth.getFullYear(), newMonth.getMonth());
    };
    
    const openPicker = () => setIsPickerVisible(true);
    
    const onPickerConfirm = () => {
        const newDate = new Date(pickerYear, pickerMonth);
        setCurrentMonth(newDate);
        fetchSchedules(pickerYear, pickerMonth);
        setIsPickerVisible(false);
    };

    if (isLoading && availableDates.length === 0) {
        return <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: 20}} />;
    }

    if (error) {
        return <Text style={styles.errorText}>{error}</Text>;
    }

    return (
        <Animated.View layout={Layout.duration(300)}>
            <Text style={styles.stepHeader}>Select Date & Time</Text>
            <Text style={styles.stepSubheader}>With <Text style={{fontFamily: theme.typography.fontFamilyBold}}>{provider.full_name}</Text></Text>
           
            <Calendar
                key={currentMonth.toISOString()}
                current={format(currentMonth, 'yyyy-MM-dd')}
                onDayPress={handleDayPress}
                markedDates={markedDates}
                onMonthChange={handleMonthChange}
                renderHeader={renderCalendarHeader}
                minDate={format(new Date(), 'yyyy-MM-dd')}
                theme={{
                    arrowColor: theme.colors.primary,
                    todayTextColor: theme.colors.primary,
                    textMonthFontFamily: theme.typography.fontFamilyBold,
                }}
            />

            {selectedDate && (
                 <View style={styles.timeSlotsContainer}>
                    <Text style={styles.timeSlotsHeader}>Available Times</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.timeSlotsGrid}>
                        {timeSlots.map(slot => (
                            <TouchableOpacity 
                                key={slot.time} 
                                style={[styles.timeSlot, selectedTimeSlot?.time === slot.time && styles.timeSlotSelected]}
                                onPress={() => handleSelectTime(slot)}
                            >
                                <Text style={[styles.timeSlotText, selectedTimeSlot?.time === slot.time && styles.timeSlotTextSelected]}>
                                    {format(new Date(`1970-01-01T${slot.time}`), 'h:mm a')}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            )}
        </Animated.View>
    );
};

const ConfirmationStep = ({ clinic, service, dateTime, provider, isSubmitting, submitError }: { clinic: Clinic; service: Service; dateTime: { date: string; timeSlot: TimeSlot; }, provider: Provider, isSubmitting: boolean, submitError: string | null}) => {
    const formattedDate = format(new Date(dateTime.date), 'EEEE, MMMM d, yyyy');
    const formattedTime = format(new Date(`1970-01-01T${dateTime.timeSlot.time}`), 'h:mm a');
    
    return (
        <Animated.View layout={Layout.duration(300)}>
            <Text style={styles.stepHeader}>Confirm Your Appointment</Text>
            
            <View style={styles.confirmationCard}>
                <View style={styles.confirmationRow}>
                    <Building size={20} color={theme.colors.primary} />
                    <Text style={styles.confirmationText}>{clinic.name}</Text>
                </View>
                <View style={styles.confirmationRow}>
                    <Tag size={20} color={theme.colors.primary} />
                    <Text style={styles.confirmationText}>{service.name}</Text>
                </View>
                 <View style={styles.confirmationRow}>
                    <User size={20} color={theme.colors.primary} />
                    <Text style={styles.confirmationText}>{provider.full_name}</Text>
                </View>
                <View style={styles.confirmationRow}>
                    <CalendarIcon size={20} color={theme.colors.primary} />
                    <Text style={styles.confirmationText}>{formattedDate} at {formattedTime}</Text>
                </View>
            </View>

            {isSubmitting && <ActivityIndicator size="small" color={theme.colors.primary} style={{marginTop: 10}}/>}
            {submitError && <Text style={styles.errorText}>{submitError}</Text>}

        </Animated.View>
    );
};

const SuccessStep = ({ onBookAnother, onViewAppointments }: { onBookAnother: () => void; onViewAppointments: () => void; }) => {
    return (
        <Animated.View style={styles.centeredMessage} entering={FadeIn}>
            <CheckCircle2 size={64} color={theme.colors.success} />
            <Text style={[styles.stepHeader, {marginTop: theme.spacing.lg}]}>Booking Confirmed!</Text>
            <Text style={styles.stepSubheader}>Your appointment has been successfully booked.</Text>

            <TouchableOpacity style={styles.primaryButton} onPress={onViewAppointments}>
                <Text style={styles.primaryButtonText}>View My Appointments</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={onBookAnother}>
                <Text style={styles.secondaryButtonText}>Book Another Service</Text>
            </TouchableOpacity>
        </Animated.View>
    );
};


const STEPS = [
    { id: 'clinic', title: 'Clinic' },
    { id: 'service', title: 'Service' },
    { id: 'provider', title: 'Provider' },
    { id: 'datetime', title: 'Date & Time' },
    { id: 'confirm', title: 'Confirm' },
    { id: 'success', title: 'Success' },
];

export function BookingFlowScreen() {
    const navigation = useNavigation<any>();
    const [step, setStep] = useState(1);
    
    const { getToken, userId } = useAuth();

    const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
    const [selectedService, setSelectedService] = useState<Service | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
    const [selectedDateTime, setSelectedDateTime] = useState<{ date: string; timeSlot: TimeSlot; } | null>(null);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState<string | null>(null);

    const handleBack = () => {
        if (step > 1) {
            setStep(prev => prev - 1);
        }
    };

    const handleReset = () => {
        setStep(1);
        setSelectedClinic(null);
        setSelectedService(null);
        setSelectedProvider(null);
        setSelectedDateTime(null);
        setIsSubmitting(false);
        setSubmitError(null);
    };

    const handleClose = () => navigation.goBack();

    const handleSelectClinic = (clinic: Clinic) => {
        setSelectedClinic(clinic);
        setStep(2);
    };

    const handleSelectService = (service: Service) => {
        setSelectedService(service);
        setStep(3);
    };
    
    const handleSelectProvider = (provider: Provider) => {
        setSelectedProvider(provider);
        setStep(4);
    };

    const handleSelectDateTime = (date: string, timeSlot: TimeSlot) => {
        setSelectedDateTime({ date, timeSlot });
    };

    const handleConfirmBooking = async () => {
        if (!selectedClinic || !selectedService || !selectedDateTime || !selectedProvider) {
            setSubmitError('Something went wrong. Please start over.');
            return;
        }
        setIsSubmitting(true);
        setSubmitError(null);

        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            setSubmitError('Could not connect to services.');
            setIsSubmitting(false);
            return;
        }

        try {
            const token = await getToken();
             if (!token) {
                 setSubmitError('Authentication token not available.');
                 setIsSubmitting(false);
                 return;
            }

            const appointmentData = {
                clinicId: selectedClinic.id,
                serviceId: selectedService.id,
                providerId: selectedProvider.id,
                appointmentTime: `${selectedDateTime.date}T${selectedDateTime.timeSlot.time}`,
            };
            
            const response = await fetch(`${backendUrl}/api/v1/appointments`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(appointmentData),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Failed to book appointment.');
            }
            
            setStep(6); // Move to Success Step

        } catch (error: any) {
            setSubmitError(error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderCurrentStep = () => {
        switch (step) {
            case 1:
                return <ClinicSelectionStep onSelectClinic={handleSelectClinic} />;
            case 2:
                return selectedClinic ? <ServiceSelectionStep clinic={selectedClinic} onSelectService={handleSelectService} /> : null;
            case 3:
                return (selectedClinic && selectedService) ? <ProviderSelectionStep clinic={selectedClinic} service={selectedService} onSelectProvider={handleSelectProvider} /> : null;
            case 4:
                return selectedProvider ? <DateTimeSelectionStep provider={selectedProvider} onSelectDateTime={handleSelectDateTime} /> : null;
            case 5:
                return (selectedClinic && selectedService && selectedDateTime && selectedProvider) ? (
                    <ConfirmationStep
                        clinic={selectedClinic}
                        service={selectedService}
                        provider={selectedProvider}
                        dateTime={selectedDateTime}
                        isSubmitting={isSubmitting}
                        submitError={submitError}
                    />
                ) : null;
            case 6:
                return <SuccessStep onBookAnother={handleReset} onViewAppointments={() => navigation.navigate('MyAppointments')} />;
            default:
                return <ClinicSelectionStep onSelectClinic={handleSelectClinic} />;
        }
    };

    const getFooterButtonText = () => {
        if (step === 4) return 'Continue';
        if (step === 5) return isSubmitting ? 'Booking...' : 'Confirm & Book';
        return 'Continue';
    };
    
    const handleFooterPress = () => {
        if (step === 4) setStep(5);
        else if (step === 5) handleConfirmBooking();
    }

    const isFooterVisible = (step === 4 && selectedDateTime) || step === 5;

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                 <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <X size={24} color={theme.colors.foreground} />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <View style={styles.progressContainer}>
                        {STEPS.map((item, index) => (
                            <Animated.View
                                key={item.id}
                                style={[
                                    styles.progressSegment,
                                    index < step -1 ? styles.progressSegmentActive : {},
                                ]}
                            />
                        ))}
                    </View>
                </View>
                 {step > 1 && step < 6 ? (
                    <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                        <ArrowLeft size={24} color={theme.colors.foreground} />
                     </TouchableOpacity>
                ) : <View style={styles.backButton} /> // Placeholder for alignment
                }
            </View>

            <ScrollView 
                style={styles.contentScrollView} 
                key={step}
                contentContainerStyle={{paddingBottom: isFooterVisible ? 100 : 20}}
            >
                {renderCurrentStep()}
            </ScrollView>
            
            {isFooterVisible && (
                 <View style={styles.footer}>
                    <TouchableOpacity 
                        style={[styles.continueButton, (isSubmitting || (step === 4 && !selectedDateTime)) && {backgroundColor: theme.colors.muted}]} 
                        onPress={handleFooterPress}
                        disabled={isSubmitting || (step === 4 && !selectedDateTime)}
                    >
                        <Text style={styles.continueButtonText}>{getFooterButtonText()}</Text>
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.md,
        paddingTop: theme.spacing.sm,
        paddingBottom: theme.spacing.md,
    },
    backButton: {
        position: 'absolute',
        right: theme.spacing.md,
        top: 12,
        zIndex: 1,
    },
    progressContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: theme.spacing.xs,
        width: '50%',
        marginBottom: theme.spacing.md,
    },
    progressSegment: {
        flex: 1,
        height: 4,
        borderRadius: 2,
        backgroundColor: theme.colors.border,
    },
    progressSegmentActive: {
        backgroundColor: theme.colors.primary,
    },
    closeButton: {
        position: 'absolute',
        left: theme.spacing.md,
        top: 12,
        zIndex: 1,
    },
    contentScrollView: {
        paddingHorizontal: theme.spacing.md,
    },
    stepHeader: {
        ...theme.typography.h2,
        fontFamily: theme.typography.fontFamilyBold,
        marginBottom: theme.spacing.xs,
    },
    stepSubheader: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        marginBottom: theme.spacing.lg,
    },
    errorText: {
        ...theme.typography.body,
        color: theme.colors.destructive,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
    },
    centeredMessage: {
        marginTop: theme.spacing.lg,
        alignItems: 'center',
        padding: theme.spacing.xl,
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
    },
    headerTitleContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
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
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.cardForeground,
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
    calendarHeader: {
        paddingBottom: theme.spacing.md,
    },
    calendarHeaderText: {
        ...theme.typography.h3,
        textAlign: 'center',
        fontFamily: theme.typography.fontFamilyBold,
    },
    timeSlotsContainer: {
        marginTop: theme.spacing.lg,
    },
    timeSlotsHeader: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilyBold,
        marginBottom: theme.spacing.md,
    },
    timeSlotsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: theme.spacing.sm,
    },
    timeSlot: {
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        backgroundColor: theme.colors.input,
        borderRadius: theme.radius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    timeSlotSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    timeSlotText: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.foreground,
    },
    timeSlotTextSelected: {
        color: theme.colors.primaryForeground,
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
    },
    continueButtonText: {
        ...theme.typography.h4,
        color: theme.colors.primaryForeground,
        fontFamily: theme.typography.fontFamilyBold,
    },
    confirmationCard: {
        backgroundColor: theme.colors.card,
        padding: theme.spacing.lg,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    confirmationRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
    },
    confirmationText: {
        ...theme.typography.body,
        marginLeft: theme.spacing.md,
        fontFamily: theme.typography.fontFamilyMedium,
    },
    primaryButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        width: '100%',
        marginTop: theme.spacing.lg,
    },
    primaryButtonText: {
        ...theme.typography.h4,
        color: theme.colors.primaryForeground,
        fontFamily: theme.typography.fontFamilyBold,
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        padding: theme.spacing.md,
        borderRadius: theme.radius.lg,
        alignItems: 'center',
        width: '100%',
        marginTop: theme.spacing.sm,
    },
    secondaryButtonText: {
        ...theme.typography.h4,
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamilyBold,
    },
});