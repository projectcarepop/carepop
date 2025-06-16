import React from 'react';
import { View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItemList, DrawerItem } from '@react-navigation/drawer';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

// Import Screens used in navigation
import { DashboardScreen } from '../../screens/DashboardScreen';
import { CreateProfileScreen } from '../../screens/CreateProfileScreen';
import { BookingScreen } from '../../screens/BookingScreen';
import { HealthServicesScreen } from '../screens/HealthServicesScreen';
import { HealthBuddyScreen } from '../screens/HealthBuddyScreen';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { MyRecordsScreen } from '../screens/MyRecordsScreen';
import { PillTrackerScreen } from '../screens/PillTrackerScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { MensTrackerScreen } from '../screens/MensTrackerScreen';
import { LogPeriodScreen } from '../screens/LogPeriodScreen';
import { LogSymptomsScreen } from '../screens/LogSymptomsScreen';
import { LogBloodPressureScreen } from '../screens/LogBloodPressureScreen';
import { PaymentMethodsScreen } from '../screens/PaymentMethodsScreen';
import { ServiceBookingScreen } from '../screens/ServiceBookingScreen';
import { LoginScreen } from '../../screens/LoginScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { ForgotPasswordScreen } from '../../screens/ForgotPasswordScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { ClinicFinderScreen } from '../screens/ClinicFinderScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';

// Import new booking flow screens
import { ClinicSelectionScreen } from '../screens/ClinicSelectionScreen';
import { DateTimeSelectionScreen } from '../screens/DateTimeSelectionScreen';
import { BookingConfirmationScreen } from '../screens/BookingConfirmationScreen';
import { BookingSuccessScreen } from '../screens/BookingSuccessScreen';

// Import Context and Theme
import { useAuth } from '../context/AuthContext';
import { theme } from '../components'; 

// --- Define Param Lists ---
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
};

export type MainDrawerParamList = {
  Dashboard: undefined;
  'My Bookings': undefined;
  'My Records': undefined;
  'Make Appointment': undefined; // This will likely be a nested stack
  'Health Buddy': undefined; // This will likely be a nested stack
  'My Profile': { screen?: keyof MyProfileStackParamList }; // Allow passing initial screen
  'Clinic Finder': undefined; 
  'About Us': undefined; 
};

export type MyProfileStackParamList = {
  MyProfileMain: undefined;
  EditProfile: undefined;
};

export type ClinicFinderStackParamList = {
  ClinicFinderMain: undefined;
  // Potentially ClinicDetails: { clinicId: string } later
};

export type AboutUsStackParamList = {
  AboutUsMain: undefined;
};

// --- Add new ParamList for the Appointment flow ---
export type AppointmentStackParamList = {
  ServiceSelection: undefined; // Previously HealthServicesScreen
  ClinicSelection: { 
    serviceId: string;
    serviceName: string;
  };
  DateTimeSelection: {
    serviceId: string;
    clinicId: string;
  };
  BookingConfirmation: {
    serviceId: string;
    clinicId: string;
    // providerId: string; // Add provider later if needed
    slot: string; // Combined date and time for simplicity
  };
  BookingSuccess: undefined;
};

export type RootStackParamList = {
  Loading: undefined; // Consider if Loading screen is needed here or handled in App.tsx
  Auth: undefined; 
  Main: undefined; 
  CreateProfile: { onProfileCreated: () => Promise<void> }; // Pass callback
};

// It might be cleaner to define a specific param list for HealthBuddyStack
export type HealthBuddyStackParamList = {
  HealthBuddyMain: undefined;
  PillTrackerScreen: undefined;
  MensTrackerScreen: undefined;
  LogBloodPressureScreen: undefined;
  // Add other health-buddy related screens here, e.g., AddMedicationScreen
  AddMedicationScreen: undefined; 
};


// --- Navigators ---
const Drawer = createDrawerNavigator<MainDrawerParamList>();
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const AppointmentStackNav = createNativeStackNavigator<AppointmentStackParamList>(); // Use the new ParamList
const HealthBuddyStackNav = createNativeStackNavigator<HealthBuddyStackParamList>(); // Use the new ParamList
const MyProfileStackNav = createNativeStackNavigator<MyProfileStackParamList>(); 
const ClinicFinderStackNav = createNativeStackNavigator<ClinicFinderStackParamList>(); 
const AboutUsStackNav = createNativeStackNavigator<AboutUsStackParamList>(); 

// --- Stack Component Functions ---

