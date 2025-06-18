import React, { useState, useCallback, FC } from 'react';
import { View, StyleSheet, ActivityIndicator, RefreshControl, useWindowDimensions, FlatList, Text, Modal, Pressable, SafeAreaView, TouchableOpacity } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { TabView, SceneMap, TabBar } from 'react-native-tab-view';
import { LucideFilter, LucidePlus } from 'lucide-react-native';
import { Checkbox } from 'react-native-paper';

// Import the canonical Appointment type from the API utility
import { Appointment, getUpcomingAppointments, getPastAppointments } from '../src/utils/api';
// Import only the component, not the type from the card file
import { AppointmentCard } from '../src/components/appointments/AppointmentCard';
import { theme, Button } from '../src/components'; 

// Define a simple type for our filter options. In a real app, this might come from an API.
const MOCK_SERVICES = [
    { id: '1', name: 'Family Planning Consultation' },
    { id: '2', name: 'HIV Testing' },
    { id: '3', name: 'SRH Checkup' },
    { id: '4', name: 'Mental Wellness Session' },
];

const AppointmentsList: FC<{ type: 'upcoming' | 'past', filters: Record<string, any> }> = ({ type, filters }) => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    const fetchAppointments = useCallback(async () => {
        setLoading(true);
        try {
            // Pass filters to the API call
            const apiCall = type === 'upcoming' 
                ? getUpcomingAppointments
                : getPastAppointments;
            const data = await apiCall(filters);
            setAppointments(data);
        } catch (error) {
            console.error(`Error fetching ${type} appointments:`, error);
        } finally {
            setLoading(false);
        }
    }, [type, filters]);

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

export const BookingScreen: FC = () => {
    const layout = useWindowDimensions();
    const navigation = useNavigation();
    const [index, setIndex] = useState(0);
    const [routes] = useState([
        { key: 'upcoming', title: 'Upcoming' },
        { key: 'past', title: 'Past' },
    ]);
    const [isFilterModalVisible, setFilterModalVisible] = useState(false);
    const [appliedFilters, setAppliedFilters] = useState<Record<string, any>>({});
    const [tempFilters, setTempFilters] = useState<Record<string, any>>({});

    const openFilterModal = () => {
        setTempFilters(appliedFilters);
        setFilterModalVisible(true);
    };
    
    const applyFilters = () => {
        setAppliedFilters(tempFilters);
        setFilterModalVisible(false);
    };
    
    const clearFilters = () => {
        setTempFilters({});
        setAppliedFilters({});
        setFilterModalVisible(false);
    };

    const handleServiceToggle = (serviceId: string) => {
        setTempFilters(prev => {
            const currentSelectedId = prev.serviceId;
            // Toggle behavior: if it's already selected, unselect it. Otherwise, select it.
            if (currentSelectedId === serviceId) {
                const { serviceId, ...rest } = prev;
                return rest;
            }
            return { ...prev, serviceId: serviceId };
        });
    };

    const renderScene = SceneMap({
        upcoming: () => <AppointmentsList type="upcoming" filters={appliedFilters} />,
        past: () => <AppointmentsList type="past" filters={appliedFilters} />,
    });

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>My Appointments</Text>
                <View style={styles.headerActions}>
                    <Pressable onPress={openFilterModal} style={styles.iconButton}>
                        <LucideFilter size={24} color={theme.colors.primary} />
                    </Pressable>
                    <Pressable onPress={() => console.log("Navigate to Booking Flow")} style={styles.iconButton}>
                        <LucidePlus size={24} color={theme.colors.primary} />
                    </Pressable>
                </View>
            </View>
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
                        inactiveColor={theme.colors.mutedForeground}
                    />
                )}
            />
            
            <Modal
                animationType="slide"
                transparent={true}
                visible={isFilterModalVisible}
                onRequestClose={() => setFilterModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Filter Appointments</Text>
                        <Text style={styles.filterSectionTitle}>By Service</Text>
                        <FlatList
                            data={MOCK_SERVICES}
                            keyExtractor={(item) => item.id}
                            renderItem={({ item }) => (
                                <TouchableOpacity style={styles.filterItem} onPress={() => handleServiceToggle(item.id)}>
                                    <Checkbox.Android
                                        status={tempFilters.serviceId === item.id ? 'checked' : 'unchecked'}
                                        onPress={() => handleServiceToggle(item.id)}
                                        color={theme.colors.primary}
                                    />
                                    <Text style={styles.filterItemText}>{item.name}</Text>
                                </TouchableOpacity>
                            )}
                        />
                        <View style={styles.modalActions}>
                            <Button variant="outline" onPress={clearFilters} style={{ flex: 1, marginRight: 8 }}>Clear</Button>
                            <Button onPress={applyFilters} style={{ flex: 1 }}>Apply</Button>
                        </View>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    headerTitle: {
        ...theme.typography.h2,
        color: theme.colors.foreground,
    },
    headerActions: {
        flexDirection: 'row',
    },
    iconButton: {
        marginLeft: theme.spacing.md,
    },
    spinner: {
        marginTop: 20,
    },
    listContent: {
        padding: theme.spacing.md,
        flexGrow: 1,
  },
    centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
        padding: theme.spacing.lg,
  },
    noAppointmentsText: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
  },
    tabLabel: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        textTransform: 'capitalize',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        padding: theme.spacing.lg,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        height: '50%',
    },
    modalTitle: {
        ...theme.typography.h3,
        marginBottom: theme.spacing.md,
        textAlign: 'center',
    },
    filterSectionTitle: {
        ...theme.typography.h4,
        color: theme.colors.foreground,
        marginBottom: theme.spacing.sm,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 'auto',
    },
    filterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
    },
    filterItemText: {
        ...theme.typography.body,
        color: theme.colors.foreground,
        marginLeft: theme.spacing.sm,
    }
}); 