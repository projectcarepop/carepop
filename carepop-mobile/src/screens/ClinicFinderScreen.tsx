import React, { useEffect, useMemo, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Button, Alert } from 'react-native';
import { theme } from '../components';
import { Menu, Compass, LocateFixed, ZoomIn, ZoomOut } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import type { DrawerScreenProps } from '@react-navigation/drawer';
import type { DrawerParamList } from '../navigation/AppNavigator';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { CustomMapView } from '../components/maps/MapView';
import { getDirections } from '../utils/api';
import polyline from '@mapbox/polyline';
import { DirectionsBottomSheet } from '../components/maps/DirectionsBottomSheet';
import * as Location from 'expo-location';
import MapView from 'react-native-maps';

// Define a type for the route steps for better type safety
interface RouteStep {
  distance: { text: string; value: number };
  duration: { text: string; value: number };
  html_instructions: string;
  travel_mode: 'DRIVING' | 'WALKING';
}

type ClinicFinderNavigationProp = DrawerScreenProps<
  DrawerParamList,
  'Clinic Finder'
>['navigation'];

/**
 * ClinicFinderScreen will display a map and list of nearby clinics.
 * (Placeholder for now)
 */
export function ClinicFinderScreen() {
  const navigation = useNavigation<ClinicFinderNavigationProp>();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);
  const [routeCoordinates, setRouteCoordinates] = useState<
    { latitude: number; longitude: number }[]
  >([]);
  const [routeSteps, setRouteSteps] = useState<RouteStep[]>([]);
  const [isSheetVisible, setSheetVisible] = useState(false);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Set an initial region to prevent map from showing a default location briefly
  const [mapRegion, setMapRegion] = useState({
    latitude: 14.5995, // Default to Manila
    longitude: 120.9842,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });

  const clinicLocation = {
    latitude: 14.605,
    longitude: 120.99,
  };

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Permission to access location was denied. Please enable it in your settings to use this feature.');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setUserLocation(coords);
      setMapRegion({ ...coords, latitudeDelta: 0.02, longitudeDelta: 0.02 }); // Zoom in on user
    })();
  }, []);

  useEffect(() => {
    if (!userLocation) return;

    const fetchRoute = async () => {
      try {
        const origin = `${userLocation.latitude},${userLocation.longitude}`;
        const destination = `${clinicLocation.latitude},${clinicLocation.longitude}`;
        
        // Using 'driving' mode for this example
        const directionsData = await getDirections(origin, destination, 'driving');
        
        if (directionsData.data && directionsData.data.length > 0) {
          const currentRoute = directionsData.data[0];
          const points = currentRoute.overview_polyline.points;
          const decodedCoords = polyline.decode(points).map((point: [number, number]) => ({
            latitude: point[0],
            longitude: point[1],
          }));
          setRouteCoordinates(decodedCoords);

          // Extract and store the turn-by-turn steps
          if (currentRoute.legs && currentRoute.legs.length > 0) {
            const steps = currentRoute.legs[0].steps;
            setRouteSteps(steps);
          }
        }
      } catch (error) {
        console.error('Failed to fetch route:', error);
        // Optionally, show a toast or message to the user
      }
    };

    fetchRoute();
  }, [clinicLocation, userLocation]);

  const recenterMap = () => {
    if (!userLocation || !mapRef.current) return;
    mapRef.current.animateToRegion({
      ...userLocation,
      latitudeDelta: 0.02,
      longitudeDelta: 0.02,
    });
  };

  // Animation values
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(20);

  useEffect(() => {
    opacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    translateY.value = withTiming(0, { duration: 500, easing: Easing.out(Easing.cubic) });
  }, [opacity, translateY]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [{ translateY: translateY.value }],
    };
  });

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
          backgroundColor: theme.colors.card,
          width: 44,
          height: 44,
          borderRadius: theme.radius.full,
          justifyContent: 'center',
          alignItems: 'center',
          borderWidth: 1,
          borderColor: theme.colors.border,
        },
        container: {
          flex: 1,
        },
        title: {
          ...theme.typography.h1,
          fontFamily: theme.typography.fontFamilyBold,
          color: theme.colors.foreground,
          marginBottom: theme.spacing.lg,
        },
        placeholderText: {
          ...theme.typography.body,
          fontFamily: theme.typography.fontFamily,
          color: theme.colors.mutedForeground,
          textAlign: 'center',
        },
        buttonContainer: {
          position: 'absolute',
          bottom: insets.bottom + 20,
          left: 20,
          right: 20,
        },
        mapControls: {
          position: 'absolute',
          top: insets.top + 20,
          right: 20,
          backgroundColor: 'transparent',
          flexDirection: 'column',
          alignItems: 'center',
        },
        controlButton: {
          backgroundColor: theme.colors.card,
          borderRadius: theme.radius.full,
          padding: theme.spacing.md,
          marginBottom: theme.spacing.md,
          elevation: 4,
          shadowColor: '#000',
          shadowOpacity: 0.1,
          shadowRadius: 4,
          shadowOffset: { width: 0, height: 2 },
        },
      }),
    [insets]
  );

  return (
    <View style={styles.safeArea}>
      <TouchableOpacity onPress={() => navigation.toggleDrawer()} style={styles.menuButton}>
        <Menu size={28} color={theme.colors.foreground} />
      </TouchableOpacity>
      <View style={styles.container}>
        <CustomMapView
          ref={mapRef}
          initialRegion={mapRegion}
          clinicLocation={clinicLocation}
          userLocation={userLocation ?? undefined}
          routeCoordinates={routeCoordinates}
        />
        <View style={styles.mapControls}>
          <TouchableOpacity onPress={recenterMap} style={styles.controlButton}>
            <LocateFixed size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
        </View>
        <View style={styles.buttonContainer}>
          <Button 
            title="Show Directions" 
            onPress={() => setSheetVisible(true)} 
            disabled={routeSteps.length === 0}
          />
        </View>
        {isSheetVisible && (
          <DirectionsBottomSheet 
            onClose={() => setSheetVisible(false)}
            steps={routeSteps} 
          />
        )}
      </View>
    </View>
  );
} 