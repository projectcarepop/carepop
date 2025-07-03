import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../components/theme';

import { getHealthLogSummary, getAiInsight, createHealthLog } from '../../services/api';
import type { HealthLogSummary, AIInsight, CreateHealthLogPayload } from '../../lib/types';
import { HealthBuddyStackParamList } from '../../navigation/AppDrawerNavigator';

import AiInsightModal from '../../components/health-buddy/AiInsightModal';

const HealthBuddyDashboardScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<NativeStackNavigationProp<HealthBuddyStackParamList>>();

  const [isInsightModalVisible, setIsInsightModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  
  const { data: summary, isLoading: isLoadingSummary } = useQuery<HealthLogSummary>({
    queryKey: ['healthLogSummary'],
    queryFn: getHealthLogSummary,
  });

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
    onSettled: () => {
        setSelectedMood(null); // Deselect mood after action
    }
  });

  const handleMoodPress = (moodLabel: string) => {
    setSelectedMood(moodLabel);
    const payload: CreateHealthLogPayload = {
        logDate: new Date().toISOString(),
        mood: moodLabel.toLowerCase() as any, // Cast as a workaround for the enum type
        symptoms: [],
        notes: null,
    };
    quickLogMood(payload);
  };
  
  const moods = [
    { icon: 'smile', label: 'Happy' },
    { icon: 'meh', label: 'Neutral' },
    { icon: 'frown', label: 'Sad' },
    { icon: 'alert-circle', label: 'Anxious' },
    { icon: 'activity', label: 'Stressed' },
  ];

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
                <Text style={styles.cardTitle}>How are you feeling today?</Text>
                <Text style={styles.cardInstruction}>Select a mood to quickly log how you feel.</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodSelector}>
                {moods.map((mood) => (
                    <TouchableOpacity key={mood.label} onPress={() => handleMoodPress(mood.label)} disabled={isLoggingMood}>
                    <View style={[styles.moodCard, selectedMood === mood.label && styles.moodCardSelected]}>
                        {isLoggingMood && selectedMood === mood.label ? (
                            <ActivityIndicator color={theme.colors.primary} />
                        ) : (
                            <Icon name={mood.icon as any} size={28} color={selectedMood === mood.label ? theme.colors.primary : theme.colors.secondary} />
                        )}
                        <Text style={[styles.moodLabel, selectedMood === mood.label && styles.moodLabelSelected]}>{mood.label}</Text>
                    </View>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </View>

            <View style={styles.card}>
                <Text style={styles.cardTitle}>Your Week in Symptoms</Text>
                <Text style={styles.cardInstruction}>Here are the symptoms you&apos;ve logged most frequently this week.</Text>
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

            {/* --- Side-by-side Buttons --- */}
            <View style={styles.actionButtonContainer}>
                <TouchableOpacity 
                    style={styles.actionButton} 
                    onPress={() => navigation.navigate('LogSymptoms')}>
                    <Icon name="plus" size={16} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Log Symptoms</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('LogPeriod')}>
                    <Icon name="plus" size={16} color={theme.colors.primary} />
                    <Text style={styles.actionButtonText}>Log Flow</Text>
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
    moodSelector: {
        flexDirection: 'row',
    },
    moodCard: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.radius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
        marginRight: theme.spacing.md,
        borderWidth: 2,
        borderColor: 'transparent',
        width: 90,
        height: 90,
        justifyContent: 'center',
    },
    moodCardSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.destructiveMuted,
    },
    moodLabel: {
        ...theme.typography.small,
        fontFamily: theme.typography.fontFamilyMedium,
        color: theme.colors.secondary,
        marginTop: theme.spacing.sm,
    },
    moodLabelSelected: {
        color: theme.colors.primary,
    },
    symptomListContainer: {
        marginTop: theme.spacing.sm,
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
    actionButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginHorizontal: -theme.spacing.sm, // Counteract button margin
        marginBottom: theme.spacing.lg,
    },
    actionButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.muted,
        padding: theme.spacing.md,
        borderRadius: theme.radius.md,
        marginHorizontal: theme.spacing.sm,
    },
    actionButtonText: {
        color: theme.colors.primary,
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilySemiBold,
        marginLeft: theme.spacing.sm,
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