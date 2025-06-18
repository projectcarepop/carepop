import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { theme } from '../components';
import { Card, Button } from '../components';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { LineChart, BarChart } from 'react-native-chart-kit';
import type { HealthBuddyStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import type { DrawerNavigationProp } from '@react-navigation/drawer';

type HealthBuddyNavigationProp = NativeStackNavigationProp<HealthBuddyStackParamList, 'HealthBuddy'>;

type Mood = 'Happy' | 'Calm' | 'Okay' | 'Anxious' | 'Sad';

const moodOptions: { name: Mood; icon: keyof typeof Ionicons.glyphMap }[] = [
    { name: 'Happy', icon: 'happy-outline' },
    { name: 'Calm', icon: 'leaf-outline' },
    { name: 'Okay', icon: 'remove-circle-outline' },
    { name: 'Anxious', icon: 'pulse-outline' },
    { name: 'Sad', icon: 'sad-outline' },
];

interface HealthEntry {
    id: number;
    value_text?: string;
    value_numeric?: number;
    value_numeric_secondary?: number;
    notes?: string;
    created_at: string;
}

const moodToValue = (mood: string): number => {
    const mapping: { [key: string]: number } = { 'Happy': 5, 'Calm': 4, 'Okay': 3, 'Anxious': 2, 'Sad': 1 };
    return mapping[mood] || 0;
};

export function HealthBuddyScreen() {
  const navigation = useNavigation<HealthBuddyNavigationProp>();
  const { session } = useAuth();
  const [moodHistory, setMoodHistory] = useState<HealthEntry[]>([]);
  const [bloodPressureHistory, setBloodPressureHistory] = useState<HealthEntry[]>([]);
  const [activityHistory, setActivityHistory] = useState<HealthEntry[]>([]);
  const [isLoadingMood, setIsLoadingMood] = useState(true);
  const [isLoadingBp, setIsLoadingBp] = useState(true);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  const [showBpModal, setShowBpModal] = useState(false);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [isSavingBp, setIsSavingBp] = useState(false);

  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityMinutes, setActivityMinutes] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  const renderSectionHeader = (title: string, iconName: keyof typeof MaterialIcons.glyphMap | keyof typeof Ionicons.glyphMap, iconSet: 'MaterialIcons' | 'Ionicons' = 'MaterialIcons') => (
    <View style={styles.cardTitleContainer}>
      {iconSet === 'MaterialIcons' ? (
        <MaterialIcons name={iconName as any} size={22} color={theme.colors.secondary} style={styles.cardTitleIcon} />
      ) : (
        <Ionicons name={iconName as any} size={22} color={theme.colors.secondary} style={styles.cardTitleIcon} />
      )}
      <Text style={styles.cardTitle}>{title}</Text>
    </View>
  );

  const fetchMoodHistory = useCallback(async () => {
    if (!session) return;
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries?type=MOOD&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch mood history.');
      setMoodHistory(data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoadingMood(false);
    }
  }, [session]);

  const fetchBloodPressureHistory = useCallback(async () => {
    if (!session) return;
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries?type=BLOOD_PRESSURE&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch blood pressure history.');
      setBloodPressureHistory(data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoadingBp(false);
    }
  }, [session]);

  const fetchActivityHistory = useCallback(async () => {
    if (!session) return;
    try {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(endDate.getDate() - 30);

      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries?type=ACTIVITY&startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch activity history.');
      setActivityHistory(data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoadingActivity(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMoodHistory();
    fetchBloodPressureHistory();
    fetchActivityHistory();
  }, [fetchMoodHistory, fetchBloodPressureHistory, fetchActivityHistory]);

  const handleSelectMood = async (mood: Mood) => {
    if (!session) return;
    setSelectedMood(mood);
    
    try {
      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ type: 'MOOD', value_text: mood }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save mood.');
      }
      fetchMoodHistory();
      Alert.alert('Success', `Your mood has been logged as "${mood}".`);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSaveBloodPressure = async () => {
    if (!session || !systolic || !diastolic) return;
    setIsSavingBp(true);
    try {
      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          type: 'BLOOD_PRESSURE',
          value_numeric: parseInt(systolic, 10),
          value_numeric_secondary: parseInt(diastolic, 10)
        }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      Alert.alert('Success', 'Blood pressure logged successfully!');
      setShowBpModal(false);
      setSystolic('');
      setDiastolic('');
      fetchBloodPressureHistory();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSavingBp(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!session || !activityMinutes) return;
    setIsSavingActivity(true);
    try {
      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          type: 'ACTIVITY',
          value_numeric: parseInt(activityMinutes, 10),
        }),
      });
      if (!response.ok) throw new Error((await response.json()).message);
      Alert.alert('Success', 'Activity logged successfully!');
      setShowActivityModal(false);
      setActivityMinutes('');
      fetchActivityHistory();
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSavingActivity(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <TouchableOpacity onPress={() => (navigation.getParent<DrawerNavigationProp<DrawerParamList>>())?.toggleDrawer()} style={styles.menuButton}>
        <Ionicons name="menu" size={32} color={theme.colors.foreground} />
      </TouchableOpacity>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Health Buddy</Text>
        <Text style={styles.screenSubtitle}>Trackers and insights to support your well-being.</Text>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <View style={styles.moodSelector}>
            {moodOptions.map(({ name, icon }) => (
              <TouchableOpacity 
                key={name} 
                style={[styles.moodButton, selectedMood === name && styles.moodButtonSelected]} 
                onPress={() => handleSelectMood(name)}
              >
                <Ionicons name={icon} size={32} color={selectedMood === name ? theme.colors.primary : theme.colors.mutedForeground} />
                <Text style={[styles.moodText, selectedMood === name && styles.moodTextSelected]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        <Card style={styles.card}>
          <Text style={styles.cardTitle}>Your Mood Over Time</Text>
          {isLoadingMood ? <ActivityIndicator color={theme.colors.primary} /> : moodHistory.length > 1 ? (
            <LineChart
                data={{
                    labels: moodHistory.map(e => new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).reverse(),
                    datasets: [{ data: moodHistory.map(e => moodToValue(e.value_text || '')).reverse() }]
                }}
                width={Dimensions.get('window').width - 60}
                height={220}
                chartConfig={{
                    backgroundColor: theme.colors.card,
                    backgroundGradientFrom: theme.colors.card,
                    backgroundGradientTo: theme.colors.card,
                    decimalPlaces: 0,
                    color: (opacity = 1) => `rgba(134, 65, 244, ${opacity})`, // Example color
                    labelColor: (opacity = 1) => theme.colors.mutedForeground,
                    style: {
                        borderRadius: 16
                    },
                    propsForDots: {
                        r: "6",
                        strokeWidth: "2",
                        stroke: theme.colors.primary
                    }
                }}
                bezier
                style={{
                    marginVertical: 8,
                    borderRadius: 16
                }}
            />
          ) : <Text style={styles.emptyChartText}>Log your mood for a few days to see a chart.</Text>}
        </Card>
        
        <Card style={styles.card}>
            <View style={{...styles.cardTitleContainer, justifyContent: 'space-between'}}>
                {renderSectionHeader('Blood Pressure', 'blood-pressure-alt', 'MaterialIcons')}
                <Button title="Log BP" size="sm" variant="outline" onPress={() => setShowBpModal(true)} />
            </View>
            {isLoadingBp ? <ActivityIndicator color={theme.colors.primary} /> : bloodPressureHistory.length > 1 ? (
                <LineChart
                    data={{
                        labels: bloodPressureHistory.map(e => new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).reverse(),
                        datasets: [
                            { data: bloodPressureHistory.map(e => e.value_numeric || 0).reverse(), color: (opacity = 1) => `rgba(255, 0, 0, ${opacity})`, strokeWidth: 2 }, // Systolic - red
                            { data: bloodPressureHistory.map(e => e.value_numeric_secondary || 0).reverse(), color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, strokeWidth: 2 } // Diastolic - blue
                        ],
                        legend: ["Systolic", "Diastolic"]
                    }}
                    width={Dimensions.get('window').width - 60}
                    height={220}
                    chartConfig={{
                      backgroundColor: theme.colors.card,
                      backgroundGradientFrom: theme.colors.card,
                      backgroundGradientTo: theme.colors.card,
                      decimalPlaces: 0,
                      color: (opacity = 1) => theme.colors.primary,
                      labelColor: (opacity = 1) => theme.colors.mutedForeground,
                    }}
                    style={{ marginVertical: 8, borderRadius: 16 }}
                />
            ) : <Text style={styles.emptyChartText}>Log your blood pressure to see your trend.</Text>}
        </Card>

        <Card style={styles.card}>
            <View style={{...styles.cardTitleContainer, justifyContent: 'space-between'}}>
                {renderSectionHeader('Physical Activity', 'fitness-outline', 'Ionicons')}
                <Button title="Log Activity" size="sm" variant="outline" onPress={() => setShowActivityModal(true)} />
            </View>
            {isLoadingActivity ? <ActivityIndicator color={theme.colors.primary} /> : activityHistory.length > 1 ? (
                <BarChart
                    data={{
                        labels: activityHistory.map(e => new Date(e.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })).reverse(),
                        datasets: [{ data: activityHistory.map(e => e.value_numeric || 0).reverse() }]
                    }}
                    width={Dimensions.get('window').width - 60}
                    height={220}
                    yAxisSuffix=" min"
                    chartConfig={{
                      backgroundColor: theme.colors.card,
                      backgroundGradientFrom: theme.colors.card,
                      backgroundGradientTo: theme.colors.card,
                      decimalPlaces: 0,
                      color: (opacity = 1) => theme.colors.primary,
                      labelColor: (opacity = 1) => theme.colors.mutedForeground,
                    }}
                    style={{ marginVertical: 8, borderRadius: 16 }}
                />
            ) : <Text style={styles.emptyChartText}>Log your activity to see your progress.</Text>}
        </Card>

        <Card style={styles.card}>
            {renderSectionHeader('Pill & Menstrual Trackers', 'medical-bag', 'MaterialIcons')}
            <View style={styles.trackersContainer}>
                <TouchableOpacity style={styles.trackerButton} onPress={() => navigation.navigate('PillTracker')}>
                    <Ionicons name="medkit-outline" size={24} color={theme.colors.primary} />
                    <Text style={styles.trackerText}>Pill Tracker</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.trackerButton} onPress={() => navigation.navigate('MensTracker')}>
                    <Ionicons name="female-outline" size={24} color={theme.colors.primary} />
                    <Text style={styles.trackerText}>Menstrual Cycle</Text>
                </TouchableOpacity>
            </View>
        </Card>
        
        {/* Modals */}
        <Modal
            animationType="slide"
            transparent={true}
            visible={showBpModal}
            onRequestClose={() => setShowBpModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Log Blood Pressure</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Systolic (e.g., 120)"
                        value={systolic}
                        onChangeText={setSystolic}
                        keyboardType="number-pad"
                        placeholderTextColor={theme.colors.mutedForeground}
                    />
                    <TextInput
                        style={styles.input}
                        placeholder="Diastolic (e.g., 80)"
                        value={diastolic}
                        onChangeText={setDiastolic}
                        keyboardType="number-pad"
                        placeholderTextColor={theme.colors.mutedForeground}
                    />
                    <View style={styles.modalButtonContainer}>
                        <Button title="Cancel" variant="ghost" onPress={() => setShowBpModal(false)} />
                        <Button title={isSavingBp ? "Saving..." : "Save"} onPress={handleSaveBloodPressure} disabled={isSavingBp} />
                    </View>
                </View>
            </View>
        </Modal>

        <Modal
            animationType="slide"
            transparent={true}
            visible={showActivityModal}
            onRequestClose={() => setShowActivityModal(false)}
        >
            <View style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Log Physical Activity</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Minutes of activity"
                        value={activityMinutes}
                        onChangeText={setActivityMinutes}
                        keyboardType="number-pad"
                        placeholderTextColor={theme.colors.mutedForeground}
                    />
                    <View style={styles.modalButtonContainer}>
                        <Button title="Cancel" variant="ghost" onPress={() => setShowActivityModal(false)} />
                        <Button title={isSavingActivity ? "Saving..." : "Save"} onPress={handleSaveActivity} disabled={isSavingActivity} />
                    </View>
                </View>
            </View>
        </Modal>

      </ScrollView>
    </SafeAreaView>
  );
}


// --- STYLES ---

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    menuButton: {
        position: 'absolute',
        top: theme.spacing.lg,
        left: theme.spacing.lg,
        zIndex: 10,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.md,
        padding: theme.spacing.xs,
    },
    container: {
        padding: theme.spacing.md,
        paddingBottom: theme.spacing.xl,
        paddingTop: 60,
    },
    screenTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.foreground,
        fontFamily: theme.typography.fontFamilyBold,
    },
    screenSubtitle: {
        fontSize: 16,
        color: theme.colors.mutedForeground,
        marginBottom: theme.spacing.lg,
        fontFamily: theme.typography.fontFamily,
    },
    card: {
        marginBottom: theme.spacing.lg,
        padding: theme.spacing.md,
    },
    cardTitleContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    cardTitleIcon: {
        marginRight: theme.spacing.sm,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: theme.colors.foreground,
        fontFamily: theme.typography.fontFamilyBold,
    },
    moodSelector: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.spacing.md,
    },
    moodButton: {
        alignItems: 'center',
        padding: theme.spacing.sm,
        borderRadius: theme.radius.lg,
        borderWidth: 1,
        borderColor: 'transparent',
        width: 68,
    },
    moodButtonSelected: {
        backgroundColor: theme.colors.accent,
        borderColor: theme.colors.primary,
    },
    moodText: {
        marginTop: theme.spacing.xs,
        fontSize: 12,
        color: theme.colors.mutedForeground,
        fontFamily: theme.typography.fontFamily,
    },
    moodTextSelected: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamilyMedium,
    },
    emptyChartText: {
        textAlign: 'center',
        marginVertical: 20,
        color: theme.colors.mutedForeground,
        fontFamily: theme.typography.fontFamily,
    },
    trackersContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginTop: theme.spacing.md,
    },
    trackerButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.secondary,
        paddingVertical: theme.spacing.sm,
        paddingHorizontal: theme.spacing.md,
        borderRadius: theme.radius.lg,
    },
    trackerText: {
        marginLeft: theme.spacing.sm,
        color: theme.colors.secondaryForeground,
        fontWeight: 'bold',
        fontFamily: theme.typography.fontFamilyMedium,
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalContent: {
        width: '85%',
        backgroundColor: theme.colors.card,
        borderRadius: theme.radius.xl,
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: theme.colors.foreground,
        marginBottom: theme.spacing.lg,
    },
    input: {
        width: '100%',
        height: 50,
        backgroundColor: theme.colors.input,
        borderRadius: theme.radius.md,
        paddingHorizontal: theme.spacing.md,
        fontSize: 16,
        color: theme.colors.foreground,
        marginBottom: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
        marginTop: theme.spacing.md,
    },
}); 