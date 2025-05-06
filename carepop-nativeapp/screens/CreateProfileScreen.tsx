import React, { useState } from 'react';
import { View, Text, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { Button, TextInput, Card, theme } from '@repo/ui';
import { supabase } from '@repo/ui/src/utils/supabase'; // Import supabase client directly

interface CreateProfileScreenProps {
  onProfileCreated: () => void; // Callback to signal completion
}

// Function to create profile in Supabase
async function createProfile(userId: string, username: string, fullName: string) {
  try {
    const { error } = await supabase
      .from('profiles') // Ensure this table name is correct
      .insert([
        { id: userId, username: username, full_name: fullName }, // Ensure column names match your table
      ]);

    if (error) {
      console.error("Error creating profile:", error);
      throw error; // Re-throw to be caught by the handler
    }
    return { success: true, error: null };
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error creating profile';
    return { success: false, error: { message } };
  }
}

export const CreateProfileScreen: React.FC<CreateProfileScreenProps> = ({ onProfileCreated }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreateProfile = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both first and last name.');
      return;
    }
    
    setLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user logged in');

      const { error: insertError } = await supabase.from('profiles').insert({
        user_id: user.id,
        first_name: firstName.trim(),
        last_name: lastName.trim(),
      });

      if (insertError) {
        console.error("Error inserting profile:", insertError);
        setError(insertError.message);
      } else {
        console.log("Profile created successfully");
        onProfileCreated();
      }
    } catch (err: any) {
      console.error("Unexpected error creating profile:", err);
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <Text style={styles.headerTitle}>Create Your Profile</Text>
        <Text style={styles.subtitle}>Let's get your basic information set up.</Text>
        
        <Card style={styles.card}>
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Your first name"
            containerStyle={styles.input}
            autoCapitalize="words"
          />

          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Your last name"
            containerStyle={styles.input}
            autoCapitalize="words"
          />

          <Button
            title="Save Profile"
            variant="primary"
            onPress={handleCreateProfile}
            isLoading={loading}
            style={styles.button}
          />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  subtitle: {
    fontSize: theme.typography.body,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
  },
  input: {
    marginBottom: theme.spacing.lg, // Increase spacing
  },
  button: {
    marginTop: theme.spacing.md,
  },
  errorContainer: {
    backgroundColor: theme.colors.destructiveMuted,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.destructiveDark || theme.colors.destructive,
    fontSize: theme.typography.caption,
    textAlign: 'center',
  },
}); 