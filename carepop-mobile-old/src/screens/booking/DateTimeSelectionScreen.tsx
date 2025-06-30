import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useQuery } from '@tanstack/react-query';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { format, parseISO } from 'date-fns';

import { theme } from '../../components/theme';
import { getPublicSlots } from '../../services/api';
import { BookingStackParamList } from '../../navigation/BookingNavigator';
import { AvailabilitySlot } from '../../lib/types';

type DateTimeSelectionRouteProp = RouteProp<BookingStackParamList, 'DateTimeSelection'>;
type DateTimeSelectionNavigationProp = NativeStackNavigationProp<BookingStackParamList, 'DateTimeSelection'>;

export default function DateTimeSelectionScreen() {
  const navigation = useNavigation<DateTimeSelectionNavigationProp>();
  const route = useRoute<DateTimeSelectionRouteProp>();
  const { clinicId, serviceId } = route.params;

  const [selectedDate, setSelectedDate] = useState<string | null>(null); // YYYY-MM-DD

  const {
    data: availabilityByDoctor,
    isLoading,
    isError,
    error,
  } = useQuery<AvailabilitySlot[], Error>({
    queryKey: ['publicSlots', clinicId, serviceId],
    queryFn: () => getPublicSlots({ clinicId, serviceId }),
    enabled: !!clinicId && !!serviceId,
  });

  const { availableDates, slotsForSelectedDate } = useMemo(() => {
    if (!availabilityByDoctor) return { availableDates: [], slotsForSelectedDate: [] };

    const allSlots = availabilityByDoctor.flatMap(doc => doc.slots);
    
    const uniqueDates = [...new Set(allSlots.map(slot => slot.split('T')[0]))];
    
    const slots = selectedDate
      ? allSlots.filter(slot => slot.startsWith(selectedDate))
      : [];

    slots.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return { availableDates: uniqueDates, slotsForSelectedDate: slots };
  }, [availabilityByDoctor, selectedDate]);

  const markedDates = useMemo(() => {
    const marks: CalendarProps['markedDates'] = {};
    availableDates?.forEach(date => {
      marks[date] = { marked: true, dotColor: theme.colors.primary };
    });
    if (selectedDate) {
      marks[selectedDate] = {
        ...marks[selectedDate],
        selected: true,
        selectedColor: theme.colors.primary,
      };
    }
    return marks;
  }, [availableDates, selectedDate]);

  const handleSelectTime = (dateTime: string) => {
    navigation.navigate('BookingConfirmation', { clinicId, serviceId, dateTime });
  };

  const renderTimeSlots = () => (
    <View style={styles.timeContainer}>
      <Text style={styles.timeTitle}>Select a Time</Text>
      {isLoading ? (
        <ActivityIndicator color={theme.colors.primary} />
      ) : (
        <View style={styles.slotsGrid}>
          {slotsForSelectedDate.map(slot => (
            <TouchableOpacity key={slot} style={styles.slotButton} onPress={() => handleSelectTime(slot)}>
              <Text style={styles.slotText}>{format(parseISO(slot), 'h:mm a')}</Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <TouchableOpacity onPress={() => setSelectedDate(null)}>
        <Text style={styles.changeDateText}>Change Date</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Date & Time</Text>
          <Text style={styles.subtitle}>Step 3 of 4</Text>
        </View>

        {selectedDate ? (
          renderTimeSlots()
        ) : (
          isLoading ? (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          ) : (
            <Calendar
              style={styles.calendar}
              onDayPress={day => setSelectedDate(day.dateString)}
              markedDates={markedDates}
              minDate={new Date().toISOString().split('T')[0]}
              theme={{
                backgroundColor: theme.colors.background,
                calendarBackground: theme.colors.background,
                textSectionTitleColor: theme.colors.mutedForeground,
                selectedDayBackgroundColor: theme.colors.primary,
                selectedDayTextColor: theme.colors.primaryForeground,
                todayTextColor: theme.colors.primary,
                dayTextColor: theme.colors.foreground,
                textDisabledColor: theme.colors.border,
                arrowColor: theme.colors.primary,
                monthTextColor: theme.colors.foreground,
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: 'bold',
              }}
            />
          )
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: theme.colors.background },
  scrollContainer: { flexGrow: 1, paddingBottom: theme.spacing.lg },
  header: { paddingHorizontal: theme.spacing.lg, paddingTop: theme.spacing.md, paddingBottom: theme.spacing.xl },
  title: { ...theme.typography.h2, color: theme.colors.foreground },
  subtitle: { ...theme.typography.body, color: theme.colors.mutedForeground, marginTop: theme.spacing.xs },
  calendar: { borderRadius: theme.radius.md, marginHorizontal: theme.spacing.lg },
  timeContainer: { paddingHorizontal: theme.spacing.lg },
  timeTitle: { ...theme.typography.h3, color: theme.colors.foreground, marginBottom: theme.spacing.lg },
  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'flex-start' },
  slotButton: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginRight: theme.spacing.md,
    marginBottom: theme.spacing.md,
    minWidth: '28%',
    alignItems: 'center',
  },
  slotText: { ...theme.typography.body, color: theme.colors.foreground, fontFamily: theme.typography.fontFamilyMedium },
  changeDateText: {
    ...theme.typography.body,
    color: theme.colors.primary,
    textAlign: 'center',
    marginTop: theme.spacing.xl,
    padding: theme.spacing.md,
  },
}); 