function HealthBuddyStack() {
  return (
    // Use the typed navigator
    <HealthBuddyStackNav.Navigator screenOptions={{ headerShown: true }}> 
      <HealthBuddyStackNav.Screen 
        name="HealthBuddyMain" 
        component={HealthBuddyScreen} 
        options={{ headerShown: false }} 
      />
      {/* Add other Health Buddy related screens here */}
      <HealthBuddyStackNav.Screen 
        name="PillTrackerScreen" 
        component={PillTrackerScreen} 
        options={{ title: 'Pill Tracker' }} // Set header title
      />
      <HealthBuddyStackNav.Screen 
        name="MensTrackerScreen" 
        component={MensTrackerScreen} 
        options={{ title: 'Menstrual Tracker' }} // Set header title
      />
       <HealthBuddyStackNav.Screen 
        name="LogBloodPressureScreen" 
        component={LogBloodPressureScreen} 
        options={{ title: 'Log Blood Pressure' }} // Set header title
      />
       {/* Example for potentially adding medication screen later */}
       {/* 
       <HealthBuddyStackNav.Screen 
        name="AddMedicationScreen" 
        component={AddMedicationScreen} 
        options={{ title: 'Add Medication' }} 
      /> 
       */}
    </HealthBuddyStackNav.Navigator>
  );
}

function MyProfileStack() {
  return (
    <MyProfileStackNav.Navigator screenOptions={{ headerShown: true }}>
      <MyProfileStackNav.Screen 
        name="MyProfileMain" 
        component={MyProfileScreen} 
        // This remains false to prevent double header when drawer header is shown
        options={{ headerShown: false }} 
      />
      <MyProfileStackNav.Screen 
        name="EditProfile" 
        component={EditProfileScreen} 
        options={{ headerShown: false  }} // Hide header for EditProfileScreen
      />
      {/* Add PaymentMethodsScreen, etc. */}
    </MyProfileStackNav.Navigator>
  );
}

function ClinicFinderStack() {
  return (
    <ClinicFinderStackNav.Navigator screenOptions={{ headerShown: true }}>
      <ClinicFinderStackNav.Screen 
        name="ClinicFinderMain" 
        component={ClinicFinderScreen} 
        // Hide header on initial screen of the stack
        options={{ headerShown: false }}
      />
      {/* Add Clinic Detail Screen later */}
    </ClinicFinderStackNav.Navigator>
  );
}

function AboutUsStack() {
  return (
    <AboutUsStackNav.Navigator screenOptions={{ headerShown: true }}>
      <AboutUsStackNav.Screen 
        name="AboutUsMain" 
        component={AboutUsScreen} 
        // Hide header for this specific screen (as requested)
        options={{ headerShown: false }} 
      />
    </AboutUsStackNav.Navigator>
  );
}

function AppointmentStack() {
  return (
    <AppointmentStackNav.Navigator screenOptions={{ headerShown: true }}>
      <AppointmentStackNav.Screen 
        name="ServiceSelection" 
        component={HealthServicesScreen} 
        options={{ title: 'Select a Service' }}
      />
      <AppointmentStackNav.Screen 
        name="ClinicSelection" 
        component={ClinicSelectionScreen} 
        options={{ title: 'Select a Clinic' }}
      />
      <AppointmentStackNav.Screen 
        name="DateTimeSelection" 
        component={DateTimeSelectionScreen} 
        options={{ title: 'Select Date & Time' }}
      />
      <AppointmentStackNav.Screen 
        name="BookingConfirmation" 
        component={BookingConfirmationScreen} 
        options={{ title: 'Confirm Appointment' }}
      />
      <AppointmentStackNav.Screen 
        name="BookingSuccess" 
        component={BookingSuccessScreen} 
        options={{ headerShown: false }} // Typically no header on a success screen
      />
    </AppointmentStackNav.Navigator>
  );
}

// --- Drawer Component ---

function MainAppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: theme.colors.primary },
        headerTintColor: '#FFFFFF',
        headerTitleStyle: { fontWeight: 'bold' },
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.text,
        drawerLabelStyle: { fontSize: 16, fontWeight: '500' }, 
      }}
    >
      <Drawer.Screen 
        name="Dashboard" 
        component={DashboardScreen} 
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="home-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen 
        name="My Bookings" 
        component={BookingScreen} 
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="calendar-outline" color={color} size={size} />,
        }}
      />
       <Drawer.Screen 
        name="My Records" 
        component={MyRecordsScreen} 
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="document-text-outline" color={color} size={size} />,
        }}
      />
      <Drawer.Screen 
        name="Make Appointment" 
        component={AppointmentStack} 
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="add-circle-outline" color={color} size={size} />,
          headerShown: true,
        }}
      />
      <Drawer.Screen 
        name="Health Buddy" 
        component={HealthBuddyStack} 
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="heart-outline" color={color} size={size} />,
           headerShown: true,
        }}
      />
       <Drawer.Screen 
        name="My Profile" 
        component={MyProfileStack} 
        options={{
           drawerIcon: ({ color, size }) => <Ionicons name="person-outline" color={color} size={size} />,
           headerShown: true,
        }}
      />
       <Drawer.Screen 
        name="Clinic Finder" 
        component={ClinicFinderStack} 
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="search-outline" color={color} size={size} />,
           headerShown: true,
        }}
      />
       <Drawer.Screen 
        name="About Us" 
        component={AboutUsStack} 
        options={{
          drawerIcon: ({ color, size }) => <Ionicons name="information-circle-outline" color={color} size={size} />,
           headerShown: true,
        }}
      />
    </Drawer.Navigator>
  );
}

