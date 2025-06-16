import React, { useState, useCallback, FC } from 'react';
import { View, StyleSheet, ActivityIndicator, RefreshControl, useWindowDimensions, FlatList, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

// Import the canonical Appointment type from the API utility
import { Appointment, getUpcomingAppointments, getPastAppointments } from '../src/utils/api';
// Import only the component, not the type from the card file
import { AppointmentCard } from '../src/components/appointments/AppointmentCard';
import { theme } from '../src/components';

const AppointmentsList: FC<{ type: 'upcoming' | 'past' }> = ({ type }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            const data = type === 'upcoming' 
                ? await getUpcomingAppointments() 
                : await getPastAppointments();
            setAppointments(data);
        } catch (error) {
            console.error(`Error fetching ${type} appointments:`, error);
        } finally {
            setLoading(false);
        }
    }, [type]);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        fetchAppointments().finally(() => setRefreshing(false));
    }, [fetchAppointments]);

    useFocusEffect(
        useCallback(() => {
            fetchAppointments();
        }, [fetchAppointments])
    );

    if (loading && !refreshing) {
        return <ActivityIndicator size="large" style={styles.spinner} color={theme.colors.primary} />;
    }

    return (
        <FlatList
            data={appointments}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <AppointmentCard appointment={item} onPress={() => console.log('Navigate to detail')} />}
            ListEmptyComponent={<NoAppointments message={`You have no ${type} appointments.`} />}
            contentContainerStyle={styles.listContent}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
    );
};

const NoAppointments: FC<{ message: string }> = ({ message }) => (
    <View style={styles.centered}>
        <Text style={styles.noAppointmentsText}>{message}</Text>
    </View>
);

const renderScene = SceneMap({
    upcoming: () => <AppointmentsList type="upcoming" />,
    past: () => <AppointmentsList type="past" />,
});

export const BookingScreen: FC = () => {
    const layout = useWindowDimensions();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'upcoming', title: 'Upcoming' },
        { key: 'past', title: 'Past' },
    ]);

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={props => (
                <TabBar
                    {...props}
                    indicatorStyle={{ backgroundColor: theme.colors.primary }}
                    style={{ backgroundColor: theme.colors.background }}
                    activeColor={theme.colors.primary}
                    inactiveColor={theme.colors.textMuted}
                />
            )}
        />
    );
};

const styles = StyleSheet.create({
    spinner: {
        marginTop: 20,
    },
    listContent: {
        padding: theme.spacing.md,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.lg,
    },
    noAppointmentsText: {
        fontSize: 16,
        color: theme.colors.textMuted,
    },
}); 