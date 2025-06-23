import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity, ActivityIndicator, Modal } from 'react-native';
import { theme } from '../components/theme';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';
import { Button } from '../components/button.native';
import { Calendar, Droplets, Smile, Wind, Leaf, BrainCircuit, Lightbulb, X, Plus } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import api from '../utils/api';

// --- Interfaces ---
interface HealthAnalysis {
  cycleSummary: string;
  nextPeriod: { date: string; confidence: number };
  fertileWindow: { start: string; end: string };
  symptomForecasts: { symptom: string; timeframe: string }[];
  moodPatterns: string;
  recommendations: string[];
}

// --- Mock Data for UI Development ---
const mockAnalysis: HealthAnalysis = {
    cycleSummary: "Your average cycle length is 29 days, with low variability. Great job with consistent tracking!",
    nextPeriod: { date: "2024-09-15", confidence: 0.9 },
    fertileWindow: { start: "2024-08-30", end: "2024-09-04" },
    symptomForecasts: [
        { symptom: "Bloating", timeframe: "2 days before your period" },
        { symptom: "Fatigue", timeframe: "1-3 days before your period" }
    ],
    moodPatterns: "It seems your mood tends to dip slightly in the 2-3 days leading up to your period. This is a common experience for many.",
    recommendations: [
        "Consider gentle exercise like yoga around Sept 12-14 to help with potential bloating.",
        "Ensure you're getting enough sleep next week as you may feel more fatigued.",
        "A warm bath or a heating pad can be a great self-care ritual during your pre-period phase."
    ]
};

// --- UI Components ---
const InsightCard = ({ title, icon, children }: { title: string, icon: React.ReactNode, children: React.ReactNode }) => (
    <Card style={styles.card}>
        <CardHeader style={styles.cardHeader}>
            {icon}
            <CardTitle style={styles.cardTitle}>{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
);

const DataLogModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
    // This will be expanded with forms for logging all the new data points.
    return (
        <Modal
            animationType="slide"
            transparent={true}
            visible={visible}
            onRequestClose={onClose}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Log Your Day</Text>
                        <TouchableOpacity onPress={onClose}>
                            <X size={24} color={theme.colors.foreground} />
                        </TouchableOpacity>
                    </View>
                    <Text style={styles.placeholderText}>Forms for pill, cycle, symptoms, mood, and notes will go here.</Text>
                    <Button title="Save Log" onPress={onClose} style={{ marginTop: theme.spacing.lg }} />
                </View>
            </View>
        </Modal>
    );
};

