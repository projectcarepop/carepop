import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Linking, Image } from 'react-native';
import { Button, TextInput, Card, Checkbox } from '../src/components';
import { theme } from '../src/components';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants'; // Import Constants
import * as WebBrowser from 'expo-web-browser'; // For Google Sign-Up
import * as AuthSession from 'expo-auth-session'; // For Google Sign-Up
import { useAuth } from '../src/context/AuthContext'; // Import useAuth
import { supabase } from '../src/utils/supabase'; // Re-import for Google Sign Up

// Get backend URL from app.json extra - Currently not used in this screen.
// const BASE_API_URL = Constants.expoConfig?.extra?.apiUrl;
// if (!BASE_API_URL) {
//   console.error("ERROR: Missing API URL in app.json extra section!");
// }

/**
 * Props for the RegisterScreen component.
 */
interface RegisterScreenProps {
  /** Function to navigate to the login screen. */
  navigateToLogin: () => void;
}

/**
 * RegisterScreen component provides UI for new user registration via email/password and Google OAuth.
 * It handles form input, validation, terms acceptance, and communication with Supabase for account creation.
 */
export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  navigateToLogin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null); // For form validation errors
  const [showConfirmationMessage, setShowConfirmationMessage] = useState(false);

  const { signUpWithEmail, isLoading, authError, clearAuthError } = useAuth(); // Access global auth state and supabase client

  // Effect to clear local errors if global authError changes (e.g., after a successful operation followed by a new one)
  useEffect(() => {
    if (authError) {
      setLocalError(null); // Clear local form errors if a global auth error is set
    }
  }, [authError]);

  /**
   * Validates the registration form inputs.
   * Checks for required fields, email format, password match, password length, and terms acceptance.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = (isGoogleSignUp: boolean = false): boolean => {
    setShowConfirmationMessage(false);
    if (authError) clearAuthError(); // Clear global auth error on new validation attempt
    setLocalError(null); // Clear local form error

    if (!isGoogleSignUp) {
      if (!email || !password || !confirmPassword) {
        setLocalError('Please fill out all required fields.');
        return false;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        setLocalError('Please enter a valid email address.');
        return false;
      }
      if (password !== confirmPassword) {
        setLocalError('Passwords do not match.');
        return false;
      }
      if (password.length < 6) {
        setLocalError('Password must be at least 6 characters long.');
        return false;
      }
    }

    if (!termsAccepted) {
      setLocalError('You must accept the Terms of Service and Privacy Policy to create an account.');
      return false;
    }
    return true;
  };

  /**
   * Handles the email and password sign-up process.
   * Validates input, calls Supabase signUp, and manages loading/error/confirmation states.
   */
  const handleEmailSignUp = async () => {
    console.log('[RegisterScreen] handleEmailSignUp called');
    if (!validateForm()) {
      console.log('[RegisterScreen] Email sign-up validation failed');
      return;
    }
    console.log('[RegisterScreen] Email sign-up validation passed');

    const { error: signUpErrorResponse, user } = await signUpWithEmail({
      email: email,
      password: password,
      options: {
        data: {},
      },
    });

    if (signUpErrorResponse) {
      console.error('[RegisterScreen] SignUp via context failed:', signUpErrorResponse.message);
    } else if (user) {
      console.log('[RegisterScreen] SignUp via context successful for user:', user.id);
      setShowConfirmationMessage(true);
    }
  };

  /**
   * Handles the Google OAuth sign-up process.
   * Validates terms acceptance, then uses Supabase signInWithOAuth and WebBrowser.
   */
  const handleGoogleSignUp = async () => {
    console.log('[RegisterScreen] handleGoogleSignUp called');
    if (!validateForm(true)) {
      console.log('[RegisterScreen] Google sign-up validation (terms) failed');
      return;
    }
    console.log('[RegisterScreen] Google sign-up validation (terms) passed');

    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'carepop',
      });
      console.log('[RegisterScreen] Using custom scheme Redirect URI for Google OAuth:', redirectUri);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
          // For Google Sign Up, Supabase automatically attempts to get name from Google profile
          // If first_name/last_name are needed for the initial profile stub via trigger,
          // it would depend on what data Supabase makes available to the trigger from an OAuth signup.
          // No explicit data field here as it's not supported directly like in email signup.
        },
      });

      console.log('[RegisterScreen] supabase.auth.signInWithOAuth response:', { dataUrl: data?.url, oauthErrorMessage: oauthError?.message || null });

      if (oauthError) {
        console.error('[RegisterScreen] Google sign-up initiation error from Supabase:', oauthError.message);
        setLocalError(oauthError.message || 'Failed to initiate Google Sign-Up with Supabase.');
        return;
      }

      if (data?.url) {
        console.log('[RegisterScreen] Google sign-up initiated. Opening auth session with URL:', data.url);
        const authSessionResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        console.log('[RegisterScreen] WebBrowser.openAuthSessionAsync result (Google Sign-Up):', authSessionResult);

        if (authSessionResult.type === 'success') {
          console.log('[RegisterScreen] Google Sign-Up via WebBrowser success. URL:', authSessionResult.url);
          setShowConfirmationMessage(true);
        } else if (authSessionResult.type === 'cancel' || authSessionResult.type === 'dismiss') {
          console.log('[RegisterScreen] User cancelled or dismissed Google Sign-Up session via WebBrowser.');
          setLocalError('Google Sign-Up was cancelled by the user.');
        } else {
          console.log('[RegisterScreen] WebBrowser.openAuthSessionAsync (Google Sign-Up) returned type:', authSessionResult.type, 'with details:', authSessionResult);
          setLocalError('Google Sign-Up did not complete as expected. Please try again.');
        }
      } else {
        console.error('[RegisterScreen] Google sign-up initiated but no URL returned from Supabase.');
        setLocalError('Failed to get the Google Sign-Up URL from Supabase.');
      }
    } catch (catchError: any) {
      console.error('[RegisterScreen] Unexpected error during Google sign-up process:', catchError);
      setLocalError(catchError.message || 'An unexpected error occurred during Google sign-up.');
    }
  };

  /**
   * Opens a URL in the system browser, e.g., for Terms of Service or Privacy Policy.
   * @param {string} url - The URL to open.
   */
  const handleOpenLink = async (url: string) => {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert(`Don't know how to open this URL: ${url}`);
      }
    } catch (error) {
      console.error('Failed to open link:', error);
      Alert.alert('Error', 'Could not open the link.');
    }
  };

  // TODO: Replace placeholders with the actual base URL of the deployed web app
  const termsUrl = 'YOUR_WEB_APP_BASE_URL/terms-of-service.md';
  const privacyUrl = 'YOUR_WEB_APP_BASE_URL/privacy-policy.md';
  // const textInputIconColor = theme.colors.secondary; // No longer needed as icons are removed

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
          <Text style={styles.title}>Create Account</Text>
          
          {showConfirmationMessage && (
            <View style={styles.successContainer}>
              <Text style={styles.successText}>
                Registration successful! Please check your email ({email}) to confirm your account.
              </Text>
            </View>
          )}

          {(authError && !showConfirmationMessage) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{authError.message}</Text>
            </View>
          )}
          {(localError && !authError && !showConfirmationMessage) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{localError}</Text>
            </View>
          )}

          <TextInput
            label="Email Address"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            containerStyle={styles.input}
            editable={!isLoading}
            placeholderTextColor={theme.colors.textMuted}
          />
          <TextInput
            label="Password"
            placeholder="Create a password (min. 6 characters)"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            containerStyle={styles.input}
            editable={!isLoading}
            placeholderTextColor={theme.colors.textMuted}
          />
          <TextInput
            label="Confirm Password"
            placeholder="Confirm your password"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            containerStyle={styles.input}
            editable={!isLoading}
            placeholderTextColor={theme.colors.textMuted}
          />

          <View style={styles.termsContainer}>
            <Checkbox
              checked={termsAccepted}
              onChange={setTermsAccepted}
              disabled={isLoading}
            />
            <View style={styles.termsTextContainer}>
              <Text style={styles.termsText}>I agree to the </Text>
              <TouchableOpacity onPress={() => handleOpenLink(termsUrl)} disabled={isLoading}>
                <Text style={styles.linkText}>Terms of Service</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}> and </Text>
              <TouchableOpacity onPress={() => handleOpenLink(privacyUrl)} disabled={isLoading}>
                <Text style={styles.linkText}>Privacy Policy</Text>
              </TouchableOpacity>
              <Text style={styles.termsText}>.</Text>
            </View>
          </View>

          <Button
            title="Create Account"
            variant="primary"
            onPress={handleEmailSignUp}
            style={styles.createAccountButton}
            isLoading={isLoading}
            disabled={isLoading}
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
            style={styles.googleButton}
            isLoading={isLoading}
            disabled={isLoading}
            icon={<Ionicons name="logo-google" size={20} color={theme.colors.secondary} />}
          />

          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginPromptText}>Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={isLoading}>
              <Text style={styles.linkText}>Login</Text>
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
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  termsTextContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    flex: 1,
    marginLeft: theme.spacing.sm,
  },
  termsText: {
    fontSize: theme.typography.caption,
    color: theme.colors.secondary,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
    fontSize: theme.typography.caption,
    textDecorationLine: 'underline',
  },
  createAccountButton: {
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
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  loginPromptText: {
    color: theme.colors.secondary,
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