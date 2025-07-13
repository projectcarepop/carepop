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
  Switch,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { MapPin, Search, X, RotateCw, Crosshair, ArrowLeft, Navigation, Menu, Filter, Clock, Heart, Zap, Stethoscope, Plus, ZoomIn, ZoomOut, Layers, Maximize } from 'lucide-react-native';
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
import { type DrawerNavigationProp } from '@react-navigation/drawer';
import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  searchClinicsForFinder,
  getPublicClinics,
  getMapboxRoute,
} from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { theme } from '../../components/theme';
import { Clinic } from '../../lib/types';
import { Button } from '../../components/button.native';
import { type ClinicFinderStackParamList, type DrawerParamList } from '../../navigation/AppDrawerNavigator';
import MapboxGL from '@rnmapbox/maps';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

MapboxGL.setAccessToken(process.env.EXPO_PUBLIC_MAPBOX_API_KEY || '');

// === CONSTANTS & CONFIGURATION ===

// Map Configuration
const MAP_DELTA = {
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

const ZOOMED_IN_MAP_DELTA = {
    latitudeDelta: 0.02,
    longitudeDelta: 0.02,
};

const DEFAULT_REGION = {
  latitude: 14.5995, // Metro Manila center
    longitude: 120.9842,
    ...MAP_DELTA,
};

// Bottom Sheet Configuration
const SHEET_MAX_HEIGHT = screenHeight * 0.85;
const DIRECTIONS_CARD_HEIGHT = 280;
const SHEET_HEADER_HEIGHT = 80;

const SNAP_POINT_FULL = screenHeight - SHEET_MAX_HEIGHT;
const SNAP_POINT_MID = screenHeight * 0.5;
const SNAP_POINT_DIRECTIONS = screenHeight - DIRECTIONS_CARD_HEIGHT - SHEET_HEADER_HEIGHT;
const SNAP_POINT_HIDDEN = screenHeight - SHEET_HEADER_HEIGHT;

// Performance Configuration
const REGION_CHANGE_THROTTLE_MS = 300; // Throttle map region updates
const LOCATION_UPDATE_INTERVAL_MS = 1000; // GPS update frequency during navigation
const LOCATION_DISTANCE_THRESHOLD_M = 10; // Minimum distance to trigger location update
const NAVIGATION_STEP_PROXIMITY_M = 20; // Distance to next step to advance navigation

// Search Configuration
const SEARCH_DEBOUNCE_MS = 500; // Debounce search input
const DEFAULT_SEARCH_RADIUS_KM = 10; // Default search radius
const RADIUS_OPTIONS_KM = [5, 10, 25, 50]; // Available radius options

// Business Hours Configuration (placeholder for future enhancement)
const BUSINESS_HOURS_START = 8; // 8 AM
const BUSINESS_HOURS_END = 18; // 6 PM

// === TYPE DEFINITIONS ===

type Filters = {
  q?: string;
  lat?: number;
  lon?: number;
  radius?: number; // in meters
  openNow?: boolean;
};

// Utility function for throttling
const throttle = <T extends (...args: any[]) => any>(func: T, delay: number): T => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  let lastExecTime = 0;
  
  return ((...args: any[]) => {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func(...args);
      lastExecTime = currentTime;
    } else {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  }) as T;
};

// === HELPER FUNCTIONS ===

// Determine clinic type based on name and services
const getClinicType = (clinic: Clinic): 'emergency' | 'dental' | 'specialized' | 'general' => {
  const name = clinic.name.toLowerCase();
  const services = (clinic.services || []).map(s => s.name.toLowerCase()).join(' ');
  
  // Emergency/Urgent care
  if (name.includes('emergency') || name.includes('urgent') || name.includes('24') || 
      services.includes('emergency') || services.includes('urgent')) {
    return 'emergency';
  }
  
  // Dental
  if (name.includes('dental') || name.includes('dentist') || 
      services.includes('dental') || services.includes('tooth') || services.includes('oral')) {
    return 'dental';
  }
  
  // Specialized (cardiology, dermatology, etc.)
  if (name.includes('cardio') || name.includes('dermato') || name.includes('neuro') ||
      name.includes('specialist') || name.includes('specialty') ||
      services.includes('cardio') || services.includes('dermato') || services.includes('specialist')) {
    return 'specialized';
  }
  
  return 'general';
};

