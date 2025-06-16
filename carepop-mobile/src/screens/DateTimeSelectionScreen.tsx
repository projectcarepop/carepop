import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { AppointmentStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';

type DateTimeSelectionRouteProp = RouteProp<AppointmentStackParamList, 'DateTimeSelection'>;
type DateTimeSelectionNavigationProp = NavigationProp<AppointmentStackParamList, 'DateTimeSelection'>;

// Mock time slots
const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', 
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM'
];

export const DateTimeSelectionScreen = () => {
    const navigation = useNavigation<DateTimeSelectionNavigationProp>();
    const route = useRoute<DateTimeSelectionRouteProp>();
    const { clinicId, serviceId } = route.params;

    const [selectedDate, setSelectedDate] = useState<string>('');
    const [selectedTime, setSelectedTime] = useState<string | null>(null);

    const today = new Date().toISOString().split('T')[0];

    const onDayPress = (day: DateData) => {
        setSelectedDate(day.dateString);
        setSelectedTime(null); // Reset time when date changes
    };

    const handleSelectTime = (time: string) => {
        setSelectedTime(time);
    };

    const handleContinue = () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert("Selection Incomplete", "Please select both a date and a time to continue.");
            return;
        }
        
        // The slot combines date and time for the confirmation screen
        const slot = `${selectedDate} ${selectedTime}`;

        navigation.navigate('BookingConfirmation', {
            clinicId,
            serviceId,
            slot
        });
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>Select a Date</Text>
                <Calendar
                    style={styles.calendar}
                    onDayPress={onDayPress}
                    markedDates={{
                        [selectedDate]: { selected: true, marked: true, selectedColor: theme.colors.primary },
                    }}
                    minDate={today}
                    theme={{
                        backgroundColor: theme.colors.background,
                        calendarBackground: theme.colors.card,
                        textSectionTitleColor: theme.colors.textMuted,
                        selectedDayBackgroundColor: theme.colors.primary,
                        selectedDayTextColor: '#ffffff',
                        todayTextColor: theme.colors.primary,
                        dayTextColor: theme.colors.text,
                        arrowColor: theme.colors.primary,
                        monthTextColor: theme.colors.text,
                        indicatorColor: theme.colors.primary,
                        'stylesheet.calendar.header': {
                            week: {
                                marginTop: 5,
                                flexDirection: 'row',
                                justifyContent: 'space-between'
                            }
                        }
                    }}
                />

                {selectedDate && (
                     <View style={styles.timeSlotContainer}>
                        <Text style={styles.header}>Select a Time</Text>
                        <View style={styles.timeSlotGrid}>
                            {timeSlots.map((time, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={[
                                        styles.timeSlotButton,
                                        selectedTime === time && styles.timeSlotButtonSelected
                                    ]}
                                    onPress={() => handleSelectTime(time)}
                                >
                                    <Text style={[
                                        styles.timeSlotText,
                                        selectedTime === time && styles.timeSlotTextSelected
                                    ]}>{time}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

            </ScrollView>
            <View style={styles.footer}>
                <TouchableOpacity 
                    style={[styles.continueButton, (!selectedDate || !selectedTime) && styles.continueButtonDisabled]} 
                    onPress={handleContinue}
                    disabled={!selectedDate || !selectedTime}
                >
                    <Text style={styles.continueButtonText}>Continue</Text>
                    <Ionicons name="arrow-forward-outline" size={20} color={theme.colors.card} />
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
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        color: theme.colors.text,
        marginBottom: theme.spacing.md,
    },
    calendar: {
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        marginBottom: theme.spacing.lg,
    },
    timeSlotContainer: {
        marginTop: theme.spacing.md,
    },
    timeSlotGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    timeSlotButton: {
        width: '32%',
        paddingVertical: 12,
        backgroundColor: theme.colors.card,
        borderRadius: theme.borderRadius.sm,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
        marginBottom: theme.spacing.sm,
    },
    timeSlotButtonSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    timeSlotText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    timeSlotTextSelected: {
        color: theme.colors.card,
    },
    footer: {
        padding: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
        backgroundColor: theme.colors.card,
    },
    continueButton: {
        backgroundColor: theme.colors.primary,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: theme.colors.muted,
    },
    continueButtonText: {
        color: theme.colors.card,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: theme.spacing.sm,
    }
}); 