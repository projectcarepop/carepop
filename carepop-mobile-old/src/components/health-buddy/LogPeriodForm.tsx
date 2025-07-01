import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { theme } from '../theme';
import { MarkingProps } from 'react-native-calendars/src/calendar/day/marking';

// Props
export type PeriodFormData = {
  startDate: string;
  endDate: string;
};

type LogPeriodFormProps = {
  onSubmit: (data: PeriodFormData) => void;
  isSubmitting: boolean;
};

type PeriodSelection = {
  startingDay: DateData | null;
  endingDay: DateData | null;
};

interface MarkedDateCustomStyles extends MarkingProps {
    color?: string;
    textColor?: string;
}
  
type MarkedDates = {
    [key: string]: MarkedDateCustomStyles;
};

const LogPeriodForm = ({ onSubmit, isSubmitting }: LogPeriodFormProps) => {
  const [period, setPeriod] = useState<PeriodSelection>({ startingDay: null, endingDay: null });
  const [markedDates, setMarkedDates] = useState<MarkedDates>({});

  const onDayPress = (day: DateData) => {
    let newMarkedDates: MarkedDates = {};
    let newPeriod: PeriodSelection;

    if (!period.startingDay || (period.startingDay && period.endingDay)) {
      newPeriod = { startingDay: day, endingDay: null };
      newMarkedDates = {
        [day.dateString]: { startingDay: true, color: theme.colors.primary, textColor: theme.colors.primaryForeground, endingDay: true },
      };
    } else {
      let start = new Date(period.startingDay.dateString + 'T00:00:00');
      let end = new Date(day.dateString + 'T00:00:00');

      if (start > end) {
        [start, end] = [end, start]; // Swap
      }
      
      newPeriod = { 
          startingDay: { ...period.startingDay, dateString: start.toISOString().split('T')[0] },
          endingDay: { ...day, dateString: end.toISOString().split('T')[0] } 
      };

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        newMarkedDates[dateString] = {
          color: theme.colors.destructiveMuted,
          textColor: theme.colors.secondary,
        };
      }
      newMarkedDates[start.toISOString().split('T')[0]] = { ...(newMarkedDates[start.toISOString().split('T')[0]] || {}), startingDay: true, color: theme.colors.primary, textColor: theme.colors.primaryForeground };
      newMarkedDates[end.toISOString().split('T')[0]] = { ...(newMarkedDates[end.toISOString().split('T')[0]] || {}), endingDay: true, color: theme.colors.primary, textColor: theme.colors.primaryForeground };
    }
    setPeriod(newPeriod);
    setMarkedDates(newMarkedDates);
  };

  const handleSave = () => {
      if(period.startingDay && period.endingDay) {
          onSubmit({
              startDate: period.startingDay.dateString,
              endDate: period.endingDay.dateString
          });
      }
  };

  const calendarTheme = {
    backgroundColor: theme.colors.card,
    calendarBackground: theme.colors.card,
    selectedDayBackgroundColor: theme.colors.primary,
    todayTextColor: theme.colors.primary,
    dotColor: theme.colors.primary,
    arrowColor: theme.colors.secondary,
    monthTextColor: theme.colors.secondary,
    textSectionTitleColor: theme.colors.mutedForeground,
    dayTextColor: theme.colors.foreground,
    textDisabledColor: theme.colors.border,
    textDayFontFamily: theme.typography.fontFamily,
    textMonthFontFamily: theme.typography.fontFamilyBold,
    textDayHeaderFontFamily: theme.typography.fontFamilyMedium,
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Log Your Period</Text>
      <Text style={styles.subtitle}>Select the start and end dates of your last period.</Text>
      
      <Calendar
        onDayPress={onDayPress}
        markingType={'period'}
        markedDates={markedDates}
        theme={calendarTheme}
        style={styles.calendar}
      />
      
      <TouchableOpacity style={[styles.button, (isSubmitting || !period.endingDay) && styles.buttonDisabled]} onPress={handleSave} disabled={isSubmitting || !period.endingDay}>
        {isSubmitting ? (
          <ActivityIndicator color={theme.colors.primaryForeground} />
        ) : (
          <Text style={styles.buttonText}>Save Period</Text>
        )}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.card,
  },
  title: {
    ...theme.typography.h2,
    color: theme.colors.secondary,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  calendar: {
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xl,
    borderWidth: 1,
    borderColor: theme.colors.border
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  buttonText: {
    ...theme.typography.h4,
    color: theme.colors.primaryForeground,
  },
});

export default LogPeriodForm; 