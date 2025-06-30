import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from '@react-navigation/drawer';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
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

// --- Modular Navigator Imports ---
import { OnboardingNavigator } from './OnboardingNavigator';
import { AuthNavigator } from './AuthNavigator';
import { AppDrawerNavigator } from './AppDrawerNavigator';

// --- Screen Imports ---
import CreateProfileScreen from '../screens/NewCreateProfileScreen';
import { SplashScreen } from '../screens/SplashScreen';
import { EditProfileScreen } from '../screens/EditProfileScreen';

// --- Root Param List ---
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined; 
  Auth: undefined;
  Main: undefined; // Represents the AppDrawerNavigator
  CreateProfile: undefined;
  EditProfile: undefined; // For modal presentation over the main app
};

const RootStack = createNativeStackNavigator<RootStackParamList>();

// --- Root Navigator with State Machine Logic ---
export function RootAppNavigator() {
  const { authStatus } = useAuth();
  const [hasOnboarded, setHasOnboarded] = useState<boolean | null>(null);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const onboarded = await AsyncStorage.getItem('hasOnboarded');
        setHasOnboarded(onboarded === 'true');
      } catch (e) {
        console.error("Failed to read onboarding status", e);
        setHasOnboarded(false);
      }
    };
    checkOnboarding();
  }, []);

  if (hasOnboarded === null || authStatus === 'loading') {
    return <SplashScreen />;
}

  return (
    <NavigationContainer>
      <RootStack.Navigator screenOptions={{ headerShown: false }}>
        {authStatus === 'unauthenticated' ? (
          hasOnboarded ? (
            <RootStack.Screen name="Auth" component={AuthNavigator} />
          ) : (
            <RootStack.Screen name="Onboarding" component={OnboardingNavigator} />
          )
        ) : authStatus === 'no-profile' ? (
          <RootStack.Screen name="CreateProfile" component={CreateProfileScreen} />
        ) : (
          <RootStack.Group>
            <RootStack.Screen name="Main" component={AppDrawerNavigator} />
            <RootStack.Screen name="EditProfile" component={EditProfileScreen} />
          </RootStack.Group>
        )}
      </RootStack.Navigator>
    </NavigationContainer>
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