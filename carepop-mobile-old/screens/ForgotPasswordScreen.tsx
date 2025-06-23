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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Mail, ArrowLeft } from 'lucide-react-native';

import { supabase } from '../src/utils/supabase';
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
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleResetPassword = async () => {
    setError(null);
    setSuccessMessage(null);

    if (!email) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(email);
      
      if (resetError) {
        setError(resetError.message || 'Failed to send reset instructions.');
      } else {
        setSuccessMessage('If an account with this email exists, password reset instructions have been sent.');
        setEmail('');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const AlertBox = ({ type, message }: { type: 'error' | 'success', message: string }) => (
    <View style={[styles.alertContainer, type === 'error' ? styles.errorBg : styles.successBg]}>
      <Text style={type === 'error' ? styles.errorText : styles.successText}>{message}</Text>
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
            {error && <AlertBox type="error" message={error} />}
            {successMessage && <AlertBox type="success" message={successMessage} />}

            <Input
              placeholder="you@example.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              label="Email"
              editable={!loading}
              icon={<Mail size={20} color={theme.colors.mutedForeground} />}
            />
            
            <Button
              title="Send Instructions"
              onPress={handleResetPassword}
              isLoading={loading}
              disabled={loading}
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
  errorBg: {
    backgroundColor: theme.colors.destructiveMuted,
  },
  errorText: {
    color: theme.colors.destructive,
    ...theme.typography.small,
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