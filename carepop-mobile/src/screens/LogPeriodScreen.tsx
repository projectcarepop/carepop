import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, Alert, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { Button, Card } from '../components';
import { theme } from '../components/theme';
import { getCyclesApi, startNewCycleApi, endCycleApi } from '../data/api/menstrual';
import { Cycle } from '../types/menstrual';

export function LogPeriodScreen() {
    const navigation = useNavigation();
    const [currentCycle, setCurrentCycle] = useState<Cycle | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, setIsUpdating] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const fetchCurrentCycle = async () => {
                setIsLoading(true);
                const cycles = await getCyclesApi();
                const activeCycle = cycles.find(c => c.end_date === null) || null;
                setCurrentCycle(activeCycle);
                setIsLoading(false);
            };
            fetchCurrentCycle();
        }, [])
    );

    const handleStartPeriod = async () => {
        setIsUpdating(true);
        const today = new Date().toISOString().split('T')[0];
        const newCycle = await startNewCycleApi(today);
        if (newCycle) {
            Alert.alert('Success', 'Your new period has been logged.');
            navigation.goBack();
        }
        setIsUpdating(false);
    };

    const handleEndPeriod = async () => {
        if (!currentCycle) return;
        setIsUpdating(true);
        const today = new Date().toISOString().split('T')[0];
        const updatedCycle = await endCycleApi(currentCycle.id, today);
        if (updatedCycle) {
            Alert.alert('Success', 'Your period end date has been logged.');
            navigation.goBack();
        }
        setIsUpdating(false);
    };

    const renderContent = () => {
        if (isLoading) {
            return <ActivityIndicator size="large" color={theme.colors.primary} />;
        }

        if (currentCycle) {
            return (
                <Card style={styles.card}>
                    <Text style={styles.cardTitle}>Your period is ongoing.</Text>
                    <Text style={styles.cardSubtitle}>Started on {new Date(currentCycle.start_date).toLocaleDateString()}</Text>
                    <Button
                        title={isUpdating ? 'Saving...' : 'Log Period End Today'}
                        onPress={handleEndPeriod}
                        disabled={isUpdating}
                        variant="primary"
                        styleType="solid"
                        style={styles.button}
                    />
                </Card>
            );
        }

        return (
            <Card style={styles.card}>
                <Text style={styles.cardTitle}>Did your period start today?</Text>
                <Text style={styles.cardSubtitle}>This will start a new cycle log.</Text>
                <Button
                    title={isUpdating ? 'Saving...' : 'Log Period Start Today'}
                    onPress={handleStartPeriod}
                    disabled={isUpdating}
                    variant="primary"
                    styleType="solid"
                    style={styles.button}
                />
            </Card>
        );
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.container}>
                <Text style={styles.screenTitle}>Log Your Period</Text>
                {renderContent()}
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: { flex: 1, backgroundColor: theme.colors.background },
    container: { flex: 1, justifyContent: 'center', padding: 20 },
    screenTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.text,
        textAlign: 'center',
        marginBottom: 30,
    },
    card: {
        padding: 20,
        alignItems: 'center',
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: theme.colors.text,
        textAlign: 'center',
    },
    cardSubtitle: {
        fontSize: 14,
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 20,
    },
    button: {
        width: '100%',
    }
}); 