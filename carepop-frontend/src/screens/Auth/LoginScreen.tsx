import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
// TODO: Import navigation hook (e.g., useNavigation)

const LoginScreen = () => {
  // TODO: Get navigation object from hook
  // const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const validateForm = (): boolean => {
    let isValid = true;
    setError(undefined);

    if (!email) {
      setError('Email is required.');
      isValid = false;
    } else if (!password) {
      setError('Password is required.');
      isValid = false;
    }

    return isValid;
  };

  const handleLogin = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(undefined);

    // --- Placeholder for API Call --- 
    console.log('Logging in with:', { email, password });
    try {
      // Replace with actual API call to FOUND-10 endpoint
      // Needs to handle token storage (SEC-FE-1) on success
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay
      Alert.alert('Login Success', 'Welcome back! (Placeholder)');
      // TODO: Navigate to main authenticated part of the app
    } catch (error: any) {
      console.error('Login failed:', error);
      // TODO: Set specific error messages based on API response (e.g., Incorrect password, User not found)
      setError('Login failed. Please check your email and password.'); // Generic error for now
    } finally {
      setLoading(false);
    }
    // --- End Placeholder --- 
  };

  const navigateToRegister = () => {
      // TODO: Implement navigation
      console.log("Navigate to Register Screen");
      // navigation.navigate('Register');
  };
  
  const navigateToForgotPassword = () => {
      // TODO: Implement navigation
      console.log("Navigate to Forgot Password Screen");
      // navigation.navigate('ForgotPassword');
  };

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-center mb-6 text-text-light dark:text-text-dark">
          Login
        </Text>

        {error && (
          <View className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 p-3 rounded-md mb-4">
             <Text className="text-red-700 dark:text-red-200 text-center">{error}</Text>
          </View>
        )}

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          disabled={loading}
          error={!!error} // Indicate error on the field if a general error exists
          className="mb-4"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          disabled={loading}
          error={!!error} // Indicate error on the field if a general error exists
          className="mb-6"
        />
        
        {/* Forgot Password Link */}
        <View className="flex-row justify-end mb-6">
            <TouchableOpacity onPress={navigateToForgotPassword} disabled={loading}>
                <Text className="text-sm text-brand-dark-blue-light dark:text-brand-dark-blue-dark">
                    Forgot Password?
                </Text>
            </TouchableOpacity>
        </View>

        <Button
          title="Login"
          onPress={handleLogin}
          loading={loading}
          disabled={loading}
          accessibilityLabel="Login to your account"
          className="mb-6"
        />

        {/* Link to Register Screen */}
        <View className="flex-row justify-center items-center">
            <Text className="text-text-light dark:text-text-dark">Don't have an account? </Text>
            <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
                <Text className="text-brand-dark-blue-light dark:text-brand-dark-blue-dark font-semibold ml-1">
                    Register
                </Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default LoginScreen; 