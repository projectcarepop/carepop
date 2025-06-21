import React, { useState, useEffect } from 'react';
import { NavigationContainer, CommonActions } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackNavigationProp } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useAuth, useUser } from '@clerk/clerk-expo';
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
} from 'lucide-react-native';

// --- Screen Imports ---
// No HomeScreen exists, so we remove the import.
// import { HomeScreen } from '../screens/HomeScreen'; 
// The Login and Register screens are now effectively handled by Clerk's UI
// We will create new screens to host Clerk's components.
import { CreateProfileScreen } from '../../screens/CreateProfileScreen';
import { ForgotPasswordScreen } from '../../screens/ForgotPasswordScreen';
import { BookingScreen } from '../../screens/BookingScreen';
import { HealthBuddyScreen } from '../screens/HealthBuddyScreen';
import { MyAppointmentsScreen } from '../screens/MyAppointmentsScreen';
import { MyRecordsScreen } from '../screens/MyRecordsScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { BookingFlowScreen } from '../screens/BookingFlowScreen';
import { AppointmentDetailScreen } from '../screens/AppointmentDetailScreen';
import { SplashScreen } from '../../screens/Onboarding/SplashScreen';
import { OnboardingScreenOne } from '../../screens/Onboarding/OnboardingScreenOne';
import { OnboardingScreenTwo } from '../../screens/Onboarding/OnboardingScreenTwo';
import { OnboardingScreenThree } from '../../screens/Onboarding/OnboardingScreenThree';
import { EmailConfirmationScreen } from '../../screens/EmailConfirmationScreen';
import { DashboardScreen } from '../screens/DashboardScreen';
import { SignInScreen } from '../screens/SignInScreen';
import { SignUpScreen } from '../screens/SignUpScreen';


// --- Param Lists ---
export type AuthStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
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
  BookingFlow: undefined;
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
  AboutUs: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Splash: undefined;
  Auth: { screen?: string } | undefined; // Allow passing initial screen
  Onboarding: undefined; 
  CreateProfile: undefined;
  Main: undefined; // The Drawer Navigator
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
      <AuthStackNav.Screen name="SignIn" component={SignInScreen} />
      <AuthStackNav.Screen name="SignUp" component={SignUpScreen} />
    </AuthStackNav.Navigator>
  );
}

// --- Booking Flow Stack ---
function BookingStack() {
  return (
    <BookingStackNav.Navigator screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <BookingStackNav.Screen name="BookingFlow" component={BookingFlowScreen} />
    </BookingStackNav.Navigator>
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
  const { signOut } = useAuth();
  const { user } = useUser();
  const drawerStyles = createDrawerStyles();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={drawerStyles.container}>
      <View style={drawerStyles.profileContainer}>
        <View style={drawerStyles.avatar}>
          <User size={28} color={theme.colors.secondary} />
        </View>
        <View style={drawerStyles.profileTextContainer}>
          <Text style={drawerStyles.profileName} numberOfLines={1}>{user?.fullName}</Text>
          <Text style={drawerStyles.profileEmail} numberOfLines={1}>{user?.primaryEmailAddress?.emailAddress}</Text>
        </View>
      </View>
      <View style={drawerStyles.menuGroup}>
        <DrawerItemList {...props} />
      </View>
      <View style={drawerStyles.footer}>
        <DrawerItem 
          label="Log Out" 
          labelStyle={drawerStyles.logoutLabel} 
          icon={() => <LogOut size={20} color={theme.colors.secondary} />} 
          onPress={() => signOut()}
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
    profileContainer: { paddingHorizontal: theme.spacing.lg, paddingVertical: theme.spacing.xl, borderBottomWidth: 1, borderBottomColor: theme.colors.border, flexDirection: 'row', alignItems: 'center', },
    avatar: { width: 56, height: 56, borderRadius: theme.radius.full, backgroundColor: theme.colors.muted, justifyContent: 'center', alignItems: 'center', marginRight: theme.spacing.md, },
    profileTextContainer: { flex: 1, flexDirection: 'column', },
    profileName: { ...theme.typography.h4, color: theme.colors.foreground, fontFamily: theme.typography.fontFamilySemiBold, },
    profileEmail: { ...theme.typography.small, color: theme.colors.mutedForeground, },
    menuGroup: { flex: 1, paddingTop: theme.spacing.sm, },
    footer: { borderTopWidth: 1, borderTopColor: theme.colors.border, paddingBottom: theme.spacing.md, },
    logoutLabel: { ...theme.typography.body, fontFamily: theme.typography.fontFamilyMedium, color: theme.colors.secondary, marginLeft: 0, },
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
      <Drawer.Screen name="Records" component={MyRecordsScreen} options={{ drawerIcon: ({ color }: { color: string }) => <FileText size={20} color={color} /> }} />
      <Drawer.Screen name="Health Buddy" component={HealthBuddyScreen} options={{ drawerIcon: ({ color }: { color: string }) => <HeartPulse size={20} color={color} /> }} />
      <Drawer.Screen name="Book a Service" component={BookingStack} options={{ drawerIcon: ({ color }: { color: string }) => <CalendarPlus size={20} color={color} /> }} />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us', drawerIcon: ({ color }: { color: string }) => <Info size={20} color={color} /> }} />
      <Drawer.Screen name="Profile" component={ProfileStackNavigator} options={{ drawerIcon: ({ color }: { color: string }) => <User size={20} color={color} /> }} />
    </Drawer.Navigator>
  );
}

// --- Profile Stack Navigator ---
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator
      screenOptions={{
        headerShown: true,
        headerTitle: '',
        headerShadowVisible: false,
      }}
    >
      <ProfileStack.Screen name="MyProfile" component={MyProfileScreen} options={{ headerShown: false }} />
      <ProfileStack.Screen name="EditProfile" component={EditProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// --- Auth Flow & Root Navigators ---
function AuthFlow() {
  return (
    <AuthStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AuthStackNav.Screen name="SignIn" component={SignInScreen} />
      <AuthStackNav.Screen name="SignUp" component={SignUpScreen} />
    </AuthStackNav.Navigator>
  );
}

// --- Root Navigator (Handles all top-level nav logic) ---
export function RootAppNavigator() {
  const { isLoaded, isSignedIn } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      const value = await AsyncStorage.getItem('hasOnboarded');
      setHasOnboarded(value === 'true');
    };
    checkOnboarding();
  }, []);

  if (!isLoaded || hasOnboarded === null) {
    return <SplashScreen />;
  }

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {isSignedIn ? (
          <RootStack.Screen name="Main" component={AppDrawer} />
        ) : (
          <>
            {!hasOnboarded ? (
              <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
            ) : (
              <RootStack.Screen name="Auth" component={AuthNavigator} />
            )}
          </>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
  );
}