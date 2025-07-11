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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, Mail, Check, Circle } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

import { signUpWithEmail } from '../services/api';
import { registerSchema, type RegisterFormValues } from '../lib/validation/auth';
import { handleAuthError, logAuthError } from '../lib/auth-errors';
import {
  Button,
  Input,
  Checkbox,
  theme,
} from '../components';
import type { AuthStackParamList } from '../navigation/AuthNavigator';
import { supabase } from '../utils/supabase';

type RegisterScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Register'
>;

const GoogleSignInButton: React.FC<{ onPress: () => void; disabled?: boolean }> = ({ onPress, disabled }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.socialButton, disabled && styles.disabledButton]}>
        <AntDesign name="google" size={24} color={theme.colors.foreground} style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>Sign up with Google</Text>
    </TouchableOpacity>
);

const StrengthIndicator: React.FC<{
  strength: 'weak' | 'medium' | 'strong' | '';
}> = ({ strength }) => {
    const getStrengthColor = () => {
        if (strength === 'strong') return theme.colors.success;
        if (strength === 'medium') return theme.colors.accent;
        if (strength === 'weak') return theme.colors.destructive;
        return theme.colors.mutedForeground;
    }

    const strengthText = strength ? `${strength.charAt(0).toUpperCase() + strength.slice(1)} password` : '';

    return (
        <View style={styles.strengthContainer}>
            <View style={[styles.strengthBar, { width: `${strength === 'strong' ? 100 : strength === 'medium' ? 66 : 33}%`, backgroundColor: getStrengthColor() }]}/>
            <Text style={[styles.strengthText, { color: getStrengthColor() }]}>{strengthText}</Text>
        </View>
    )
};

const usePasswordStrength = (password: string) => {
  return useMemo(() => {
    if (!password) return { checks: {}, strengthScore: 0, strength: '' as const };
    const checks = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      specialChar: /[^A-Za-z0-9]/.test(password),
    };
    const strengthScore = Object.values(checks).filter(Boolean).length;
    let strength: 'weak' | 'medium' | 'strong' | '' = '';
    if (strengthScore <= 2) strength = 'weak';
    else if (strengthScore <= 4) strength = 'medium';
    else if (strengthScore === 5) strength = 'strong';
    return { checks, strengthScore, strength };
  }, [password]);
};

