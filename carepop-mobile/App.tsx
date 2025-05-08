import 'react-native-gesture-handler'; // Re-enable this import
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity, Dimensions } from 'react-native'; // Added ActivityIndicator, TouchableOpacity, and Dimensions
import { theme, Button } from './src/components'; 
import { supabase } from './src/utils/supabase'; // Removed unused getCurrentUser, getUserProfile
import { MaterialIcons } from '@expo/vector-icons'; // Re-enable (ensure installed)
import {
  useFonts,
  // Inter_400Regular, // REMOVE
  // Inter_700Bold, // REMOVE
} from '@expo-google-fonts/inter'; // Keep import line if other fonts might be added later, or remove
import {
  SpaceGrotesk_400Regular, // ADD
  SpaceGrotesk_700Bold, // ADD
} from '@expo-google-fonts/space-grotesk'; // ADD
import { AuthNavigator } from './screens/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native'; // Re-enable
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'; // Re-enable
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack'; // Import Stack Navigator
import { DashboardScreen } from './screens/DashboardScreen';
import { CreateProfileScreen } from './screens/CreateProfileScreen'; // Import the new screen
import { BookingScreen } from './screens/BookingScreen'; // Import BookingScreen
import { HealthServicesScreen } from './src/screens/HealthServicesScreen';
import { HealthBuddyScreen } from './src/screens/HealthBuddyScreen';
import { MyProfileScreen } from './src/screens/MyProfileScreen'; // Corrected import for renamed screen
import { MyRecordsScreen } from './src/screens/MyRecordsScreen'; // Import the new screen
import { PillTrackerScreen } from './src/screens/PillTrackerScreen';
import { AddMedicationScreen } from './src/screens/AddMedicationScreen';
import { MensTrackerScreen } from './src/screens/MensTrackerScreen';
import { LogPeriodScreen } from './src/screens/LogPeriodScreen';
import { LogSymptomsScreen } from './src/screens/LogSymptomsScreen';
import { LogBloodPressureScreen } from './src/screens/LogBloodPressureScreen';
import { PaymentMethodsScreen } from './src/screens/PaymentMethodsScreen';
import type { Session } from '@supabase/supabase-js'; // Removed Subscription
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ServiceBookingScreen } from './src/screens/ServiceBookingScreen'; // Import the new screen
import { LoginScreen } from './screens/LoginScreen'; // Import Auth Screens
import { RegisterScreen } from './screens/RegisterScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import * as Linking from 'expo-linking'; // Added for deep link handling
import * as ExpoSplashScreen from 'expo-splash-screen'; // Use alias for expo splash screen
import { EditProfileScreen } from './src/screens/EditProfileScreen'; // Import EditProfileScreen

// Import Onboarding Screens from new location
import { SplashScreen as CustomSplashScreen } from './screens/Onboarding/SplashScreen'; // Corrected Path
import { OnboardingScreenOne } from './screens/Onboarding/OnboardingScreenOne'; // Corrected Path
import { OnboardingScreenTwo } from './screens/Onboarding/OnboardingScreenTwo'; // Corrected Path
import { OnboardingScreenThree } from './screens/Onboarding/OnboardingScreenThree'; // Import Screen Three

// Import AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

// Import Carousel
import Carousel from 'react-native-reanimated-carousel';

// Prevent native splash screen from auto-hiding
ExpoSplashScreen.preventAutoHideAsync();

const ONBOARDING_COMPLETE_KEY = 'hasOnboarded';
const { width: screenWidth } = Dimensions.get('window');

// --- Define Param Lists ---
type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

type MainDrawerParamList = {
  Dashboard: undefined;
  'My Bookings': undefined;
  'My Records': undefined;
  'Make Appointment': undefined; // This will likely be a nested stack
  'Health Buddy': undefined; // This will likely be a nested stack
  'My Profile': undefined; // This will likely be a nested stack for MyProfileStack
};

