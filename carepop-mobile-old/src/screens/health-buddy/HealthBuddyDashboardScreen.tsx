import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../components/theme';

import { getHealthLogSummary, getAiInsight, createHealthLog, getHealthLogs } from '../../services/api';
import type { HealthLog, HealthLogSummary, AIInsight, CreateHealthLogPayload } from '../../lib/types';
import { HealthBuddyStackParamList } from '../../navigation/AppDrawerNavigator';

import AiInsightModal from '../../components/health-buddy/AiInsightModal';

const HealthBuddyDashboardScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<HealthBuddyStackParamList>>();

  const [isInsightModalVisible, setIsInsightModalVisible] = useState(false);
  
  const { data: summary, isLoading: isLoadingSummary } = useQuery<HealthLogSummary>({
    queryKey: ['healthLogSummary'],
    queryFn: getHealthLogSummary,
  });

  const { data: healthLogs } = useQuery<HealthLog[]>({
    queryKey: ['healthLogs'],
    queryFn: getHealthLogs,
  });

  const today = new Date().toISOString().split('T')[0];
  const hasLoggedToday = healthLogs?.some(log => log.logDate.split('T')[0] === today);

  const { mutate: fetchAiInsight, data: aiInsight, isPending: isFetchingInsight } = useMutation<AIInsight>({
    mutationFn: getAiInsight,
    onSuccess: () => setIsInsightModalVisible(true),
    onError: () => setIsInsightModalVisible(true), 
  });

  const { mutate: quickLogMood, isPending: isLoggingMood } = useMutation({
    mutationFn: (payload: CreateHealthLogPayload) => createHealthLog(payload),
    onSuccess: () => {
      Alert.alert('Success', 'Your mood has been logged.');
      queryClient.invalidateQueries({ queryKey: ['healthLogSummary'] });
    },
    onError: (error: any) => {
      Alert.alert('Error', error.message || 'Could not log your mood.');
    },
  });

  return (
    <View style={styles.screenContainer}>
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Health Buddy</Text>
                    <Text style={styles.headerSubtitle}>Your personal health companion</Text>
                </View>
            </View>
            
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Your Week in Symptoms</Text>
                <Text style={styles.cardInstruction}>Here are the symptoms you&apos;ve logged most frequently this week.</Text>
                
                <TouchableOpacity 
                    style={[styles.actionButton, hasLoggedToday && styles.disabledButton]} 
                    onPress={() => navigation.navigate('LogSymptoms')}
                    disabled={hasLoggedToday}
                    >
                    <Icon name="plus" size={16} color={hasLoggedToday ? theme.colors.mutedForeground : theme.colors.primary} />
                    <Text style={[styles.actionButtonText, hasLoggedToday && styles.disabledButtonText]}>Log Symptoms & Mood</Text>
                </TouchableOpacity>

                {hasLoggedToday && (
                    <Text style={styles.loggedTodayText}>You&apos;ve already logged your symptoms today. Come back tomorrow!</Text>
                )}

                {isLoadingSummary ? (
                    <ActivityIndicator color={theme.colors.primary} style={{marginTop: theme.spacing.lg}} />
                ) : (
                    <View style={styles.symptomListContainer}>
                    {summary?.frequentSymptoms && summary.frequentSymptoms.length > 0 ? (
                        summary.frequentSymptoms.map((item, index) => (
                        <View key={index} style={styles.symptomItem}>
                            <Text style={styles.symptomText}>{item.symptom}</Text>
                            <View style={styles.symptomBadge}>
                            <Text style={styles.symptomBadgeText}>{item.count} {item.count > 1 ? 'times' : 'time'}</Text>
                            </View>
                        </View>
                        ))
                    ) : (
                        <Text style={styles.symptomText}>No symptoms logged this week.</Text>
                    )}
                    </View>
                )}
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Track Your Cycle</Text>
                <Text style={styles.cardInstruction}>Log the start and end of your menstrual flow to see patterns over time.</Text>
                <TouchableOpacity 
                    style={[styles.actionButton, hasLoggedToday && styles.disabledButton]}
                    onPress={() => navigation.navigate('LogPeriod')}
                    disabled={hasLoggedToday}
                    >
                    <Icon name="droplet" size={16} color={hasLoggedToday ? theme.colors.mutedForeground : theme.colors.primary} />
                    <Text style={[styles.actionButtonText, hasLoggedToday && styles.disabledButtonText]}>Log Flow</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity style={[styles.card, styles.aiCard]} onPress={() => fetchAiInsight()}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="sparkles" size={24} color={theme.colors.accentForeground} style={{ marginRight: theme.spacing.lg }} />
                <View style={{flex: 1}}>
                    <Text style={styles.aiCardTitle}>{isFetchingInsight ? "Generating..." : "Generate Your Weekly Insight"}</Text>
                    <Text style={styles.aiCardSubtitle}>Tap to let our AI analyze your logs and provide a personalized insight.</Text>
                </View>
                </View>
            </TouchableOpacity>

            <View style={{ height: 120 }} />
        </ScrollView>

        {isInsightModalVisible && <AiInsightModal visible={isInsightModalVisible} insight={aiInsight?.insight || "An error occurred, but here's a general tip: Stay hydrated!"} onClose={() => setIsInsightModalVisible(false)} />}
    </View>
  );
};

const styles = StyleSheet.create({
    screenContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.sm,
        paddingTop: theme.spacing.xl * 2,
    },
    container: {
        flex: 1,
        paddingHorizontal: theme.spacing.lg,
    },
    header: {
        paddingVertical: theme.spacing.xl,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerTitle: {
        ...theme.typography.h1,
        color: theme.colors.secondary,
        opacity: 0.9,
        marginTop: theme.spacing.xs,
    },
    headerSubtitle: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        marginTop: theme.spacing.xs,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.md,
        padding: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
        shadowColor: theme.colors.secondary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
        elevation: 5,
    },
    cardTitle: {
        ...theme.typography.h3,
        color: theme.colors.secondary,
        marginBottom: theme.spacing.xs,
    },
    cardInstruction: {
        ...theme.typography.small,
        color: theme.colors.mutedForeground,
        marginBottom: theme.spacing.lg,
    },
    symptomListContainer: {
        marginTop: theme.spacing.lg,
    },
    symptomItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    symptomText: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        color: theme.colors.foreground,
    },
    symptomBadge: {
        backgroundColor: theme.colors.muted,
        borderRadius: theme.radius.full,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.xs,
    },
    symptomBadgeText: {
        ...theme.typography.small,
        color: theme.colors.mutedForeground,
        fontFamily: theme.typography.fontFamilyMedium,
    },
    actionButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.muted,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        marginBottom: theme.spacing.lg,
    },
    actionButtonText: {
        color: theme.colors.primary,
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilySemiBold,
        marginLeft: theme.spacing.sm,
    },
    disabledButton: {
        backgroundColor: theme.colors.background,
        borderColor: theme.colors.border,
        borderWidth: 1,
    },
    disabledButtonText: {
        color: theme.colors.mutedForeground,
    },
    loggedTodayText: {
        ...theme.typography.small,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginBottom: theme.spacing.lg,
    },
    aiCard: {
        backgroundColor: theme.colors.secondary,
        padding: theme.spacing.lg,
    },
    aiCardTitle: {
        ...theme.typography.h4,
        color: theme.colors.accentForeground,
    },
    aiCardSubtitle: {
        ...theme.typography.small,
        color: theme.colors.accentForeground,
        opacity: 0.9,
        marginTop: theme.spacing.xs,
    },
});

export default HealthBuddyDashboardScreen; 