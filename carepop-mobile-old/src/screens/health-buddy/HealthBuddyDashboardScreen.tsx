import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, useWindowDimensions, Modal, Alert, ActivityIndicator } from 'react-native';
import { Feather as Icon } from '@expo/vector-icons';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../../components/theme';

import { getHealthLogSummary, getAiInsight, createMenstrualLog } from '../../services/api';
import type { HealthLogSummary, AIInsight, CreateHealthLogPayload } from '../../lib/types';
import { HealthBuddyStackParamList } from '../../navigation/AppDrawerNavigator'; // Adjust this import to your actual navigator types

import AiInsightModal from '../../components/health-buddy/AiInsightModal';
import LogPeriodForm, { PeriodFormData } from '../../components/health-buddy/LogPeriodForm';

// --- Mock Data ---
const mockSummary: HealthLogSummary = {
  frequentSymptoms: [
    { symptom: 'Headache', count: 4 },
    { symptom: 'Fatigue', count: 5 },
    { symptom: 'Nausea', count: 2 },
    { symptom: 'Bloating', count: 3 },
  ],
};

const mockAiInsight: AIInsight = {
    insight: "We've noticed a pattern of headaches and fatigue. Consider discussing this with your provider. Remember to stay hydrated and get plenty of rest!"
}

type ActiveModal = 'period' | null;

type HealthBuddyNavigationProp = NativeStackNavigationProp<HealthBuddyStackParamList, 'HealthBuddyDashboard'>;

