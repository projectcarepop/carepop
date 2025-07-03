import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Calendar, DateData } from 'react-native-calendars';
import { useNavigation } from '@react-navigation/native';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Ionicons } from '@expo/vector-icons';

import { theme } from '../../components/theme';
import { createMenstrualLog } from '../../services/api';
import type { CreateMenstrualLogPayload } from '../../lib/types';

const LogPeriodScreen = () => {
  const navigation = useNavigation();
  const queryClient = useQueryClient();

  const [periodRange, setPeriodRange] = useState<{ startDate: string; endDate: string }>({ startDate: '', endDate: '' });

  const { mutate: submitPeriodLog, isPending } = useMutation({
    mutationFn: createMenstrualLog,
    onSuccess: () => {
      Alert.alert('Success', 'Your period has been logged.');
      queryClient.invalidateQueries({ queryKey: ['healthLogSummary'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Could not save your log. Please try again.');
    },
  });

  const onDayPress = (day: DateData) => {
    if (!periodRange.startDate || (periodRange.startDate && periodRange.endDate)) {
      setPeriodRange({ startDate: day.dateString, endDate: '' });
    } else {
      let start = periodRange.startDate;
      let end = day.dateString;
      if (new Date(start) > new Date(end)) {
        [start, end] = [end, start]; // Swap
      }
      setPeriodRange({ startDate: start, endDate: end });
    }
  };

  const markedDates = useMemo(() => {
    const marked: { [key: string]: any } = {};
    if (periodRange.startDate) {
      const start = new Date(periodRange.startDate + 'T00:00:00');
      const end = periodRange.endDate ? new Date(periodRange.endDate + 'T00:00:00') : new Date(start);

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateString = d.toISOString().split('T')[0];
        marked[dateString] = {
          color: theme.colors.primary,
          textColor: theme.colors.primaryForeground,
          startingDay: dateString === periodRange.startDate,
          endingDay: dateString === periodRange.endDate,
          selected: true,
        };
      }
    }
    return marked;
  }, [periodRange]);

  const handleSave = () => {
    if (!periodRange.startDate) {
      Alert.alert('Incomplete', 'Please select a start date.');
      return;
    }
    const payload: CreateMenstrualLogPayload = {
      startDate: periodRange.startDate,
      // The backend expects an end date. If only one day is selected, start and end are the same.
      endDate: periodRange.endDate || periodRange.startDate, 
    };
    submitPeriodLog(payload);
  };

  const calendarTheme = {
    backgroundColor: theme.colors.background,
    calendarBackground: theme.colors.background,
    selectedDayBackgroundColor: theme.colors.primary,
    todayTextColor: theme.colors.primary,
    dotColor: theme.colors.primary,
    arrowColor: theme.colors.primary,
    monthTextColor: theme.colors.secondary,
    textSectionTitleColor: theme.colors.mutedForeground,
    dayTextColor: theme.colors.foreground,
    textDisabledColor: theme.colors.muted,
    textDayFontFamily: theme.typography.fontFamily,
    textMonthFontFamily: theme.typography.fontFamilyBold,
    textDayHeaderFontFamily: theme.typography.fontFamilyMedium,
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.secondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Log Your Period</Text>
      </View>

      <Text style={styles.subtitle}>Select the start and end dates of your cycle.</Text>
      
      <Calendar
        onDayPress={onDayPress}
        markingType={'period'}
        markedDates={markedDates}
        theme={calendarTheme}
        style={styles.calendar}
      />
      
      <TouchableOpacity 
        style={[styles.button, (isPending || !periodRange.startDate) && styles.buttonDisabled]} 
        onPress={handleSave} 
        disabled={isPending || !periodRange.startDate}
      >
        {isPending ? <ActivityIndicator color={theme.colors.primaryForeground} /> : <Text style={styles.buttonText}>Save Period</Text>}
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    paddingTop: theme.spacing.xl * 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.xl*2,
  },
  headerTitle: {
    ...theme.typography.h2,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.md,
  },
  subtitle: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.xl,
    paddingHorizontal: theme.spacing.md,
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
  buttonDisabled: {
    backgroundColor: theme.colors.muted,
  },
  buttonText: {
    ...theme.typography.h4,
    color: theme.colors.primaryForeground,
  },
});

export default LogPeriodScreen; 