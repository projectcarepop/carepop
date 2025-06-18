import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, StyleSheet } from 'react-native';

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
} from 'lucide-react-native';

// --- Screen Imports ---
import { HomeScreen } from '../screens/HomeScreen';
import { LoginScreen } from '../../screens/LoginScreen';
import { RegisterScreen } from '../../screens/RegisterScreen';
import { CreateProfileScreen } from '../../screens/CreateProfileScreen';
import { ForgotPasswordScreen } from '../../screens/ForgotPasswordScreen';
import { BookingScreen } from '../../screens/BookingScreen';
import { HealthBuddyScreen } from '../screens/HealthBuddyScreen';
import { ClinicFinderScreen } from '../screens/ClinicFinderScreen';
import { MyAppointmentsScreen } from '../screens/MyAppointmentsScreen';
import { MyRecordsScreen } from '../screens/MyRecordsScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';
import { BookingFlowScreen } from '../screens/BookingFlowScreen';
import { AppointmentDetailScreen } from '../screens/AppointmentDetailScreen';


// --- Param Lists ---
export type AuthStackParamList = { Login: undefined; Register: undefined; ForgotPassword: undefined; };

export type ProfileStackParamList = {
  MyProfile: undefined;
  EditProfile: undefined;
};

export type AppointmentsStackParamList = {
  MyAppointments: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type BookingStackParamList = {
  BookingFlow: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  ClinicFinder: undefined;
  BookAppointment: { screen: string, params?: object } | undefined;
  HealthBuddy: undefined;
};

export type DrawerParamList = {
  Dashboard: undefined; // This will point to the Tab navigator
  Appointments: undefined;
  Records: undefined;
  'Health Buddy': undefined;
  'Clinic Finder': undefined;
  'Book a Service': undefined;
  AboutUs: undefined;
  Profile: undefined;
};

export type RootStackParamList = { Auth: undefined; Main: undefined; CreateProfile: undefined; };


// --- Navigators ---
const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const ProfileStack = createNativeStackNavigator<ProfileStackParamList>();
const AppointmentsStackNav = createNativeStackNavigator<AppointmentsStackParamList>();
const BookingStackNav = createNativeStackNavigator<BookingStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();
const Tab = createBottomTabNavigator<TabParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();


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


// --- Floating Tab Navigator (Wrapped for Stability) ---
function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          // These styles create the floating tab bar
          bottom: 25, 
          left: '15%',
          right: '15%',
          width: '70%',
          paddingTop: 10,
          height: 65,
          backgroundColor: theme.colors.secondary,
          borderRadius: theme.radius.lg,
          overflow: 'hidden',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.12,
          shadowRadius: 15,
          elevation: 5,
        },
        tabBarActiveTintColor: theme.colors.primaryForeground,
        tabBarInactiveTintColor: 'rgba(235, 235, 245, 0.6)',
        tabBarItemStyle: {
          justifyContent: 'center',
          paddingBottom: 5, // Adjust icon position
        },
      }}
    >
      <Tab.Screen name="Dashboard" component={HomeScreen} options={{ tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} /> }} />
      <Tab.Screen name="ClinicFinder" component={ClinicFinderScreen} options={{ tabBarIcon: ({ color, size }) => <Map size={size} color={color} /> }} />
      <Tab.Screen 
        name="BookAppointment" 
        component={BookingStack} // Placeholder, navigation is handled by listener
        options={{ tabBarIcon: ({ color, size }) => <CalendarPlus size={size} color={color} /> }} 
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            e.preventDefault();
            navigation.getParent()?.navigate('Book a Service');
          },
        })}
      />
      <Tab.Screen name="HealthBuddy" component={HealthBuddyScreen} options={{ tabBarIcon: ({ color, size }) => <HeartPulse size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}


// --- Custom Drawer Content ---
function CustomDrawerContent(props: any) {
  const { signOut, profile, user } = useAuth();
  const drawerStyles = createDrawerStyles();
  return (
    <DrawerContentScrollView {...props} contentContainerStyle={drawerStyles.container}>
      <View style={drawerStyles.profileContainer}>
        <View style={drawerStyles.avatar}>
          <User size={28} color={theme.colors.secondary} />
        </View>
        <View style={drawerStyles.profileTextContainer}>
          <Text style={drawerStyles.profileName} numberOfLines={1}>{profile?.first_name} {profile?.last_name}</Text>
          <Text style={drawerStyles.profileEmail} numberOfLines={1}>{user?.email}</Text>
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
          onPress={signOut} 
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
      <Drawer.Screen name="Dashboard" component={AppTabs} options={{ drawerIcon: ({ color }) => <LayoutDashboard size={20} color={color} /> }} />
      <Drawer.Screen name="Appointments" component={AppointmentsStack} options={{ drawerIcon: ({ color }) => <CalendarCheck size={20} color={color} /> }} />
      <Drawer.Screen name="Records" component={MyRecordsScreen} options={{ drawerIcon: ({ color }) => <FileText size={20} color={color} /> }} />
      <Drawer.Screen name="Health Buddy" component={HealthBuddyScreen} options={{ drawerIcon: ({ color }) => <HeartPulse size={20} color={color} /> }} />
      <Drawer.Screen name="Clinic Finder" component={ClinicFinderScreen} options={{ drawerIcon: ({ color }) => <Map size={20} color={color} /> }} />
      <Drawer.Screen name="Book a Service" component={BookingStack} options={{ drawerIcon: ({ color }) => <CalendarPlus size={20} color={color} /> }} />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us', drawerIcon: ({ color }) => <Info size={20} color={color} /> }} />
      <Drawer.Screen name="Profile" component={ProfileStackNavigator} options={{ drawerIcon: ({ color }) => <User size={20} color={color} /> }} />
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
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="Register" component={RegisterScreen} />
      <AuthStack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
    </AuthStack.Navigator>
  );
}

function Root() {
  const { user, profile, isLoading } = useAuth();

  if (isLoading) {
    return null; // Or a loading spinner
  }

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false }}>
      {!user ? (
        <RootStack.Screen name="Auth" component={AuthFlow} />
      ) : !profile?.first_name ? (
        <RootStack.Screen name="CreateProfile" component={CreateProfileScreen} />
      ) : (
        <RootStack.Screen name="Main" component={AppDrawer} />
      )}
    </RootStack.Navigator>
  );
}

export function RootAppNavigator() {
  return (
    <NavigationContainer>
      <Root />
    </NavigationContainer>
  );
}