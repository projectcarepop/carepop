import 'react-native-gesture-handler';
import React, { useState, useEffect, useRef } from 'react';
import { StyleSheet, View, Dimensions, Text, Button as RNButton, Alert } from 'react-native';
import { theme, Button } from './src/components';
import {
  useFonts,
  SpaceGrotesk_400Regular,
  SpaceGrotesk_700Bold,
} from '@expo-google-fonts/space-grotesk';
import { NavigationContainer } from '@react-navigation/native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import * as Linking from 'expo-linking';
import * as ExpoSplashScreen from 'expo-splash-screen';
import { SplashScreen as CustomSplashScreen } from './screens/Onboarding/SplashScreen';
import { OnboardingScreenOne } from './screens/Onboarding/OnboardingScreenOne';
import { OnboardingScreenTwo } from './screens/Onboarding/OnboardingScreenTwo';
import { OnboardingScreenThree } from './screens/Onboarding/OnboardingScreenThree';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Carousel from 'react-native-reanimated-carousel';
import { RootAppNavigator } from './src/navigation/AppNavigator';

const ONBOARDING_COMPLETE_KEY = 'hasOnboarded';

// Keep the splash screen visible while we fetch resources
ExpoSplashScreen.preventAutoHideAsync();

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  let [fontsLoaded, fontError] = useFonts({
    SpaceGrotesk_400Regular,
    SpaceGrotesk_700Bold,
  });

  const { isLoading: isLoadingAuth, session, user, isAwaitingEmailConfirmation, refreshUserProfile, signOut } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);
  const [initialChecksDone, setInitialChecksDone] = useState(false);
  const [showCustomSplashOverride, setShowCustomSplashOverride] = useState(true);
  const onboardingCarouselRef = useRef<any>(null);
  const [alertShownForUnconfirmedUser, setAlertShownForUnconfirmedUser] = useState(false);
  const alertInitiatedThisCycleRef = useRef(false); // Ref to track alert initiation

  const onboardingScreens = [
    { id: 'one', component: OnboardingScreenOne },
    { id: 'two', component: OnboardingScreenTwo },
    { id: 'three', component: OnboardingScreenThree },
  ];

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        const alreadyOnboarded = value === 'true';
        setHasOnboarded(alreadyOnboarded);
      } catch (e) {
        console.error('[AppContent] Failed to load onboarding status:', e);
        setHasOnboarded(false);
      }
    };
    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    const prepareApp = async () => {
      if ((fontsLoaded || fontError) && !isLoadingAuth && hasOnboarded !== null) {
        setInitialChecksDone(true);
        await ExpoSplashScreen.hideAsync();

        const customSplashTimer = setTimeout(() => {
          setShowCustomSplashOverride(false);
        }, 1000);

        return () => clearTimeout(customSplashTimer);
      }
    };
    prepareApp();
  }, [fontsLoaded, fontError, isLoadingAuth, hasOnboarded]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      // console.log('[AppContent] Received deep link URL:', url);
    };

    Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    });

    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleProfileCreated = async () => {
    console.log('[AppContent] Profile created/updated. Refreshing user profile in AuthContext...');
    await refreshUserProfile();
  };

  const handleOnboardingComplete = async () => {
    console.log('[AppContent] Onboarding complete. Setting flag and state.');
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasOnboarded(true);
    } catch (e) {
      console.error('[AppContent] Failed to save onboarding status:', e);
      setHasOnboarded(true);
    }
  };

  useEffect(() => {
    // If we are not in a state where confirmation is awaited, or no user,
    // reset flags for the next potential cycle.
    if (!user || !isAwaitingEmailConfirmation) {
      alertInitiatedThisCycleRef.current = false;
      // Only reset alertShownForUnconfirmedUser if it's currently true,
      // to avoid unnecessary state updates if it's already false.
      if (alertShownForUnconfirmedUser) {
        setAlertShownForUnconfirmedUser(false);
      }
      return; // Early exit, no alert to show or manage further in this effect run
    }

    // Conditions to show the alert:
    // 1. User exists and is awaiting confirmation.
    // 2. The user has NOT YET acknowledged this type of alert (alertShownForUnconfirmedUser is false).
    // 3. An alert has NOT YET been initiated in the current run of this confirmation state (alertInitiatedThisCycleRef.current is false).
    if (user && isAwaitingEmailConfirmation && !alertShownForUnconfirmedUser && !alertInitiatedThisCycleRef.current) {
      alertInitiatedThisCycleRef.current = true; // Mark that we are initiating an alert in this cycle.
      
      console.log('[AppContent] Preparing to show confirmation alert for user:', user.id);
      Alert.alert(
        "Registration Successful!",
        `Please check your email (${user.email || 'your email address'}) to confirm your account. You will now be taken to the login screen.`,
        [
          {
            text: "OK",
            onPress: async () => {
              setAlertShownForUnconfirmedUser(true); // User has acknowledged.
              if (signOut) {
                await signOut();
              }
            },
          },
        ],
        { cancelable: false }
      );
    }
  }, [user, isAwaitingEmailConfirmation, alertShownForUnconfirmedUser, signOut]);

  // Show custom JS splash screen if:
  // 1. Initial checks aren't done (e.g. first load, waiting for fonts/auth/onboarding status)
  // 2. Override to show custom splash is active (e.g., for minimum display time on first load)
  // 3. Fonts are not loaded yet (and no font error)
  // 4. OR if auth is currently loading (e.g. sign-in, sign-out in progress) - ensure fonts are loaded to avoid errors in splash itself
  if (
    !initialChecksDone || 
    showCustomSplashOverride || 
    (!fontsLoaded && !fontError) ||
    (isLoadingAuth && fontsLoaded && !fontError) // ADDED/MODIFIED: Explicitly show splash if auth is loading
  ) {
    return <CustomSplashScreen />;
  }

  // If fonts failed to load (and checks are done), display an error message.
  if (fontError) {
    return (
      <View style={styles.centeredError}>
        <Text style={styles.errorText}>Error loading fonts!</Text>
        <Text style={styles.errorDetails}>{fontError.message}</Text>
      </View>
    );
  }

  // After all loading checks:
  // If user is authenticated and has completed onboarding, show the main app.
  // Crucially, fonts must be loaded here.
  if (fontsLoaded && session && user && hasOnboarded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <NavigationContainer theme={theme}>
          <RootAppNavigator onProfileCreated={handleProfileCreated} />
        </NavigationContainer>
      </View>
    );
  }

  // If user is not authenticated (session is null, user is null) OR has not completed onboarding:
  // Show login or onboarding flow.
  // Crucially, fonts must be loaded here.
  if (fontsLoaded && (!session || !hasOnboarded)) {
    if (hasOnboarded === false) { // Explicitly false means checked and not onboarded
      const width = Dimensions.get('window').width;
      return (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }}>
          <Carousel
            ref={onboardingCarouselRef}
            loop={false}
            width={width}
            height={Dimensions.get('window').height}
            data={onboardingScreens}
            scrollAnimationDuration={500}
            renderItem={({ item }) => (
              <item.component 
                onComplete={handleOnboardingComplete} 
                onSkip={handleOnboardingComplete} 
              />
            )}
            style={{ width: '100%' }}
          />
        </View>
      );
    } else { // hasOnboarded is null (still checking) or true (but no session, go to login)
      // This case should ideally be covered by the loading state or RootAppNavigator's auth handling
      // For safety, rendering RootAppNavigator which will redirect to Auth screens.
      return (
        <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
          <NavigationContainer theme={theme}>
            <RootAppNavigator onProfileCreated={handleProfileCreated} />
          </NavigationContainer>
        </View>
      );
    }
  }
  
  // Fallback / Default case - should ideally not be reached if logic above is exhaustive.
  // Render only if fonts are loaded.
  if (fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: theme.colors.background }}>
        <NavigationContainer theme={theme}>
          <RootAppNavigator onProfileCreated={handleProfileCreated} />
        </NavigationContainer>
      </View>
    );
  }
  // If fonts are not loaded and there is no font error, CustomSplashScreen is already returned earlier.
  // If there is a fontError, that is also handled earlier.
  // This path should theoretically not be reached if the above logic is complete.
  return null; 
}

const styles = StyleSheet.create({
  centeredError: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'red',
    marginBottom: 10,
  },
  errorDetails: {
    fontSize: 14,
    color: 'red',
    textAlign: 'center',
  },
});