export default function HealthBuddyScreen({ navigation }: any) {
    const { getToken, isLoaded } = useAuth();
    const [analysis, setAnalysis] = useState<HealthAnalysis | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    const handleAnalyze = useCallback(async () => {
        if (!isLoaded) return;
        
        setLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await api.post('/health-logs/analyze', {}, getToken);
            setAnalysis(result);
        } catch (err: any) {
            console.error("Failed to get analysis", err);
            setError(err.message || "Couldn't get your analysis. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [isLoaded, getToken]);

    const ConfidenceMeter = ({ confidence }: { confidence: number }) => (
        <View style={styles.confidenceContainer}>
            <View style={[styles.confidenceBar, { width: `${confidence * 100}%` }]} />
        </View>
    );

    return (
        <SafeAreaView style={styles.safeArea}>
            <DataLogModal visible={modalVisible} onClose={() => setModalVisible(false)} />
            <ScrollView contentContainerStyle={styles.container}>
                <View style={styles.headerContainer}>
                    <View>
                        <Text style={styles.header}>Health AI</Text>
                        <Text style={styles.subHeader}>Your personal health dashboard.</Text>
                    </View>
                    <TouchableOpacity style={styles.fab} onPress={() => navigation.navigate('LogHealthData')}>
                        <Plus size={24} color={theme.colors.primaryForeground} />
                    </TouchableOpacity>
                </View>
                
                <Button 
                    title={loading ? "Analyzing..." : "Get Fresh Insights"}
                    onPress={handleAnalyze} 
                    disabled={loading || !isLoaded}
                    variant="outline"
                    icon={<BrainCircuit size={18} color={theme.colors.primary} style={{ marginRight: theme.spacing.sm }} />}
                />

                {loading && <ActivityIndicator size="large" color={theme.colors.primary} style={{ marginTop: theme.spacing.xl }} />}
                
                {error && !loading && (
                    <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                        <Button title="Try Again" onPress={handleAnalyze} variant="link" />
                    </View>
                )}

                {analysis && !loading && (
                    <View style={styles.dashboardGrid}>
                        <InsightCard title="Cycle Summary" icon={<Calendar size={24} color={theme.colors.primary} />}>
                            <Text style={styles.cardText}>{analysis.cycleSummary}</Text>
                        </InsightCard>

                        <InsightCard title="Predictions" icon={<Droplets size={24} color={theme.colors.primary} />}>
                            <View style={styles.predictionItem}>
                                <Text style={styles.cardTextBold}>Next Period:</Text>
                                <Text style={styles.cardText}>{analysis.nextPeriod.date}</Text>
                                <ConfidenceMeter confidence={analysis.nextPeriod.confidence} />
                            </View>
                            <View style={styles.predictionItem}>
                                <Text style={styles.cardTextBold}>Fertile Window:</Text>
                                <Text style={styles.cardText}>{analysis.fertileWindow.start} to {analysis.fertileWindow.end}</Text>
                            </View>
                        </InsightCard>

                        <InsightCard title="Symptom Forecast" icon={<Wind size={24} color={theme.colors.primary} />}>
                            {analysis.symptomForecasts.map((s, i) => (
                                <Text key={i} style={styles.cardText}>• You may experience <Text style={styles.cardTextBold}>{s.symptom}</Text> {s.timeframe}.</Text>
                            ))}
                        </InsightCard>

                        <InsightCard title="Mood Patterns" icon={<Smile size={24} color={theme.colors.primary} />}>
                            <Text style={styles.cardText}>{analysis.moodPatterns}</Text>
                        </InsightCard>

                        <InsightCard title="Recommendations" icon={<Lightbulb size={24} color={theme.colors.primary} />}>
                             {analysis.recommendations.map((r, i) => (
                                <View key={i} style={styles.recommendationItem}>
                                    <Leaf size={16} color={theme.colors.success} />
                                    <Text style={[styles.cardText, { flex: 1, marginLeft: theme.spacing.sm }]}>{r}</Text>
                                </View>
                            ))}
                        </InsightCard>
                    </View>
                )}

                {!analysis && !loading && !error && (
                    <View style={styles.centered}>
                        <Text style={styles.placeholderText}>Tap &quot;Get Fresh Insights&quot; to see your personalized health analysis.</Text>
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    container: {
        paddingHorizontal: theme.spacing.lg,
        paddingBottom: theme.spacing.xl,
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: theme.spacing.lg,
        marginBottom: theme.spacing.lg,
    },
    header: {
        ...theme.typography.h1,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.primary,
    },
    subHeader: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
    },
    fab: {
        backgroundColor: theme.colors.primary,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    dashboardGrid: {
        marginTop: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    card: {
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.lg,
        padding: 0, // Reset padding for custom layout
        overflow: 'hidden',
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    cardTitle: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilySemiBold,
        color: theme.colors.cardForeground,
        marginLeft: theme.spacing.sm,
    },
    cardText: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        lineHeight: 22,
    },
    cardTextBold: {
        fontFamily: theme.typography.fontFamilySemiBold,
        color: theme.colors.cardForeground,
    },
    predictionItem: {
        marginBottom: theme.spacing.md,
    },
    confidenceContainer: {
        height: 6,
        width: '100%',
        backgroundColor: theme.colors.muted,
        borderRadius: theme.radius.full,
        marginTop: theme.spacing.xs,
        overflow: 'hidden',
    },
    confidenceBar: {
        height: '100%',
        backgroundColor: theme.colors.success,
    },
    recommendationItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: theme.spacing.sm,
    },
    errorContainer: {
        marginTop: theme.spacing.lg,
        alignItems: 'center',
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.destructiveMuted,
        borderRadius: theme.radius.lg,
    },
    errorText: {
        ...theme.typography.body,
        color: theme.colors.destructiveForeground,
        textAlign: 'center',
        marginBottom: theme.spacing.md,
    },
    placeholderText: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginVertical: theme.spacing.xl,
    },
    centered: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.xl * 2,
    },
    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.radius.lg,
        borderTopRightRadius: theme.radius.lg,
        padding: theme.spacing.lg,
        height: '60%', // Adjust as needed
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingBottom: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    modalTitle: {
        ...theme.typography.h3,
        fontFamily: theme.typography.fontFamilyBold,
    },
}); 