type MyProfileStackParamList = {
  MyProfileMain: undefined;
  EditProfile: undefined;
};

type RootStackParamList = {
  Loading: undefined;
  Auth: undefined; // Refers to AuthStack
  Main: undefined; // Refers to MainDrawer
  CreateProfile: undefined; // Screen shown between Auth and Main
};

// --- Navigators ---
const Drawer = createDrawerNavigator<MainDrawerParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppointmentStackNav = createNativeStackNavigator(); // Specific stack for appointments
const HealthBuddyStackNav = createNativeStackNavigator(); // Specific stack for health buddy
const MyProfileStackNav = createNativeStackNavigator<MyProfileStackParamList>(); // Specific stack for profile sections

// Re-enable Custom Drawer Content
function CustomDrawerContent(props: any) {
  const { signOut } = useAuth(); // Use signOut from our context

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        icon={({ color, size }: { color: string; size: number }) => (
          <MaterialIcons name="logout" color={color} size={size} />
        )}
        onPress={async () => {
          await signOut(); // Call context signOut directly
        }}
      />
    </DrawerContentScrollView>
  );
}

// App Root Component
export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

// --- Main App Content Component --- 
function AppContent() {
  let [fontsLoaded, fontError] = useFonts({
    // Inter_400Regular, // REMOVE
    // Inter_700Bold, // REMOVE
    SpaceGrotesk_400Regular, // ADD
    SpaceGrotesk_700Bold, // ADD
  });

  const { session, profile, isLoading: isLoadingAuth, signOut } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean>(false); // ALWAYS SHOW ONBOARDING INITIALLY FOR TESTING
  const [isAppLoading, setIsAppLoading] = useState(true); // Technical loading (fonts, auth check)
  const [showCustomSplashOverride, setShowCustomSplashOverride] = useState(true); // Controls splash visibility after technical load
  const onboardingCarouselRef = useRef<any>(null);

  console.log('[AppContent] Rendering. Session:', session ? 'exists' : 'null/undefined', 'Profile:', profile ? 'exists' : 'null/undefined', 'isLoadingAuth:', isLoadingAuth, 'isAppLoading:', isAppLoading, 'hasOnboarded (state):', hasOnboarded, 'showCustomSplashOverride:', showCustomSplashOverride );

  // Updated onboarding screens data
  const onboardingScreens = [
    // SplashScreen is now primarily the initial native one + loading view
    { id: 'one', component: OnboardingScreenOne },
    { id: 'two', component: OnboardingScreenTwo },
    { id: 'three', component: OnboardingScreenThree }, // Added Screen Three
  ];

  // Check Onboarding Status on Mount
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        // TEMPORARILY DISABLE READING FROM ASYNCSTORAGE FOR ONBOARDING
        // const value = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
        // setHasOnboarded(value === 'true');
        // console.log('[AppContent] Onboarding status loaded:', value === 'true');
        console.log('[AppContent] Onboarding check skipped for testing. Forcing show.');
      } catch (e) {
        console.error('[AppContent] Failed to load onboarding status (during test override):', e);
        // setHasOnboarded(false); // Already set to false initially
      }
    };
    checkOnboardingStatus();
  }, []);

  // --- Splash Screen Hiding & App Loading Logic ---
  useEffect(() => {
    const prepareApp = async () => {
      await ExpoSplashScreen.preventAutoHideAsync(); 
      
      if ((fontsLoaded || fontError) && !isLoadingAuth) {
        console.log('[AppContent] Technical loading complete. Hiding native splash screen.');
        await ExpoSplashScreen.hideAsync();
        setIsAppLoading(false); // Technical loading is done

        // Now, set a timer for the custom JS splash screen to stay longer
        const customSplashTimer = setTimeout(() => {
          console.log('[AppContent] Custom JS splash override timer finished.');
          setShowCustomSplashOverride(false);
        }, 2000); // Show JS splash for an additional 2 seconds AFTER native hides & assets load

        return () => clearTimeout(customSplashTimer); // Cleanup timer
      }
    }
    prepareApp();
  }, [fontsLoaded, fontError, isLoadingAuth]); 

  // --- Deep Link Handling --- 
  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const { url } = event;
      console.log('[AppContent] Received deep link URL:', url);
      // Supabase client might automatically pick up session from URL if tokens are in fragment.
      // We rely on onAuthStateChange in AuthContext to update the session.
      // No explicit supabase.auth.setSession or getSessionFromUrl here for now.
    };

    // Get the initial URL if the app was opened with one
    Linking.getInitialURL().then(initialUrl => {
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    });

    // Listen for subsequent URLs
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  const handleProfileCreated = () => {
    // This function might still be useful if CreateProfileScreen needs to signal back.
    // However, AuthContext should ideally re-fetch/update profile upon user actions.
    // For now, let's assume AuthContext will reflect the new profile after creation.
    console.log('[AppContent] Profile creation reported. AuthContext should update.');
  };

  const handleOnboardingComplete = async () => {
    try {
      await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, 'true');
      setHasOnboarded(true); // This will now trigger the transition to Auth/Main
      console.log('[AppContent] Onboarding marked as complete.');
    } catch (e) {
      console.error('[AppContent] Failed to save onboarding status:', e);
      // Still proceed to set state to true to allow app progression even if save fails
      setHasOnboarded(true);
    }
  };

  // --- Loading View ---
  // Show CustomSplashScreen if technical loading is happening OR if override timer is active
  if (isAppLoading || showCustomSplashOverride) { 
    return <CustomSplashScreen />;
  }

  // --- Conditional Rendering Logic ---
  // 1. Show Onboarding Carousel if not completed (and custom splash override is false)
  if (!hasOnboarded) { // ALWAYS TRUE INITIALLY FOR TESTING (until handleOnboardingComplete)
    return (
      <Carousel
        ref={onboardingCarouselRef}
        loop={false}
        width={screenWidth}
        height={Dimensions.get('window').height} // Use full height
        autoPlay={false}
        data={onboardingScreens} 
        scrollAnimationDuration={500}
        // onSnapToItem={(index) => console.log('Current onboarding slide index: ', index)}
        renderItem={({ item, index }) => {
          const ScreenComponent = item.component;
          const screenProps: any = {}; // Simpler props

          if (item.id === 'three') { 
              screenProps.onComplete = handleOnboardingComplete;
          }
          return (
            <View style={{ flex: 1, width: screenWidth }}>
              <ScreenComponent {...screenProps} />
            </View>
          );
        }}
      />
    );
  }

  // 2. If onboarding is done, proceed with Auth/Main flow
  // ... (rest of the existing logic for session, profile, etc.)
  return (
    <NavigationContainer>
       <RootStack.Navigator screenOptions={{ headerShown: false }}>
         {/* Onboarding handled above, removed from RootStack navigation */}
          {!session ? (
           // Onboarding done, no session --> Auth Flow
           <RootStack.Screen name="Auth" component={AuthScreens} />
         ) : !profile ? (
           // Onboarding done, session exists, but no profile yet --> Create Profile
           <RootStack.Screen name="CreateProfile">
                {(props) => <CreateProfileScreen {...props} onProfileCreated={handleProfileCreated} />}
           </RootStack.Screen>
         ) : (
            // Onboarding done, session and profile exist --> Main App Drawer
           <RootStack.Screen name="Main" component={MainAppDrawer} />
         )}
       </RootStack.Navigator>
    </NavigationContainer>
  );
}

