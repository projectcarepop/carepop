import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, Pressable } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Swipeable } from 'react-native-gesture-handler';

import { theme, Card, Button } from '../components';
import { getMedications, getMedicationLogs, logMedication, deactivateMedication } from '../data/api/medication';
import { Medication } from '../types/medication';
import { HealthBuddyStackParamList } from '../navigation/AppNavigator';

type PillTrackerNavigationProp = NativeStackNavigationProp<HealthBuddyStackParamList, 'PillTrackerScreen'>;

type MedicationWithLog = Medication & { takenToday: boolean };

export function PillTrackerScreen() {
    const navigation = useNavigation<PillTrackerNavigationProp>();
    const [medications, setMedications] = useState<MedicationWithLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        try {
            const today = new Date().toISOString().split('T')[0];
            const [meds, logs] = await Promise.all([
                getMedications(),
                getMedicationLogs(today)
            ]);
            
            const loggedIds = new Set(logs.map(log => log.medication_id));
            
            const combinedMeds = meds.map(med => ({
                ...med,
                takenToday: loggedIds.has(med.id),
            }));
            
            setMedications(combinedMeds);
        } catch (error) {
            // Error is already alerted in the api function
        } finally {
            setIsLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const handleLogMedication = async (medId: string) => {
        const success = await logMedication(medId);
        if (success) {
            setMedications(prevMeds =>
                prevMeds.map(med =>
                    med.id === medId ? { ...med, takenToday: true } : med
                )
            );
            Alert.alert('Success', 'Medication logged!');
        }
    };

    const handleDeleteMedication = async (medId: string) => {
        Alert.alert(
            "Deactivate Medication",
            "Are you sure you want to deactivate this medication? This cannot be undone.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Deactivate",
                    style: "destructive",
                    onPress: async () => {
                        const success = await deactivateMedication(medId);
                        if (success) {
                            fetchData(); // Refresh the list
                            Alert.alert('Success', 'Medication has been deactivated.');
                        }
                    }
                }
            ]
        );
    };

    const renderRightActions = (medId: string) => {
        return (
            <TouchableOpacity
                onPress={() => handleDeleteMedication(medId)}
                style={styles.deleteButton}>
                <Ionicons name="trash-outline" size={24} color={theme.colors.white} />
            </TouchableOpacity>
        );
    };

    const renderMedicationItem = ({ item }: { item: MedicationWithLog }) => (
        <Swipeable renderRightActions={() => renderRightActions(item.id)}>
            <Card style={styles.medCard}>
                <View style={styles.medInfo}>
                    <Text style={styles.medName}>{item.name}</Text>
                    {item.dosage && <Text style={styles.medDosage}>{item.dosage}</Text>}
                </View>
                <Pressable
                    style={[styles.statusButton, item.takenToday ? styles.takenButton : styles.toTakeButton]}
                    onPress={() => !item.takenToday && handleLogMedication(item.id)}
                    disabled={item.takenToday}
                >
                    <Ionicons 
                        name={item.takenToday ? "checkmark-circle" : "ellipse-outline"}
                        size={24}
                        color={item.takenToday ? theme.colors.white : theme.colors.primary}
                    />
                    <Text style={[styles.statusText, item.takenToday && styles.takenText]}>
                        {item.takenToday ? 'Taken' : 'Take'}
                    </Text>
                </Pressable>
            </Card>
        </Swipeable>
    );

    if (isLoading) {
        return (
            <SafeAreaView style={styles.safeArea}>
                <ActivityIndicator style={{ marginTop: 20 }} size="large" color={theme.colors.primary} />
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.header}>
                <Text style={styles.screenTitle}>Pill Tracker</Text>
                <Button
                    title="Add Med"
                    onPress={() => navigation.navigate('AddMedicationScreen')}
                    variant="primary"
                    styleType="solid"
                    icon={<Ionicons name="add" size={20} color={theme.colors.white} />}
                />
            </View>
            
            {medications.length > 0 ? (
                <FlatList
                    data={medications}
                    renderItem={renderMedicationItem}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={styles.listContainer}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="file-tray-outline" size={64} color={theme.colors.border} />
                    <Text style={styles.emptyText}>No medications added yet.</Text>
                    <Text style={styles.emptySubText}>Press "Add Med" to get started.</Text>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
    },
    listContainer: {
        paddingHorizontal: 20,
        paddingTop: 10,
    },
    medCard: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
        padding: 15,
    },
    medInfo: {
        flex: 1,
    },
    medName: {
        fontSize: 16,
        fontWeight: '600',
        color: theme.colors.text,
    },
    medDosage: {
        fontSize: 14,
        color: theme.colors.textMuted,
        marginTop: 2,
    },
    statusButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 20,
    },
    toTakeButton: {
        borderWidth: 1,
        borderColor: theme.colors.primary,
    },
    takenButton: {
        backgroundColor: theme.colors.primary,
    },
    statusText: {
        marginLeft: 8,
        fontSize: 14,
        fontWeight: '500',
        color: theme.colors.primary,
    },
    takenText: {
        color: theme.colors.white,
    },
    deleteButton: {
        backgroundColor: theme.colors.danger,
        justifyContent: 'center',
        alignItems: 'center',
        width: 75,
        height: '90%',
        borderRadius: theme.roundness,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        marginTop: 10,
    },
    emptySubText: {
        fontSize: 14,
        color: theme.colors.textMuted,
        marginTop: 5,
        textAlign: 'center',
    },
}); 