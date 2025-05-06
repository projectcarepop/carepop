import 'react-native-gesture-handler'; // Re-enable this import
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, SafeAreaView, ActivityIndicator, TouchableOpacity } from 'react-native'; // Added ActivityIndicator and TouchableOpacity
import { theme, Button } from '@repo/ui'; 
import { signOut as supabaseSignOut, getCurrentUser, supabase, getUserProfile } from '@repo/ui/src/utils/supabase'; 
import { MaterialIcons } from '@expo/vector-icons'; // Re-enable (ensure installed)
import {
  useFonts,
  Inter_400Regular,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { AuthNavigator } from './screens/AuthNavigator';
import { NavigationContainer } from '@react-navigation/native'; // Re-enable
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer'; // Re-enable
import { createNativeStackNavigator } from '@react-navigation/native-stack'; // Import Stack Navigator
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

const Drawer = createDrawerNavigator();
const Stack = createNativeStackNavigator(); // Root Stack

// Temporarily removed drawer content for build testing
/*
function CustomDrawerContent(props: any) {
  const { signOut } = useAuth(); // Assuming useAuth provides signOut

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        icon={({ color, size }) => (
          <MaterialIcons name="logout" color={color} size={size} />
        )}
        onPress={async () => {
          await signOut();
          // Navigation should automatically handle the redirect via state change in App
        }}
      />
    </DrawerContentScrollView>
  );
}
*/
// Re-enable Custom Drawer Content
function CustomDrawerContent(props: any) {
  const { signOut } = useAuth(); // Use signOut from our context

  return (
    <DrawerContentScrollView {...props}>
      <DrawerItemList {...props} />
      <DrawerItem
        label="Logout"
        icon={({ color, size }: { color: any; size: any }) => (
          <MaterialIcons name="logout" color={color} size={size} />
        )}
        onPress={async () => {
          await signOut(); // Call context signOut directly
        }}
      />
    </DrawerContentScrollView>
  );
}

// Define the possible states for the authenticated user's profile
type ProfileState = 'checking' | 'exists' | 'needsCreation' | 'error';

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
  let [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_700Bold,
  });

  // Use state from AuthContext
  const { authToken, isLoading: isCheckingAuth, setAuthStateFromExternal } = useAuth();
  
  // Keep local state for profile checking, but it might not be accurate now
  const [profileState, setProfileState] = useState<ProfileState>('exists'); // Default to exists for bypass
  const [isLoggingOut, setIsLoggingOut] = useState(false); 
  const [startupError, setStartupError] = useState<string | null>(null);

  // --- TEMPORARY BYPASS: Comment out the entire useEffect that handles Supabase auth ---
  /*
  useEffect(() => {
    // Initial check logic remains similar, but calls setAuthStateFromExternal
    const checkInitialState = async () => {
      console.log('[AppContent Initial Check] Starting...');
      // isLoading state is handled by AuthProvider
      setProfileState('checking');
      setStartupError(null);
      let initialToken: string | null = null; // Track token found during initial check
      try {
        console.log('[AppContent Initial Check] Calling supabase.auth.getSession()...');
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        console.log('[AppContent Initial Check] getSession() result:', JSON.stringify({ sessionData, sessionError }, null, 2));

        if (sessionError) {
          console.error('[AppContent Initial Check] getSession() error:', sessionError.message);
          setStartupError(`Failed to retrieve session: ${sessionError.message}`);
          // setAuthStateFromExternal(null); // Handled by listener/initial state
          setProfileState('error');
        } else if (sessionData.session) {
          console.log('[AppContent Initial Check] Session found:', sessionData.session.user.id);
          initialToken = sessionData.session.access_token;
          // Profile check logic...
           const { profile, error: profileError } = await getUserProfile();
           if (profileError) {
             console.error("[AppContent Initial Check] Error checking profile:", profileError.message);
             setStartupError(`Failed to load profile: ${profileError.message}`);
             setProfileState('error');
           } else if (profile) {
             console.log('[AppContent Initial Check] Profile exists');
             setProfileState('exists');
           } else {
             console.log('[AppContent Initial Check] Profile needs creation');
             setProfileState('needsCreation');
           }
        } else {
          console.log('[AppContent Initial Check] No session found via getSession(). Trying refreshSession()...');
          try {
             const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
             console.log('[AppContent Initial Check] refreshSession() result:', JSON.stringify({ refreshData, refreshError }, null, 2));

             if (refreshError) {
                 console.error('[AppContent Initial Check] refreshSession() error:', refreshError.message);
                 // initialToken remains null
                 setProfileState('checking');
             } else if (refreshData.session) {
                 console.log('[AppContent Initial Check] Session recovered via refreshSession():', refreshData.session.user.id);
                 initialToken = refreshData.session.access_token;
                 // Profile check logic...
                 const { profile, error: profileError } = await getUserProfile();
                 if (profileError) {
                   console.error("[AppContent Initial Check] Error checking profile after refresh:", profileError.message);
                   setStartupError(`Failed to load profile: ${profileError.message}`);
                   setProfileState('error');
                 } else if (profile) {
                   console.log('[AppContent Initial Check] Profile exists after refresh');
                   setProfileState('exists');
                 } else {
                   console.log('[AppContent Initial Check] Profile needs creation after refresh');
                   setProfileState('needsCreation');
                 }
             } else {
                 console.log('[AppContent Initial Check] refreshSession() did not return a session.');
                 // initialToken remains null
                 setProfileState('checking');
             }
          } catch (refreshCatchError: any) {
              console.error('[AppContent Initial Check] Unexpected error during refreshSession():', refreshCatchError);
              setProfileState('error');
              setStartupError(refreshCatchError.message || 'Error trying to refresh session.');
          }
        }
      } catch (error: any) {
        console.error('[AppContent Initial Check] Unexpected outer error:', error);
        setStartupError(error.message || 'An unexpected error occurred during startup.');
        setProfileState('error');
      } finally {
        console.log('[AppContent Initial Check] Finished. Setting initial auth state based on check.');
        // Explicitly set initial state AFTER async checks complete
        // Note: AuthProvider might have already loaded token from SecureStore,
        // this ensures consistency if get/refreshSession provides the latest state.
        // setAuthStateFromExternal(initialToken); 
        // Let the listener handle the state updates for simplicity unless initialToken MUST override
      }
    };
    // Don't run checkInitialState directly here, let AuthProvider load first.
    // We rely on the listener below primarily, and AuthProvider handles initial load from SecureStore.

    // Listener for subsequent auth changes - calls setAuthStateFromExternal
    console.log('[AppContent] Setting up onAuthStateChange listener...');
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session: Session | null) => {
      console.log(`[AppContent Auth Listener] Event: ${_event}, Session object:`, session);
      const currentToken = session?.access_token ?? null;
      
      // Update context state based on listener
      setAuthStateFromExternal(currentToken);
      
      if (session) {
        console.log('[AppContent Auth Listener] Session exists, checking profile...');
        setProfileState('checking');
        const { profile, error } = await getUserProfile();
        if (error) {
          console.error("[AppContent Auth Listener] Error checking profile:", error.message);
          setProfileState('error');
          setStartupError(`Profile Error: ${error.message}`); // Update error state
        } else if (profile) {
          console.log('[AppContent Auth Listener] Profile exists');
          setProfileState('exists');
        } else {
          console.log('[AppContent Auth Listener] Profile needs creation');
          setProfileState('needsCreation');
        }
      } else {
        console.log('[AppContent Auth Listener] No session, resetting profile state');
        setProfileState('checking');
        setStartupError(null); // Clear errors on logout
      }
    });

    return () => {
      console.log('[AppContent] Unsubscribing from onAuthStateChange.');
      subscription?.unsubscribe();
    };
  }, [setAuthStateFromExternal]);
  */
  // ------------------------------------------------------------------------------------

  const handleProfileCreated = () => {
    setProfileState('exists');
  };

  // --- Loading States --- 
  // isCheckingAuth should be false now due to AuthContext bypass
  if (!fontsLoaded /* || isCheckingAuth */) { 
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading fonts...</Text>
        <StatusBar style="auto" />
      </View>
    );
  }

  // --- Error State (Might not be reachable with bypass) --- 
  if (profileState === 'error' && startupError && !authToken) { 
     return (
       <SafeAreaView style={styles.safeArea}>
         <View style={styles.loadingContainer}>
            <Text style={styles.errorTitle}>Initialization Error</Text>
            <Text style={styles.errorText}>{startupError}</Text>
            {/* Add a retry button? */}
            <StatusBar style="auto" />
         </View>
       </SafeAreaView>
     );
  }

  // --- Main Rendering Logic --- 
  // Because authToken is now initially 'fake-bypass-token', 
  // this should directly render the authenticated part.
  // We also default profileState to 'exists' to bypass profile checks.
  return (
    <NavigationContainer>
      {!authToken ? ( 
        <AuthNavigator /> 
      ) : profileState === 'needsCreation' ? (
        <CreateProfileScreen onProfileCreated={handleProfileCreated} />
      ) : profileState === 'exists' ? (
        // Use Root Stack Navigator - remove PillTrackerStack and MensTrackerStack
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="AppDrawer" component={DrawerNavigator} />
        </Stack.Navigator>
      ) : ( 
        // Loading profile state
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Loading profile...</Text>
          <StatusBar style="auto" />
        </View>
      )}
    </NavigationContainer>
  );
}

