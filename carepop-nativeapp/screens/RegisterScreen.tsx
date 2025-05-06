import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Linking } from 'react-native';
import { Button, TextInput, Card, Checkbox } from '@repo/ui';
import { signInWithGoogle } from '@repo/ui/src/utils/supabase';
import { registerUser } from '@repo/ui/src/utils/apiClient';
import { theme } from '@repo/ui/src/theme';
import Constants from 'expo-constants'; // Import Constants

// Get backend URL from app.json extra
const BASE_API_URL = Constants.expoConfig?.extra?.apiUrl; // Should be like http://10.0.2.2:8080
if (!BASE_API_URL) {
  console.error("ERROR: Missing API URL in app.json extra section!");
  // Handle this case appropriately - maybe show an error message
}

interface RegisterScreenProps {
  navigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const validateForm = () => {
    setShowConfirmationMessage(false);
    if (!email || !password || !confirmPassword || !firstName || !lastName ) {
      setError('Please fill out all required fields.');
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setError('Please enter a valid email address.');
        return false;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return false;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return false;
    }

    if (!termsAccepted) {
      setError('You must accept the Terms of Service and Privacy Policy.');
      return false;
    }
    setError(null);
    return true;
  };

  const handleEmailSignUp = async () => {
    console.log('[RegisterScreen] handleEmailSignUp called');
    if (!validateForm()) {
      console.log('[RegisterScreen] Validation failed');
      return;
    }
    console.log('[RegisterScreen] Validation passed');

    setLoading(true);
    setError(null);
    setShowConfirmationMessage(false);

    // Backend call removed
    console.log('[RegisterScreen] Attempting email sign up for:', email);
    // Simulate a delay and then stop loading
    setTimeout(() => {
      setLoading(false);
      // Simulate success for UI testing:
      setShowConfirmationMessage(true); 
      // setError('Email sign up is currently disabled.'); // Optional: inform user of disabled state
    }, 1000);
  };

  const handleGoogleSignUp = async () => {
    if (!termsAccepted) {
      setError('You must accept the terms and conditions');
      return;
    }

    setLoading(true);
    setError(null);
    console.log('[RegisterScreen] Attempting Google sign up (UI only)');
    // Simulate a delay and then stop loading
    setTimeout(() => {
      setLoading(false);
      // setError('Google sign up is currently disabled.'); // Optional: inform user
      // Or simulate success:
      // setShowConfirmationMessage(true); // If Google sign up also shows this message
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
          <Text style={styles.title}>Create Account</Text>
          
          {showConfirmationMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Registration successful! Please check your email ({email}) to confirm your account.
              </Text>
            </View>
          )}

          {error && !showConfirmationMessage && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TextInput
            label="Email *"
            value={email}
            onChangeText={setEmail}
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.input}
          />

          <TextInput
            label="First Name"
            value={firstName}
            onChangeText={setFirstName}
            placeholder="Your first name"
            containerStyle={styles.input}
          />

          <TextInput
            label="Last Name"
            value={lastName}
            onChangeText={setLastName}
            placeholder="Your last name"
            containerStyle={styles.input}
          />

          <TextInput
            label="Password *"
            value={password}
            onChangeText={setPassword}
            placeholder="Create a password"
            secureTextEntry
            containerStyle={styles.input}
          />

          <TextInput
            label="Confirm Password *"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            placeholder="Confirm your password"
            secureTextEntry
            containerStyle={styles.input}
          />

          <View style={styles.termsContainer}>
            <Checkbox
              checked={termsAccepted}
              onChange={setTermsAccepted}
              label="I accept the Terms of Service and Privacy Policy"
            />
          </View>

          <Button
            title="Create Account"
            variant="primary"
            onPress={handleEmailSignUp}
            isLoading={loading}
            style={styles.registerButton}
          />

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Sign Up with Google"
            variant="secondary"
            styleType="outline"
            onPress={handleGoogleSignUp}
            isLoading={loading}
            style={styles.googleButton}
          />

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin}>
              <Text style={styles.loginLink}>Log In</Text>
            </TouchableOpacity>
          </View>
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
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.text,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  termsContainer: {
    marginBottom: theme.spacing.md,
  },
  registerButton: {
    marginBottom: theme.spacing.md,
  },
  orContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  orText: {
    color: theme.colors.textMuted,
    marginHorizontal: theme.spacing.sm,
    fontSize: theme.typography.caption,
  },
  googleButton: {
    marginBottom: theme.spacing.lg,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
  },
  loginLink: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.typography.caption,
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
    color: '#2E7D32',
    fontSize: theme.typography.caption,
  },
}); 