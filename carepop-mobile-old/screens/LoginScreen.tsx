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
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useMutation } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, AlertCircle, Mail } from 'lucide-react-native';
import { AntDesign } from '@expo/vector-icons';

import { signInWithEmail } from '../src/services/api';
import { loginSchema, type LoginFormValues } from '../src/lib/validation/auth';
import {
  Button,
  Input,
  theme,
} from '../src/components';
import type { AuthStackParamList } from '../src/navigation/AppNavigator';
import { useAuth } from '../src/context/AuthContext';

const GoogleSignInButton = ({ onPress, disabled }: { onPress: () => void; disabled?: boolean; }) => (
    <TouchableOpacity onPress={onPress} disabled={disabled} style={[styles.socialButton, disabled && styles.disabledButton]}>
        <AntDesign name="google" size={24} color={theme.colors.foreground} style={styles.socialIcon} />
        <Text style={styles.socialButtonText}>Sign in with Google</Text>
    </TouchableOpacity>
);

type LoginScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'Login'
>;

export const LoginScreen: React.FC = () => {
  const navigation = useNavigation<LoginScreenNavigationProp>();
  const { signInWithGoogle } = useAuth();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const { control, handleSubmit, formState: { errors } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const { mutate: handleLogin, isPending: isLoggingIn } = useMutation({
    mutationFn: (data: LoginFormValues) => signInWithEmail(data),
    onError: (error) => {
      if (error.message.includes('Invalid login credentials')) {
        setAuthError('Invalid email or password. Please try again.');
      } else {
        setAuthError(error.message);
      }
    },
    // onSuccess will be handled by the AuthContext listener
  });
  
  const [isSigningInWithGoogle, setIsSigningInWithGoogle] = useState(false);

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setIsSigningInWithGoogle(true);
    try {
      await signInWithGoogle();
      // The auth listener in AuthContext will handle navigation.
    } catch (error) {
      // The error is already logged in the context, but we can show an alert here if needed.
      Alert.alert('Google Sign-In Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsSigningInWithGoogle(false);
    }
  };

  const isSubmitting = isLoggingIn || isSigningInWithGoogle;

  useEffect(() => {
    if (errors.email || errors.password) {
      setAuthError(null);
    }
  }, [errors.email, errors.password]);

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
            {authError && (
              <View style={styles.errorContainer}>
                <AlertCircle size={20} color={theme.colors.destructive} />
                <Text style={styles.errorText}>{authError}</Text>
              </View>
            )}

            <Controller name="email" control={control} render={({ field: { onChange, onBlur, value } }) => (
                <Input placeholder="you@example.com" value={value} onChangeText={(text: string) => {
                  onChange(text);
                  if (authError) setAuthError(null);
                }} onBlur={onBlur} keyboardType="email-address" autoCapitalize="none" label="Email" editable={!isSubmitting} icon={<Mail size={20} color={theme.colors.mutedForeground} />} error={errors.email?.message} />
            )}/>
            <View>
                <Controller name="password" control={control} render={({ field: { onChange, onBlur, value } }) => (
                    <Input placeholder="Enter your password" value={value} onChangeText={(text: string) => {
                      onChange(text);
                      if (authError) setAuthError(null);
                    }} onBlur={onBlur} secureTextEntry={!isPasswordVisible} label="Password" editable={!isSubmitting} icon={
                        <TouchableOpacity onPress={() => setIsPasswordVisible((prev: boolean) => !prev)}>
                            {isPasswordVisible ? <EyeOff size={22} color={theme.colors.mutedForeground} /> : <Eye size={22} color={theme.colors.mutedForeground} />}
                        </TouchableOpacity>
                    } error={errors.password?.message} />
                )}/>
                <TouchableOpacity style={styles.forgotPasswordContainer} onPress={() => navigation.navigate('ForgotPassword')}>
                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                </TouchableOpacity>
            </View>

            <Button
              title="Log In"
              onPress={handleSubmit(data => handleLogin(data))}
              isLoading={isSubmitting}
              disabled={isSubmitting}
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
          <GoogleSignInButton onPress={handleGoogleSignIn} disabled={isSubmitting} />
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
        marginTop: theme.spacing.xs,
    },
    forgotPasswordText: {
        ...theme.typography.body,
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamilyMedium,
    },
    dividerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: theme.spacing.xl,
    },
    divider: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.border,
    },
    dividerText: {
        marginHorizontal: theme.spacing.md,
        ...theme.typography.body,
        color: theme.colors.mutedForeground,
    },
    socialLoginContainer: {
        width: '100%',
        alignItems: 'center',
        gap: theme.spacing.md,
        marginBottom: theme.spacing.xl,
    },
    socialButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.radius.lg,
        width: '100%',
    },
    socialIcon: {
        marginRight: theme.spacing.md,
    },
    socialButtonText: {
        ...theme.typography.body,
        fontFamily: theme.typography.fontFamilyMedium,
        color: theme.colors.secondary,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: theme.spacing.xl,
    },
    footerText: {
        ...theme.typography.body,
        color: theme.colors.secondary,
    },
    linkText: {
        color: theme.colors.primary,
        fontFamily: theme.typography.fontFamilyMedium,
    },
    disabledButton: {
        opacity: 0.5,
    },
});