import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { theme } from '../../components/theme';
import { useNavigation } from '@react-navigation/native';

type Period = {
  startingDay: DateData | null;
  endingDay: DateData | null;
};

const LogPeriodScreen = () => {
  const navigation = useNavigation();
  const [period, setPeriod] = useState<Period>({ startingDay: null, endingDay: null });
  const [markedDates, setMarkedDates] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const onDayPress = (day: DateData) => {
    if (!period.startingDay || (period.startingDay && period.endingDay)) {
      // Start a new period selection
      const newMarked = {
        [day.dateString]: { startingDay: true, color: theme.colors.primary, textColor: theme.colors.primaryForeground },
      };
      setPeriod({ startingDay: day, endingDay: null });
      setMarkedDates(newMarked);
    } else {
      // End the period selection
      let start = new Date(period.startingDay.dateString);
      let end = new Date(day.dateString);

      if (start > end) {
        [start, end] = [end, start]; // Swap if end is before start
      }
      
      const newMarked = { ...markedDates };
      for (let d = start; d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        newMarked[dateString] = {
          ...newMarked[dateString],
          color: theme.colors.primary,
          textColor: theme.colors.primaryForeground,
        };
      }

      const startString = start.toISOString().split('T')[0];
      const endString = end.toISOString().split('T')[0];
      
      newMarked[startString] = { ...newMarked[startString], startingDay: true };
      newMarked[endString] = { ...newMarked[endString], endingDay: true };

      setPeriod({ startingDay: {dateString: startString, day: start.getDate(), month: start.getMonth()+1, year: start.getFullYear(), timestamp: start.getTime()}, endingDay: {dateString: endString, day: end.getDate(), month: end.getMonth()+1, year: end.getFullYear(), timestamp: end.getTime()} });
      setMarkedDates(newMarked);
    }
  };

  const handleSave = () => {
    setIsLoading(true);
    // Mock API call
    setTimeout(() => {
      setIsLoading(false);
      navigation.goBack();
    }, 1500);
  };

  const calendarTheme = {
    backgroundColor: theme.colors.card,
    calendarBackground: theme.colors.background,
    selectedDayBackgroundColor: theme.colors.primary,
    todayTextColor: theme.colors.primary,
    dotColor: theme.colors.primary,
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.foreground,
    textSectionTitleColor: theme.colors.mutedForeground,
    dayTextColor: theme.colors.foreground,
    textDisabledColor: theme.colors.muted,
    'stylesheet.calendar.header': {
      week: {
        marginTop: theme.spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between'
      }
    },
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
      
      <TouchableOpacity style={styles.button} onPress={handleSave} disabled={isLoading || !period.endingDay}>
        {isLoading ? (
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
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  title: {
    ...theme.typography.h1,
    color: theme.colors.foreground,
    marginBottom: theme.spacing.xs,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
  },
  calendar: {
    borderRadius: theme.radius.lg,
    marginBottom: theme.spacing.xl,
  },
  button: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    height: 50,
  },
  buttonText: {
    ...theme.typography.h4,
    color: theme.colors.primaryForeground,
  },
});

export default LogPeriodScreen; 