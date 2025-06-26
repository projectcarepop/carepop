import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, TouchableOpacity } from 'react-native';
import { useQuery, useMutation } from '@tanstack/react-query';
import { theme, Button } from '../components';
import { useAuth } from '../context/AuthContext';
import { getAiInsight } from '../services/api'; // Use our new service
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BrainCircuit } from 'lucide-react-native';

export default function HealthBuddyScreen() {
  const { session } = useAuth();
  const navigation = useNavigation();

  // The mutation to trigger the AI insight generation
  const { 
    mutate: fetchInsight, 
    data: insightData, 
    isPending: isFetchingInsight, 
    isError, 
    error 
  } = useMutation({
    mutationFn: getAiInsight,
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
        <Text style={styles.title}>Health Buddy AI</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <BrainCircuit size={28} color={theme.colors.primary} />
            <Text style={styles.cardTitle}>Your Personal Health Insight</Text>
          </View>
          <Text style={styles.cardDescription}>
            Based on your recent health logs, our AI has generated a personalized insight to help you on your wellness journey.
          </Text>

          {isFetchingInsight && (
            <ActivityIndicator style={{ marginVertical: 20 }} size="large" color={theme.colors.primary} />
          )}

          {isError && (
            <Text style={styles.errorText}>
              Error fetching insight: {error.message}
            </Text>
          )}

          {insightData && (
            <View style={styles.insightResult}>
              <Text style={styles.insightText}>{insightData.insight}</Text>
            </View>
          )}

          <Button
            title={isFetchingInsight ? 'Generating...' : 'Generate New Insight'}
            onPress={() => fetchInsight()}
            disabled={isFetchingInsight || !session}
            style={{ marginTop: 20 }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  backButton: {
    marginRight: theme.spacing.md,
  },
  title: {
    ...theme.typography.h3,
    fontFamily: theme.typography.fontFamilyBold,
  },
  content: {
    padding: theme.spacing.lg,
  },
  card: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  cardTitle: {
    ...theme.typography.h4,
    fontFamily: theme.typography.fontFamilySemiBold,
    marginLeft: theme.spacing.md,
  },
  cardDescription: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
    marginBottom: theme.spacing.lg,
  },
  insightResult: {
    marginTop: theme.spacing.lg,
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
  },
  insightText: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamily,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
    marginTop: 20,
  }
}); 