export const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<RegisterScreenNavigationProp>();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  
  const { control, handleSubmit, watch, formState: { errors } } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: '', password: '', termsAccepted: false },
  });

  const password = watch('password');
  const { strength } = usePasswordStrength(password);

  const { mutate: handleRegister, isPending: isRegistering } = useMutation({
    mutationFn: (data: RegisterFormValues) => signUpWithEmail(data),
    onSuccess: () => {
      Alert.alert('Check your email!', 'We sent you a confirmation link to complete your registration.');
      navigation.navigate('Login');
    },
    onError: (error) => {
      logAuthError(error, 'email_registration');
      const errorInfo = handleAuthError(error);
      Alert.alert('Registration Error', errorInfo.userMessage);
    },
  });
  
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    setIsSigningInWithGoogle(true);
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'io.supabase.carepop://auth/callback',
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
            client_id: Platform.OS === 'ios' 
              ? process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_IOS
              : process.env.EXPO_PUBLIC_GOOGLE_OAUTH_CLIENT_ID_ANDROID,
          },
        },
      });

      if (error) throw error;

      if (data.url) {
        const result = await WebBrowser.openAuthSessionAsync(data.url, null);
        if (result.type === 'success') {
          // The auth listener in AuthContext will handle navigation once the session is established
        }
      }
    } catch (error: any) {
      logAuthError(error, 'google_oauth_registration');
      const errorInfo = handleAuthError(error);
      Alert.alert('Google Sign-In Error', errorInfo.userMessage);
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };
  
  const isSubmitting = isRegistering || isSigningInWithGoogle;

  const handleOpenLink = (url: string) => Linking.openURL(url).catch(err => console.error("Couldn't load page", err));

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
          source={require('../../assets/carepop-logo-pink.png')}
          style={styles.logo}
        />
            <Text style={styles.title}>Create an Account</Text>
            <Text style={styles.description}>
              Start your journey with us today.
            </Text>
        </View>

        <View style={styles.formContainer}>
            <Controller name="email" control={control} render={({ field: { onChange, onBlur, value } }) => (
                <Input placeholder="you@example.com" value={value} onChangeText={onChange} onBlur={onBlur} keyboardType="email-address" autoCapitalize="none" label="Email" editable={!isSubmitting} icon={<Mail size={20} color={theme.colors.mutedForeground} />} error={errors.email?.message} />
            )}/>
            <Controller name="password" control={control} render={({ field: { onChange, onBlur, value } }) => (
                <View>
                    <Input placeholder="••••••••" value={value} onChangeText={onChange} onBlur={onBlur} secureTextEntry={!isPasswordVisible} label="Password" editable={!isSubmitting} icon={
                        <TouchableOpacity onPress={() => setIsPasswordVisible(p => !p)}>
                            {isPasswordVisible ? <EyeOff size={22} color={theme.colors.mutedForeground} /> : <Eye size={22} color={theme.colors.mutedForeground} />}
                        </TouchableOpacity>
                    } error={errors.password?.message} />
                    {password && <StrengthIndicator strength={strength} />}
                </View>
            )}/>
            
            <Controller name="termsAccepted" control={control} render={({ field: { onChange, value } }) => (
                <View style={styles.termsContainer}>
                  <Checkbox checked={value} onChange={onChange} aria-label="Accept terms and conditions" />
                  <View style={styles.termsTextContainer}>
                    <Text style={styles.termsText}>
                      I agree to the{' '}
                      <Text style={styles.linkText} onPress={() => handleOpenLink('https://carepop.vercel.app/terms-of-service')}>Terms & Conditions</Text>
                      {' and '}
                      <Text style={styles.linkText} onPress={() => handleOpenLink('https://carepop.vercel.app/privacy-policy')}>Privacy Policy</Text>.
                    </Text>
                  </View>
                </View>
            )}/>
             {errors.termsAccepted && <Text style={styles.errorText}>{errors.termsAccepted.message}</Text>}

            <View style={styles.buttonContainer}>
                <Button 
                    title="Create Account" 
                    onPress={handleSubmit(data => handleRegister(data))} 
                    isLoading={isSubmitting}
                    disabled={isSubmitting} 
                    size="lg"
                    fullWidth 
                />
            </View>
        </View>
          
        <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>or continue with</Text>
            <View style={styles.divider} />
        </View>

        <View style={styles.socialLoginContainer}>
            <GoogleSignInButton onPress={handleGoogleSignIn} disabled={isSubmitting} />
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
    gap: theme.spacing.md,
    width: '100%',
  },
  errorText: {
    ...theme.typography.small,
    color: theme.colors.destructive,
    marginTop: -theme.spacing.sm,
    marginBottom: theme.spacing.sm,
    paddingHorizontal: 4,
  },
  buttonContainer: {
    marginTop: theme.spacing.sm,
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
  },
  termsTextContainer: {
    flex: 1,
  },
  termsText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
    lineHeight: 18,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: theme.colors.border,
  },
  dividerText: {
    ...theme.typography.small,
    color: theme.colors.mutedForeground,
  },
  socialLoginContainer: {
    alignItems: 'center',
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.card,
    borderWidth: 1,
    borderColor: theme.colors.border,
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.radius.full,
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  socialIcon: {
    marginRight: theme.spacing.md,
  },
  socialButtonText: {
    ...theme.typography.body,
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  footerText: {
    ...theme.typography.body,
    color: theme.colors.mutedForeground,
  },
  linkText: {
    color: theme.colors.primary,
    fontWeight: 'bold',
  },
  strengthContainer: { marginTop: theme.spacing.sm, padding: theme.spacing.md, backgroundColor: theme.colors.background, borderRadius: theme.radius.md, borderWidth: 1, borderColor: theme.colors.border, gap: theme.spacing.xs, },
  strengthBar: { height: 4, borderRadius: 2, },
  strengthText: { ...theme.typography.small, },
});