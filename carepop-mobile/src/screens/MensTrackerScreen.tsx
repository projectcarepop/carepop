import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Calendar, CalendarProps } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import { theme, Button } from '../components';
import { getCyclesApi, getSymptomsApi } from '../data/api/menstrual';
import { Cycle, SymptomLog } from '../types/menstrual';
import { HealthBuddyStackParamList } from '../navigation/AppNavigator';

type MensTrackerNavigationProp = NativeStackNavigationProp<HealthBuddyStackParamList, 'MensTracker'>;

// --- Helper Functions ---
const getDaysBetween = (startDate: string, endDate: string) => {
    const dates = [];
    let currentDate = new Date(startDate);
    const end = new Date(endDate);
    while (currentDate <= end) {
        dates.push(new Date(currentDate).toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

export function MensTrackerScreen() {
    const navigation = useNavigation<MensTrackerNavigationProp>();
    const [cycles, setCycles] = useState<Cycle[]>([]);
    const [symptoms, setSymptoms] = useState<SymptomLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [markedDates, setMarkedDates] = useState<CalendarProps['markedDates']>({});

    useFocusEffect(
        React.useCallback(() => {
            const fetchData = async () => {
                setIsLoading(true);
                try {
                    const [fetchedCycles, fetchedSymptoms] = await Promise.all([
                        getCyclesApi(),
                        getSymptomsApi('2024-01-01', new Date().toISOString().split('T')[0])
                    ]);
                    setCycles(fetchedCycles);
                    setSymptoms(fetchedSymptoms);
                } finally {
                    setIsLoading(false);
                }
            };
            fetchData();
        }, [])
    );

    useMemo(() => {
        const markings: CalendarProps['markedDates'] = {};
        cycles.forEach(cycle => {
            const periodDays = getDaysBetween(cycle.start_date, cycle.end_date || cycle.start_date);
            periodDays.forEach((day, index) => {
                markings[day] = {
                    ...markings[day],
                    startingDay: index === 0,
                    endingDay: index === periodDays.length - 1,
                    color: theme.colors.primary,
                    textColor: theme.colors.background,
                };
            });
        });
        symptoms.forEach(log => {
            markings[log.log_date] = { 
                ...markings[log.log_date], 
                marked: true, 
                dotColor: theme.colors.secondary 
            };
        });
        setMarkedDates(markings);
    }, [cycles, symptoms]);
    
    const currentCycle = cycles.find(c => c.end_date === null);
    const cycleDay = currentCycle ? getDaysBetween(currentCycle.start_date, new Date().toISOString().split('T')[0]).length : 0;

    if (isLoading) {
        return <SafeAreaView style={styles.safeArea}><ActivityIndicator size="large" color={theme.colors.primary} /></SafeAreaView>;
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView contentContainerStyle={styles.container}>
                <Text style={styles.screenTitle}>Menstrual Tracker</Text>
                
                <Calendar
                    markingType={'period'}
                    markedDates={markedDates}
                    theme={{
                        calendarBackground: theme.colors.background,
                        textSectionTitleColor: theme.colors.mutedForeground,
                        dayTextColor: theme.colors.foreground,
                        todayTextColor: theme.colors.primary,
                        selectedDayBackgroundColor: theme.colors.primary,
                        selectedDayTextColor: theme.colors.primaryForeground,
                        arrowColor: theme.colors.primary,
                        monthTextColor: theme.colors.secondary,
                        textMonthFontWeight: 'bold',
                        ...theme.typography
                    }}
                />

                <View style={styles.infoCard}>
                    <Ionicons name="water-outline" size={32} color={theme.colors.primary} />
                    <View style={styles.infoTextContainer}>
                         {currentCycle ? (
                            <>
                                <Text style={styles.infoTitle}>Day {cycleDay} of your cycle</Text>
                                <Text style={styles.infoSubtitle}>Period started on {new Date(currentCycle.start_date).toLocaleDateString()}</Text>
                            </>
                         ) : (
                             <Text style={styles.infoTitle}>No active cycle</Text>
                         )}
                    </View>
                </View>

                <View style={styles.actionsContainer}>
                    <Button
                        title="Log Period"
                        onPress={() => navigation.navigate('LogPeriod')}
                        style={styles.actionButton}
                    />
                    <Button
                        title="Log Symptoms"
                        onPress={() => navigation.navigate('LogSymptoms')}
                        variant="outline"
                        style={styles.actionButton}
                    />
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { padding: 20 },
    screenTitle: { ...theme.typography.h2, color: theme.colors.foreground, marginBottom: 20, textAlign: 'center' },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.accent,
        borderRadius: theme.radius.md,
        padding: 15,
        marginTop: 20,
    },
    infoTextContainer: { marginLeft: 15 },
    infoTitle: { ...theme.typography.h4, color: theme.colors.primary, fontFamily: theme.typography.fontFamilySemiBold },
    infoSubtitle: { ...theme.typography.body, color: theme.colors.primary, marginTop: 2 },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: 20,
    },
    actionButton: {
        flex: 1,
        marginHorizontal: 10,
    }
}); 