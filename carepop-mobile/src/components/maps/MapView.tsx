import React, { forwardRef } from 'react';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { StyleSheet } from 'react-native';
import { theme } from '../../components/theme';

interface MapViewProps {
  initialRegion: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  userLocation?: {
    latitude: number;
    longitude: number;
  };
  clinicLocation: {
    latitude: number;
    longitude: number;
  };
  routeCoordinates?: {
    latitude: number;
    longitude: number;
  }[];
}

export const CustomMapView = forwardRef<MapView, MapViewProps>(({
  initialRegion,
  userLocation,
  clinicLocation,
  routeCoordinates = [],
}, ref) => {
  return (
    <MapView
      ref={ref}
      provider={PROVIDER_GOOGLE}
      style={styles.map}
      initialRegion={initialRegion}
      showsUserLocation
      showsMyLocationButton
    >
      {userLocation && (
        <Marker
          coordinate={userLocation}
          title="Your Location"
          pinColor={theme.colors.primary}
        />
      )}

      <Marker
        coordinate={clinicLocation}
        title="Clinic"
        description="The destination clinic"
        pinColor={theme.colors.secondary}
      />

      {routeCoordinates.length > 0 && (
        <Polyline
          coordinates={routeCoordinates}
          strokeColor={theme.colors.accent}
          strokeWidth={4}
        />
      )}
    </MapView>
  );
});

CustomMapView.displayName = 'CustomMapView';

const styles = StyleSheet.create({
  map: {
    ...StyleSheet.absoluteFillObject,
  },
}); 