// Custom marker component with map pin shape and label
const ClinicMarker = React.memo(({ clinic, isSelected }: { clinic: Clinic; isSelected: boolean }) => {
  const clinicType = getClinicType(clinic);
  
  const getMarkerConfig = () => {
    const size = isSelected ? 48 : 40;
    const iconSize = isSelected ? 24 : 20;

    switch (clinicType) {
      case 'emergency':
        return {
          color: '#ef4444', // Red
          icon: <Zap size={iconSize} color="white" />,
          label: clinic.name,
          size,
        };
      case 'dental':
        return {
          color: '#06b6d4', // Cyan
          icon: <Plus size={iconSize} color="white" />,
          label: clinic.name,
          size,
        };
      case 'specialized':
        return {
          color: '#8b5cf6', // Purple
          icon: <Heart size={iconSize} color="white" />,
          label: clinic.name,
          size,
        };
      default:
        return {
          color: isSelected ? theme.colors.primary : '#10b981', // Green
          icon: <Stethoscope size={iconSize} color="white" />,
          label: clinic.name,
          size,
        };
    }
  };

  const { color, icon, label, size } = getMarkerConfig();

  return (
    <View style={styles.markerContainer}>
      {/* Clinic Name Label */}
      <View style={[styles.markerLabel, isSelected && styles.markerLabelSelected]}>
        <Text style={[styles.markerLabelText, isSelected && styles.markerLabelTextSelected]}>
          {label}
        </Text>
      </View>
      
      {/* Map Pin Shape */}
      <View style={styles.markerWrapper}>
        <View style={[
          styles.markerPin,
          {
            width: size,
            height: size,
            backgroundColor: color,
            borderRadius: size / 2,
          },
          isSelected && styles.markerPinSelected
        ]}>
          {icon}
        </View>
        
        {/* Pointed Bottom */}
        <View style={[
          styles.markerPoint,
          { 
            borderLeftWidth: size * 0.25,
            borderRightWidth: size * 0.25,
            borderTopWidth: size * 0.3,
            borderTopColor: color,
          },
          isSelected && styles.markerPointSelected
        ]} />
      </View>
    </View>
  );
}, (prevProps, nextProps) => {
  // Only re-render if clinic ID or selection state changes
  return prevProps.clinic.id === nextProps.clinic.id && 
         prevProps.isSelected === nextProps.isSelected;
});
ClinicMarker.displayName = 'ClinicMarker';

// Clustering logic - REMOVED, will be handled natively by Mapbox

// Cluster marker component - REMOVED, will be handled natively by Mapbox

// Map legend component
const MapLegend = React.memo(() => (
  <View style={styles.mapLegend}>
    <Text style={styles.legendTitle}>Clinic Types</Text>
    <View style={styles.legendItems}>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: '#10b981' }]}>
          <Stethoscope size={12} color="white" />
        </View>
        <Text style={styles.legendText}>General</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: '#ef4444' }]}>
          <Zap size={12} color="white" />
        </View>
        <Text style={styles.legendText}>Emergency</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: '#06b6d4' }]}>
          <Plus size={12} color="white" />
        </View>
        <Text style={styles.legendText}>Dental</Text>
      </View>
      <View style={styles.legendItem}>
        <View style={[styles.legendIcon, { backgroundColor: '#8b5cf6' }]}>
          <Heart size={12} color="white" />
        </View>
        <Text style={styles.legendText}>Specialist</Text>
      </View>
    </View>
  </View>
));
MapLegend.displayName = 'MapLegend';

