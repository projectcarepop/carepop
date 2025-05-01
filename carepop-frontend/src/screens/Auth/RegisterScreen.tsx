import React, { useState } from 'react';
import { View, Text, ScrollView, Alert, TouchableOpacity } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import TextInput from '../../components/common/TextInput';
import Button from '../../components/common/Button';
import { HelperText } from 'react-native-paper';
// TODO: Import Checkbox component when available
// TODO: Import navigation hook (e.g., useNavigation)

const RegisterScreen = () => {
  // TODO: Get navigation object from hook
  // const navigation = useNavigation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>();
  const [passwordError, setPasswordError] = useState<string | undefined>();
  const [consentError, setConsentError] = useState<string | undefined>();

  const validateForm = (): boolean => {
    let isValid = true;
    setEmailError(undefined);
    setPasswordError(undefined);
    setConsentError(undefined);

    if (!email) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (password.length < 8) { 
      setPasswordError('Password must be at least 8 characters long.');
      isValid = false;
    }

    // TODO: Enable consent check when Checkbox is implemented
    // if (!consentGiven) {
    //   setConsentError('You must agree to the terms to register.');
    //   isValid = false;
    // }

    return isValid;
  };

  const handleRegister = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setEmailError(undefined);
    setPasswordError(undefined);
    setConsentError(undefined);

    console.log('Registering with:', { email, password, consentGiven });
    try {
      // Replace with actual API call to FOUND-9 endpoint
      await new Promise(resolve => setTimeout(resolve, 1500)); 
      Alert.alert('Registration Success', 'Account created successfully! Please check your email for verification. (Placeholder)');
      // TODO: Navigate to Login or a verification pending screen
      // navigation.navigate('Login'); 
    } catch (error: any) {
      console.error('Registration failed:', error);
      setPasswordError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const navigateToLogin = () => {
      // TODO: Implement navigation
      console.log("Navigate to Login Screen");
      // navigation.navigate('Login');
  };

  return (
    <ScreenContainer>
      <ScrollView keyboardShouldPersistTaps="handled">
        <Text className="text-2xl font-bold text-center mb-6 text-text-light dark:text-text-dark">
          Create Account
        </Text>

        <TextInput
          label="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          error={!!emailError}
          errorText={emailError}
          disabled={loading}
          className="mb-4"
        />

        <TextInput
          label="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
          error={!!passwordError}
          errorText={passwordError}
          disabled={loading}
        />
        {/* Show password requirements hint */} 
        {!passwordError && 
          <HelperText type="info" visible={true} className="mb-4">
            Minimum 8 characters.
          </HelperText>
        }

        {/* TODO: Consent Checkbox Placeholder - SEC-FE-2 */}
        <View className="flex-row items-center mb-6">
          {/* <Checkbox status={consentGiven ? 'checked' : 'unchecked'} onPress={() => setConsentGiven(!consentGiven)} disabled={loading} /> */}
          {/* TODO: Make links pressable */}
          <Text className="flex-1 text-sm ml-2 text-text-light dark:text-text-dark">
            I agree to the <Text className="text-brand-dark-blue-light dark:text-brand-dark-blue-dark underline">Terms of Service</Text> and <Text className="text-brand-dark-blue-light dark:text-brand-dark-blue-dark underline">Privacy Policy</Text>.
          </Text>
        </View>
        {consentError && <Text className="text-red-500 text-xs mb-4">{consentError}</Text>}

        <Button
          title="Create Account"
          onPress={handleRegister}
          loading={loading}
          disabled={loading}
          accessibilityLabel="Create new account"
          className="mb-6"
        />

        {/* Link to Login Screen */}
        <View className="flex-row justify-center items-center">
            <Text className="text-text-light dark:text-text-dark">Already have an account? </Text>
            <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
                <Text className="text-brand-dark-blue-light dark:text-brand-dark-blue-dark font-semibold ml-1">
                    Login
                </Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
};

export default RegisterScreen; 