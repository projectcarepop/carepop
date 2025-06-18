import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, Button, Linking, Platform } from 'react-native';
import MapView, { Marker, Callout } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';
import { theme } from '../components';

interface Clinic {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
}

const ClinicFinderMapScreen = () => {
    const navigation = useNavigation();
    const [clinics, setClinics] = useState<Clinic[]>([]);
    const [userLocation, setUserLocation] = useState<Location.LocationObject | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [destination, setDestination] = useState<Clinic | null>(null);
    const mapRef = useRef<MapView>(null);

    const GOOGLE_MAPS_API_KEY = Constants.expoConfig?.extra?.GOOGLE_MAPS_API_KEY;

    useEffect(() => {
        if (!GOOGLE_MAPS_API_KEY) {
            setError("Google Maps API key is missing. Directions service will not work.");
        }
        const initialize = async () => {
            try {
                // Request location permissions
                let { status } = await Location.requestForegroundPermissionsAsync();
                if (status !== 'granted') {
                    setError('Permission to access location was denied');
                    setLoading(false);
                    return;
                }

                // Get user's current location
                let location = await Location.getCurrentPositionAsync({});
                setUserLocation(location);
                
                // Fetch clinics
                const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
                if (!backendUrl) {
                    throw new Error('Backend URL is not configured.');
                }
                const response = await fetch(`${backendUrl}/api/v1/public/clinics`);
                if (!response.ok) {
                    throw new Error('Failed to fetch clinics');
                }
                const data = await response.json();
                setClinics(data.data.clinics);
            } catch (e) {
                setError(e instanceof Error ? e.message : 'An unknown error occurred');
            } finally {
                setLoading(false);
            }
        };

        initialize();
    }, []);

    const handleSelectClinic = (clinic: Clinic) => {
        setDestination(clinic);
        // Animate to fit the route
        if (mapRef.current && userLocation) {
            mapRef.current.fitToCoordinates(
                [
                    { latitude: userLocation.coords.latitude, longitude: userLocation.coords.longitude },
                    { latitude: clinic.latitude, longitude: clinic.longitude },
                ],
                {
                    edgePadding: { top: 100, right: 50, bottom: 50, left: 50 },
                    animated: true,
                }
            );
        }
    };

    const openInMaps = (clinic: Clinic) => {
        const scheme = Platform.select({ ios: 'maps:0,0?q=', android: 'geo:0,0?q=' });
        const latLng = `${clinic.latitude},${clinic.longitude}`;
        const label = clinic.name;
        const url = Platform.select({
            ios: `${scheme}${label}@${latLng}`,
            android: `${scheme}${latLng}(${label})`
        });

        if (url) {
            Linking.openURL(url);
        }
    };

  return (
    <View style={styles.container}>
        <Appbar.Header style={{ backgroundColor: theme.colors.background }}>
            <Appbar.BackAction onPress={() => navigation.goBack()} color={theme.colors.foreground} />
            <Appbar.Content title="Clinic Finder" color={theme.colors.foreground} titleStyle={styles.appbarTitle} />
        </Appbar.Header>
        {loading && (
            <View style={styles.overlay}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        )}
        {error && (
            <View style={styles.overlay}>
                <Text style={styles.errorText}>{error}</Text>
            </View>
        )}
        {!loading && !error && (
            <MapView 
                ref={mapRef}
                style={styles.map}
                initialRegion={{
                    latitude: userLocation ? userLocation.coords.latitude : 14.6760,
                    longitude: userLocation ? userLocation.coords.longitude : 121.0437,
                    latitudeDelta: 0.15,
                    longitudeDelta: 0.08,
                }}
            >
                {userLocation && (
                    <Marker
                        coordinate={{
                            latitude: userLocation.coords.latitude,
                            longitude: userLocation.coords.longitude,
                        }}
                        title="Your Location"
                        pinColor={theme.colors.secondary} // Differentiate user's location
                    />
                )}
                {clinics.map(clinic => (
                    <Marker
                        key={clinic.id}
                        coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
                        title={clinic.name}
                    >
                        <Callout tooltip>
                            <View style={styles.calloutView}>
                                <Text style={styles.calloutTitle}>{clinic.name}</Text>
                                <Button title="See Route" onPress={() => handleSelectClinic(clinic)} color={theme.colors.primary} />
                                {destination && destination.id === clinic.id && (
                                    <View style={{ marginTop: theme.spacing.sm }}>
                                        <Button title="Get Directions" onPress={() => openInMaps(clinic)} color={theme.colors.secondary} />
                                    </View>
                                )}
                            </View>
                        </Callout>
                    </Marker>
                ))}
                {userLocation && destination && GOOGLE_MAPS_API_KEY && (
                    <MapViewDirections
                        origin={{
                            latitude: userLocation.coords.latitude,
                            longitude: userLocation.coords.longitude,
                        }}
                        destination={{
                            latitude: destination.latitude,
                            longitude: destination.longitude,
                        }}
                        apikey={GOOGLE_MAPS_API_KEY}
                        strokeWidth={4}
                        strokeColor={theme.colors.primary}
                    />
                )}
            </MapView>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  appbarTitle: {
    ...theme.typography.h4,
    color: theme.colors.foreground,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    top: 60, // Adjust based on Appbar height, or use a better layout method
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
  },
  errorText: {
    ...theme.typography.body,
    color: theme.colors.destructive,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  instructionsContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: theme.colors.card,
    padding: 15,
    borderRadius: theme.radius.lg,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instructionsText: {
    ...theme.typography.body,
    fontWeight: 'bold',
  },
  calloutView: {
    padding: theme.spacing.md,
    minWidth: 150,
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    borderColor: theme.colors.border,
    borderWidth: 1,
  },
  calloutTitle: {
    ...theme.typography.h4,
    color: theme.colors.cardForeground,
    marginBottom: theme.spacing.sm,
  },
});

export default ClinicFinderMapScreen; 