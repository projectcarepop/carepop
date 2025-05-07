import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';

// Adjust import paths assuming files are directly under src/*/
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../../screens/LoginScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
// Import other screens as needed
import { HomeScreen } from '../screens/HomeScreen'; // Corrected path

// Define types for the navigation stacks
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  // ForgotPassword: undefined; // Add if you have this screen
};

export type AppStackParamList = {
  Home: undefined;
  // Add other authenticated screens here
  // Profile: undefined;
  // Settings: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const AppStack = createNativeStackNavigator<AppStackParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            // Pass navigation functions directly
            navigateToRegister={() => props.navigation.navigate('Register')}
            navigateToForgotPassword={() => { /* props.navigation.navigate('ForgotPassword') */ }}
          />
        )}
      </AuthStack.Screen>
      <AuthStack.Screen name="Register">
         {(props) => (
          <RegisterScreen
            {...props}
            // Pass navigation functions directly
            navigateToLogin={() => props.navigation.navigate('Login')}
          />
        )}
      </AuthStack.Screen>
      {/* Add ForgotPassword screen here if needed */}
    </AuthStack.Navigator>
  );
}

// App Navigator (Authenticated users)
function AppNavigator() {
  return (
    <AppStack.Navigator>
      <AppStack.Screen name="Home" component={HomeScreen} />
      {/* Add other authenticated screens here */}
      {/* <AppStack.Screen name="Profile" component={ProfileScreen} /> */}
    </AppStack.Navigator>
  );
}

export function RootNavigator() {
  const { session, isLoading } = useAuth();

  // Show loading indicator while checking for session
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 