// --- Custom Drawer Content ---

function CustomDrawerContent(props: any) {
  const { signOut } = useAuth();

  // Filter out 'My Profile' from the main list rendered by DrawerItemList
  const filteredProps = {
    ...props,
    state: {
      ...props.state,
      routeNames: props.state.routeNames.filter((routeName: string) => routeName !== 'My Profile'),
      routes: props.state.routes.filter((route: any) => route.name !== 'My Profile'),
    },
  };
  // Adjust index if necessary (though likely not needed if just removing one item)
  filteredProps.state.index = filteredProps.state.routes.findIndex((route: any) => route.name === props.state.routes[props.state.index].name);
  if (filteredProps.state.index === -1) {
      // Fallback if the original active route was filtered (shouldn't happen here)
      filteredProps.state.index = 0; 
  }


  return (
    <View style={{ flex: 1 }}>
      <DrawerContentScrollView {...props} style={{ flex: 1 }}>
        {/* Pass filtered props to DrawerItemList */}
        <DrawerItemList {...filteredProps} /> 
      </DrawerContentScrollView>
      <View style={styles.bottomDrawerSection}>
        {/* RE-ADD Custom My Profile Item - Placed above Logout */}
        <DrawerItem
          label="My Profile"
          icon={({ color, size }: { color: string; size: number }) => (
            <Ionicons name="person-outline" color={color} size={size} />
          )}
          onPress={() => {
            // Navigate to the registered 'My Profile' screen (which loads MyProfileStack)
            props.navigation.navigate('My Profile'); 
          }}
          style={{ marginVertical: theme.spacing.xs }}
          labelStyle={{ fontSize: 16, fontWeight: '500' }}
          inactiveTintColor={theme.colors.text} // Use inactive color
          inactiveBackgroundColor={'transparent'} // Keep background transparent
          // Determine if active based on props.state (before filtering)
          // This logic might need refinement depending on exact desired active state behavior
          // focused={props.state.routes[props.state.index].name === 'My Profile'} 
          // activeTintColor={theme.colors.primary} 
          // activeBackgroundColor={theme.colors.primaryMuted} 
        />
        {/* Logout Item */}
        <DrawerItem
          label="Logout"
          icon={({ color, size }: { color: string; size: number }) => (
            <Ionicons name="log-out-outline" color={color} size={size} />
          )}
          onPress={async () => {
            await signOut();
          }}
          style={{ marginVertical: theme.spacing.xs }}
          labelStyle={{ fontSize: 16, fontWeight: '500' }}
          inactiveTintColor={theme.colors.text}
          inactiveBackgroundColor={'transparent'}
        />
      </View>
    </View>
  );
}


// --- Auth Stack Component ---

function AuthScreens() {
  // Note: navigateToLogin/Register props are removed as navigation is handled by react-navigation
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
      <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStackNav.Navigator>
  );
}

// --- Root Navigator Component (Core Logic) ---

interface RootAppNavigatorProps {
    onProfileCreated: () => Promise<void>;
}

export const RootAppNavigator: React.FC<RootAppNavigatorProps> = ({ onProfileCreated }) => {
  const { session, profile, isLoading } = useAuth();

  // Show loading state if auth state or profile is still loading
  // Consider adding a dedicated Loading screen component if needed
  if (isLoading) { 
    // Maybe return a dedicated loading screen later?
    // For now, App.tsx handles the initial loading/splash
    return null; 
  } 

  return (
    // NavigationContainer is now expected to wrap this in App.tsx
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!session ? (
        // No session -> Show Auth flow
        <RootStack.Screen name="Auth" component={AuthScreens} />
      ) : !profile || !profile.first_name ? (
        // Session exists, but no profile or first_name is missing -> Show Create Profile
        <RootStack.Screen 
          name="CreateProfile" 
          component={CreateProfileScreen}
          initialParams={{ onProfileCreated: onProfileCreated }} // Pass callback
        />
      ) : (
        // Session exists and profile complete -> Show Main App Drawer
        <RootStack.Screen name="Main" component={MainAppDrawer} />
      )}
    </RootStack.Navigator>
  );
};

// --- Styles (Primarily for CustomDrawerContent) ---
const styles = StyleSheet.create({
  bottomDrawerSection: {
    marginBottom: 15,
    borderTopColor: theme.colors.border,
    borderTopWidth: 1,
    paddingTop: theme.spacing.sm, // Add some padding above the items
  },
}); 