import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, ScrollView, TouchableOpacity } from 'react-native';
import { theme } from '../components/theme';
import { Card, CardHeader, CardContent, CardTitle } from '../components/card.native';
import { Button } from '../components/button.native';
import { Pill, Check, X, Flame, History, Droplets, Pencil, Smile, Meh, Frown, Sparkles } from 'lucide-react-native';
import { useAuth } from '@clerk/clerk-expo';
import { logHealthEntry, getHealthInsights } from '../utils/api';

type PillStatus = 'taken' | 'missed' | 'pending';

const PillTracker = () => {
    const { getToken } = useAuth();
    const [status, setStatus] = React.useState<PillStatus>('pending');
    const [isLoading, setIsLoading] = React.useState(false);

    const handlePress = async (newStatus: 'taken' | 'missed') => {
        setIsLoading(true);
        try {
            await logHealthEntry(getToken, {
                entry_type: 'pill',
                status: newStatus,
            });
            setStatus(newStatus);
        } catch (error) {
            console.error('Failed to log pill status:', error);
            // Optionally: show a toast to the user
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.pillTrackerContainer}>
            <View style={styles.pillInfo}>
                <Pill size={24} color={theme.colors.foreground} />
                <Text style={styles.pillText}>Daily Birth Control</Text>
                <View style={[styles.streak, status === 'taken' && styles.streakTaken]}>
                    <Flame size={16} color={status === 'taken' ? theme.colors.background : theme.colors.primary} />
                    <Text style={[styles.streakText, status === 'taken' && styles.streakTextTaken]}>5 days</Text>
                </View>
            </View>
            <View style={styles.pillActions}>
                <Button 
                    title="Taken" 
                    variant={status === 'taken' ? 'default' : 'outline'} 
                    size="sm" 
                    icon={<Check size={16} color={status === 'taken' ? theme.colors.primaryForeground : theme.colors.foreground}/>} 
                    onPress={() => handlePress('taken')}
                    disabled={status !== 'pending' || isLoading}
                />
                <Button 
                    title="Missed" 
                    variant={status === 'missed' ? 'destructive' : 'outline'} 
                    size="sm" 
                    icon={<X size={16} color={status === 'missed' ? theme.colors.destructiveForeground : theme.colors.foreground}/>} 
                    onPress={() => handlePress('missed')}
                    disabled={status !== 'pending' || isLoading}
                />
            </View>
            <TouchableOpacity style={styles.historyLink} disabled={isLoading}>
                <History size={16} color={theme.colors.mutedForeground} />
                <Text style={styles.historyLinkText}>View History</Text>
            </TouchableOpacity>
        </View>
    );
};

