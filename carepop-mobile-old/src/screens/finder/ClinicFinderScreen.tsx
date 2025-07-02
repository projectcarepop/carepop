import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  Platform,
  ActionSheetIOS,
  Linking,
  Alert,
  ListRenderItem,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { MapPin, Search, X, RotateCw, Crosshair, ArrowLeft, Navigation } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import MapViewDirections from 'react-native-maps-directions';
import { GestureHandlerRootView, PanGestureHandler, PanGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  useAnimatedGestureHandler,
  withTiming,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import { useNavigation } from '@react-navigation/native';
import { type NativeStackNavigationProp } from '@react-navigation/native-stack';

import {
  searchClinicsForFinder,
  getPublicClinics,
} from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { theme } from '../../components/theme';
import { Clinic } from '../../lib/types';
import { Button } from '../../components/button.native';
import { type ClinicFinderStackParamList } from '../../navigation/AppDrawerNavigator';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const GOOGLE_MAPS_API_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY;

// --- Custom Bottom Sheet Constants ---
const SHEET_MAX_HEIGHT = screenHeight * 0.85;
const DIRECTIONS_CARD_HEIGHT = 280;
const SHEET_HEADER_HEIGHT = 80;

const SNAP_POINT_FULL = screenHeight - SHEET_MAX_HEIGHT;
const SNAP_POINT_MID = screenHeight * 0.5;
const SNAP_POINT_DIRECTIONS = screenHeight - DIRECTIONS_CARD_HEIGHT - SHEET_HEADER_HEIGHT;

const MAP_DELTA = {
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const ZOOMED_IN_MAP_DELTA = {
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
}

const DEFAULT_REGION = {
    latitude: 14.5995, // Metro Manila
    longitude: 120.9842,
    ...MAP_DELTA,
};

type Filters = {
  q?: string;
  lat?: number;
  lon?: number;
  radius?: number; // in meters
};

const RADIUS_OPTIONS_KM = [5, 10, 25, 50];

// --- Reusable Components ---

const ClinicCard = React.memo(function ClinicCard({ item, isSelected }: { item: Clinic; isSelected: boolean }) {
    return (
        <View style={[styles.card, isSelected && styles.selectedCard]}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>{item.address?.street}, {item.address?.city}</Text>
          {item.distance != null && (
            <View style={styles.distanceContainer}>
              <MapPin size={14} color={theme.colors.primary} />
              <Text style={styles.cardDistance}>{(item.distance / 1000).toFixed(1)} km away</Text>
            </View>
          )}
        </View>
    );
});

const EmptyState = () => (
  <View style={styles.centered}>
    <Search size={48} color={theme.colors.secondary} style={{ marginBottom: theme.spacing.md }}/>
    <Text style={styles.emptyStateTitle}>No Clinics Found</Text>
    <Text style={styles.emptyStateSubtitle}>Try adjusting your search or find clinics near you.</Text>
  </View>
);

// --- Main Screen ---

export function ClinicFinderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClinicFinderStackParamList>>();
  const [filters, setFilters] = useState<Filters>({});
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [radius, setRadius] = useState<number>(10); // Default radius in km
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [directions, setDirections] = useState<any>(null);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [currentUserPosition, setCurrentUserPosition] = useState<Location.LocationObjectCoords | null>(null);
  const [directionSteps, setDirectionSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const mapRef = useRef<MapView>(null);
  const flatListRef = useRef<FlatList<Clinic>>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  // --- Reanimated and Gesture Handler Setup ---
  const translateY = useSharedValue(SNAP_POINT_MID);
  const isNavigationActiveSV = useSharedValue(false);
  const isClinicSelectedSV = useSharedValue(false);

  type GestureContext = { startY: number };

  useEffect(() => {
    isNavigationActiveSV.value = isNavigationActive;
  }, [isNavigationActive]);

  useEffect(() => {
    isClinicSelectedSV.value = !!selectedClinic;
    if (selectedClinic) {
      translateY.value = withTiming(SNAP_POINT_DIRECTIONS);
    } else if (!isNavigationActive) {
      translateY.value = withTiming(SNAP_POINT_MID);
    }
  }, [selectedClinic, isNavigationActive, translateY]);


  const gestureHandler = useAnimatedGestureHandler<PanGestureHandlerGestureEvent, GestureContext>({
    onStart: (_, ctx) => {
      ctx.startY = translateY.value;
    },
    onActive: (event, ctx) => {
      translateY.value = ctx.startY + event.translationY;
      translateY.value = Math.max(translateY.value, SNAP_POINT_FULL);
    },
    onEnd: (event) => {
      const snapPoints = isClinicSelectedSV.value
        ? [SNAP_POINT_DIRECTIONS]
        : [SNAP_POINT_FULL, SNAP_POINT_MID];
      
      const projectedY = translateY.value + event.velocityY * 0.1;

      const closestSnapPoint = snapPoints.reduce(
        (prev, curr) => (Math.abs(curr - projectedY) < Math.abs(prev - projectedY) ? curr : prev)
      );

      translateY.value = withSpring(closestSnapPoint, { damping: 15, stiffness: 150 });
    },
  });

  const animatedSheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
  }));
  // --- End Reanimated Setup ---

  const isFilterActive = useMemo(() => !!(filters.q || (filters.lat && filters.lon)), [filters]);

  useEffect(() => {
    if (isNavigationActive) {
      // Close sheet if open
      translateY.value = withTiming(screenHeight);
    } else if (selectedClinic) {
      translateY.value = withTiming(SNAP_POINT_DIRECTIONS)
    } else {
      translateY.value = withTiming(SNAP_POINT_MID);
    }
  }, [isNavigationActive]);

  useEffect(() => {
    const startWatching = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Permission to access location is required for navigation.');
        setIsNavigationActive(false);
        return;
      }

      locationSubscription.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 10,
        },
        (location) => {
          setCurrentUserPosition(location.coords);
          mapRef.current?.animateCamera({
            center: location.coords,
            pitch: 45,
            heading: location.coords.heading ?? 0,
            zoom: 18,
          }, { duration: 500 });
        }
      );
    };

    const stopWatching = () => {
      if (locationSubscription.current) {
        locationSubscription.current.remove();
        locationSubscription.current = null;
      }
      setCurrentUserPosition(null);
      setDirectionSteps([]);
      setCurrentStepIndex(0);
    };

    if (isNavigationActive) {
      startWatching();
    } else {
      stopWatching();
    }

    return () => {
      stopWatching(); // Cleanup on unmount
    };
  }, [isNavigationActive]);

  useEffect(() => {
    if (!isNavigationActive || !currentUserPosition || directionSteps.length === 0 || currentStepIndex >= directionSteps.length -1) {
      return;
    }

    const nextStep = directionSteps[currentStepIndex + 1];
    if (!nextStep) return;

    const distanceToNextStep = getDistance(currentUserPosition, nextStep.start_location);

    if (distanceToNextStep < 20) {
      setCurrentStepIndex(prev => prev + 1);
    }

  }, [currentUserPosition, directionSteps, currentStepIndex, isNavigationActive]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, q: debouncedSearchText }));
  }, [debouncedSearchText]);
  
  const isSearchActive = !!filters.q || (!!filters.lat && !!filters.lon);
  
  const isLocationSearch = !!filters.lat && !!filters.lon;

  const clinicsQuery = useQuery<Clinic[], Error>({
    queryKey: ['clinics', { lat: filters.lat, lon: filters.lon, radius: filters.radius }],
    queryFn: () => {
      if (isLocationSearch) {
        return searchClinicsForFinder(filters).then(clinics => {
            // This logic is needed here now since we cannot modify api.ts
            return clinics.map((clinic: any) => {
                if (clinic.location && typeof clinic.location === 'string') {
                    const match = clinic.location.match(/POINT\\(([-\\d.]+) ([-\\d.]+)\\)/);
                    if (match) {
                        return { ...clinic, longitude: parseFloat(match[1]), latitude: parseFloat(match[2]) };
                    }
                }
                return clinic;
            });
        });
      }
      return getPublicClinics();
    },
  });

  const filteredClinics = useMemo(() => {
    const clinics = clinicsQuery.data ?? [];
    if (!debouncedSearchText) {
      return clinics;
    }
    return clinics.filter(clinic =>
      clinic.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
    );
  }, [clinicsQuery.data, debouncedSearchText]);

  const isLoading = clinicsQuery.isLoading;

  const handleFindNearMe = async () => {
    setIsFetchingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location access is needed to find nearby clinics.');
      setIsFetchingLocation(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      const coords = { latitude: location.coords.latitude, longitude: location.coords.longitude };
      setUserLocation(coords);
      mapRef.current?.animateToRegion({ ...coords, ...ZOOMED_IN_MAP_DELTA }, 1000);
      setSearchText('');
      setFilters({ lat: coords.latitude, lon: coords.longitude, radius: radius * 1000 });
    } catch (e) {
      Alert.alert("Location Error", "Could not get your current location.");
      console.error("Could not get location", e);
    } finally {
      setIsFetchingLocation(false);
    }
  };
  
  const clearFilters = () => {
      setFilters({});
      setSearchText('');
      setRadius(10);
      setSelectedClinic(null);
      setUserLocation(null);
      setDirections(null);
      setIsNavigationActive(false);
      mapRef.current?.animateToRegion(DEFAULT_REGION, 1000);
      translateY.value = withTiming(SNAP_POINT_MID);
  }
  
  const onMarkerPress = useCallback((clinic: Clinic) => {
    setSelectedClinic(clinic);
    setDirections(null); 
    mapRef.current?.animateToRegion({
      latitude: clinic.latitude,
      longitude: clinic.longitude,
      ...ZOOMED_IN_MAP_DELTA,
    }, 500);
    translateY.value = withTiming(SNAP_POINT_DIRECTIONS);
  }, []);
  
  const handleGetDirections = () => {
    if (!userLocation || !selectedClinic) {
      Alert.alert("Location Needed", "Please use the 'Find Near Me' button first to set your location.");
      return;
    }
    setDirections(null); 
    setIsNavigationActive(true);
  }

  const handleCancelNavigation = () => {
    setIsNavigationActive(false);
    setDirections(null);
    if(selectedClinic){
        onMarkerPress(selectedClinic);
    }
  }

  const instructionText = useMemo(() => {
    if (isLocationSearch) return `Showing clinics near you.`;
    if (debouncedSearchText) return `Showing results for "${debouncedSearchText}".`;
    return "Showing all clinics. Use search or find clinics near you.";
  }, [isLocationSearch, debouncedSearchText]);

  // --- Render methods for Bottom Sheet ---
  
  const renderSearchHeader = () => (
     <View style={styles.controlsContainer}>
        <Text style={styles.instructionText}>{instructionText}</Text>
        <View style={styles.searchInputContainer}>
          <Search size={20} color={theme.colors.secondary} style={styles.searchIcon} />
          <TextInput
            placeholder="Search by clinic name..."
            value={searchText}
            onChangeText={setSearchText}
            style={styles.searchInput}
            placeholderTextColor={theme.colors.secondary}
          />
          {searchText.length > 0 && (
             <TouchableOpacity onPress={() => setSearchText('')} style={styles.clearIcon}>
                <X size={20} color={theme.colors.secondary} />
            </TouchableOpacity>
          )}
        </View>

        {filters.lat && filters.lon && (
            <View style={styles.radiusContainer}>
                <Text style={styles.radiusLabel}>Search within:</Text>
                <ScrollView 
                    horizontal 
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.radiusScrollContainer}
                    style={{ flex: 1 }}
                >
                    {RADIUS_OPTIONS_KM.map(r => (
                        <TouchableOpacity 
                            key={r}
                            style={[styles.radiusButton, radius === r && styles.radiusButtonSelected]}
                            onPress={() => {
                                setRadius(r);
                                if (filters.lat && filters.lon) {
                                    setFilters(prev => ({...prev, radius: r * 1000}));
                                }
                            }}
                        >
                            <Text style={[styles.radiusButtonText, radius === r && styles.radiusButtonTextSelected]}>{r} km</Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>
        )}

        <View style={styles.filterButtons}>
            <Button onPress={handleFindNearMe} disabled={isFetchingLocation} icon={<MapPin size={16} color={theme.colors.primaryForeground} />}>
              Find Near Me
            </Button>
            {isFilterActive && (
                 <Button onPress={clearFilters} variant="secondary" icon={<X size={16} color={theme.colors.accentForeground} />}>
                    Clear
                </Button>
            )}
        </View>
         {clinicsQuery.isFetching && <ActivityIndicator style={styles.refetchingIndicator} color={theme.colors.primary} />}
      </View>
  )
  
  const DirectionInstructionCard = () => {
    if (!isNavigationActive || directionSteps.length === 0 || currentStepIndex >= directionSteps.length) {
        return null;
    }

    const step = directionSteps[currentStepIndex];
    const instruction = step.html_instructions.replace(/<[^>]*>/g, '');
    const distance = step.distance.text;

    return (
        <View style={styles.instructionCard}>
            <Text style={styles.instructionText_L}>{instruction}</Text>
            <Text style={styles.instructionDistance}>{distance}</Text>
        </View>
    );
  }

  const renderDirectionsCard = () => (
      <View style={styles.directionsContainer}>
          <View style={styles.directionsHeader}>
              <TouchableOpacity onPress={() => { setSelectedClinic(null); setDirections(null); }} style={styles.backButton}>
                  <ArrowLeft size={24} color={theme.colors.primary} />
              </TouchableOpacity>
              <Text style={styles.directionsTitle} numberOfLines={1}>{selectedClinic?.name}</Text>
          </View>
          <Text style={styles.directionsAddress} numberOfLines={2}>{selectedClinic?.address?.street}, {selectedClinic?.address?.barangay}, {selectedClinic?.address?.city}</Text>
          
          {directions && (
              <View style={styles.directionsInfo}>
                  <Text style={styles.directionsInfoText}>{directions.duration.text}</Text>
                  <Text style={styles.directionsInfoSeparator}>•</Text>
                  <Text style={styles.directionsInfoText}>{directions.distance.text}</Text>
              </View>
          )}

          <View style={styles.buttonRow}>
            <Button onPress={handleGetDirections} style={styles.buttonFlex}>Get Directions</Button>
            <Button 
                variant="secondary" 
                style={styles.buttonFlex}
                onPress={() => {
                    if (selectedClinic) {
                        navigation.navigate('ClinicDetail', { clinicId: selectedClinic.id });
                    }
                }}
            >
                View Details
            </Button>
          </View>
      </View>
  );

  const renderItem: ListRenderItem<Clinic> = ({ item }) => (
    <TouchableOpacity onPress={() => onMarkerPress(item)}>
      <ClinicCard item={item} isSelected={selectedClinic?.id === item.id} />
    </TouchableOpacity>
  );

  return (
    <GestureHandlerRootView style={{flex: 1}}>
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
          {filteredClinics.map((clinic) => (
              <Marker
                key={clinic.id}
                coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
                title={clinic.name}
                onPress={() => onMarkerPress(clinic)}
                pinColor={selectedClinic?.id === clinic.id ? theme.colors.primary : theme.colors.accent}
              />
          ))}
          {userLocation && (
              <Marker
                  coordinate={userLocation}
                  title="Your Location"
              >
                  <View style={styles.userLocationMarker}>
                      <View style={styles.userLocationMarkerCore} />
                  </View>
              </Marker>
          )}
          {currentUserPosition && (
              <Marker
                  anchor={{ x: 0.5, y: 0.5 }}
                  coordinate={currentUserPosition}
              >
                <View style={[styles.navigationArrow]}>
                    <Navigation size={18} color="white" style={{ transform: [{ rotate: '-45deg' }]}} />
                </View>
              </Marker>
          )}
          {isNavigationActive && userLocation && selectedClinic && GOOGLE_MAPS_API_KEY && (
              <MapViewDirections 
                origin={userLocation}
                destination={{latitude: selectedClinic.latitude, longitude: selectedClinic.longitude}}
                apikey={GOOGLE_MAPS_API_KEY}
                strokeWidth={5}
                strokeColor={theme.colors.primary}
                onReady={result => {
                    setDirections(result);
                    if (result.legs[0]?.steps) {
                      setDirectionSteps(result.legs[0].steps);
                      setCurrentStepIndex(0);
                    }
                    mapRef.current?.fitToCoordinates(result.coordinates, {
                        edgePadding: { top: 150, right: 50, bottom: 100, left: 50 },
                        animated: true,
                    });
                }}
              />
          )}
      </MapView>

      <DirectionInstructionCard />

      {isNavigationActive && (
          <TouchableOpacity style={styles.cancelNavButton} onPress={handleCancelNavigation}>
              <X size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.recenterButton} onPress={handleFindNearMe}>
        <Crosshair size={24} color={theme.colors.foreground} />
      </TouchableOpacity>

      <PanGestureHandler onGestureEvent={gestureHandler}>
        <Animated.View style={[styles.sheet, animatedSheetStyle]}>
          <View style={styles.handle} />
          {selectedClinic ? (
            renderDirectionsCard()
          ) : (
            <FlatList
              ref={flatListRef}
              data={filteredClinics}
              keyExtractor={(item) => item.id}
              renderItem={renderItem}
              ListHeaderComponent={renderSearchHeader}
              ListEmptyComponent={!isLoading ? <EmptyState /> : null}
              contentContainerStyle={styles.listContent}
            />
          )}
        </Animated.View>
      </PanGestureHandler>
    </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  controlsContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  instructionText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: { marginRight: theme.spacing.sm, },
  clearIcon: { marginLeft: theme.spacing.sm, },
  searchInput: {
    flex: 1,
    ...theme.typography.body,
    height: 44,
  },
  radiusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.md,
  },
  radiusScrollContainer: {
    alignItems: 'center',
  },
  radiusLabel: {
    ...theme.typography.body,
    marginRight: theme.spacing.md,
    color: theme.colors.secondary,
  },
  radiusButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginHorizontal: theme.spacing.xs,
  },
  radiusButtonSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  radiusButtonText: {
    ...theme.typography.body,
  },
  radiusButtonTextSelected: {
    color: theme.colors.primaryForeground,
    fontFamily: theme.typography.fontFamilySemiBold,
  },
  filterButtons: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'flex-end',
    marginTop: theme.spacing.md,
    gap: theme.spacing.md,
  },
  refetchingIndicator: {
    paddingVertical: theme.spacing.md,
  },
  listContent: {
    backgroundColor: theme.colors.background,
    paddingBottom: 40,
  },
  centered: {
    minHeight: screenHeight * 0.2,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.xl,
  },
  emptyStateTitle: {
    ...theme.typography.h3,
    marginTop: theme.spacing.md,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.card,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  selectedCard: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  cardTitle: { ...theme.typography.h4, },
  cardAddress: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    backgroundColor: theme.colors.muted,
    padding: theme.spacing.xs,
    borderRadius: theme.radius.md,
    alignSelf: 'flex-start',
  },
  cardDistance: {
    ...theme.typography.body,
    color: theme.colors.primary,
    marginLeft: theme.spacing.xs,
  },
  recenterButton: {
      position: 'absolute',
      top: 60,
      right: 20,
      backgroundColor: theme.colors.background,
      padding: theme.spacing.md,
      borderRadius: theme.radius.full,
      elevation: 5,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 3.84,
  },
  cancelNavButton: {
    position: 'absolute',
    top: 60,
    left: 20,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.md,
    borderRadius: theme.radius.full,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  userLocationMarker: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(0, 122, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  userLocationMarkerCore: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary,
    borderWidth: 1.5,
    borderColor: 'white',
  },
  navigationArrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: 'white',
    elevation: 10,
  },
  directionsContainer: {
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.background,
    flex: 1,
  },
  directionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.md,
  },
  backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
  },
  directionsTitle: {
      ...theme.typography.h3,
      flex: 1,
  },
  directionsAddress: {
      ...theme.typography.body,
      color: theme.colors.secondary,
      marginBottom: theme.spacing.lg,
      marginLeft: 52, // Align with title
  },
  directionsInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: theme.spacing.lg,
  },
  directionsInfoText: {
      ...theme.typography.h4,
  },
  directionsInfoSeparator: {
      marginHorizontal: theme.spacing.md,
      color: theme.colors.secondary,
  },
  instructionCard: {
    position: 'absolute',
    top: 60,
    left: '10%',
    right: '10%',
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.lg,
    alignItems: 'center',
    elevation: 11,
  },
  instructionText_L: {
    ...theme.typography.h4,
    color: 'white',
    textAlign: 'center',
  },
  instructionDistance: {
    ...theme.typography.body,
    color: 'white',
    opacity: 0.9,
    marginTop: theme.spacing.xs,
  },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: screenHeight,
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4.65,
    elevation: 6,
  },
  handle: {
    alignSelf: 'center',
    width: 50,
    height: 5,
    borderRadius: 4,
    backgroundColor: theme.colors.border,
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  buttonFlex: {
    flex: 1,
  },
});

function getDistance(
  coord1: { latitude: number; longitude: number },
  coord2: { latitude: number; longitude: number }
) {
  const R = 6371e3; // metres
  const p1 = (coord1.latitude * Math.PI) / 180;
  const p2 = (coord2.latitude * Math.PI) / 180;
  const deltaP = p2 - p1;
  const deltaL = (coord2.longitude - coord1.longitude) * Math.PI / 180;

  const a =
    Math.sin(deltaP / 2) * Math.sin(deltaP / 2) +
    Math.cos(p1) * Math.cos(p2) * Math.sin(deltaL / 2) * Math.sin(deltaL / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in metres
} 