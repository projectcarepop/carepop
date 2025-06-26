import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '../context/AuthContext';
import { theme } from '../components/theme';
import {
  LayoutDashboard,
  CalendarPlus,
  CalendarCheck,
  Map,
  FileText,
  HeartPulse,
  Info,
  User,
  LogOut,
  UserCircle,
} from 'lucide-react-native';
import { navigationRef } from './navigation';

// --- Screen Imports ---
import CreateProfileScreen from '../../screens/CreateProfileScreen';
import { ForgotPasswordScreen } from '../../screens/ForgotPasswordScreen';
import { BookingScreen } from '../../screens/BookingScreen';
import HealthBuddyScreen from '../screens/HealthBuddyScreen';
import { MyAppointmentsScreen } from '../screens/MyAppointmentsScreen';
import { MyRecordsScreen } from '../screens/MyRecordsScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { AppointmentDetailScreen } from '../screens/AppointmentDetailScreen';
import { SplashScreen } from '../../screens/Onboarding/SplashScreen';
import { OnboardingScreenOne } from '../../screens/Onboarding/OnboardingScreenOne';
import { OnboardingScreenTwo } from '../../screens/Onboarding/OnboardingScreenTwo';
import { OnboardingScreenThree } from '../../screens/Onboarding/OnboardingScreenThree';
import { EmailConfirmationScreen } from '../../screens/EmailConfirmationScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { LoginScreen } from '../../screens/LoginScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { ClinicFinderScreen } from '../../screens/ClinicFinderScreen';
import LogHealthDataScreen from '../screens/LogHealthDataScreen';
import { BookingNavigator } from './BookingNavigator';


// --- Param Lists ---
export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  EmailConfirmation: undefined;
};

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
  BookingFlow: undefined;
};