// --- Stack Navigators --- 

function HealthBuddyStack() {
  return (
    <HealthBuddyStackNav.Navigator screenOptions={{ headerShown: false }}>
      <HealthBuddyStackNav.Screen name="HealthBuddyMain" component={HealthBuddyScreen} options={{ title: 'Health Buddy' }} />
    </HealthBuddyStackNav.Navigator>
  );
}

function MyProfileStack() {
  return (
    <MyProfileStackNav.Navigator screenOptions={{ headerShown: false }}>
      <MyProfileStackNav.Screen
        name="MyProfileMain"
        component={MyProfileScreen}
      />
      <MyProfileStackNav.Screen
        name="EditProfile"
        component={EditProfileScreen}
      />
    </MyProfileStackNav.Navigator>
  );
}

function AppointmentStack() {
  return (
    <AppointmentStackNav.Navigator>
      <AppointmentStackNav.Screen name="ServiceBooking" component={ServiceBookingScreen} options={{ title: 'Book Service' }}/>
      <AppointmentStackNav.Screen name="BookingScreen" component={BookingScreen} options={{ title: 'My Bookings Main' }} />
      {/* Example: <AppointmentStackNav.Screen name="BookingDetail" component={BookingDetailScreen} /> */}
    </AppointmentStackNav.Navigator>
  );
}

