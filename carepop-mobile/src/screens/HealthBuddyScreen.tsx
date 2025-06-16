import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, FlatList, TouchableOpacity, Alert, ActivityIndicator, TextInput, Modal } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import useNavigation
import type { NavigationProp } from '@react-navigation/native';
import { theme } from '../components';
import { Card, Button } from '../components'; // Import Card and Button if needed
import { MaterialIcons, Ionicons } from '@expo/vector-icons'; // Added Ionicons for more icon choices
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';

// Define param list for navigation type safety (if possible)
// Consider creating a dedicated HealthBuddyStackParamList if not already done
type HealthBuddyNavigationProp = NavigationProp<{
  PillTrackerScreen: undefined; // Assuming this is the screen name
  MensTrackerScreen: undefined; // Assuming this is the screen name
  LogBloodPressureScreen: undefined; // Assuming this is the screen name
  // Add routes for Comorbidities and Allergies if screens exist
}>;

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
    notes?: string;
    created_at: string;
}

export function HealthBuddyScreen() { // Remove navigation prop if using hook
  const navigation = useNavigation<HealthBuddyNavigationProp>(); // Use the hook
  const { session } = useAuth();
  const [moodHistory, setMoodHistory] = useState<HealthEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMood, setSelectedMood] = useState<Mood | null>(null);

  // State for Blood Pressure
  const [showBpModal, setShowBpModal] = useState(false);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [isSavingBp, setIsSavingBp] = useState(false);

  // State for Activity
  const [showActivityModal, setShowActivityModal] = useState(false);
  const [activityMinutes, setActivityMinutes] = useState('');
  const [isSavingActivity, setIsSavingActivity] = useState(false);

  // TODO: Add state and logic for tracking data

  // Helper function to create a section with icon and title
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

  // --- Data Fetching ---

  const fetchMoodHistory = useCallback(async () => {
    if (!session) return;
    try {
      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries?type=MOOD`, {
        headers: { 'Authorization': `Bearer ${session.access_token}` },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Failed to fetch mood history.');
      setMoodHistory(data.data || []);
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchMoodHistory();
  }, [fetchMoodHistory]);

  // --- Event Handlers ---

  const handleSelectMood = async (mood: Mood) => {
    if (!session) return;
    setSelectedMood(mood); // Visually select the mood
    
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
      // Refresh history after successful submission
      fetchMoodHistory();
      Alert.alert('Success', `Your mood has been logged as "${mood}".`);

    } catch (error: any) {
      Alert.alert('Error', error.message);
    }
  };

  const handleSaveBloodPressure = async () => {
    if (!session) {
      Alert.alert('Authentication Error', 'You must be logged in to save data.');
      return;
    }
    if (!systolic || !diastolic) {
      Alert.alert('Incomplete', 'Please enter both systolic and diastolic values.');
      return;
    }
    setIsSavingBp(true);
    try {
      const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
      const response = await fetch(`${backendUrl}/api/v1/public/health-entries`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
        body: JSON.stringify({
          type: 'BLOOD_PRESSURE',
          value_numeric: parseInt(systolic, 10),
          notes: `Diastolic: ${diastolic}` // Storing diastolic in notes for now
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save blood pressure.');
      }
      Alert.alert('Success', 'Blood pressure logged successfully!');
      setShowBpModal(false);
      setSystolic('');
      setDiastolic('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSavingBp(false);
    }
  };

  const handleSaveActivity = async () => {
    if (!session) {
      Alert.alert('Authentication Error', 'You must be logged in to save data.');
      return;
    }
    if (!activityMinutes) {
      Alert.alert('Incomplete', 'Please enter the duration of your activity.');
      return;
    }
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
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to save activity.');
      }
      Alert.alert('Success', 'Activity logged successfully!');
      setShowActivityModal(false);
      setActivityMinutes('');
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSavingActivity(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.screenTitle}>Health Buddy</Text>
        <Text style={styles.screenSubtitle}>Trackers and insights to support your well-being.</Text>

        {/* Mood Check-in Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How are you feeling today?</Text>
          <View style={styles.moodSelector}>
            {moodOptions.map(({ name, icon }) => (
              <TouchableOpacity 
                key={name} 
                style={[styles.moodButton, selectedMood === name && styles.moodButtonSelected]} 
                onPress={() => handleSelectMood(name)}
              >
                <Ionicons name={icon} size={32} color={selectedMood === name ? theme.colors.primary : theme.colors.textMuted} />
                <Text style={[styles.moodText, selectedMood === name && styles.moodTextSelected]}>{name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Mood History Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Week in Moods</Text>
          {isLoading ? (
            <ActivityIndicator color={theme.colors.primary} />
          ) : moodHistory.length > 0 ? (
            <View style={styles.chartPlaceholder}>
              <Ionicons name="stats-chart-outline" size={48} color={theme.colors.border} />
              <Text style={styles.placeholderText}>Mood chart coming soon!</Text>
              <Text style={styles.placeholderSubText}>Last entry: {moodHistory[0].value_text} on {new Date(moodHistory[0].created_at).toLocaleDateString()}</Text>
            </View>
          ) : (
            <View style={styles.chartPlaceholder}>
              <Ionicons name="happy-outline" size={48} color={theme.colors.border} />
              <Text style={styles.placeholderText}>No mood history yet.</Text>
              <Text style={styles.placeholderSubText}>Log your mood above to get started!</Text>
            </View>
          )}
        </View>

        {/* Pill Tracker Section - Updated onPress */}
        <Card style={styles.card}>
          {renderSectionHeader("Pill Tracker", "medical-services")}
          <Text style={styles.cardContent}>Stay on top of your medication schedule. Log doses and set reminders.</Text>
          <Button 
            title="Manage Pill Tracker"
            variant="secondary"
            styleType="solid"
            onPress={() => navigation.navigate('PillTrackerScreen')} // Navigate to PillTrackerScreen
            style={styles.cardButton}
            icon={<MaterialIcons name="arrow-forward" size={16} color={theme.colors.background} />}
          />
        </Card>

        {/* Menstrual Tracker Section - Updated onPress */}
        <Card style={styles.card}>
          {renderSectionHeader("Menstrual Cycle", "female", "Ionicons")}
          <Text style={styles.cardContent}>Track your cycle, log symptoms, and view predictions.</Text> 
          {/* Removed hardcoded date */}
          <Button 
            title="Manage Menstrual Tracker"
            variant="secondary"
            styleType="solid"
            onPress={() => navigation.navigate('MensTrackerScreen')} // Navigate to MensTrackerScreen
            style={styles.cardButton}
            icon={<MaterialIcons name="arrow-forward" size={16} color={theme.colors.background} />}
          />
        </Card>

        {/* ADDED Comorbidities Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Comorbidities", "list-alt", "MaterialIcons")}
          <Text style={styles.cardContent}>Log and manage any existing health conditions.</Text>
          {/* TODO: Add onPress navigation when screen exists */}
          <Button 
            title="Log Comorbidities"
            variant="secondary"
            styleType="outline"
            onPress={() => { Alert.alert('Coming Soon', 'Ability to log comorbidities is under development.'); }}
            style={styles.cardButton}
            icon={<Ionicons name="add-circle-outline" size={16} color={theme.colors.secondary} />}
          />
        </Card>

        {/* ADDED Allergies Section */}
        <Card style={styles.card}>
          {renderSectionHeader("Allergies", "warning-amber", "MaterialIcons")}
          <Text style={styles.cardContent}>Keep track of your known allergies.</Text>
          {/* TODO: Add onPress navigation when screen exists */}
          <Button 
            title="Log Allergies"
            variant="secondary"
            styleType="outline"
            onPress={() => { Alert.alert('Coming Soon', 'Ability to log allergies is under development.'); }}
            style={styles.cardButton}
            icon={<Ionicons name="add-circle-outline" size={16} color={theme.colors.secondary} />}
          />
        </Card>

        {/* Blood Pressure Tracker Section - Updated onPress */}
        <Card style={styles.card}>
          {renderSectionHeader("Blood Pressure", "favorite-border")}
          <Text style={styles.cardContent}>Monitor your blood pressure regularly.</Text>
          <Text style={styles.cardSubtitle}>Keep a log of your BP readings.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowBpModal(true)}>
            <Ionicons name="add-outline" size={20} color={theme.colors.card} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Log Today's Reading</Text>
          </TouchableOpacity>
        </Card>

        {/* --- NEW: Activity Card --- */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="walk-outline" size={24} color={theme.colors.secondary} style={styles.cardIcon} />
            <Text style={styles.cardTitle}>Daily Activity</Text>
          </View>
          <Text style={styles.cardSubtitle}>Log your physical activity for the day.</Text>
          <TouchableOpacity style={styles.primaryButton} onPress={() => setShowActivityModal(true)}>
            <Ionicons name="add-outline" size={20} color={theme.colors.card} style={styles.buttonIcon} />
            <Text style={styles.primaryButtonText}>Log Activity</Text>
          </TouchableOpacity>
        </View>

        {/* Health Insights Section - Kept as is */}
        <Card style={styles.card}>
          {renderSectionHeader("Health Insights", "lightbulb-outline")}
          {/* Placeholder insights */}
          <View style={styles.insightItem}>
            <Ionicons name="checkmark-circle-outline" size={18} color={theme.colors.success} style={styles.insightIcon} />
            <Text style={styles.insightText}>Placeholder health insight 1.</Text>
          </View>
          <View style={styles.insightItem}>
            <Ionicons name="alert-circle-outline" size={18} color={theme.colors.warning} style={styles.insightIcon} />
            <Text style={styles.insightText}>Placeholder health insight 2.</Text>
          </View>
           <View style={styles.insightItem}>
            <Ionicons name="information-circle-outline" size={18} color={theme.colors.primary} style={styles.insightIcon} />
            <Text style={styles.insightText}>Placeholder health insight 3.</Text>
          </View>
        </Card>

      </ScrollView>

      {/* --- NEW: Blood Pressure Modal --- */}
      <Modal
        transparent={true}
        visible={showBpModal}
        animationType="fade"
        onRequestClose={() => setShowBpModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Blood Pressure</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Systolic (SYS)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 120"
                keyboardType="number-pad"
                value={systolic}
                onChangeText={setSystolic}
              />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Diastolic (DIA)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 80"
                keyboardType="number-pad"
                value={diastolic}
                onChangeText={setDiastolic}
              />
            </View>
            <TouchableOpacity style={[styles.primaryButton, isSavingBp && { backgroundColor: theme.colors.disabled }]} onPress={handleSaveBloodPressure} disabled={isSavingBp}>
              {isSavingBp ? <ActivityIndicator color={theme.colors.card} /> : <Text style={styles.primaryButtonText}>Save Reading</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowBpModal(false)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- NEW: Activity Modal --- */}
      <Modal
        transparent={true}
        visible={showActivityModal}
        animationType="fade"
        onRequestClose={() => setShowActivityModal(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Log Daily Activity</Text>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Activity Duration (in minutes)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., 30"
                keyboardType="number-pad"
                value={activityMinutes}
                onChangeText={setActivityMinutes}
              />
            </View>
            <TouchableOpacity style={[styles.primaryButton, isSavingActivity && { backgroundColor: theme.colors.disabled }]} onPress={handleSaveActivity} disabled={isSavingActivity}>
              {isSavingActivity ? <ActivityIndicator color={theme.colors.card} /> : <Text style={styles.primaryButtonText}>Save Activity</Text>}
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryButton} onPress={() => setShowActivityModal(false)}>
              <Text style={styles.secondaryButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  container: {
    flexGrow: 1, // Use flexGrow for ScrollView content
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    paddingBottom: theme.spacing.xl, 
  },
  screenTitle: { // Similar to welcomeText in Dashboard
    fontSize: theme.typography.subheading + 2, 
    fontWeight: '600', 
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
    paddingHorizontal: theme.spacing.sm, // Consistent with Dashboard's welcomeText
  },
  screenSubtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.sm,
  },
  card: {
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.md, 
    borderRadius: theme.borderRadius.lg, 
  },
  cardTitleContainer: { 
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitleIcon: { 
    marginRight: theme.spacing.sm,
  },
  cardTitle: { // Consistent with Dashboard
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.secondary, 
  },
  cardContent: { // Consistent with Dashboard
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
    lineHeight: theme.typography.body * 1.4, // Improved readability
  },
  cardContentMuted: { // Consistent with Dashboard
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  cardButton: { // Consistent with Dashboard
    marginTop: theme.spacing.sm, 
    alignSelf: 'flex-start', 
  },
  statsContainer: { // From Dashboard
    flexDirection: 'row',
    justifyContent: 'space-around', // Or 'flex-start' if preferred with spacing
    marginBottom: theme.spacing.md, // Space before contentMuted or next element
  },
  statItem: { // From Dashboard
    alignItems: 'center',
    paddingHorizontal: theme.spacing.sm, // Add some padding between items
  },
  statValue: { // From Dashboard
    fontSize: theme.typography.heading - 2, 
    fontWeight: 'bold',
    color: theme.colors.primary, // Or theme.colors.secondary for variation
  },
  statLabel: { // From Dashboard
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  insightItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  insightIcon: {
    marginRight: theme.spacing.sm,
  },
  insightText: {
    fontSize: theme.typography.body,
    color: theme.colors.text,
    flexShrink: 1, // Allow text to wrap
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-start',
  },
  moodButton: {
    alignItems: 'center',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    width: 70, // Fixed width for alignment
  },
  moodButtonSelected: {
    backgroundColor: theme.colors.primaryMuted,
  },
  moodText: {
    fontSize: 12,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  moodTextSelected: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  chartPlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.md,
  },
  placeholderText: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.md,
    fontWeight: '500',
  },
  placeholderSubText: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginTop: theme.spacing.xs,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: '100%',
  },
  primaryButtonText: {
    color: theme.colors.card,
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: theme.spacing.sm,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    width: '100%',
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: theme.colors.primary,
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonIcon: {
    marginRight: theme.spacing.sm,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.lg,
    width: '90%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.lg,
  },
  inputGroup: {
    width: '100%',
    marginBottom: theme.spacing.md,
  },
  inputLabel: {
    fontSize: 14,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.xs,
  },
  input: {
    backgroundColor: theme.colors.background,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    padding: theme.spacing.md,
    fontSize: 16,
    width: '100%',
  },
  cardSubtitle: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    marginBottom: theme.spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardIcon: {
    marginRight: theme.spacing.sm,
  },
}); 