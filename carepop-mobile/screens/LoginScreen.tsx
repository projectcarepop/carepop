import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, Alert, Image } from 'react-native';
import { Button, TextInput, Card, theme } from '../src/components';
import { useAuth } from '../src/context/AuthContext';
import { supabase } from '../src/utils/supabase';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../src/navigation/AppNavigator'; // Corrected path

/**
 * Props for the LoginScreen component.
 * No longer needs navigation props.
 */
interface LoginScreenProps {
  // navigateToRegister: () => void; // Removed
  // navigateToForgotPassword: () => void; // Removed
}

// Define navigation prop type
type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login' // This screen's name in the stack
>;

/**
 * LoginScreen component provides UI for user authentication via email/password and Google OAuth.
 * It interacts with AuthContext for authentication operations and state management.
 */
export const LoginScreen: React.FC<LoginScreenProps> = () => {
  // Removed props: { navigateToRegister, navigateToForgotPassword }
  const navigation = useNavigation<LoginScreenNavigationProp>(); // Get navigation object

  // Use AuthContext for auth operations, global loading, and error state
  const { signInWithPassword, isLoading: isAuthLoading, authError, clearAuthError } = useAuth();

  // Local state for form inputs and local validation errors
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null); // For form validation errors
  const [localLoading, setLocalLoading] = useState(false); // For controlling local UI elements like button disable
  const [isPasswordVisible, setIsPasswordVisible] = useState(false); // State for password visibility

  // Effect to clear local error when global auth error changes (or is cleared)
  useEffect(() => {
    if (authError) {
      setLocalError(null); // Let the global error display
    } 
  }, [authError]);

  /**
   * Validates the login form inputs (email and password).
   * Sets local error state if validation fails.
   * @returns {boolean} True if the form is valid, false otherwise.
   */
  const validateForm = (): boolean => {
    if (authError) clearAuthError(); // Clear previous global auth error on new attempt
    setLocalError(null); // Clear previous local error
    
    if (!email || !password) {
      setLocalError('Email and password are required.');
      return false;
    }
     if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { // Stricter email validation
        setLocalError('Please enter a valid email address.');
        return false;
    }
    return true;
  };

  /**
   * Handles the email and password login process.
   * Validates input, calls signInWithPassword from AuthContext, and manages local loading state.
   * Relies on AuthContext to handle global loading, errors, and navigation on success.
   */
  const handleEmailLogin = async () => {
    if (!validateForm()) {
      return;
    }
    setLocalLoading(true);
    // clearAuthError() was called in validateForm
    // setLocalError(null) was called in validateForm

    // console.log('[LoginScreen] Calling signInWithPassword from AuthContext...');
    await signInWithPassword({ email, password });
    // AuthContext will set its isLoading state during the async operation.
    // AuthContext will set its authError state if the operation fails.
    // AuthContext's onAuthStateChange listener will handle navigation on success.
    setLocalLoading(false); // Reset local loading once the async call is initiated/returned
                          // AuthContext.isLoading will reflect the true auth operation status.
  };

  /**
   * Handles the Google OAuth login process.
   * Uses Supabase client from AuthContext for signInWithOAuth.
   * Relies on AuthContext for state updates and error handling post-redirect.
   */
  const handleGoogleLogin = async () => {
    setLocalLoading(true);
    setLocalError(null);
    if (authError) clearAuthError(); 
    // console.log('[LoginScreen] Attempting Google login (using custom scheme)...');

    // Need Supabase client instance for OAuth call
    if (!supabase) {
        setLocalError("Authentication service is not available.");
        setLocalLoading(false);
        return;
    }

    try {
      const redirectUri = AuthSession.makeRedirectUri({
        scheme: 'carepop', // Ensure this matches app.json
      });
      // console.log('[LoginScreen] Using custom scheme Redirect URI for Google OAuth:', redirectUri);

      const { data, error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUri,
        },
      });

      // console.log('[LoginScreen] supabase.auth.signInWithOAuth response:', { dataUrl: data?.url, oauthErrorMessage: oauthError?.message || null });

      if (oauthError) {
        console.error('[LoginScreen] Google sign-in initiation error from Supabase:', oauthError.message);
        // Let AuthContext handle setting the error, just update local state
        setLocalError(oauthError.message || 'Failed to initiate Google Sign-In.'); 
        setLocalLoading(false);
        return;
      }

      if (data?.url) {
        // console.log('[LoginScreen] Google sign-in initiated. Opening auth session with URL:', data.url);
        const authSessionResult = await WebBrowser.openAuthSessionAsync(data.url, redirectUri);
        // console.log('[LoginScreen] WebBrowser.openAuthSessionAsync result (custom scheme flow):', authSessionResult);

        if (authSessionResult.type === 'success') {
          // console.log('[LoginScreen] WebBrowser.openAuthSessionAsync success. URL:', authSessionResult.url);
          // Session will be handled by Supabase client and AuthContext's onAuthStateChange.
          // isAuthLoading from context will manage the loading state during this phase.
        } else if (authSessionResult.type === 'cancel' || authSessionResult.type === 'dismiss') {
          // console.log('[LoginScreen] User cancelled or dismissed Google Sign-In session via WebBrowser.');
          setLocalError('Google Sign-In was cancelled.');
          setLocalLoading(false); 
        } else {
          // console.log('[LoginScreen] WebBrowser.openAuthSessionAsync returned type:', authSessionResult.type);
          setLocalError('Google Sign-In failed or was interrupted.');
          setLocalLoading(false); 
        }
      } else {
        console.error('[LoginScreen] Google sign-in initiated but no URL returned from Supabase.');
        setLocalError('Could not get the Google Sign-In URL.');
        setLocalLoading(false);
      }
    } catch (catchError: any) {
      console.error('[LoginScreen] Unexpected error during Google sign-in process (custom scheme):', catchError);
      setLocalError(catchError.message || 'An unexpected error occurred during Google sign-in.');
      setLocalLoading(false);
    } finally {
      // Ensure local loading is false if not handled by specific paths above
      // However, for the success path, we rely on isAuthLoading from context.
      // This might need refinement depending on desired UX.
      if (localLoading && !isAuthLoading) { // Only set if locally loading but context isn't
         // setLocalLoading(false); // Re-evaluating if this finally block is best place
      }
    }
  };

  // Combine local loading state with global auth loading state for disabling UI
  const combinedLoading = localLoading || isAuthLoading;

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
          
          {/* Display local validation error OR global auth error */}         
          {(localError || authError) && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{localError || authError?.message || 'An error occurred'}</Text>
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
            editable={!combinedLoading} // Use combined loading state
            placeholderTextColor={theme.colors.textMuted}
          />

          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            placeholder="Enter your password"
            secureTextEntry={!isPasswordVisible}
            containerStyle={styles.input}
            editable={!combinedLoading} // Use combined loading state
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
            onPress={() => navigation.navigate('ForgotPassword')}
            disabled={combinedLoading} // Use combined loading state
          >
            <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
          </TouchableOpacity>

          <Button
            title="Log In"
            variant="primary"
            onPress={handleEmailLogin}
            isLoading={combinedLoading} // Use combined loading state
            style={styles.loginButton}
            disabled={combinedLoading} // Use combined loading state
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
            isLoading={combinedLoading} // Use combined loading state
            style={styles.googleButton}
            disabled={combinedLoading} // Use combined loading state
            icon={<Ionicons name="logo-google" size={20} color={theme.colors.secondary} />}
          />

          <View style={styles.registerContainer}>
            <Text style={styles.registerPromptText}>Don&apos;t have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={combinedLoading}>
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