const HealthBuddyDashboardScreen = () => {
  const queryClient = useQueryClient();
  const navigation = useNavigation<HealthBuddyNavigationProp>();

  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [isFabMenuOpen, setIsFabMenuOpen] = useState(false);
  const [isInsightModalVisible, setIsInsightModalVisible] = useState(false);
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [headerHeight, setHeaderHeight] = useState(0);
  
  const { data: summary, isLoading: isLoadingSummary } = useQuery<HealthLogSummary>({
    queryKey: ['healthLogSummary'],
    queryFn: getHealthLogSummary,
  });

  const { mutate: fetchAiInsight, data: aiInsight, isPending: isFetchingInsight } = useMutation<AIInsight>({
    mutationFn: getAiInsight,
    onSuccess: () => setIsInsightModalVisible(true),
    onError: () => setIsInsightModalVisible(true), // Show mock on error for demo
  });
  
  const { mutate: submitPeriod, isPending: isSubmittingPeriod } = useMutation({
      mutationFn: (data: PeriodFormData) => createMenstrualLog(data),
      onSuccess: () => {
          Alert.alert('Success', 'Your period has been logged.');
          setActiveModal(null);
          queryClient.invalidateQueries({ queryKey: ['healthLogSummary'] });
      },
      onError: (error) => {
          Alert.alert('Error', `Could not save your log: ${error.message}`);
      },
  });

  const moods = [
    { icon: 'smile', label: 'Happy' },
    { icon: 'meh', label: 'Neutral' },
    { icon: 'frown', label: 'Sad' },
    { icon: 'alert-circle', label: 'Anxious' },
    { icon: 'activity', label: 'Stressed' },
  ];

  const handleFabMenuPress = (modal: ActiveModal) => {
    setActiveModal(modal);
    setIsFabMenuOpen(false);
  };

  return (
    <View style={styles.screenContainer}>
        <ScrollView style={styles.container}>
            <View 
                style={styles.header}
                onLayout={(event) => {
                    setHeaderHeight(event.nativeEvent.layout.height);
                }}
            >
                <View>
                    <Text style={styles.headerTitle}>Health Buddy</Text>
                    <Text style={styles.headerSubtitle}>Your personal health companion</Text>
                </View>
                <TouchableOpacity style={styles.fab} onPress={() => setIsFabMenuOpen(!isFabMenuOpen)}>
                    <Icon name={isFabMenuOpen ? "x" : "plus"} size={24} color={theme.colors.primaryForeground} />
                </TouchableOpacity>
            </View>

            {isFabMenuOpen && (
            <View style={[styles.fabMenu, { top: headerHeight }]}>
                <TouchableOpacity style={styles.fabMenuItem} onPress={() => navigation.navigate('LogSymptoms')}>
                <Text style={styles.fabMenuText}>Log Symptoms</Text>
                <View style={[styles.fabIconContainer, { backgroundColor: theme.colors.secondary}]}>
                    <Icon name="thermometer" size={24} color={theme.colors.secondaryForeground} />
                </View>
                </TouchableOpacity>
                <TouchableOpacity style={styles.fabMenuItem} onPress={() => handleFabMenuPress('period')}>
                <Text style={styles.fabMenuText}>Log Period</Text>
                <View style={[styles.fabIconContainer, { backgroundColor: theme.colors.secondary}]}>
                    <Icon name="droplet" size={24} color={theme.colors.secondaryForeground} />
                </View>
                </TouchableOpacity>
            </View>
            )}

            {/* Mood Selector Card */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>How are you feeling today?</Text>
                <Text style={styles.cardInstruction}>Select a mood to quickly log how you feel.</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.moodSelector}>
                {moods.map((mood) => (
                    <TouchableOpacity key={mood.label} onPress={() => setSelectedMood(mood.label)}>
                    <View style={[styles.moodCard, selectedMood === mood.label && styles.moodCardSelected]}>
                        <Icon name={mood.icon as any} size={28} color={selectedMood === mood.label ? theme.colors.primary : theme.colors.secondary} />
                        <Text style={[styles.moodLabel, selectedMood === mood.label && styles.moodLabelSelected]}>{mood.label}</Text>
                    </View>
                    </TouchableOpacity>
                ))}
                </ScrollView>
            </View>

            {/* Symptoms Summary Card */}
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

            {/* AI Insight Card */}
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

        {/* Modals */}
        {isInsightModalVisible && <AiInsightModal visible={isInsightModalVisible} insight={aiInsight?.insight || mockAiInsight.insight} onClose={() => setIsInsightModalVisible(false)} />}
        <Modal
            animationType="slide"
            transparent={true}
            visible={activeModal !== null}
            onRequestClose={() => setActiveModal(null)}
        >
            <View style={styles.modalBackdrop}>
                <View style={styles.modalContainer}>
                    <TouchableOpacity style={styles.modalCloseButton} onPress={() => setActiveModal(null)}>
                        <Icon name="x" size={24} color={theme.colors.mutedForeground} />
                    </TouchableOpacity>
                    {activeModal === 'period' && (
                        <LogPeriodForm
                            onSubmit={submitPeriod}
                            isSubmitting={isSubmittingPeriod}
                        />
                    )}
                </View>
            </View>
        </Modal>
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
    fab: {
        backgroundColor: theme.colors.secondary,
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 8,
        shadowColor: theme.colors.secondary,
    },
    fabMenu: {
        position: 'absolute',
        right: 0,
        zIndex: 10,
        alignItems: 'flex-end',
        marginBottom: theme.spacing.lg,
    },
    fabMenuItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fabMenuText: {
        ...theme.typography.h4,
        color: theme.colors.secondary,
        backgroundColor: theme.colors.card,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.radius.md,
        marginRight: theme.spacing.md,
        elevation: 5,
        shadowColor: theme.colors.secondary,
    },
    fabIconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 5,
        shadowColor: theme.colors.secondary,
    },
    modalBackdrop: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: 'white',
        borderRadius: 20,
        paddingVertical: theme.spacing.lg,
        margin: 24,
        width: '90%',
        maxHeight: '85%',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5
    },
    modalCloseButton: {
        position: 'absolute',
        top: theme.spacing.md,
        right: theme.spacing.md,
        zIndex: 1,
    },
});

export default HealthBuddyDashboardScreen; 