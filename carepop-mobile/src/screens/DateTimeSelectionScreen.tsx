import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { theme } from '../components';
import { useNavigation, useRoute, NavigationProp, RouteProp } from '@react-navigation/native';
import { AppointmentStackParamList } from '../navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { Calendar, DateData } from 'react-native-calendars';

type DateTimeSelectionRouteProp = RouteProp<AppointmentStackParamList, 'DateTimeSelection'>;
type DateTimeSelectionNavigationProp = NavigationProp<AppointmentStackParamList, 'DateTimeSelection'>;

// Mock time slots for demonstration
const timeSlots = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
    '01:00 PM', '01:30 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM'
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
        setSelectedTime(null);
    };

    const handleSelectTime = (time: string) => {
        setSelectedTime(time);
    };

    const handleContinue = () => {
        if (!selectedDate || !selectedTime) {
            Alert.alert("Selection Incomplete", "Please select both a date and a time to continue.");
            return;
        }
        
        const slot = `${selectedDate} ${selectedTime}`;

        navigation.navigate('BookingConfirmation', {
            clinicId,
            serviceId,
            slot
        });
    };

    // Calendar theme integrated with our app's theme
    const calendarTheme = {
        backgroundColor: theme.colors.background,
        calendarBackground: theme.colors.card,
        textSectionTitleColor: theme.colors.textMuted,
        selectedDayBackgroundColor: theme.colors.primary,
        selectedDayTextColor: theme.colors.card,
        todayTextColor: theme.colors.primary,
        dayTextColor: theme.colors.text,
        textDisabledColor: theme.colors.disabled,
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

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.header}>1. Select a Date</Text>
                <Calendar
                    style={styles.calendar}
                    onDayPress={onDayPress}
                    markedDates={{
                        [selectedDate]: { selected: true, marked: true, selectedColor: theme.colors.primary },
                    }}
                    minDate={today}
                    theme={calendarTheme}
                />

                {selectedDate && (
                     <View>
                        <Text style={styles.header}>2. Select a Time</Text>
                        <View style={styles.timeSlotGrid}>
                            {timeSlots.map((time) => (
                                <TouchableOpacity
                                    key={time}
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
                    <Ionicons name="arrow-forward-circle" size={24} color={theme.colors.card} />
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
        fontSize: theme.typography.subheading,
        fontWeight: 'bold',
        color: theme.colors.secondary,
        marginBottom: theme.spacing.md,
        paddingLeft: theme.spacing.xs,
    },
    calendar: {
        borderRadius: theme.borderRadius.lg,
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
        borderRadius: theme.borderRadius.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        alignItems: 'center',
    },
    timeSlotButtonSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primaryDark,
    },
    timeSlotText: {
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    timeSlotTextSelected: {
        color: theme.colors.card,
        fontWeight: 'bold',
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
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'center',
    },
    continueButtonDisabled: {
        backgroundColor: theme.colors.disabledBackground,
    },
    continueButtonText: {
        color: theme.colors.card,
        fontSize: 18,
        fontWeight: 'bold',
        marginRight: theme.spacing.sm,
    }
}); 