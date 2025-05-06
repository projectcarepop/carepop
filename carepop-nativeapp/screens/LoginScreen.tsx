import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { Button, TextInput, Card } from '@repo/ui';
// import * as SecureStore from 'expo-secure-store'; // No longer needed here
import { theme } from '@repo/ui/src/theme';
import { useAuth } from '../src/context/AuthContext'; // Import useAuth
import Constants from 'expo-constants'; // Import Constants

// Get base backend URL from app.json extra
const BASE_API_URL = Constants.expoConfig?.extra?.apiUrl;
if (!BASE_API_URL) {
  console.error("ERROR: Missing API URL in app.json extra section!");
  // Handle this case appropriately - maybe show an error message
}

// const AUTH_TOKEN_KEY = 'authToken'; // No longer needed here

interface LoginScreenProps {
  navigateToRegister: () => void;
  navigateToForgotPassword: () => void;
  // Add a prop or context function to update auth state if needed
  // onLoginSuccess: (token: string) => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigateToRegister,
  navigateToForgotPassword,
  // onLoginSuccess, // Example
}) => {
  const { signIn } = useAuth(); // Get signIn from context
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add stricter validation
  const validateForm = () => {
    if (!email || !password) {
      setError('Email and password are required.');
      return false;
    }
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Stricter email validation
        setError('Please enter a valid email address.');
        return false;
    }
    setError(null); // Clear previous error
    return true;
  };

  const handleEmailLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    // Backend call removed
    console.log('[LoginScreen] Attempting login with Email:', email);
    // Simulate a delay and then stop loading
    setTimeout(() => {
      setLoading(false);
      // setError('Login functionality is currently disabled.'); // Optional: inform user
      // Or, if you want to simulate success for UI testing:
      // const fakeToken = 'fake-logged-in-token';
      // await signIn(fakeToken);
    }, 1000);
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    console.log('[LoginScreen] Attempting Google login (UI only)');
    // Simulate a delay and then stop loading
    setTimeout(() => {
      setLoading(false);
      // setError('Google login is currently disabled.'); // Optional: inform user
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
          <Text style={styles.title}>Log In</Text>
          
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
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

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry
            containerStyle={styles.input}
          />

          <TouchableOpacity 
            style={styles.forgotPassword}
            onPress={navigateToForgotPassword}
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Log In"
            variant="primary"
            onPress={handleEmailLogin}
            isLoading={loading}
            style={styles.loginButton}
          />

          <View style={styles.orContainer}>
            <View style={styles.divider} />
            <Text style={styles.orText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <Button
            title="Continue with Google"
            variant="secondary"
            styleType="outline"
            onPress={handleGoogleLogin}
            isLoading={loading}
            style={styles.googleButton}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerText}>Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister}>
              <Text style={styles.registerLink}>Sign Up</Text>
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.md,
  },
  forgotPasswordText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.caption,
  },
  loginButton: {
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
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  registerText: {
    color: theme.colors.text,
    fontSize: theme.typography.caption,
  },
  registerLink: {
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
}); 