import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useSignIn, useOAuth } from "@clerk/clerk-expo";
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';

import {
  Button,
  Input,
  theme,
} from '../src/components';
import type { AuthStackParamList } from '../src/navigation/AppNavigator';

const GoogleSignInButton: React.FC<{ onPress: () => void; disabled?: boolean }> = ({ onPress, disabled }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.socialButton, disabled && styles.disabledButton]}>
        <AntDesign name="google" size={24} color={theme.colors.secondary} style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>Sign in with Google</Text>
    </TouchableOpacity>
);

const AppleSignInButton: React.FC<{ onPress: () => void; disabled?: boolean }> = ({ onPress, disabled }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.socialButton, styles.appleButton, disabled && styles.disabledButton]}>
        <AntDesign name="apple1" size={24} color={theme.colors.background} style={styles.socialIcon} />
        <Text style={[styles.socialButtonText, styles.appleButtonText]}>Sign in with Apple</Text>
    </TouchableOpacity>
);

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signIn, setActive, isLoaded } = useSignIn();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [emailAddress, password]);

  const onSignInPress = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const completeSignIn = await signIn.create({
        identifier: emailAddress,
        password,
      });
      await setActive({ session: completeSignIn.createdSessionId });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'An error occurred during login.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignInWithProvider = React.useCallback(async (strategy: 'google' | 'apple') => {
    const oauthFlow = strategy === 'google' ? startGoogleOAuthFlow : startAppleOAuthFlow;
    setIsOAuthLoading(true);
    try {
      const { createdSessionId, setActive } = await oauthFlow();

      if (createdSessionId) {
        setActive?.({ session: createdSessionId });
      } else {
        // Use signIn or signUp for next steps such as MFA
      }
    } catch (err) {
      console.error('OAuth error', err);
      setError('An error occurred during social login.');
    } finally {
      setIsOAuthLoading(false);
    }
  }, [startGoogleOAuthFlow, startAppleOAuthFlow]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
        <Image
          source={require('../assets/carepop-logo-pink.png')}
          style={styles.logo}
        />
            <Text style={styles.title}>Welcome Back</Text>
            <Text style={styles.description}>
              Enter your credentials to access your account.
            </Text>
        </View>

        <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle
                  size={20}
                  color={theme.colors.destructive}
                />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            <Input
              placeholder="you@example.com"
              value={emailAddress}
              onChangeText={setEmailAddress}
              keyboardType="email-address"
              autoCapitalize="none"
              label="Email"
              editable={!isLoading && !isOAuthLoading}
              icon={<Mail size={20} color={theme.colors.mutedForeground} />}
            />
            <View>
            <Input
              placeholder="Enter your password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              label="Password"
              editable={!isLoading && !isOAuthLoading}
              icon={
                <TouchableOpacity
                  onPress={() => setShowPassword((prev) => !prev)}
                >
                      {showPassword ? (
                        <EyeOff size={22} color={theme.colors.mutedForeground} />
                       ) : (
                        <Eye size={22} color={theme.colors.mutedForeground} />
                       )}
                </TouchableOpacity>
              }
            />
                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
            </View>

            <Button
              title="Log In"
              onPress={onSignInPress}
              isLoading={isLoading}
              disabled={isLoading || isOAuthLoading}
              size="lg"
              fullWidth
            />
        </View>
          
        <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
        </View>

        <View style={styles.socialLoginContainer}>
          <GoogleSignInButton onPress={() => handleSignInWithProvider('google')} disabled={isLoading || isOAuthLoading} />
          <AppleSignInButton onPress={() => handleSignInWithProvider('apple')} disabled={isLoading || isOAuthLoading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={[styles.footerText, styles.linkText]}>
              Sign Up
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 32,
    paddingVertical: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: theme.spacing.lg,
  },
  title: {
      ...theme.typography.h2,
      fontFamily: theme.typography.poppinsFontFamilyBold,
      fontWeight: 'bold',
      color: theme.colors.secondary,
      marginBottom: theme.spacing.sm,
  },
  description: {
      ...theme.typography.body,
      color: theme.colors.secondary,
      textAlign: 'center',
      maxWidth: '80%',
  },
  formContainer: {
    gap: theme.spacing.lg,
    width: '100%',
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.destructiveMuted,
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
    gap: theme.spacing.sm,
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    flexShrink: 1,
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginTop: theme.spacing.sm,
  },
  forgotPasswordText: {
    ...theme.typography.small,
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    width: '100%',
  },
  divider: {
      flex: 1,
      height: 1,
      backgroundColor: theme.colors.border,
  },
  dividerText: {
      marginHorizontal: theme.spacing.md,
      color: theme.colors.mutedForeground,
      ...theme.typography.small,
  },
  socialLoginContainer: {
      width: '100%',
      gap: theme.spacing.md,
  },
  socialButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: theme.spacing.md,
      backgroundColor: theme.colors.background,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: theme.radius.md,
      width: '100%',
  },
  appleButton: {
    backgroundColor: '#000000',
    borderColor: '#000000',
  },
  socialIcon: {
      marginRight: theme.spacing.md,
  },
  socialButtonText: {
      ...theme.typography.body,
      fontWeight: 'bold',
      color: theme.colors.secondary,
  },
  appleButtonText: {
    color: '#FFFFFF',
  },
  disabledButton: {
      opacity: 0.5,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
});