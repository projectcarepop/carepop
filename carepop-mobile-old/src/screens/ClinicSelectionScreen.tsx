import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { theme } from '../components';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { BookingStackParamList, DrawerParamList } from '../navigation/AppNavigator';
import type { DrawerNavigationProp } from '@react-navigation/drawer';
import { useAuth } from '../context/AuthContext';
import Constants from 'expo-constants';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';

// Define the structure of a Clinic object
interface Clinic {
  id: string;
  name: string;
  address: string;
  city: string; // Assuming city and province are available
  province: string;
}

type ClinicSelectionNavigationProp = NavigationProp<BookingStackParamList, 'ClinicSelection'>;

export const ClinicSelectionScreen = () => {
  const navigation = useNavigation<ClinicSelectionNavigationProp>();
  const { session } = useAuth();
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const insets = useSafeAreaInsets();

  // Animation
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  const fetchClinics = useCallback(async () => {
    if (!session) {
      setError('You must be logged in to view clinics.');
      setIsLoading(false);
      return;
    }

    const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
    if (!backendUrl) {
      setError('Backend URL not configured.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch(`${backendUrl}/api/v1/public/clinics`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch clinics.');
      }
      
      setClinics(data.data || []);
    } catch (e: any) {
      setError(e.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
    fetchClinics();
  }, [fetchClinics, opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
      flex: 1,
    };
  });

  const handleSelectClinic = (clinic: Clinic) => {
    navigation.navigate('ServiceSelection', {
      clinicId: clinic.id,
      clinicName: clinic.name,
    });
  };

  const renderClinicItem = ({ item }: { item: Clinic }) => (
    <TouchableOpacity onPress={() => handleSelectClinic(item)} style={styles.clinicCard}>
      <View style={styles.cardIconContainer}>
        <Ionicons name="business-outline" size={32} color={theme.colors.primary} />
      </View>
      <View style={styles.cardTextContainer}>
        <Text style={styles.cardTitle}>{item.name}</Text>
        <Text style={styles.cardSubtitle} numberOfLines={2}>{item.address}</Text>
        <Text style={styles.cardLocation}>{`${item.city}, ${item.province}`}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={theme.colors.mutedForeground} />
    </TouchableOpacity>
  );

  const styles = useMemo(
    () =>
      StyleSheet.create({
        safeArea: {
          flex: 1,
          backgroundColor: theme.colors.background,
        },
        menuButton: {
          position: 'absolute',
          top: insets.top + theme.spacing.sm,
          left: insets.left + theme.spacing.xl,
          zIndex: 10,
          backgroundColor: theme.colors.background,
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        listContainer: {
          paddingHorizontal: theme.spacing.xl,
          paddingTop: insets.top + 70,
          paddingBottom: insets.bottom + theme.spacing.lg,
        },
        centeredContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: theme.spacing.xl,
        },
        screenTitle: {
          ...theme.typography.h1,
          fontFamily: theme.typography.fontFamilyBold,
          color: theme.colors.foreground,
          marginBottom: theme.spacing.lg,
        },
        placeholderText: {
          ...theme.typography.h3,
          fontFamily: theme.typography.fontFamilySemiBold,
          color: theme.colors.mutedForeground,
          textAlign: 'center',
          marginTop: theme.spacing.md,
        },
        loadingText: {
          ...theme.typography.body,
          fontFamily: theme.typography.fontFamily,
          marginTop: theme.spacing.md,
          color: theme.colors.mutedForeground,
        },
        errorTextTitle: {
          ...theme.typography.h3,
          fontFamily: theme.typography.fontFamilySemiBold,
          color: theme.colors.destructive,
          marginTop: theme.spacing.md,
          marginBottom: theme.spacing.sm,
          textAlign: 'center',
        },
        errorText: {
          ...theme.typography.body,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
          textAlign: 'center',
        },
        clinicCard: {
          flexDirection: 'row',
          alignItems: 'center',
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.lg,
          padding: theme.spacing.lg,
          marginBottom: theme.spacing.md,
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        cardIconContainer: {
          marginRight: theme.spacing.md,
          backgroundColor: theme.colors.accent,
          padding: theme.spacing.md,
          borderRadius: theme.radius.full,
        },
        cardTextContainer: {
          flex: 1,
          marginRight: theme.spacing.sm,
        },
        cardTitle: {
          ...theme.typography.h4,
          fontFamily: theme.typography.fontFamilySemiBold,
          color: theme.colors.foreground,
          marginBottom: theme.spacing.xs,
        },
        cardSubtitle: {
          ...theme.typography.body,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
          marginBottom: theme.spacing.xs,
        },
        cardLocation: {
          ...theme.typography.small,
          fontFamily: theme.typography.fontFamilyMedium,
          color: theme.colors.primary,
        },
      }),
    [insets]
  );

  if (isLoading) {
    return (
      <View style={[styles.safeArea, styles.centeredContainer]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Loading Clinics...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={[styles.safeArea, styles.centeredContainer]}>
        <Ionicons name="alert-circle-outline" size={48} color={theme.colors.destructive} />
        <Text style={styles.errorTextTitle}>Something went wrong</Text>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.safeArea}>
      <TouchableOpacity
        onPress={() => navigation.getParent<DrawerNavigationProp<DrawerParamList>>()?.toggleDrawer()}
        style={styles.menuButton}
      >
        <Ionicons name="menu" size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <Animated.View style={animatedStyle}>
        <FlatList
          data={clinics}
          renderItem={renderClinicItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContainer}
          ListHeaderComponent={<Text style={styles.screenTitle}>Find a Clinic</Text>}
          ListEmptyComponent={
            <View style={styles.centeredContainer}>
              <Ionicons name="search-outline" size={48} color={theme.colors.mutedForeground} />
              <Text style={styles.placeholderText}>No clinics are available at this time.</Text>
            </View>
          }
        />
      </Animated.View>
    </View>
  );
}; 