// Enhanced map controls component
const MapControls = React.memo(({ 
  onZoomIn, 
  onZoomOut, 
  onToggleMapType, 
  mapType 
}: { 
  onZoomIn: () => void; 
  onZoomOut: () => void; 
  onToggleMapType: () => void; 
  mapType: 'standard' | 'satellite';
}) => (
  <View style={styles.mapControls}>
    <TouchableOpacity style={styles.mapControlButton} onPress={onZoomIn}>
      <ZoomIn size={20} color={theme.colors.foreground} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.mapControlButton} onPress={onZoomOut}>
      <ZoomOut size={20} color={theme.colors.foreground} />
    </TouchableOpacity>
    <TouchableOpacity style={styles.mapControlButton} onPress={onToggleMapType}>
      <Layers size={20} color={mapType === 'satellite' ? theme.colors.primary : theme.colors.foreground} />
    </TouchableOpacity>
  </View>
));
MapControls.displayName = 'MapControls';
const formatClinicAddress = (clinic: Clinic): string => {
  // Cast to any to access all possible address field variations
  const c = clinic as any;
  
  // Option 1: Use full_address if available (Supabase format)
  if (c.full_address) {
    return c.full_address;
  }
  
  // Option 2: Build from individual Supabase fields
  if (c.street_address || c.locality || c.region) {
    const parts = [c.street_address, c.locality, c.region].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  // Option 3: Handle address as JSONB object (Drizzle format)
  if (c.address && typeof c.address === 'object') {
    const addr = c.address;
    const parts = [
      addr.street, 
      addr.city || addr.cityMunicipality, 
      addr.province,
      addr.barangay
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  // Option 4: Handle individual address fields (legacy format)
  if (c.street || c.cityMunicipality) {
    const cityName = typeof c.cityMunicipality === 'string' 
      ? c.cityMunicipality 
      : c.cityMunicipality?.name;
    const provinceName = typeof c.province === 'string'
      ? c.province
      : c.province?.name;
    const parts = [c.street, cityName, provinceName].filter(Boolean);
    return parts.length > 0 ? parts.join(', ') : 'Address not available';
  }
  
  return 'Address not available';
};

// --- Reusable Components ---

const ClinicCard = React.memo(function ClinicCard({ item, isSelected }: { item: Clinic; isSelected: boolean }) {
    const formattedAddress = formatClinicAddress(item);
    
    return (
        <View style={[styles.card, isSelected && styles.selectedCard]}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardAddress} numberOfLines={2}>{formattedAddress}</Text>
          {item.distance != null && (
            <View style={styles.distanceContainer}>
              <MapPin size={14} color={theme.colors.primary} />
              <Text style={styles.cardDistance}>{(item.distance / 1000).toFixed(1)} km away</Text>
            </View>
          )}
        </View>
    );
}, (prevProps, nextProps) => {
  // Only re-render if clinic ID, selection state, or distance changes
  return prevProps.item.id === nextProps.item.id && 
         prevProps.isSelected === nextProps.isSelected &&
         prevProps.item.distance === nextProps.item.distance;
});

const EmptyState = React.memo(() => (
  <View style={styles.centered}>
    <Search size={48} color={theme.colors.secondary} style={{ marginBottom: theme.spacing.md }}/>
    <Text style={styles.emptyStateTitle}>No Clinics Found</Text>
    <Text style={styles.emptyStateSubtitle}>Try adjusting your search or find clinics near you.</Text>
  </View>
));
EmptyState.displayName = 'EmptyState';

// Loading skeleton component for clinic cards
const ClinicCardSkeleton = React.memo(() => (
  <View style={[styles.card, styles.skeletonCard]}>
    <View style={[styles.skeletonLine, styles.skeletonTitle]} />
    <View style={[styles.skeletonLine, styles.skeletonAddress]} />
    <View style={[styles.skeletonLine, styles.skeletonDistance]} />
  </View>
));
ClinicCardSkeleton.displayName = 'ClinicCardSkeleton';

// Loading skeleton for search header
const SearchHeaderSkeleton = React.memo(() => (
  <View style={styles.controlsContainer}>
    <View style={[styles.skeletonLine, styles.skeletonInstruction]} />
    <View style={[styles.searchInputContainer, styles.skeletonSearchInput]} />
    <View style={styles.filterRow}>
      <View style={[styles.skeletonLine, styles.skeletonFilterButton]} />
      <View style={[styles.skeletonLine, styles.skeletonFilterButton]} />
    </View>
    <View style={styles.actionButtons}>
      <View style={[styles.skeletonLine, styles.skeletonActionButton]} />
    </View>
  </View>
));
SearchHeaderSkeleton.displayName = 'SearchHeaderSkeleton';

// --- Main Screen ---

export function ClinicFinderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<ClinicFinderStackParamList> & DrawerNavigationProp<DrawerParamList>>();
  const [filters, setFilters] = useState<Filters>({});
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, SEARCH_DEBOUNCE_MS);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [radius, setRadius] = useState<number>(DEFAULT_SEARCH_RADIUS_KM); // Default radius in km
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);
  const [isNavigationActive, setIsNavigationActive] = useState(false);
  const [currentUserPosition, setCurrentUserPosition] = useState<Location.LocationObjectCoords | null>(null);
  const [directionSteps, setDirectionSteps] = useState<any[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [openNow, setOpenNow] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [mapType, setMapType] = useState<'standard' | 'satellite'>('standard');
  const [isSheetMaximized, setIsSheetMaximized] = useState(false);
  const [directionsResult, setDirectionsResult] = useState<{ duration: number, distance: number } | null>(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState<GeoJSON.Geometry | null>(null);
  
  const debouncedFilters = useDebounce(filters, SEARCH_DEBOUNCE_MS);

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const flatListRef = useRef<FlatList<Clinic>>(null);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);

  useEffect(() => {
    const checkFirstVisit = async () => {
      try {
        const hasVisited = await AsyncStorage.getItem('@hasVisitedClinicFinder');
        if (hasVisited === null) {
          // It's the first visit, automatically find nearby clinics
          handleFindNearMe();
          // Mark as visited so this doesn't run again
          await AsyncStorage.setItem('@hasVisitedClinicFinder', 'true');
        }
      } catch (error) {
        console.error('AsyncStorage error in ClinicFinderScreen:', error);
      }
    };

    checkFirstVisit();
  }, []); // The empty dependency array ensures this runs only once on mount.


  // --- Reanimated and Gesture Handler Setup ---
  const translateY = useSharedValue(SNAP_POINT_MID);
  const isClinicSelectedSV = useSharedValue(false);

  type GestureContext = { startY: number };

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
        : [SNAP_POINT_FULL, SNAP_POINT_MID, SNAP_POINT_HIDDEN];
      
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

  const isFilterActive = useMemo(() => !!(filters.q || (filters.lat && filters.lon) || openNow), [filters, openNow]);

  useEffect(() => {
    if (isNavigationActive) {
      translateY.value = withTiming(screenHeight, { duration: 250 });
    } else {
      if (selectedClinic) {
        translateY.value = withTiming(SNAP_POINT_DIRECTIONS, { duration: 250 });
      } else {
        translateY.value = withTiming(SNAP_POINT_MID, { duration: 250 });
    }
    }
  }, [isNavigationActive, selectedClinic]);

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
          timeInterval: LOCATION_UPDATE_INTERVAL_MS,
          distanceInterval: LOCATION_DISTANCE_THRESHOLD_M,
        },
        (location) => {
          setCurrentUserPosition(location.coords);
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

    const distanceToNextStep = getDistance(currentUserPosition, {
        latitude: nextStep.maneuver.location[1],
        longitude: nextStep.maneuver.location[0]
    });

    if (distanceToNextStep < NAVIGATION_STEP_PROXIMITY_M) {
      setCurrentStepIndex((prev: number) => prev + 1);
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
        return searchClinicsForFinder(filters);
      }
      return getPublicClinics();
    },
  });

  const filteredClinics = useMemo(() => {
    let clinics = clinicsQuery.data ?? [];
    
    // Filter by search text
    if (debouncedSearchText) {
      clinics = clinics.filter(clinic =>
      clinic.name.toLowerCase().includes(debouncedSearchText.toLowerCase())
    );
    }
    
    // Filter by "Open Now" if enabled
    if (openNow) {
      const currentHour = new Date().getHours();
      // Basic business hours filter (8 AM - 6 PM)
      // This can be enhanced when actual operating hours data is available
      const isBusinessHours = currentHour >= BUSINESS_HOURS_START && currentHour < BUSINESS_HOURS_END;
      if (isBusinessHours) {
        // For now, show all clinics during business hours
        // In a real implementation, this would check actual operating hours
        clinics = clinics.filter(clinic => {
          // Placeholder logic - can be enhanced with real operating hours data
          return true; // Assume all clinics are open during business hours
        });
      } else {
        // After hours - filter to 24/7 or emergency clinics
        // For now, show a subset (this would use real data in production)
        clinics = clinics.filter(clinic => {
          // Placeholder: show clinics with "emergency" or "24" in name
          const name = clinic.name.toLowerCase();
          return name.includes('emergency') || name.includes('24') || name.includes('urgent');
        });
      }
    }
    
    return clinics;
  }, [clinicsQuery.data, debouncedSearchText, openNow]);

  const isLoading = clinicsQuery.isLoading;

  const onMarkerPress = useCallback((clinic: Clinic) => {
    setSelectedClinic(clinic);
    
    // Reset navigation state only if it's currently active
    if (isNavigationActive) {
      setIsNavigationActive(false);
      setDirectionsResult(null);
      setDirectionSteps([]);
      setCurrentStepIndex(0);
      setRouteGeoJSON(null);
    }
    
    cameraRef.current?.flyTo([clinic.longitude, clinic.latitude], 500);
    translateY.value = withTiming(SNAP_POINT_DIRECTIONS);
  }, [isNavigationActive]);

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
      cameraRef.current?.flyTo([coords.longitude, coords.latitude], 1000);
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
      setRadius(DEFAULT_SEARCH_RADIUS_KM);
      setOpenNow(false);
      setShowFilters(false);
      setSelectedClinic(null);
      setUserLocation(null);
      setDirectionsResult(null);
      setDirectionSteps([]);
      setCurrentStepIndex(0);
      setIsNavigationActive(false);
      setRouteGeoJSON(null);
      cameraRef.current?.flyTo([DEFAULT_REGION.longitude, DEFAULT_REGION.latitude], 1000);
      cameraRef.current?.zoomTo(10, 1000);
      translateY.value = withTiming(SNAP_POINT_MID);
  }
  
  const handleGetDirections = async () => {
    if (!userLocation || !selectedClinic) return;

    try {
      const routeData = await getMapboxRoute(userLocation, {
        latitude: selectedClinic.latitude,
        longitude: selectedClinic.longitude,
      });

      if (routeData && routeData.geometry) {
        setRouteGeoJSON(routeData.geometry);
        setDirectionSteps(routeData.legs?.[0]?.steps || []);
        setDirectionsResult({
          distance: routeData.distance / 1000, // meters to km
          duration: routeData.duration / 60,   // seconds to minutes
        });
        //setIsNavigationActive(true); // Defer starting navigation until user action

        const northEast = [Math.max(userLocation.longitude, selectedClinic.longitude), Math.max(userLocation.latitude, selectedClinic.latitude)];
        const southWest = [Math.min(userLocation.longitude, selectedClinic.longitude), Math.min(userLocation.latitude, selectedClinic.latitude)];

        cameraRef.current?.fitBounds(
            northEast,
            southWest,
            [150, 50, 350, 50], // padding: top, right, bottom, left
            500 // animation duration
        );
      }
    } catch (error) {
      Alert.alert("Routing Error", "Could not calculate the route. The service may be unavailable.");
      console.error('Mapbox Directions Error:', error);
    }
  };

  const handleCancelNavigation = () => {
    setIsNavigationActive(false);
    setDirectionsResult(null);
    setDirectionSteps([]);
    setCurrentStepIndex(0);
    setRouteGeoJSON(null);
    if(selectedClinic){
        onMarkerPress(selectedClinic);
    } else {
        translateY.value = withTiming(SNAP_POINT_MID);
    }
  };

  const handleRecenter = () => {
    if (isNavigationActive) {
      if (currentUserPosition) {
        cameraRef.current?.setCamera({
            centerCoordinate: [currentUserPosition.longitude, currentUserPosition.latitude],
            pitch: 45,
            heading: currentUserPosition.heading ?? 0,
            zoomLevel: 18,
            animationDuration: 800
        });
      }
    } else {
      handleFindNearMe();
    }
  };

  const handleShowRouteOverview = () => {
    if (userLocation && selectedClinic) {
        const northEast = [Math.max(userLocation.longitude, selectedClinic.longitude), Math.max(userLocation.latitude, selectedClinic.latitude)];
        const southWest = [Math.min(userLocation.longitude, selectedClinic.longitude), Math.min(userLocation.latitude, selectedClinic.latitude)];

        cameraRef.current?.fitBounds(
            northEast,
            southWest,
            [150, 50, 100, 50], // padding: top, right, bottom, left
            500 // animation duration
        );
    }
  };

  const handleOpenDrawer = useCallback(() => {
    navigation.openDrawer();
  }, [navigation]);

  const handleToggleOpenNow = useCallback((value: boolean) => {
    setOpenNow(value);
    setFilters((prev: Filters) => ({ ...prev, openNow: value }));
  }, []);

  const handleToggleFilters = useCallback(() => {
    setShowFilters((prev: boolean) => !prev);
  }, []);

  const handleRegionChange = useCallback((region: any) => {
    setMapRegion(region);
  }, []);

  // Throttled version for clustering to improve performance
  const handleRegionChangeThrottled = useCallback(
    throttle((region: any) => {
      // setMapRegion(region); // TODO: Re-evaluate if needed for Mapbox
    }, REGION_CHANGE_THROTTLE_MS),
    []
  );

  const handleZoomIn = useCallback(async () => {
    const currentZoom = await mapRef.current?.getZoom();
    if (typeof currentZoom === 'number') {
      cameraRef.current?.zoomTo(currentZoom + 1, 300);
    }
  }, []);

  const handleZoomOut = useCallback(async () => {
    const currentZoom = await mapRef.current?.getZoom();
    if (typeof currentZoom === 'number') {
      cameraRef.current?.zoomTo(currentZoom - 1, 300);
    }
  }, []);

  const handleToggleMapType = useCallback(() => {
    setMapType(prev => prev === 'standard' ? 'satellite' : 'standard');
  }, []);

  const instructionText = useMemo(() => {
    if (isLocationSearch) return `Showing clinics near you.`;
    if (debouncedSearchText) return `Showing results for "${debouncedSearchText}".`;
    return "Showing all clinics. Use search or find clinics near you.";
  }, [isLocationSearch, debouncedSearchText]);

  // --- Render methods for Bottom Sheet ---
  
  const renderSearchHeader = () => (
     <View style={styles.controlsContainer}>
        <Text style={styles.instructionText}>{instructionText}</Text>
        
        {/* Search Bar */}
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

        {/* Filter Toggle & Quick Filters Row */}
        <View style={styles.filterRow}>
          <TouchableOpacity style={styles.filterToggleButton} onPress={handleToggleFilters}>
            <Filter size={16} color={theme.colors.primary} />
            <Text style={styles.filterToggleText}>Filters</Text>
            {isFilterActive && <View style={styles.filterActiveDot} />}
          </TouchableOpacity>

          {/* Open Now Quick Toggle */}
          <View style={styles.openNowContainer}>
            <Clock size={16} color={openNow ? theme.colors.primary : theme.colors.secondary} />
            <Text style={[styles.openNowLabel, openNow && styles.openNowLabelActive]}>Open Now</Text>
            <Switch
              value={openNow}
              onValueChange={handleToggleOpenNow}
              trackColor={{ false: theme.colors.muted, true: theme.colors.primary }}
              thumbColor={theme.colors.background}
              style={styles.openNowSwitch}
            />
          </View>
        </View>

        {/* Expanded Filters Panel */}
        {showFilters && (
          <View style={styles.filtersPanel}>
            <Text style={styles.filterSectionTitle}>Search Radius</Text>
            <View style={styles.radiusGrid}>
                {RADIUS_OPTIONS_KM.map(r => (
                    <TouchableOpacity
                        key={r}
                        style={[
                            styles.radiusChip,
                            radius === r && styles.radiusChipSelected,
                            !isLocationSearch && styles.radiusChipDisabled,
                        ]}
                        disabled={!isLocationSearch}
                        onPress={() => {
                            setRadius(r);
                            setFilters((prev: Filters) => ({...prev, radius: r * 1000}));
                        }}
                    >
                    <Text style={[
                        styles.radiusChipText,
                        radius === r && styles.radiusChipTextSelected,
                        !isLocationSearch && styles.radiusChipTextDisabled,
                    ]}>
                        {r} km
                    </Text>
                    </TouchableOpacity>
                ))}
            </View>
            {!isLocationSearch && (
                 <Text style={styles.filterHintText}>
                   Use &quot;Find Near Me&quot; to enable distance filtering.
                 </Text>
            )}
          </View>
        )}

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <Button 
            onPress={handleFindNearMe} 
            disabled={isFetchingLocation} 
            icon={<MapPin size={16} color={theme.colors.primaryForeground} />}
            style={styles.findNearMeButton}
          >
            {isFetchingLocation ? 'Finding...' : 'Find Near Me'}
            </Button>
            {isFilterActive && (
            <Button 
              onPress={clearFilters} 
              variant="secondary" 
              icon={<X size={18} color={theme.colors.destructive} />}
              style={styles.clearButton}
            >
                    Clear
                </Button>
            )}
        </View>

        {clinicsQuery.isFetching && (
          <ActivityIndicator style={styles.refetchingIndicator} color={theme.colors.primary} />
        )}
      </View>
  )
  
  const DirectionInstructionCard = () => {
    if (!isNavigationActive || directionSteps.length === 0 || currentStepIndex >= directionSteps.length) {
        return null;
    }

    const step = directionSteps[currentStepIndex];
    if (!step) return null; // Added safety check
    const instruction = step.maneuver.instruction;
    const distance = step.distance > 1000 
        ? `${(step.distance / 1000).toFixed(1)} km`
        : `${Math.round(step.distance)} m`;

    return (
        <View style={styles.instructionCard}>
            <Text style={styles.instructionText_L}>{instruction}</Text>
            <Text style={styles.instructionDistance}>{distance}</Text>
        </View>
    );
  }

  const renderDirectionsCard = () => (
    <View style={styles.directionsContainer}>
      {/* Top content is now wrapped in a single View to keep it compact */}
      <View>
        <View style={styles.directionsHeader}>
          <TouchableOpacity onPress={() => { setSelectedClinic(null); setDirectionsResult(null); }} style={styles.backButton}>
            <ArrowLeft size={24} color={theme.colors.primary} />
          </TouchableOpacity>
          <Text style={styles.directionsTitle} numberOfLines={1}>{selectedClinic?.name}</Text>
        </View>
        <Text style={styles.directionsAddress} numberOfLines={2}>{selectedClinic ? formatClinicAddress(selectedClinic) : 'Address not available'}</Text>
        
        {directionsResult && (
          <View style={styles.directionsInfo}>
            <Text style={styles.directionsInfoText}>{`${Math.round(directionsResult.duration)} min`}</Text>
            <Text style={styles.directionsInfoSeparator}>•</Text>
            <Text style={styles.directionsInfoText}>{`${directionsResult.distance.toFixed(1)} km`}</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        <Button
          onPress={routeGeoJSON ? () => setIsNavigationActive(true) : handleGetDirections}
          style={styles.buttonFlex}
          disabled={isNavigationActive}
          icon={!routeGeoJSON ? <Navigation size={16} color="white" /> : (isNavigationActive ? undefined : <Navigation size={16} color="white" />)}
        >
          {routeGeoJSON
            ? (isNavigationActive ? 'Navigating...' : 'Start Navigation')
            : 'Get Directions'
          }
        </Button>
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
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={mapType === 'standard' ? MapboxGL.StyleURL.Street : MapboxGL.StyleURL.Satellite}
        // onRegionDidChange={handleRegionChangeThrottled}
      >
        <MapboxGL.Camera 
            ref={cameraRef}
            defaultSettings={{
                centerCoordinate: [DEFAULT_REGION.longitude, DEFAULT_REGION.latitude],
                zoomLevel: 10,
            }}
            followUserLocation={isNavigationActive}
            followZoomLevel={16}
            followPitch={45}
        />
        <MapboxGL.UserLocation 
            visible={true}
            showsUserHeadingIndicator={true}
        />

          {filteredClinics.map(clinic => (
            <MapboxGL.MarkerView
              key={clinic.id}
              id={clinic.id}
              coordinate={[clinic.longitude, clinic.latitude]}
            >
              <TouchableOpacity onPress={() => onMarkerPress(clinic)}>
                  <ClinicMarker clinic={clinic} isSelected={selectedClinic?.id === clinic.id} />
              </TouchableOpacity>
            </MapboxGL.MarkerView>
          ))}

          {routeGeoJSON && (
            <MapboxGL.ShapeSource id="routeSource" shape={routeGeoJSON}>
              <MapboxGL.LineLayer
                id="routeLine"
                style={{
                  lineColor: theme.colors.primary,
                  lineWidth: 5,
                  lineOpacity: 0.85,
                }}
              />
            </MapboxGL.ShapeSource>
          )}
      </MapboxGL.MapView>

      <DirectionInstructionCard />

      {isNavigationActive && (
          <TouchableOpacity style={styles.cancelNavButton} onPress={handleCancelNavigation}>
              <X size={24} color={theme.colors.secondary} />
          </TouchableOpacity>
      )}

      <TouchableOpacity style={styles.recenterButton} onPress={handleRecenter}>
        <Crosshair size={24} color={theme.colors.foreground} />
      </TouchableOpacity>
      
      {isFilterActive && (
        <TouchableOpacity style={styles.resetButton} onPress={clearFilters}>
            <RotateCw size={22} color={theme.colors.foreground} />
        </TouchableOpacity>
      )}

      {isNavigationActive && (
        <TouchableOpacity style={styles.overviewButton} onPress={handleShowRouteOverview}>
          <Maximize size={22} color={theme.colors.foreground} />
        </TouchableOpacity>
      )}

      {!isNavigationActive && (
        <TouchableOpacity style={styles.hamburgerButton} onPress={handleOpenDrawer}>
          <Menu size={24} color={theme.colors.foreground} />
        </TouchableOpacity>
      )}

      {!isNavigationActive && !selectedClinic && <MapLegend />}

      {!isNavigationActive && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onToggleMapType={handleToggleMapType}
          mapType={mapType}
        />
      )}

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
              ListHeaderComponent={isLoading ? <SearchHeaderSkeleton /> : renderSearchHeader}
              ListEmptyComponent={
                isLoading ? (
                  <View>
                    {Array.from({ length: 3 }, (_, index) => (
                      <ClinicCardSkeleton key={`skeleton-${index}`} />
                    ))}
                  </View>
                ) : (
                  <EmptyState />
                )
              }
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
              onRefresh={() => clinicsQuery.refetch()}
              refreshing={clinicsQuery.isFetching && !isLoading}
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
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  filterToggleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    position: 'relative',
  },
  filterToggleText: {
    ...theme.typography.body,
    marginLeft: theme.spacing.xs,
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  filterActiveDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
  },
  openNowContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.muted,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
  },
  openNowLabel: {
    ...theme.typography.body,
    marginLeft: theme.spacing.xs,
    marginRight: theme.spacing.sm,
    color: theme.colors.secondary,
  },
  openNowLabelActive: {
    color: theme.colors.primary,
    fontFamily: theme.typography.fontFamilyMedium,
  },
  openNowSwitch: {
    transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }],
  },
  filtersPanel: {
    backgroundColor: theme.colors.card,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginTop: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterSectionTitle: {
    ...theme.typography.h4,
    marginBottom: theme.spacing.md,
    color: theme.colors.foreground,
  },
  radiusGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    justifyContent: 'flex-start',
  },
  radiusChip: {
    paddingVertical: theme.spacing.xs,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.full,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.background,
    minWidth: 50,
    alignItems: 'center',
  },
  radiusChipDisabled: {
    backgroundColor: theme.colors.muted,
    borderColor: theme.colors.border,
  },
  radiusChipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  radiusChipText: {
    ...theme.typography.small,
    fontFamily: theme.typography.fontFamilyMedium,
    color: theme.colors.foreground,
  },
  radiusChipTextDisabled: {
    color: theme.colors.secondary,
  },
  radiusChipTextSelected: {
    color: theme.colors.primaryForeground,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    marginTop: theme.spacing.lg,
    gap: theme.spacing.sm,
  },
  findNearMeButton: {
    flex: 2,
    minHeight: 44,
  },
  clearButton: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: theme.spacing.md,
  },
  filterHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
  },
  filterHintText: {
    ...theme.typography.small,
    color: theme.colors.secondary,
    marginLeft: theme.spacing.sm,
    textAlign: 'center',
  },
  clusterContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 150,
    height: 80,
  },
  clusterLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
  },
  clusterLabelText: {
    fontSize: 11,
    lineHeight: 14,
    color: 'white',
    fontFamily: theme.typography.fontFamilyMedium,
    textAlign: 'center',
  },
  clusterMarker: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: theme.colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 6,
  },
  clusterText: {
    ...theme.typography.h4,
    color: 'white',
    fontFamily: theme.typography.fontFamilyBold,
  },
  clusterPoint: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 15,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: theme.colors.primary,
    marginTop: -2,
  },
  mapLegend: {
    position: 'absolute',
    bottom: 140,
    right: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    minWidth: 120,
  },
  legendTitle: {
    ...theme.typography.small,
    fontFamily: theme.typography.fontFamilyBold,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
    color: theme.colors.foreground,
  },
  legendItems: {
    gap: theme.spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  legendIcon: {
    width: 16,
    height: 16,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  legendText: {
    ...theme.typography.small,
    color: theme.colors.foreground,
    flex: 1,
  },
  mapControls: {
    position: 'absolute',
    top: 110,
    right: 20,
    gap: theme.spacing.xs,
  },
  mapControlButton: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  markerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 200,
    height: 80,
  },
  markerLabel: {
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    marginBottom: theme.spacing.xs,
  },
  markerLabelSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    transform: [{ scale: 1.1 }],
  },
  markerLabelText: {
    fontSize: 11,
    lineHeight: 14,
    color: 'white',
    fontFamily: theme.typography.fontFamilyMedium,
    textAlign: 'center',
  },
  markerLabelTextSelected: {
    fontFamily: theme.typography.fontFamilyBold,
  },
  markerWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  markerPin: {
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
  },
  markerPinSelected: {
    elevation: 12,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    transform: [{ scale: 1.1 }],
  },
  markerPoint: {
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
  markerPointSelected: {
    borderLeftWidth: 14,
    borderRightWidth: 14,
    borderTopWidth: 16,
    marginTop: -3,
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
    top: 50,
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
  resetButton: {
    position: 'absolute',
    top: 170, 
    right: 20,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  overviewButton: {
    position: 'absolute',
    top: 110,
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
  hamburgerButton: {
      position: 'absolute',
      top: 50,
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
  cancelNavButton: {
    position: 'absolute',
    top: 50,
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
    backgroundColor: theme.colors.background,
    height: DIRECTIONS_CARD_HEIGHT,
    padding: theme.spacing.lg,
  },
  directionsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 0
  },
  backButton: {
      padding: theme.spacing.sm,
      marginRight: theme.spacing.md,
      marginLeft: -theme.spacing.sm, // Align better with edge
  },
  directionsTitle: {
      ...theme.typography.h3,
      flex: 1,
  },
  directionsAddress: {
      ...theme.typography.body,
      color: theme.colors.secondary,
      marginBottom: theme.spacing.xs,
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
    top: 110,
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
    marginTop: theme.spacing.lg,
  },
  buttonFlex: {
    flex: 1,
  },
  skeletonCard: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    marginHorizontal: theme.spacing.lg,
    marginVertical: theme.spacing.xs,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  skeletonLine: {
    height: 16,
    borderRadius: 8,
    backgroundColor: theme.colors.border,
  },
  skeletonTitle: {
    width: '80%',
    marginBottom: theme.spacing.sm,
  },
  skeletonAddress: {
    width: '60%',
    marginBottom: theme.spacing.sm,
  },
  skeletonDistance: {
    width: '40%',
  },
  skeletonInstruction: {
    width: '70%',
    marginBottom: theme.spacing.md,
    alignSelf: 'center',
  },
  skeletonSearchInput: {
    backgroundColor: theme.colors.muted,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  skeletonFilterButton: {
    width: 100,
    height: 30,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.muted,
    marginRight: theme.spacing.sm,
  },
  skeletonActionButton: {
    width: '100%',
    height: 44,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.muted,
  },
  debugContainer: {
    position: 'absolute',
    top: 150,
    left: 10,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 8,
    borderRadius: 5,
  },
  debugText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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