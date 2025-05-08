import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Adjust import paths assuming files are directly under src/*/
import { useAuth } from '../context/AuthContext';
import { LoginScreen } from '../../screens/LoginScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
// Import other screens as needed
import { HomeScreen } from '../screens/HomeScreen'; // Corrected path
// import { SplashScreen } from '../screens/SplashScreen'; // Import your SplashScreen
import { OnboardingNavigator } from './OnboardingNavigator'; // Import the new OnboardingNavigator
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';

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
  MyProfile: undefined;
  EditProfile: undefined;
};

// Add a new ParamList for the root stack that includes Onboarding
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Auth: undefined; // Represents the AuthNavigator stack
  App: undefined;  // Represents the AppNavigator stack
};

const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const AppStackNav = createNativeStackNavigator<AppStackParamList>();
const RootStackNav = createNativeStackNavigator<RootStackParamList>();

// Auth Navigator
function AuthNavigator() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login">
        {(props) => (
          <LoginScreen
            {...props}
            // Pass navigation functions directly
            navigateToRegister={() => props.navigation.navigate('Register')}
            navigateToForgotPassword={() => { /* props.navigation.navigate('ForgotPassword') */ }}
          />
        )}
      </AuthStackNav.Screen>
      <AuthStackNav.Screen name="Register">
         {(props) => (
          <RegisterScreen
            {...props}
            // Pass navigation functions directly
            navigateToLogin={() => props.navigation.navigate('Login')}
          />
        )}
      </AuthStackNav.Screen>
      {/* Add ForgotPassword screen here if needed */}
    </AuthStackNav.Navigator>
  );
}

// App Navigator (Authenticated users)
function AppNavigator() {
  return (
    <AppStackNav.Navigator>
      <AppStackNav.Screen name="Home" component={HomeScreen} />
      {/* Add other authenticated screens here */}
      {/* <AppStackNav.Screen name="Profile" component={ProfileScreen} /> */}
      <AppStackNav.Screen name="MyProfile" component={MyProfileScreen} />
      <AppStackNav.Screen name="EditProfile" component={EditProfileScreen} />
    </AppStackNav.Navigator>
  );
}

export function RootNavigator() {
  const { session, isLoading: isAuthLoading } = useAuth();
  // const [isLoadingOnboarding, setIsLoadingOnboarding] = React.useState(true); // Temporarily disable
  // const [showOnboarding, setShowOnboarding] = React.useState(false); // Temporarily disable

  // TEMPORARY: Force show onboarding for testing
  const isLoadingOnboarding = false;
  const showOnboarding = false;

  /* React.useEffect(() => { // Temporarily disable AsyncStorage check
    const checkOnboardingStatus = async () => {
      try {
        const onboardingStatus = await AsyncStorage.getItem('hasCompletedOnboarding');
        if (onboardingStatus === 'true') {
          setShowOnboarding(false);
        } else {
          setShowOnboarding(true);
        }
      } catch (e) {
        setShowOnboarding(true); // Default to showing onboarding if error
        console.error("Failed to load onboarding status", e);
      } finally {
        setIsLoadingOnboarding(false);
      }
    };
    checkOnboardingStatus();
  }, []); */

  const handleOnboardingComplete = async () => {
    // This function will still be called by OnboardingNavigator but won't change showOnboarding state for now
    try {
      await AsyncStorage.setItem('hasCompletedOnboarding', 'true');
      console.log("Onboarding marked as complete in AsyncStorage (Bypassed for UI)");
      // setShowOnboarding(false); // Temporarily disable state change
    } catch (e) {
      console.error("Failed to save onboarding status", e);
      // setShowOnboarding(false); // Temporarily disable state change
    }
  };

  // Combined loading state
  if (isAuthLoading || isLoadingOnboarding) { // isLoadingOnboarding is now hardcoded to false for bypass
    // You can use your existing SplashScreen or the ActivityIndicator view
    // return <SplashScreen />;
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootStackNav.Navigator screenOptions={{ headerShown: false }}>
        {showOnboarding ? ( // This will always be true for now
          <RootStackNav.Screen name="Onboarding">
            {() => <OnboardingNavigator onOnboardingComplete={handleOnboardingComplete} />}
          </RootStackNav.Screen>
        ) : session ? (
          <RootStackNav.Screen name="App" component={AppNavigator} />
        ) : (
          <RootStackNav.Screen name="Auth" component={AuthNavigator} />
        )}
      </RootStackNav.Navigator>
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