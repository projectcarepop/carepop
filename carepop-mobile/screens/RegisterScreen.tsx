import React, { useState, useMemo } from 'react';
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

import { useAuth } from '../src/context/AuthContext';
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
  const { signUpWithEmail, signInWithGoogle, isLoading, authError } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isPasswordFocused, setIsPasswordFocused] = useState(false);

  const { checks, isStrong } = usePasswordStrength(password);

  const handleRegister = async () => {
    if (!isStrong || !termsAccepted) return;
    const { user } = await signUpWithEmail({ email, password });
    if (user) setShowConfirmation(true);
  };
  
  const handleGoogleSignIn = async () => {
    await signInWithGoogle();
  };

  const handleOpenLink = (url: string) => Linking.openURL(url).catch(err => console.error("Couldn't load page", err));

  if (showConfirmation) {
    return (
        <View style={styles.confirmationContainer}>
            <Mail size={48} color={theme.colors.primary} />
            <Text style={styles.title}>Check your email</Text>
            <Text style={styles.description}>
              We&apos;ve sent a confirmation link to {email}. Please click the link to activate your account.
            </Text>
            <Button title="Back to Login" onPress={() => navigation.navigate('Login')} fullWidth size="lg" style={{marginTop: theme.spacing.xl}} />
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
            {authError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={theme.colors.destructive} />
                <Text style={styles.errorText}>{authError.message}</Text>
              </View>
            )}

            <Input
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              label="Email"
              editable={!isLoading}
              icon={<Mail size={20} color={theme.colors.mutedForeground} />}
            />
            <View>
            <Input
              placeholder="Create a strong password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!isPasswordVisible}
              label="Password"
              editable={!isLoading}
                  onFocus={() => setIsPasswordFocused(true)}
                  onBlur={() => setIsPasswordFocused(false)}
              icon={
                <TouchableOpacity onPress={() => setIsPasswordVisible(p => !p)}>
                      {isPasswordVisible ? (
                          <EyeOff size={22} color={theme.colors.mutedForeground} />
                      ) : (
                          <Eye size={22} color={theme.colors.mutedForeground} />
                      )}
                </TouchableOpacity>
              }
            />
            </View>
            {isPasswordFocused && (
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
                disabled={isLoading}
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
              disabled={isLoading || !isStrong || !termsAccepted}
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
          <GoogleSignInButton onPress={handleGoogleSignIn} disabled={isLoading} />
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
  socialIcon: {
      marginRight: theme.spacing.md,
  },
  socialButtonText: {
      ...theme.typography.body,
      fontWeight: 'bold',
      color: theme.colors.secondary,
  },
  disabledButton: {
      opacity: 0.6,
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