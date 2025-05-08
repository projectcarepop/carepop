import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { Button, TextInput, Card, theme } from '../src/components';
// import * as SecureStore from 'expo-secure-store'; // No longer needed here
import { useAuth } from '../src/context/AuthContext'; // Import useAuth to access authError and clearAuthError
import { supabase } from '../src/utils/supabase'; // Import supabase client
// import Constants from 'expo-constants'; // Import Constants - Removed as BASE_API_URL is commented out
import * as WebBrowser from 'expo-web-browser'; // Import expo-web-browser
import * as AuthSession from 'expo-auth-session'; // Import AuthSession
import { Ionicons } from '@expo/vector-icons'; // Ensure Ionicons is imported
// import * as AuthSession from 'expo-auth-session'; // Removed as it was only for the temporary log

// Get base backend URL from app.json extra
// const BASE_API_URL = Constants.expoConfig?.extra?.apiUrl;
// if (!BASE_API_URL) {
//   console.error("ERROR: Missing API URL in app.json extra section!");
// }

// const AUTH_TOKEN_KEY = 'authToken'; // No longer needed here

/**
 * Props for the LoginScreen component.
 */
interface LoginScreenProps {
  /** Function to navigate to the registration screen. */
  navigateToRegister: () => void;
  /** Function to navigate to the forgot password screen. */
  navigateToForgotPassword: () => void;
  // Add a prop or context function to update auth state if needed
  // onLoginSuccess: (token: string) => void;
}

/**
 * LoginScreen component provides UI for user authentication via email/password and Google OAuth.
 * It handles form input, validation, and communication with Supabase for authentication.
 */