const MenstrualTracker = () => {
    const { getToken } = useAuth();
    const [symptomsLogged, setSymptomsLogged] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleLogSymptoms = async () => {
        setIsLoading(true);
        try {
            await logHealthEntry(getToken, {
                entry_type: 'menstrual_cycle',
                status: 'symptoms_logged',
            });
            setSymptomsLogged(true);
        } catch (error) {
            console.error('Failed to log symptoms:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <View style={styles.menstrualTrackerContainer}>
                <View style={styles.cycleStatus}>
                    <Droplets size={24} color={theme.colors.primary} />
                    <Text style={styles.cycleStatusText}>Day 5 of Period</Text>
                </View>
                <View style={styles.cycleProgressBarContainer}>
                    <View style={styles.cycleProgressBar} />
                </View>
                <Text style={styles.cyclePrediction}>Next Period: July 28th</Text>
            </View>
            <Button 
                title={symptomsLogged ? "Symptoms Logged" : "Log Symptoms"}
                variant={symptomsLogged ? "default" : "outline"} 
                icon={symptomsLogged ? <Check size={16} color={theme.colors.primaryForeground} /> : <Pencil size={16} color={theme.colors.accent}/>}
                onPress={handleLogSymptoms}
                disabled={symptomsLogged || isLoading}
            />
        </>
    );
};

type Mood = 'happy' | 'neutral' | 'sad';

const MoodTracker = () => {
    const { getToken } = useAuth();
    const [selectedMood, setSelectedMood] = React.useState<Mood | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);

    const handleSelectMood = async (mood: Mood) => {
        if (selectedMood === mood) {
            return; // Already selected or in process
        }
        setIsLoading(true);
        try {
            await logHealthEntry(getToken, {
                entry_type: 'mood',
                value: mood,
            });
            setSelectedMood(mood);
        } catch (error) {
            console.error('Failed to log mood:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const moods: { name: Mood; icon: React.ReactNode; color: string }[] = [
        { name: 'happy', icon: <Smile size={32} color={selectedMood === 'happy' ? theme.colors.background : theme.colors.success} />, color: theme.colors.success },
        { name: 'neutral', icon: <Meh size={32} color={selectedMood === 'neutral' ? theme.colors.background : theme.colors.mutedForeground} />, color: theme.colors.mutedForeground },
        { name: 'sad', icon: <Frown size={32} color={selectedMood === 'sad' ? theme.colors.background : theme.colors.destructive} />, color: theme.colors.destructive },
    ];

    return (
        <View style={styles.moodTrackerContainer}>
            <Text style={styles.moodQuestion}>How are you feeling today?</Text>
            <View style={styles.moodOptions}>
                {moods.map((mood) => (
                    <TouchableOpacity 
                        key={mood.name}
                        style={[
                            styles.moodOption, 
                            selectedMood === mood.name && { backgroundColor: mood.color }
                        ]}
                        onPress={() => handleSelectMood(mood.name)}
                        disabled={isLoading}
                    >
                        {mood.icon}
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const AIInsights = () => {
    const { getToken } = useAuth();
    const [insight, setInsight] = React.useState<{ title: string; message: string; suggestion: string } | null>(null);
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState<string | null>(null);

    const fetchInsights = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await getHealthInsights(getToken);
            setInsight(data);
        } catch (err) {
            setError('Could not fetch insights at this time.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <View style={styles.aiInsightsContainer}>
            {insight ? (
                <>
                    <Text style={styles.aiInsightsTitle}>{insight.title}</Text>
                    <Text style={styles.aiInsightsText}>{insight.message}</Text>
                    <Text style={styles.aiInsightsSuggestion}>{insight.suggestion}</Text>
                </>
            ) : (
                <>
                    <Sparkles size={24} color={theme.colors.secondary} />
                    <Text style={styles.aiInsightsTitle}>Unlock Deeper Insights</Text>
                    <Text style={styles.aiInsightsText}>Our AI analyzes your tracking data to provide personalized feedback.</Text>
                    <Button title={isLoading ? "Analyzing..." : "View Insights"} onPress={fetchInsights} disabled={isLoading} />
                    {error && <Text style={styles.errorText}>{error}</Text>}
                </>
            )}
        </View>
    );
};

const FeatureCard = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <Card style={styles.card}>
        <CardHeader style={styles.featureCardHeader}>
            <CardTitle style={styles.cardTitle}>{title}</CardTitle>
        </CardHeader>
        <CardContent style={styles.featureCardContent}>
            {children}
        </CardContent>
    </Card>
);

export function HealthBuddyScreen() {
  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Health Buddy</Text>
        <Text style={styles.subHeader}>Your personal space to track and understand your health.</Text>
        
        <FeatureCard title="Pill Tracker">
            <PillTracker />
        </FeatureCard>

        <FeatureCard title="Menstrual Tracker">
            <MenstrualTracker />
        </FeatureCard>
        
        <FeatureCard title="Mood Tracker">
            <MoodTracker />
        </FeatureCard>
        
        <FeatureCard title="AI Insights">
            <AIInsights />
        </FeatureCard>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.background,
    },
    container: {
        paddingHorizontal: theme.spacing.xl,
        paddingBottom: theme.spacing.xl,
        paddingTop: theme.spacing.xl * 1.2,
    },
    header: {
        ...theme.typography.h1,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.secondary,
        marginBottom: theme.spacing.sm,
    },
    subHeader: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        marginBottom: theme.spacing.xl,
    },
    card: {
        marginBottom: theme.spacing.lg,
    },
    cardTitle: {
        color: theme.colors.primary,
    },
    featureCardHeader: {
        paddingHorizontal: theme.spacing.lg,
        paddingTop: theme.spacing.lg,
        paddingBottom: theme.spacing.sm,
    },
    featureCardContent: {
        padding: theme.spacing.lg,
        paddingTop: 0,
    },
    placeholderText: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
    },
    pillTrackerContainer: {
        // Main container for pill info and actions
    },
    pillInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    pillText: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilySemiBold,
        marginLeft: theme.spacing.sm,
        flex: 1, // Take up remaining space
    },
    streak: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.destructiveMuted,
        paddingHorizontal: theme.spacing.sm,
        paddingVertical: theme.spacing.xs,
        borderRadius: theme.radius.full,
    },
    streakTaken: {
        backgroundColor: theme.colors.primary,
    },
    streakText: {
        ...theme.typography.small,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.primary,
        marginLeft: theme.spacing.xs,
    },
    streakTextTaken: {
        color: theme.colors.background,
    },
    pillActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: theme.spacing.md,
    },
    historyLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: theme.spacing.lg,
        paddingTop: theme.spacing.md,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    historyLinkText: {
        ...theme.typography.small,
        color: theme.colors.mutedForeground,
        marginLeft: theme.spacing.xs,
        fontFamily: theme.typography.fontFamilyMedium,
    },
    menstrualTrackerContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.lg,
    },
    cycleStatus: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    cycleStatusText: {
        ...theme.typography.h3,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.primary,
        marginLeft: theme.spacing.sm,
    },
    cycleProgressBarContainer: {
        width: '100%',
        height: 8,
        backgroundColor: theme.colors.muted,
        borderRadius: theme.radius.full,
        overflow: 'hidden',
        marginBottom: theme.spacing.sm,
    },
    cycleProgressBar: {
        width: '25%', // Example progress
        height: '100%',
        backgroundColor: theme.colors.primary,
    },
    cyclePrediction: {
        ...theme.typography.small,
        color: theme.colors.mutedForeground,
        fontFamily: theme.typography.fontFamilyMedium,
        marginBottom: theme.spacing.lg,
    },
    moodTrackerContainer: {
        alignItems: 'center',
    },
    moodQuestion: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        marginBottom: theme.spacing.lg,
    },
    moodOptions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        width: '100%',
    },
    moodOption: {
        padding: theme.spacing.sm,
        borderRadius: theme.radius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    aiInsightsContainer: {
        alignItems: 'center',
        textAlign: 'center',
    },
    aiInsightsTitle: {
        ...theme.typography.h4,
        fontFamily: theme.typography.fontFamilyBold,
        color: theme.colors.secondary,
        marginTop: theme.spacing.sm,
    },
    aiInsightsText: {
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
        textAlign: 'center',
        marginVertical: theme.spacing.md,
    },
    aiInsightsSuggestion: {
        ...theme.typography.small,
        fontFamily: theme.typography.fontFamilyMedium,
        color: theme.colors.foreground,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
        padding: theme.spacing.md,
        backgroundColor: theme.colors.muted,
        borderRadius: theme.radius.md,
    },
    errorText: {
        ...theme.typography.small,
        color: theme.colors.destructive,
        marginTop: theme.spacing.md,
    }
}); 