export type AppointmentsStackParamList = {
  MyAppointments: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type BookingStackParamList = {
  BookAppointment: undefined;
  SelectDateTime: { clinicId: string; serviceId: string; };
};

export type OnboardingStackParamList = {
  OnboardingOne: undefined;
  OnboardingTwo: undefined;
  OnboardingThree: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined; // This will point to the HomeScreen directly now
  Appointments: undefined;
  Records: undefined;
  'Health Buddy': undefined;
  'Book a Service': undefined;
  'Clinic Finder': undefined;
  AboutUs: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: { screen?: string } | undefined; // Allow passing initial screen
  Onboarding: undefined; 
  CreateProfile: undefined;
  Main: undefined; // The Drawer Navigator
  EditProfile: undefined;
  LogHealthData: undefined; // Added here for modal presentation
};


// --- Navigators ---
const AuthStackNav = createNativeStackNavigator<AuthStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const AppointmentsStackNav = createNativeStackNavigator<AppointmentsStackParamList>();
const BookingStackNav = createNativeStackNavigator<BookingStackParamList>();
const OnboardingStack = createNativeStackNavigator<OnboardingStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();


// --- Component-Based Navigators ---

function OnboardingNavigator() {
  return (
    <OnboardingStack.Navigator screenOptions={{ headerShown: false }}>
      <OnboardingStack.Screen name="OnboardingOne" component={OnboardingScreenOne} />
      <OnboardingStack.Screen name="OnboardingTwo" component={OnboardingScreenTwo} />
      <OnboardingStack.Screen name="OnboardingThree" component={OnboardingScreenThree} />
    </OnboardingStack.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="Login" component={LoginScreen} />
      <AuthStackNav.Screen name="Register" component={RegisterScreen} />
      <AuthStackNav.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStackNav.Navigator>
  );
}

// --- Appointments Stack ---
function AppointmentsStack() {
  return (
    <AppointmentsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentsStackNav.Screen name="MyAppointments" component={MyAppointmentsScreen} />
      <AppointmentsStackNav.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </AppointmentsStackNav.Navigator>
  );
}


// --- Custom Drawer Content ---
function CustomDrawerContent(props: any) {
  const drawerStyles = createDrawerStyles();
  const { user, signOut } = useAuth();

  return (
    <DrawerContentScrollView {...props} contentContainerStyle={drawerStyles.container}>
      <View style={drawerStyles.header}>
        <UserCircle color={theme.colors.primary} size={48} />
        <Text style={drawerStyles.headerEmail} numberOfLines={1}>
          {user?.email || 'User'}
        </Text>
      </View>
      <View style={drawerStyles.menuGroup}>
        <DrawerItemList {...props} />
      </View>
      <View style={drawerStyles.footer}>
        <DrawerItem
          label="Sign Out"
          icon={({ color }) => <LogOut size={20} color={color} />}
          onPress={signOut}
          inactiveTintColor={theme.colors.destructive}
          labelStyle={{ ...theme.typography.body, fontFamily: theme.typography.fontFamilyMedium }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

// --- Main App Styles ---
const styles = StyleSheet.create({
  // The tabContainer style is no longer needed here as styles are applied directly to tabBarStyle
});

const createDrawerStyles = () => StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background, },
    header: {
      paddingHorizontal: theme.spacing.xl,
      paddingVertical: theme.spacing.lg,
      marginBottom: theme.spacing.md,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerEmail: {
      ...theme.typography.body,
      fontFamily: theme.typography.fontFamilySemiBold,
      color: theme.colors.secondary,
      marginLeft: theme.spacing.md,
      flex: 1,
    },
    menuGroup: { flex: 1, paddingTop: theme.spacing.sm, },
    footer: {
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      padding: theme.spacing.sm,
    }
});

// --- Main Drawer Navigator ---
function AppDrawer() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: theme.colors.muted,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.secondary,
        drawerLabelStyle: { ...theme.typography.body, fontFamily: theme.typography.fontFamilyMedium, marginLeft: 0, },
        drawerItemStyle: { borderRadius: theme.radius.md, marginVertical: 2, marginHorizontal: theme.spacing.md, },
        drawerStyle: { borderTopRightRadius: theme.radius.lg, borderBottomRightRadius: theme.radius.lg, backgroundColor: theme.colors.background, },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ drawerIcon: ({ color }: { color: string }) => <LayoutDashboard size={20} color={color} /> }} />
      <Drawer.Screen name="Appointments" component={AppointmentsStack} options={{ drawerIcon: ({ color }: { color: string }) => <CalendarCheck size={20} color={color} /> }} />
      <Drawer.Screen name="Book a Service" component={BookingNavigator} options={{ drawerIcon: ({ color }: { color: string }) => <CalendarPlus size={20} color={color} /> }} />
      <Drawer.Screen name="Clinic Finder" component={ClinicFinderScreen} options={{ drawerIcon: ({ color }: { color: string }) => <Map size={20} color={color} /> }} />
      <Drawer.Screen name="Health Buddy" component={HealthBuddyScreen} options={{ drawerIcon: ({ color }: { color: string }) => <HeartPulse size={20} color={color} /> }} />
      <Drawer.Screen name="Records" component={MyRecordsScreen} options={{ drawerIcon: ({ color }: { color:string }) => <FileText size={20} color={color} /> }} />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us', drawerIcon: ({ color }: { color: string }) => <Info size={20} color={color} /> }} />
      <Drawer.Screen name="Profile" component={MyProfileScreen} options={{ drawerIcon: ({ color }: { color: string }) => <User size={20} color={color} /> }} />
    </Drawer.Navigator>
  );
}

// --- Root Navigator with State Machine Logic ---
export function RootAppNavigator() {
  const { authStatus } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  // This check remains to decide between Onboarding and Auth screens for new visitors.
  useEffect(() => {
    const checkOnboarding = async () => {
      const onboarded = await AsyncStorage.getItem('hasOnboarded');
      setHasOnboarded(onboarded === 'true');
    };
    checkOnboarding();
  }, []);

  // We still need to wait for the async onboarding check to complete
  if (hasOnboarded === null) {
      return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {authStatus === 'loading' ? (
            <RootStack.Screen name="Splash" component={SplashScreen} />
        ) : authStatus === 'unauthenticated' ? (
            hasOnboarded ? (
                <RootStack.Screen name="Auth" component={AuthNavigator} />
            ) : (
                <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
            )
        ) : authStatus === 'no-profile' ? (
            <RootStack.Screen name="CreateProfile" component={CreateProfileScreen} />
        ) : (
            <RootStack.Group>
                <RootStack.Screen name="Main" component={AppDrawer} />
                <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
            </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}

const LoadingIndicator = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Loading...</Text>
  </View>
);