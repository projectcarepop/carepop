import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Button, TextInput, Card } from '@repo/ui';
import { resetPassword } from '@repo/ui/src/utils/supabase';
import { theme } from '@repo/ui/src/theme';

interface ForgotPasswordScreenProps {
  navigateToLogin: () => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    console.log('[ForgotPasswordScreen] Attempting password reset for:', email);

    // Backend call removed
    // try {
    //   const { error: resetError } = await resetPassword(email);
      
    //   if (resetError) {
    //     setError(resetError.message);
    //     return;
    //   }

    //   setSuccessMessage('Password reset instructions have been sent to your email');
    //   setEmail(''); // Clear the form
    // } catch (err) {
    //   setError('An unexpected error occurred. Please try again.');
    //   console.error(err);
    // } finally {
    //   setLoading(false);
    // }

    // Simulate a delay and then stop loading
    setTimeout(() => {
      setLoading(false);
      // Simulate success for UI testing:
      setSuccessMessage('Password reset instructions have been sent to your email (UI only).');
      // setEmail(''); // Optional: clear the form
      // setError('Password reset is currently disabled.'); // Optional: inform user
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.appName}>CarePoP</Text>

        <Card style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address, and we'll send you instructions to reset your password.
          </Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {successMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>{successMessage}</Text>
            </View>
          )}

          <TextInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.input}
          />

          <Button
            title="Reset Password"
            variant="primary"
            onPress={handleResetPassword}
            isLoading={loading}
            style={styles.resetButton}
          />

          <TouchableOpacity 
            style={styles.backToLoginContainer}
            onPress={navigateToLogin}
          >
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
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
  appName: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.text,
  },
  subtitle: {
    fontSize: theme.typography.caption,
    color: theme.colors.textMuted,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  resetButton: {
    marginBottom: theme.spacing.lg,
  },
  backToLoginContainer: {
    alignItems: 'center',
  },
  backToLoginText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.button,
    fontWeight: 'bold',
  },
  errorContainer: {
    backgroundColor: '#FFEBEE',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  errorText: {
    color: theme.colors.destructive,
    fontSize: theme.typography.caption,
  },
  successContainer: {
    backgroundColor: '#E8F5E9',
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.sm,
    marginBottom: theme.spacing.md,
  },
  successText: {
    color: theme.colors.success,
    fontSize: theme.typography.caption,
  },
}); 