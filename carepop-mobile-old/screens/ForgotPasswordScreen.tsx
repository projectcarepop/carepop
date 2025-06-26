import React, { useState } from 'react';
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
import { Mail, ArrowLeft } from 'lucide-react-native';

import { forgotPassword } from '../src/services/api';
import { forgotPasswordSchema, type ForgotPasswordFormValues } from '../src/lib/validation/auth';
import {
  Button,
  Input,
  theme,
} from '../src/components';
import type { AuthStackParamList } from '../src/navigation/AppNavigator';

type ForgotPasswordScreenNavigationProp = NativeStackNavigationProp<
  AuthStackParamList,
  'ForgotPassword'
>;

export const ForgotPasswordScreen: React.FC = () => {
  const navigation = useNavigation<ForgotPasswordScreenNavigationProp>();
  const [isSuccess, setIsSuccess] = useState(false);

  const { control, handleSubmit, formState: { errors }, reset } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const { mutate: sendResetLink, isPending } = useMutation({
    mutationFn: (data: ForgotPasswordFormValues) => forgotPassword(data.email),
    onSuccess: () => {
      reset();
      setIsSuccess(true);
    },
    onError: (error) => {
      // As a security practice, we often don't want to confirm if an email exists or not.
      // So, we can show a generic success message even on some errors.
      // However, for a better developer/user experience in some cases, you might show the error.
      // Here, we'll alert the error but also set the success UI state.
      Alert.alert('Error', error.message);
      setIsSuccess(true); // Show generic message even if the email doesn't exist.
    },
  });

  const AlertBox = ({ message }: { message: string }) => (
    <View style={[styles.alertContainer, styles.successBg]}>
      <Text style={styles.successText}>{message}</Text>
    </View>
  );

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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.description}>
              Enter your email to receive reset instructions. No worries!
            </Text>
        </View>

        <View style={styles.formContainer}>
            {isSuccess && <AlertBox message="If an account with this email exists, password reset instructions have been sent." />}

            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <Input
                  placeholder="you@example.com"
                  onBlur={onBlur}
                  onChangeText={onChange}
                  value={value}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  label="Email"
                  editable={!isPending && !isSuccess}
                  error={errors.email?.message}
                  icon={<Mail size={20} color={theme.colors.mutedForeground} />}
                />
              )}
            />
            
            <Button
              title="Send Instructions"
              onPress={handleSubmit((data) => sendResetLink(data))}
              isLoading={isPending}
              disabled={isPending || isSuccess}
              size="lg"
              fullWidth
            />
        </View>
          
        <View style={styles.footer}>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.backButton}>
             <ArrowLeft size={16} color={theme.colors.primary} />
             <Text style={[styles.footerText, styles.linkText]}>
              Back to Login
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
  alertContainer: {
    padding: theme.spacing.md,
    borderRadius: theme.radius.md,
  },
  successBg: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  successText: {
    color: theme.colors.success,
    ...theme.typography.small,
  },
  footer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.xl,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
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