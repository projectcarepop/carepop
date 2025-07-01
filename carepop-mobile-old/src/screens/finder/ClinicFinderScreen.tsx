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
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import * as Location from 'expo-location';
import { MapPin, Search, X, RotateCw, Crosshair } from 'lucide-react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import BottomSheet, { BottomSheetFlatList, BottomSheetFlatListMethods } from '@gorhom/bottom-sheet';

import { searchPublicClinics, getPublicClinics } from '../../services/api';
import { useDebounce } from '../../hooks/useDebounce';
import { theme } from '../../components/theme';
import { Clinic } from '../../lib/types';

const { height: screenHeight } = Dimensions.get('window');

const MAP_DELTA = {
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const ZOOMED_IN_MAP_DELTA = {
    latitudeDelta: 0.02,
    longitudeDelta: 0.01,
}

const DEFAULT_REGION = {
    latitude: 14.5995, // Metro Manila
    longitude: 120.9842,
    ...MAP_DELTA,
};

type Filters = {
  name?: string;
  lat?: number;
  lon?: number;
  radius?: number;
};

// --- Reusable Components ---

const ClinicCard = React.memo(function ClinicCard({ item, isSelected }: { item: Clinic; isSelected: boolean }) {
    return (
        <View style={[styles.card, isSelected && styles.selectedCard]}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardAddress} numberOfLines={1}>{item.address?.street}, {item.address?.barangay}, {item.address?.city}</Text>
          {item.distance && (
            <View style={styles.distanceContainer}>
              <MapPin size={14} color={theme.colors.primary} />
              <Text style={styles.cardDistance}>{item.distance.toFixed(2)} km away</Text>
            </View>
          )}
        </View>
    );
});

const EmptyState = ({ hasFilters }: { hasFilters: boolean }) => (
  <View style={styles.centered}>
    <Search size={48} color={theme.colors.secondary} style={{ marginBottom: theme.spacing.md }}/>
    <Text style={styles.emptyStateTitle}>
      {hasFilters ? 'No Clinics Found' : 'Find Your Clinic'}
    </Text>
    <Text style={styles.emptyStateSubtitle}>
      {hasFilters
        ? 'Try adjusting your search or filter criteria.'
        : 'Use the search bar, filter by service, or find clinics near you to get started.'}
    </Text>
  </View>
);

// --- Main Screen ---