export const LoginScreen: React.FC<LoginScreenProps> = ({
  navigateToRegister,
  navigateToForgotPassword,
  // onLoginSuccess, // Example
}) => {
  // Removed the temporary useEffect hook for logging

  const { authError, clearAuthError } = useAuth(); // Access error state from AuthContext
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility

  /**
   * Validates the login form inputs (email and password).
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    if (!email || !password) {
      setError('Email and password are required.');
      return false;
    }
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Stricter email validation
        setError('Please enter a valid email address.');
        return false;
    }
    setError(null); // Clear previous error
    if (authError) clearAuthError(); // Clear global auth error if starting a new attempt
    return true;
  };

  /**
   * Handles the email and password login process.
   * Validates input, calls Supabase signInWithPassword, and manages loading/error states.
   */
  const handleEmailLogin = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (signInError) {
        console.error('[LoginScreen] Supabase sign-in error:', signInError.message);
        setError(signInError.message || 'Failed to log in. Please check your credentials.');
      } else {
        console.log('[LoginScreen] Supabase sign-in successful. AuthContext will handle navigation.');
        // Navigation will be handled by onAuthStateChange in AuthContext
      }
    } catch (catchError: any) {
      console.error('[LoginScreen] Unexpected error during sign-in:', catchError);
      setError(catchError.message || 'An unexpected error occurred. Please try again.');
    }
    setLoading(false);
  };

  /**
   * Handles the Google OAuth login process.
   * Uses Supabase signInWithOAuth and WebBrowser to open the Google authentication flow.
   * Relies on a custom URL scheme ('carepop') for redirecting back to the app.
   */
  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    if (authError) clearAuthError(); 
    console.log('[LoginScreen] Attempting Google login (using custom scheme)...');

    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'carepop', // Defined in app.json's expo.scheme
        // path: 'auth/callback' // Optional: if your callback handling requires a specific path
      });
      console.log('[LoginScreen] Using custom scheme Redirect URI for Google OAuth:', redirectUri);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          //queryParams: { access_type: 'offline', prompt: 'consent' }, // Optional: if needed for refresh tokens or specific Google behavior
        },
      });

      console.log('[LoginScreen] supabase.auth.signInWithOAuth response:', { dataUrl: data?.url, oauthErrorMessage: oauthError?.message || null });

      if (oauthError) {
        console.error('[LoginScreen] Google sign-in initiation error from Supabase:', oauthError.message);
        setError(oauthError.message || 'Failed to initiate Google Sign-In with Supabase.');
        setLoading(false);
        return;
      }

      if (data?.url) {
        console.log('[LoginScreen] Google sign-in initiated. Opening auth session with URL:', data.url);
        // WebBrowser.openAuthSessionAsync opens the Google sign-in page.
        // After successful authentication with Google, Google redirects to the Supabase callback URL.
        // Supabase then processes this and redirects back to the `redirectUri` (our custom scheme `carepop://`).
        // The Expo app, listening for this custom scheme, will receive the URL containing session info in the fragment (#access_token=...).
        // The Supabase client (configured with a Linking adapter or similar) automatically handles this incoming URL
        // to establish the session. The onAuthStateChange logic within the AuthContext will then process this new session.
        const authSessionResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        console.log('[LoginScreen] WebBrowser.openAuthSessionAsync result (custom scheme flow):', authSessionResult);

        if (authSessionResult.type === 'success') {
          console.log('[LoginScreen] WebBrowser.openAuthSessionAsync success. URL:', authSessionResult.url);
          // At this point, the app should have received the redirect via the custom scheme.
          // The Supabase client is expected to handle the URL fragment and establish the session.
          // No explicit token handling is needed here. AuthContext will reflect the new state.
          // setLoading will be managed by AuthContext's isLoading once the session is processed or if an error occurs during that phase.
        } else if (authSessionResult.type === 'cancel' || authSessionResult.type === 'dismiss') {
          console.log('[LoginScreen] User cancelled or dismissed Google Sign-In session via WebBrowser.');
          setError('Google Sign-In was cancelled by the user.');
          setLoading(false); 
        } else {
          // This case includes authSessionResult.type === 'error' or any other unexpected type.
          console.log('[LoginScreen] WebBrowser.openAuthSessionAsync returned type:', authSessionResult.type, 'with details (if any):', authSessionResult);
          setError('Google Sign-In did not complete as expected. Please try again.');
          setLoading(false); 
        }
      } else {
        console.error('[LoginScreen] Google sign-in initiated but no URL returned from Supabase.');
        setError('Failed to get the Google Sign-In URL from Supabase.');
        setLoading(false);
      }
      // setLoading(false) is intentionally not set here for the success path of openAuthSessionAsync,
      // as the AuthContext's isLoading state will take over once the deep link is processed and session established (or fails to establish).
      // For explicit cancel/error from WebBrowser, setLoading(false) is called above.
    } catch (catchError: any) {
      console.error('[LoginScreen] Unexpected error during Google sign-in process (custom scheme):', catchError);
      let errorMessage = 'An unexpected error occurred during Google sign-in.';
      if (catchError.message) {
        errorMessage += ` Details: ${catchError.message}`;
      }
      setError(errorMessage);
      setLoading(false); // Ensure loading is reset on unexpected errors
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
        />

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
            editable={!loading}
            placeholderTextColor={theme.colors.textMuted}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
            containerStyle={styles.input}
            editable={!loading}
            placeholderTextColor={theme.colors.textMuted}
            trailingIcon={
              <Ionicons 
                name={isPasswordVisible ? 'eye-off-outline' : 'eye-outline'} 
                size={24} 
                color={theme.colors.textMuted} 
              />
            }
            onPressTrailingIcon={() => setIsPasswordVisible(!isPasswordVisible)}
          />

          <TouchableOpacity 
            style={styles.forgotPasswordContainer}
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
            disabled={loading}
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
            disabled={loading}
            icon={<Ionicons name="logo-google" size={20} color={theme.colors.secondary} />}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerPromptText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
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
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  logo: {
    width: 200,
    height: 100,
    resizeMode: 'contain',
    marginBottom: theme.spacing.xl,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
    color: theme.colors.secondary,
  },
  input: {
    marginBottom: theme.spacing.md,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: theme.spacing.sm,
  },
  forgotPasswordText: {
    color: theme.colors.primary,
    fontSize: theme.typography.caption,
    fontWeight: 'normal',
  },
  loginButton: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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
    color: theme.colors.secondary,
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
  registerPromptText: {
    color: theme.colors.secondary,
    fontSize: theme.typography.caption,
  },
  registerText: {
    color: theme.colors.secondary,
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