import React from 'react';
import { createDrawerNavigator, DrawerContentScrollView, DrawerItem, DrawerItemList } from '@react-navigation/drawer';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { theme } from '../components/theme';
import { LayoutDashboard, CalendarPlus, CalendarCheck, Map, FileText, HeartPulse, Info, User, LogOut, UserCircle } from 'lucide-react-native';

// Screen Imports
import { DashboardScreen } from '../screens/DashboardScreen';
import { MyAppointmentsScreen } from '../screens/MyAppointmentsScreen';
import { AppointmentDetailScreen } from '../screens/AppointmentDetailScreen';
import { BookingNavigator } from './BookingNavigator';
import { ClinicFinderScreen } from '../screens/ClinicFinderScreen';
import HealthBuddyScreen from '../screens/HealthBuddyScreen';
import { MyRecordsScreen } from '../screens/MyRecordsScreen';
import { RecordDetailScreen } from '../screens/RecordDetailScreen';
import { AboutUsScreen } from '../screens/AboutUsScreen';
import { MyProfileScreen } from '../screens/MyProfileScreen';
import { ProfileNavigator } from './ProfileNavigator';

// --- Param Lists ---
export type AppointmentsStackParamList = {
  MyAppointments: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type RecordsStackParamList = {
  MyRecords: undefined;
  RecordDetail: { recordId: string };
};

export type DrawerParamList = {
  Dashboard: undefined;
  Appointments: undefined;
  Records: undefined;
  'Health Buddy': undefined;
  'Book a Service': undefined;
  'Clinic Finder': undefined;
  AboutUs: undefined;
  Profile: undefined;
};

// --- Navigators ---
const AppointmentsStackNav = createNativeStackNavigator<AppointmentsStackParamList>();
const RecordsStackNav = createNativeStackNavigator<RecordsStackParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

// --- Nested Stack Navigator ---
function AppointmentsNavigator() {
  return (
    <AppointmentsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <AppointmentsStackNav.Screen name="MyAppointments" component={MyAppointmentsScreen} />
      <AppointmentsStackNav.Screen name="AppointmentDetail" component={AppointmentDetailScreen} />
    </AppointmentsStackNav.Navigator>
  );
}

function RecordsNavigator() {
  return (
    <RecordsStackNav.Navigator screenOptions={{ headerShown: false }}>
      <RecordsStackNav.Screen name="MyRecords" component={MyRecordsScreen} />
      <RecordsStackNav.Screen name="RecordDetail" component={RecordDetailScreen} />
    </RecordsStackNav.Navigator>
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
          onPress={() => signOut()}
          inactiveTintColor={theme.colors.destructive}
          labelStyle={{ ...theme.typography.body, fontFamily: theme.typography.fontFamilyMedium }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

// --- Main App Drawer Navigator ---
export function AppDrawerNavigator() {
  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerActiveBackgroundColor: theme.colors.muted,
        drawerActiveTintColor: theme.colors.primary,
        drawerInactiveTintColor: theme.colors.secondary,
        drawerLabelStyle: { ...theme.typography.body, fontFamily: theme.typography.fontFamilyMedium, marginLeft: 0 },
        drawerItemStyle: { borderRadius: theme.radius.md, marginVertical: 2, marginHorizontal: theme.spacing.md },
        drawerStyle: { borderTopRightRadius: theme.radius.lg, borderBottomRightRadius: theme.radius.lg, backgroundColor: theme.colors.background },
      }}
    >
      <Drawer.Screen name="Dashboard" component={DashboardScreen} options={{ drawerIcon: ({ color }: { color: string }) => <LayoutDashboard size={20} color={color} /> }} />
      <Drawer.Screen name="Appointments" component={AppointmentsNavigator} options={{ drawerIcon: ({ color }: { color: string }) => <CalendarCheck size={20} color={color} /> }} />
      <Drawer.Screen name="Book a Service" component={BookingNavigator} options={{ drawerIcon: ({ color }: { color: string }) => <CalendarPlus size={20} color={color} /> }} />
      <Drawer.Screen name="Clinic Finder" component={ClinicFinderScreen} options={{ drawerIcon: ({ color }: { color: string }) => <Map size={20} color={color} /> }} />
      <Drawer.Screen name="Health Buddy" component={HealthBuddyScreen} options={{ drawerIcon: ({ color }: { color: string }) => <HeartPulse size={20} color={color} /> }} />
      <Drawer.Screen name="Records" component={RecordsNavigator} options={{ drawerIcon: ({ color }: { color:string }) => <FileText size={20} color={color} /> }} />
      <Drawer.Screen name="AboutUs" component={AboutUsScreen} options={{ title: 'About Us', drawerIcon: ({ color }: { color: string }) => <Info size={20} color={color} /> }} />
      <Drawer.Screen name="Profile" component={ProfileNavigator} options={{ drawerIcon: ({ color }: { color: string }) => <User size={20} color={color} /> }} />
    </Drawer.Navigator>
  );
}

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