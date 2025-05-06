import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { Button } from '@repo/ui';

type AuthScreen = 'login' | 'register' | 'forgotPassword';

export const AuthNavigator: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<AuthScreen>('login');

  const navigateToLogin = () => setCurrentScreen('login');
  const navigateToRegister = () => setCurrentScreen('register');
  const navigateToForgotPassword = () => setCurrentScreen('forgotPassword');

  return (
    <View style={styles.container}>
      {currentScreen === 'login' && (
        <LoginScreen
          navigateToRegister={navigateToRegister}
          navigateToForgotPassword={navigateToForgotPassword}
        />
      )}

      {currentScreen === 'register' && (
        <RegisterScreen
          navigateToLogin={navigateToLogin}
        />
      )}

      {currentScreen === 'forgotPassword' && (
        <ForgotPasswordScreen
          navigateToLogin={navigateToLogin}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  authenticatedContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
  signOutButton: {
    minWidth: 200,
  }
}); 