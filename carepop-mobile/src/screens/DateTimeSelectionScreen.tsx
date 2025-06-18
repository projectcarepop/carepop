import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { BookingStackParamList } from '../navigation/AppNavigator';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';
import { getDay, format } from 'date-fns';

type DateTimeSelectionRouteProp = RouteProp<BookingStackParamList, 'DateTimeSelection'>;
type DateTimeSelectionNavigationProp = NavigationProp<BookingStackParamList, 'DateTimeSelection'>;

// Expected structure for schedule data from the backend
interface ScheduleSlot {
  provider_id: string;
  provider_name: string; // For display, optional
  day_of_week: number; // 0 for Sunday, 1 for Monday, etc.
  start_time: string; // "HH:mm" format
  end_time: string; // "HH:mm" format
}

// Structure for a selectable time slot in the UI
interface TimeSlot {
  time: string; // e.g., "09:00 AM"
  providerId: string;
  day: string; // e.g., "Monday"
}


export const DateTimeSelectionScreen = () => {
    const navigation = useNavigation<DateTimeSelectionNavigationProp>();
    const route = useRoute<DateTimeSelectionRouteProp>();
    const { clinicId, serviceId, serviceName } = route.params;

    const { session } = useAuth();
    const [schedules, setSchedules] = useState<ScheduleSlot[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);

    const today = new Date().toISOString().split('T')[0];

    // Fetch schedules from the backend
    const fetchSchedules = useCallback(async () => {
        if (!session) {
            setError('You must be logged in.');
            setIsLoading(false);
            return;
        }
        const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
        if (!backendUrl) {
            setError('Backend URL not configured.');
            setIsLoading(false);
            return;
        }
        try {
            const response = await fetch(`${backendUrl}/api/v1/public/schedules/availability?clinic_id=${clinicId}&service_id=${serviceId}`, {
                headers: { 'Authorization': `Bearer ${session.access_token}` },
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Failed to fetch schedules.');
            setSchedules(data.data || []);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setIsLoading(false);
        }
    }, [session, clinicId, serviceId]);

    useEffect(() => {
        fetchSchedules();
    }, [fetchSchedules]);


    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        setSelectedTimeSlot(null);
    };

    const handleSelectTime = (timeSlot: TimeSlot) => {
        setSelectedTimeSlot(timeSlot);
    };
    
    const handleContinue = () => {
        if (!selectedDate || !selectedTimeSlot) {
            Alert.alert("Selection Incomplete", "Please select both a date and a time to continue.");
            return;
        }

        navigation.navigate('BookingConfirmation', {
            clinicId,
            serviceId,
            providerId: selectedTimeSlot.providerId,
            schedule: {
                date: selectedDate,
                time: selectedTimeSlot.time,
                day: selectedTimeSlot.day,
            },
        });
    };

    // Memoize the calculation of available time slots for a selected date
    const availableTimeSlots = useMemo((): TimeSlot[] => {
        if (!selectedDate) return [];
        
        const selectedDayOfWeek = getDay(new Date(selectedDate)); // Use date-fns to get day of week
        const dayName = format(new Date(selectedDate), 'EEEE'); // Get full day name e.g., "Monday"

        const slotsForDay = schedules.filter(s => s.day_of_week === selectedDayOfWeek);
        
        // This is a simplified slot generation. A real app might have more complex logic.
        const allSlots: TimeSlot[] = [];
        slotsForDay.forEach(schedule => {
            // Logic to generate 30-minute slots from start_time to end_time
            let [startHour, startMinute] = schedule.start_time.split(':').map(Number);
            const [endHour, endMinute] = schedule.end_time.split(':').map(Number);

            while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
                const date = new Date();
                date.setHours(startHour, startMinute, 0);
                allSlots.push({
                    time: format(date, 'hh:mm a'), // e.g., "09:00 AM"
                    providerId: schedule.provider_id,
                    day: dayName,
                });
                startMinute += 30;
                if (startMinute >= 60) {
                    startHour++;
                    startMinute -= 60;
                }
            }
        });

        // Remove duplicates and sort
        const uniqueSlots = Array.from(new Set(allSlots.map(s => s.time)))
            .map(time => allSlots.find(s => s.time === time)!);
        
        return uniqueSlots.sort((a, b) => a.time.localeCompare(b.time));

    }, [selectedDate, schedules]);

    const calendarTheme = {
        backgroundColor: theme.colors.background,
        calendarBackground: theme.colors.card,
        textSectionTitleColor: theme.colors.mutedForeground,
        selectedDayBackgroundColor: theme.colors.primary,
        selectedDayTextColor: theme.colors.card,
        todayTextColor: theme.colors.primary,
        dayTextColor: theme.colors.foreground,
        textDisabledColor: theme.colors.mutedForeground,
        arrowColor: theme.colors.primary,
        monthTextColor: theme.colors.secondary,
        indicatorColor: theme.colors.primary,
        textDayFontFamily: theme.typography.fontFamily,
        textMonthFontFamily: theme.typography.fontFamilyBold,
        textDayHeaderFontFamily: theme.typography.fontFamily,
        textDayFontWeight: '500' as const,
        textMonthFontWeight: 'bold' as const,
        textDayHeaderFontWeight: '300' as const,
        textDayFontSize: 16,
        textMonthFontSize: 20,
        textDayHeaderFontSize: 14,
    };

    if (isLoading) {
        return <View style={styles.centered}><ActivityIndicator size="large" /><Text>Loading Availability...</Text></View>;
    }
    if (error) {
        return <View style={styles.centered}><Text>Error: {error}</Text></View>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>1. Select a Date for {serviceName}</Text>
                <Calendar
                    style={styles.calendar}
                    onDayPress={onDayPress}
                    markedDates={{ [selectedDate]: { selected: true, marked: true }, }}
                    minDate={today}
                    theme={calendarTheme}
                />

                {selectedDate && (
                     <View>
                        <Text style={styles.header}>2. Select a Time</Text>
                        <View style={styles.timeSlotGrid}>
                            {availableTimeSlots.length > 0 ? (
                                availableTimeSlots.map((slot) => (
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
                                ))
                            ) : (
                                <Text style={styles.noSlotsText}>No available slots for this day.</Text>
                            )}
                        </View>
                    </View>
                )}
            </ScrollView>
            
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.continueButton, (!selectedDate || !selectedTimeSlot) && styles.continueButtonDisabled]} 
                    onPress={handleContinue}
                    disabled={!selectedDate || !selectedTimeSlot}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward-circle" size={24} color={theme.colors.primaryForeground} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
    },
    header: {
        ...theme.typography.h4,
        color: theme.colors.secondary,
        marginBottom: theme.spacing.md,
        paddingLeft: theme.spacing.xs,
    },
    calendar: {
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    timeSlotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'flex-start', // Align to start
    },
    timeSlotButton: {
        width: '31%', // Adjust for 3 columns with margin
        margin: '1.1%', // Create space between buttons
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
        ...theme.typography.small,
        fontFamily: theme.typography.fontFamilyMedium,
        color: theme.colors.primary,
    },
    timeSlotTextSelected: {
        color: theme.colors.primaryForeground,
        fontFamily: theme.typography.fontFamilySemiBold,
    },
    footer: {
        paddingVertical: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.background, // Match screen background
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: theme.colors.muted,
    },
    continueButtonText: {
        color: theme.colors.primaryForeground,
        ...theme.typography.h4,
        marginRight: theme.spacing.sm,
    },
    centered: { flex: 1, justifyContent: 'center', alignItems: 'center'},
    noSlotsText: { padding: 20, textAlign: 'center', color: theme.colors.mutedForeground }
}); 