// --- Drawer Navigator Definition ---
function MainAppDrawer() {
  return (
    <Drawer.Navigator 
      drawerContent={props => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerLabelStyle: { marginLeft: -20, fontSize: 16 }
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{ 
          title: 'Home Dashboard',
          drawerIcon: ({ color, size }) => <MaterialIcons name="dashboard" color={color} size={size} />
        }} 
      />
      <Drawer.Screen 
        name="My Bookings" 
        component={AppointmentStack} // Using AppointmentStack here
        options={{ 
          title: 'My Appointments',
          drawerIcon: ({ color, size }) => <MaterialIcons name="event" color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="My Records" 
        component={MyRecordsScreen} 
        options={{ 
          title: 'My Health Records',
          drawerIcon: ({ color, size }) => <MaterialIcons name="folder-shared" color={color} size={size} /> 
        }} 
      />
       <Drawer.Screen 
        name="Make Appointment" // This could also directly be AppointmentStack if preferred
        component={HealthServicesScreen} 
        options={{ 
          title: 'Book a Service',
          drawerIcon: ({ color, size }) => <MaterialIcons name="medical-services" color={color} size={size} />
        }} 
      />
      <Drawer.Screen 
        name="Health Buddy" 
        component={HealthBuddyStack} 
        options={{ 
          title: 'AI Health Buddy',
          drawerIcon: ({ color, size }) => <MaterialIcons name="chat" color={color} size={size} /> 
        }} 
      />
      <Drawer.Screen 
        name="My Profile" 
        component={MyProfileStack} // Using MyProfileStack here
        options={{ 
          title: 'My Profile Settings',
          drawerIcon: ({ color, size }) => <MaterialIcons name="person" color={color} size={size} /> 
        }} 
      />
    </Drawer.Navigator>
  );
}

// --- Auth Stack Navigator ---
function AuthScreens() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
       <AuthStackNav.Screen name="Login">
         {(props) => <LoginScreen {...props} navigateToRegister={() => props.navigation.navigate('Register')} navigateToForgotPassword={() => props.navigation.navigate('ForgotPassword')} />}
       </AuthStackNav.Screen>
       <AuthStackNav.Screen name="Register">
         {(props) => <RegisterScreen {...props} navigateToLogin={() => props.navigation.navigate('Login')} />}
       </AuthStackNav.Screen>
      <AuthStackNav.Screen name="ForgotPassword">
        {(props) => <ForgotPasswordScreen {...props} navigateToLogin={() => props.navigation.navigate('Login')} />}
      </AuthStackNav.Screen>
    </AuthStackNav.Navigator>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    color: theme.colors.textMuted,
    fontSize: theme.typography.body, // Slightly larger?
  },
  errorTitle: { // Style for error titles
    fontSize: theme.typography.subheading,
    fontWeight: 'bold',
    color: theme.colors.destructive,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  errorText: { 
    color: theme.colors.destructive,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  // Removed custom drawer styles
});
