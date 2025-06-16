import React, { useState, useCallback, FC } from 'react';
import { View, StyleSheet, ActivityIndicator, RefreshControl, useWindowDimensions, FlatList, Text } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';

import { AppointmentCard, Appointment } from '../src/components/appointments/AppointmentCard';
import api from '../src/utils/api';

// Define the props for the reusable list component
interface AppointmentsListProps {
  appointments: Appointment[];
  onRefresh: () => void;
  refreshing: boolean;
  isLoading: boolean;
  ListEmptyComponent: React.ComponentType<any> | React.ReactElement | null;
}

const AppointmentsList: FC<AppointmentsListProps> = ({ appointments, onRefresh, refreshing, isLoading, ListEmptyComponent }) => (
  <FlatList
    data={appointments}
    keyExtractor={(item) => item.id}
    renderItem={({ item }) => <AppointmentCard appointment={item} onPress={() => console.log('Navigate to detail')} />}
    ListEmptyComponent={!isLoading ? ListEmptyComponent : null}
    contentContainerStyle={styles.listContent}
    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    ListFooterComponent={isLoading && !refreshing ? <ActivityIndicator style={styles.spinner} /> : null}
  />
);

const NoAppointments: FC<{ message: string }> = ({ message }) => (
    <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>{message}</Text>
    </View>
);

const BookingScreen: FC = () => {
    const layout = useWindowDimensions();

    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'upcoming', title: 'Upcoming' },
        { key: 'past', title: 'Past' },
    ]);

    const [upcoming, setUpcoming] = useState<Appointment[]>([]);
    const [past, setPast] = useState<Appointment[]>([]);

    const [loadingUpcoming, setLoadingUpcoming] = useState(false);
    const [loadingPast, setLoadingPast] = useState(false);

    const [refreshingUpcoming, setRefreshingUpcoming] = useState(false);
    const [refreshingPast, setRefreshingPast] = useState(false);

    const fetchAppointments = useCallback(async (type: 'upcoming' | 'past') => {
        const endpointType = type === 'upcoming' ? 'future' : 'past';
        const isLoading = type === 'upcoming' ? loadingUpcoming : loadingPast;
        const setLoading = type === 'upcoming' ? setLoadingUpcoming : setLoadingPast;
        const setAppointments = type === 'upcoming' ? setUpcoming : setPast;

        if (isLoading) return;
        setLoading(true);

        try {
            const response = await api.get(`/public/appointments/my/${endpointType}`);
            setAppointments(response.data || []);
        } catch (error) {
            console.error(`Error fetching ${type} appointments:`, error);
        } finally {
            setLoading(false);
        }
    }, [loadingUpcoming, loadingPast]);

    const onRefreshUpcoming = useCallback(() => {
        setRefreshingUpcoming(true);
        fetchAppointments('upcoming').finally(() => setRefreshingUpcoming(false));
    }, [fetchAppointments]);

    const onRefreshPast = useCallback(() => {
        setRefreshingPast(true);
        fetchAppointments('past').finally(() => setRefreshingPast(false));
    }, [fetchAppointments]);

    useFocusEffect(
        useCallback(() => {
            fetchAppointments('upcoming');
            fetchAppointments('past');
        }, [fetchAppointments])
    );
    
    const renderScene = SceneMap({
        upcoming: () => (
            <AppointmentsList
                appointments={upcoming}
                onRefresh={onRefreshUpcoming}
                refreshing={refreshingUpcoming}
                isLoading={loadingUpcoming}
                ListEmptyComponent={<NoAppointments message="You have no upcoming appointments." />}
            />
        ),
        past: () => (
            <AppointmentsList
                appointments={past}
                onRefresh={onRefreshPast}
                refreshing={refreshingPast}
                isLoading={loadingPast}
                ListEmptyComponent={<NoAppointments message="You have no past appointments." />}
            />
        ),
    });

    return (
        <TabView
            navigationState={{ index, routes }}
            renderScene={renderScene}
            onIndexChange={setIndex}
            initialLayout={{ width: layout.width }}
            renderTabBar={props => 
                <TabBar 
                    {...props} 
                    style={{ backgroundColor: 'white' }} 
                    indicatorStyle={{ backgroundColor: '#6200ee' }}
                    activeColor={'#6200ee'}
                    inactiveColor={'black'}
                />
            }
        />
    );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
    paddingHorizontal: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
  },
  spinner: {
    marginVertical: 20,
  }
});

export default BookingScreen; 