// --- Stack Navigators --- 

function HealthBuddyStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="HealthBuddyHome" component={HealthBuddyScreen} options={{ title: 'Health Buddy' }}/>
      <Stack.Screen name="LogBloodPressure" component={LogBloodPressureScreen} options={{ title: 'Log Blood Pressure' }}/>
      <Stack.Screen name="PillTrackerHome" component={PillTrackerScreen} options={{ title: 'Pill Tracker' }}/>
      <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={{ title: 'Add Medication' }}/>
      <Stack.Screen name="MensTrackerHome" component={MensTrackerScreen} options={{ title: 'Menstrual Tracker' }}/>
      <Stack.Screen name="LogPeriod" component={LogPeriodScreen} options={{ title: 'Log Period' }}/>
      <Stack.Screen name="LogSymptoms" component={LogSymptomsScreen} options={{ title: 'Log Symptoms' }}/>
    </Stack.Navigator>
  );
}

function MyProfileStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="MyProfileHome" component={MyProfileScreen} options={{ title: 'My Profile & Settings' }}/>
      <Stack.Screen name="PaymentMethods" component={PaymentMethodsScreen} options={{ title: 'Payment Methods' }}/>
    </Stack.Navigator>
  );
}

function AppointmentStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen 
        name="SelectService" 
        component={HealthServicesScreen} 
        options={{ title: 'Select Health Service' }}
      />
      <Stack.Screen 
        name="ServiceBooking" 
        component={ServiceBookingScreen} 
        options={({ navigation }) => ({
          headerShown: true, 
          title: 'Book Appointment', 
          headerLeft: () => (
            <TouchableOpacity 
              onPress={() => navigation.navigate('SelectService')} 
              style={{ marginLeft: 10 }}
            >
              <MaterialIcons name="arrow-back-ios" size={24} color={theme.colors.primary} /> 
            </TouchableOpacity>
          ),
        })} 
      />
    </Stack.Navigator>
  );
}

