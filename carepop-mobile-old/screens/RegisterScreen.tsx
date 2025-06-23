import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Image,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Eye, EyeOff, AlertCircle, Mail, Check, Circle } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';

import { useSignUp, useOAuth } from "@clerk/clerk-expo";
import {
  Button,
  Input,
  Checkbox,
  theme,
} from '../src/components';
import type { AuthStackParamList } from '../src/navigation/AppNavigator';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

const GoogleSignInButton: React.FC<{ onPress: () => void; disabled?: boolean }> = ({ onPress, disabled }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.socialButton, disabled && styles.disabledButton]}>
        <AntDesign name="google" size={24} color={theme.colors.secondary} style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>Sign up with Google</Text>
    </TouchableOpacity>
);

const AppleSignInButton: React.FC<{ onPress: () => void; disabled?: boolean }> = ({ onPress, disabled }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.socialButton, styles.appleButton, disabled && styles.disabledButton]}>
        <AntDesign name="apple1" size={24} color={theme.colors.background} style={styles.socialIcon} />
        <Text style={[styles.socialButtonText, styles.appleButtonText]}>Sign up with Apple</Text>
    </TouchableOpacity>
);

const StrengthIndicator: React.FC<{
  label: string;
  isValid: boolean;
}> = ({ label, isValid }) => (
  <View style={styles.strengthItem}>
    {isValid ? <Check size={16} color={theme.colors.success} /> : <Circle size={16} color={theme.colors.mutedForeground} />}
    <Text
      style={[
        styles.strengthText,
        { color: isValid ? theme.colors.success : theme.colors.mutedForeground },
      ]}
    >
      {label}
    </Text>
  </View>
);

const usePasswordStrength = (password: string) => {
  return useMemo(() => {
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password),
    };
    const strength = Object.values(checks).filter(Boolean).length;
    const isStrong = strength === 5;
    return { checks, strength, isStrong };
  }, [password]);
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isOAuthLoading, setIsOAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);

  const { startOAuthFlow: startGoogleOAuthFlow } = useOAuth({ strategy: 'oauth_google' });
  const { startOAuthFlow: startAppleOAuthFlow } = useOAuth({ strategy: 'oauth_apple' });

  const { checks, isStrong } = usePasswordStrength(password);

  // Clear error when user starts typing
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [emailAddress, password, code]);

  const handleRegister = async () => {
    if (!isLoaded || !isStrong || !termsAccepted) return;

    setIsLoading(true);
    setError(null);

    try {
      await signUp.create({
        emailAddress,
        password,
      });

      // start the email verification process
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });

      // setPendingVerification to true to show the verification code input field
      setPendingVerification(true);
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'An error occurred during sign up.');
    } finally {
      setIsLoading(false);
    }
  };

  const onPressVerify = async () => {
    if (!isLoaded) return;
    setIsLoading(true);
    setError(null);
    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });
      await setActive({ session: completeSignUp.createdSessionId });
    } catch (err: any) {
      console.error(JSON.stringify(err, null, 2));
      setError(err.errors?.[0]?.message || 'An error occurred during verification.');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignUpWithProvider = React.useCallback(async (strategy: 'google' | 'apple') => {
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
      setError('An error occurred during social sign up.');
    } finally {
      setIsOAuthLoading(false);
    }
  }, [startGoogleOAuthFlow, startAppleOAuthFlow]);

  const handleOpenLink = (url: string) => Linking.openURL(url).catch(err => console.error("Couldn't load page", err));

  if (pendingVerification) {
    return (
        <View style={styles.confirmationContainer}>
            <Mail size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.description}>
              We&apos;ve sent a verification code to {emailAddress}. Please enter it below.
            </Text>
            <Input
              placeholder="Enter verification code"
              value={code}
              onChangeText={setCode}
              keyboardType="numeric"
              style={{marginTop: theme.spacing.lg}}
            />
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Button title="Verify Email" onPress={onPressVerify} fullWidth size="lg" style={{marginTop: theme.spacing.md}} isLoading={isLoading} />
      </View>
    );
  }

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
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.description}>
              Start your journey with us today.
            </Text>
        </View>

        <View style={styles.formContainer}>
            {error && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={theme.colors.destructive} />
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
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              label="Password"
              editable={!isLoading && !isOAuthLoading}
              onFocus={() => setShowPassword(true)}
              onBlur={() => setShowPassword(false)}
              icon={
                <TouchableOpacity onPress={() => setShowPassword(p => !p)}>
                      {showPassword ? (
                          <EyeOff size={22} color={theme.colors.mutedForeground} />
                      ) : (
                          <Eye size={22} color={theme.colors.mutedForeground} />
                      )}
                </TouchableOpacity>
              }
            />
            </View>
            {password.length > 0 && (
            <View style={styles.strengthContainer}>
              <StrengthIndicator label="At least 8 characters" isValid={checks.length} />
              <StrengthIndicator label="An uppercase letter" isValid={checks.uppercase} />
              <StrengthIndicator label="A lowercase letter" isValid={checks.lowercase} />
              <StrengthIndicator label="A number" isValid={checks.number} />
              <StrengthIndicator label="A special character" isValid={checks.specialChar} />
            </View>
            )}

            <View style={styles.termsContainer}>
              <Checkbox
                checked={termsAccepted}
                onChange={setTermsAccepted}
                disabled={isLoading || isOAuthLoading}
              />
              <Text style={styles.termsText}>
                I agree to the{' '}
                <Text style={styles.linkText} onPress={() => handleOpenLink('https://carepop.com/terms')}>
                  Terms of Service
                </Text>
                {' '}and{' '}
                <Text style={styles.linkText} onPress={() => handleOpenLink('https://carepop.com/privacy')}>
                  Privacy Policy
                </Text>.
              </Text>
            </View>

            <Button
              title="Create Account"
              onPress={handleRegister}
              isLoading={isLoading}
              disabled={isLoading || isOAuthLoading || !isStrong || !termsAccepted}
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
          <GoogleSignInButton onPress={() => handleSignUpWithProvider('google')} disabled={isLoading || isOAuthLoading} />
          <AppleSignInButton onPress={() => handleSignUpWithProvider('apple')} disabled={isLoading || isOAuthLoading} />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={[styles.footerText, styles.linkText]}>
              Log In
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
  confirmationContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.xl,
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
      textAlign: 'center',
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
  strengthContainer: {
    gap: theme.spacing.xs,
  },
  strengthItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  strengthText: {
    ...theme.typography.xsmall,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    
    gap: theme.spacing.sm,
  },
  termsText: {
    ...theme.typography.xsmall,
    color: theme.colors.mutedForeground,
    flexShrink: 1,
    lineHeight: 18,
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
      marginBottom: theme.spacing.lg,
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