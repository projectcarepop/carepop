import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Dimensions, ActivityIndicator, Text, Button } from 'react-native';
import MapView, { Marker, Callout, Polyline } from 'react-native-maps';
import { Appbar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import Constants from 'expo-constants';
import * as Location from 'expo-location';

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
    const [route, setRoute] = useState<any>(null);
    const [isNavigating, setIsNavigating] = useState(false);

    useEffect(() => {
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

    const handleNavigation = async (clinic: Clinic) => {
        if (!userLocation) {
            setError("Could not determine your location to start navigation.");
            return;
        }

        setIsNavigating(true);
        setLoading(true);

        try {
            const backendUrl = Constants.expoConfig?.extra?.EXPO_PUBLIC_BACKEND_API_URL;
            const response = await fetch(`${backendUrl}/api/v1/public/navigation/route`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    start: { lat: userLocation.coords.latitude, lon: userLocation.coords.longitude },
                    end: { lat: clinic.latitude, lon: clinic.longitude },
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch route.');
            }
            const routeData = await response.json();
            setRoute(routeData.data);
        } catch (e) {
            setError(e instanceof Error ? e.message : 'Failed to get route');
        } finally {
            setLoading(false);
        }
    };

  return (
    <View style={styles.container}>
        <Appbar.Header>
            <Appbar.BackAction onPress={() => navigation.goBack()} />
            <Appbar.Content title="Clinic Finder" />
        </Appbar.Header>
        {loading && (
            <View style={styles.overlay}>
                <ActivityIndicator size="large" />
            </View>
        )}
        {error && (
            <View style={styles.overlay}>
                <Text>{error}</Text>
            </View>
        )}
        {!loading && !error && (
            <MapView 
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
                        pinColor="blue" // Differentiate user's location
                    />
                )}
                {clinics.map(clinic => (
                    <Marker
                        key={clinic.id}
                        coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
                        title={clinic.name}
                    >
                        <Callout onPress={() => handleNavigation(clinic)}>
                            <View>
                                <Text>{clinic.name}</Text>
                                <Button title="Navigate" />
                            </View>
                        </Callout>
                    </Marker>
                ))}
            </MapView>
        )}
        {isNavigating && route && (
            <View style={styles.instructionsContainer}>
                <Text style={styles.instructionsText}>
                    Next: {route.instructions[0].instruction}
                </Text>
            </View>
        )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    top: 60, // Adjust based on Appbar height, or use a better layout method
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  instructionsContainer: {
    position: 'absolute',
    top: 80,
    left: 20,
    right: 20,
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  instructionsText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ClinicFinderMapScreen; 