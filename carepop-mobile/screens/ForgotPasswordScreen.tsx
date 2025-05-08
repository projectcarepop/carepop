import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Image } from 'react-native';
import { Button, TextInput, Card } from '../src/components';
import { supabase } from '../src/utils/supabase';
import { theme } from '../src/components';
import { MaterialIcons } from '@expo/vector-icons';
import { useAuth } from '../src/context/AuthContext';

/**
 * Props for the ForgotPasswordScreen component.
 */
interface ForgotPasswordScreenProps {
  /** Function to navigate back to the login screen. */
  navigateToLogin: () => void;
}

/**
 * ForgotPasswordScreen component provides UI for users to request a password reset link.
 * It collects the user's email and uses Supabase to send reset instructions.
 */
export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  navigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const { authError, clearAuthError } = useAuth();

  /**
   * Handles the password reset request process.
   * Validates the email, calls Supabase to send a reset email, and manages UI feedback.
   */
  const handleResetPassword = async () => {
    if (authError) clearAuthError();
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);
    console.log('[ForgotPasswordScreen] Attempting password reset for:', email);

    try {
      // TODO: Configure `redirectTo` for a better mobile password reset experience.
      // This URL should be a deep link to a screen in your app (e.g., carepop://reset-password)
      // where the user enters a new password after verifying the token from the email.
      // The app will need to handle this deep link, parse the token, and use supabase.auth.updateUser().
      // Example: const resetRedirectUrl = AuthSession.makeRedirectUri({ scheme: 'carepop', path: 'reset-password' });
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email
        // { redirectTo: resetRedirectUrl } // Pass the configured redirect URL here
      );
      
      if (resetError) {
        console.error('[ForgotPasswordScreen] Supabase reset password error:', resetError.message);
        setError(resetError.message || 'Failed to send reset instructions. Please try again.');
      } else {
        console.log('[ForgotPasswordScreen] Password reset instructions sent successfully.');
        setSuccessMessage('Password reset instructions have been sent to your email. Please check your inbox (and spam folder).');
        setEmail(''); // Clear the form on success
      }
    } catch (err: any) {
      console.error('[ForgotPasswordScreen] Unexpected error during password reset:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Image 
          source={require('../assets/carepop-logo-pink.png')} 
          style={styles.logo} 
          resizeMode="contain"
        />

        <Card style={styles.card}>
          <Text style={styles.title}>Reset Password</Text>
          <Text style={styles.subtitle}>
            Enter your email address, and we&apos;ll send you instructions to reset your password.
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
    alignItems: 'center',
  },
  appName: {
    fontSize: theme.typography.heading,
    fontWeight: 'bold',
    color: theme.colors.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 200,
    height: 100,
    marginBottom: theme.spacing.xl,
  },
  card: {
    padding: theme.spacing.lg,
    width: '100%',
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