// --- Drawer Navigator Definition ---
function DrawerNavigator() {
  return (
     <Drawer.Navigator 
          drawerContent={(props) => <CustomDrawerContent {...props} />} 
        >
          <Drawer.Screen 
            name="Dashboard" 
            component={DashboardScreen} 
            options={{ 
              title: 'Dashboard', 
              drawerIcon: ({ color, size }: { color: any; size: any }) => (
                <MaterialIcons name="dashboard" color={color} size={size} />
              )
            }}
          />
          <Drawer.Screen 
            name="My Bookings" 
            component={BookingScreen} 
            options={{ 
              title: 'My Bookings',
              drawerIcon: ({ color, size }: { color: any; size: any }) => (
                <MaterialIcons name="book-online" color={color} size={size} /> 
              )
            }}
          />
          <Drawer.Screen 
            name="My Records" 
            component={MyRecordsScreen} 
            options={{ 
              title: 'My Records',
              drawerIcon: ({ color, size }: { color: any; size: any }) => (
                <MaterialIcons name="folder-open" color={color} size={size} /> 
              )
            }}
          />
          <Drawer.Screen 
            name="Make Appointment" 
            component={AppointmentStack} // Use the new AppointmentStack
            options={{ 
              title: 'Make Appointment',
              drawerIcon: ({ color, size }: { color: any; size: any }) => (
                <MaterialIcons name="add-circle-outline" color={color} size={size} />
              )
            }}
          />
          <Drawer.Screen 
            name="Health Buddy" 
            component={HealthBuddyStack} 
            options={{ 
              drawerLabel: 'Health Buddy',
              title: 'Health Buddy', 
              drawerIcon: ({ color, size }: { color: any; size: any }) => (
                  <MaterialIcons name="favorite-border" color={color} size={size} />
              )
            }}
          />
          <Drawer.Screen 
            name="My Profile" 
            component={MyProfileStack} 
            options={{ 
              drawerLabel: 'My Profile',
              title: 'My Profile & Settings', 
              drawerIcon: ({ color, size }: { color: any; size: any }) => (
                <MaterialIcons name="person-outline" color={color} size={size} />
              )
            }}
          />
        </Drawer.Navigator>
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