export function ClinicFinderScreen() {
  const [filters, setFilters] = useState<Filters>({});
  const [searchText, setSearchText] = useState('');
  const debouncedSearchText = useDebounce(searchText, 500);
  const [isFetchingLocation, setIsFetchingLocation] = useState(false);
  const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
  const [radius, setRadius] = useState<number>(10); // Default radius in km
  const [userLocation, setUserLocation] = useState<{latitude: number, longitude: number} | null>(null);

  const mapRef = useRef<MapView>(null);
  const bottomSheetRef = useRef<BottomSheet>(null);
  const flatListRef = useRef<BottomSheetFlatListMethods>(null);

  const snapPoints = useMemo(() => ['25%', '50%', '85%'], []);
  const isFilterActive = useMemo(() => !!(filters.name || (filters.lat && filters.lon)), [filters]);

  useEffect(() => {
    setFilters(prev => ({ ...prev, name: debouncedSearchText }));
  }, [debouncedSearchText]);
  
  // Query 1: Get ALL clinics for the map
  const allClinicsQuery = useQuery({
    queryKey: ['publicClinics'],
    queryFn: getPublicClinics,
  });

  // Query 2: Get SEARCHED clinics for the list when a filter is active
  const searchQuery = useQuery({
    queryKey: ['searchedClinics', filters],
    queryFn: () => searchPublicClinics(filters),
    enabled: isFilterActive, // Only run this query when a filter is applied
  });

  const handleFindNearMe = async () => {
    setIsFetchingLocation(true);
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      console.error('Permission to access location was denied');
      setIsFetchingLocation(false);
      return;
    }

    try {
      let location = await Location.getCurrentPositionAsync({});
      const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          ...ZOOMED_IN_MAP_DELTA
      };
      setUserLocation({latitude: newRegion.latitude, longitude: newRegion.longitude});
      mapRef.current?.animateToRegion(newRegion, 1000);
      setSearchText('');
      setFilters({ lat: newRegion.latitude, lon: newRegion.longitude, radius: radius * 1000 });
    } catch (e) {
      console.error("Could not get location", e);
    } finally {
      setIsFetchingLocation(false);
    }
  };
  
  const clearFilters = () => {
      setFilters({});
      setSearchText('');
      setRadius(10);
      setSelectedClinicId(null);
      setUserLocation(null);
      mapRef.current?.animateToRegion(DEFAULT_REGION, 1000);
  }
  
  const recenterMap = async () => {
      setIsFetchingLocation(true);
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.error('Permission to access location was denied');
        setIsFetchingLocation(false);
        return;
      }
      
      try {
        let location = await Location.getCurrentPositionAsync({});
        const newRegion = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            ...ZOOMED_IN_MAP_DELTA
        };
        setUserLocation({latitude: newRegion.latitude, longitude: newRegion.longitude});
        mapRef.current?.animateToRegion(newRegion, 1000);
        setSearchText('');
        setFilters({ lat: newRegion.latitude, lon: newRegion.longitude, radius: radius * 1000 });
      } catch (e) {
        console.error("Could not get location", e);
      } finally {
        setIsFetchingLocation(false);
      }
  }
  
  const onMarkerPress = (clinic: Clinic, index: number, list: Clinic[]) => {
    setSelectedClinicId(clinic.id);
    bottomSheetRef.current?.snapToIndex(1); // Snap to 50%
    if (flatListRef.current && list.length > index) {
        flatListRef.current.scrollToIndex({ animated: true, index });
    }
    mapRef.current?.animateToRegion({
        latitude: clinic.latitude,
        longitude: clinic.longitude,
        ...MAP_DELTA
    }, 500);
  };
  
  const handleCardPress = (clinic: Clinic) => {
      const listToUse = isFilterActive ? searchQuery.data : allClinicsQuery.data;
      if (!listToUse) return;
      const index = listToUse.findIndex(c => c.id === clinic.id);
      if (index !== -1) {
          onMarkerPress(clinic, index, listToUse);
      }
  }
  
  const instructionText = useMemo(() => {
    if (filters.lat && filters.lon) {
        return `Showing clinics within ${radius}km of your location.`;
    }
    if (filters.name) {
        return `Showing results for '${filters.name}'.`;
    }
    return "Showing all clinics. Use search or 'Find Near Me' to narrow your results.";
  }, [filters, radius]);

  // --- Render methods for Bottom Sheet ---
  
  const RADIUS_OPTIONS = [5, 10, 25];

  const renderHeader = () => (
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
                    {RADIUS_OPTIONS.map(r => (
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
            <TouchableOpacity style={styles.filterButton} onPress={handleFindNearMe} disabled={isFetchingLocation}>
              {isFetchingLocation ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} style={{marginRight: theme.spacing.xs}}/>
              ) : (
                <MapPin size={16} color={theme.colors.primary} style={{marginRight: theme.spacing.sm}}/>
              )}
                <Text style={styles.filterButtonText}>Find Clinics Near Me</Text>
            </TouchableOpacity>

            {isFilterActive && (
                 <TouchableOpacity style={[styles.filterButton, styles.clearButton]} onPress={clearFilters}>
                    <X size={16} color={theme.colors.accentForeground} style={{marginRight: theme.spacing.sm}}/>
                    <Text style={[styles.filterButtonText, styles.clearButtonText]}>Clear Filters</Text>
                </TouchableOpacity>
            )}
        </View>
         {searchQuery.isFetching && <ActivityIndicator style={styles.refetchingIndicator} color={theme.colors.primary} />}
      </View>
  )
  
  const listData = isFilterActive ? searchQuery.data : allClinicsQuery.data;
  const isLoading = isFilterActive ? searchQuery.isLoading : allClinicsQuery.isLoading;

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        provider={PROVIDER_GOOGLE}
        initialRegion={DEFAULT_REGION}
        showsUserLocation
        showsMyLocationButton={false}
      >
          {listData?.map((clinic, index) => (
              <Marker
                key={clinic.id}
                coordinate={{ latitude: clinic.latitude, longitude: clinic.longitude }}
                title={clinic.name}
                onPress={() => onMarkerPress(clinic, index, listData || [])}
                pinColor={selectedClinicId === clinic.id ? theme.colors.primary : theme.colors.accent}
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
      </MapView>

      <TouchableOpacity style={styles.recenterButton} onPress={recenterMap} disabled={isFetchingLocation}>
        {isFetchingLocation ? (
            <ActivityIndicator color={theme.colors.primary} />
        ) : (
            <Crosshair size={24} color={theme.colors.secondary} />
        )}
      </TouchableOpacity>

      <BottomSheet
        ref={bottomSheetRef}
        index={1}
        snapPoints={snapPoints}
        handleIndicatorStyle={{ backgroundColor: theme.colors.primary }}
      >
        <BottomSheetFlatList
          ref={flatListRef}
          data={listData}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <TouchableOpacity onPress={() => handleCardPress(item)}>
                <ClinicCard item={item} isSelected={selectedClinicId === item.id} />
            </TouchableOpacity>
          )}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={<EmptyState hasFilters={isFilterActive} />}
          contentContainerStyle={styles.listContent}
          onScrollToIndexFailed={(info) => {
            const wait = new Promise(resolve => setTimeout(resolve, 500));
            wait.then(() => {
                flatListRef.current?.scrollToIndex({ index: info.index, animated: true });
            });
          }}
        />
      </BottomSheet>
    </View>
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
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.card,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    height: 50,
  },
  clearButton: {
    backgroundColor: theme.colors.accent,
    borderColor: theme.colors.accent,
  },
  clearButtonText: {
    color: theme.colors.accentForeground,
  },
  filterButtonText: {
    ...theme.typography.body,
    color: theme.colors.secondary,
    fontFamily: theme.typography.fontFamilySemiBold,
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
  }
}); 