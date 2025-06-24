'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ClinicList from './ClinicList';
import DynamicMapLoader from './DynamicMapLoader';
import ClinicDetailModal from './ClinicDetailModal';
import SlidingPanel, { PanelState } from './SlidingPanel';
import { Loader2, SlidersHorizontal, ArrowLeft, LocateFixed } from 'lucide-react';
import LocationSearchInput from './LocationSearchInput';
import ServiceFilter from './ServiceFilter';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import useMediaQuery from '@/hooks/use-media-query';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { type InferResponseType } from 'hono/client';
import { apiClient } from '@/lib/apiClient';

// --- Start: New Inferred Types ---
// These are the canonical types for this feature, inferred from the API.
type ClinicsResponse = InferResponseType<typeof apiClient.public.clinics.$get>;
type Clinic = ClinicsResponse extends { data: (infer T)[] } ? T : never;

type ServicesResponse = InferResponseType<typeof apiClient.public.services.$get>;
type Service = ServicesResponse extends { data: (infer T)[] } ? T : never;
// --- End: New Inferred Types ---

type ActiveView = 'list' | 'filters';

interface ClinicFinderClientProps {
  initialClinics: Clinic[];
  initialServices: Service[];
  initialFetchError: string | null;
}

export default function ClinicFinderClient({ initialClinics, initialServices, initialFetchError: initialError }: ClinicFinderClientProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  
  const [clinics, setClinics] = useState<Clinic[]>(initialClinics);
  const [error, setError] = useState<string | null>(initialError);
  const [isLoading, setIsLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [selectedClinic, setSelectedClinic] = useState<Clinic | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchRadius, setSearchRadius] = useState(5);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [highlightedClinic, setHighlightedClinic] = useState<string | null>(null);
  const [routeDestination, setRouteDestination] = useState<Clinic | null>(null);
  const [clinicSearchQuery, setClinicSearchQuery] = useState('');
  
  // Mobile-specific state
  const [panelState, setPanelState] = useState<PanelState>('collapsed');
  const [activeView, setActiveView] = useState<ActiveView>('list');

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null); 
    }
  }, [error]);

  // Add client-side distance calculation if userLocation is available
  const clinicsWithDistance = React.useMemo(() => {
    if (!userLocation) return clinics;
    // haversine formula for distance calculation
    const toRad = (x: number) => x * Math.PI / 180;
    return clinics.map(clinic => {
      if (!clinic.latitude || !clinic.longitude) return clinic;
      const R = 6371; // Earth radius in km
      const dLat = toRad(clinic.latitude - userLocation.lat);
      const dLon = toRad(clinic.longitude - userLocation.lon);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(toRad(userLocation.lat)) * Math.cos(toRad(clinic.latitude)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;
      return { ...clinic, distance_km: distance };
    }).sort((a, b) => (a.distance_km || Infinity) - (b.distance_km || Infinity));
  }, [clinics, userLocation]);

  const serviceFilteredClinics = clinicsWithDistance.filter(clinic => {
    return selectedServices.length === 0 || 
           selectedServices.every(serviceId => 
             (clinic.services_offered || []).some(s => s.serviceId === serviceId)
           );
  });

  const finalFilteredClinics = serviceFilteredClinics.filter(clinic => {
    const query = clinicSearchQuery.toLowerCase();
    const nameMatch = clinic.name.toLowerCase().includes(query);
    const addressMatch = clinic.full_address?.toLowerCase().includes(query) || false;
    return nameMatch || addressMatch;
  });

  const fetchClinicsByLocation = async ({ lat, lon }: { lat: number; lon: number }, radius: number) => {
    setIsLoading(true);
    setError(null);
    setUserLocation({ lat, lon });
    
    if (!isDesktop) {
        setActiveView('list');
        setPanelState('partial');
    }

    try {
      const res = await apiClient.public.clinics.nearby.$get({
        query: {
          lat: lat.toString(),
          lon: lon.toString(),
          radius: (radius * 1000).toString(), // API expects radius in meters
        }
      });
      if (!res.ok) throw new Error('Failed to fetch clinics');
      const data = await res.json();
      setClinics(data.data ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleGetCurrentLocation = () => {
    setIsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchClinicsByLocation({ lat: position.coords.latitude, lon: position.coords.longitude }, searchRadius);
        },
        (err) => {
          setError(`Geolocation error: ${err.message}. Please enable location services.`);
          toast.error(`Geolocation error: ${err.message}. Please enable location services.`);
          setIsLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser.");
      toast.error("Geolocation is not supported by this browser.");
      setIsLoading(false);
    }
  };
  
  const handleApplyFilters = () => {
    if (!isDesktop) setActiveView('list');
    if (userLocation) {
      fetchClinicsByLocation(userLocation, searchRadius);
    } else {
      toast.info("Please select a location first to apply filters.");
    }
  };

  const handleClearFilters = () => {
    setSelectedServices([]);
    setSearchRadius(5);
  };

  const handleViewDetailsClick = (clinic: Clinic) => {
    setSelectedClinic(clinic);
    setIsModalOpen(true);
  };

  const handleShowRoute = (clinic: Clinic) => {
    setRouteDestination(clinic);
    if (!isDesktop) {
        setPanelState('collapsed');
    }
  };
  
  // Mobile view transition
  const viewVariants = {
    hidden: { opacity: 0, x: 200 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -200 },
  };

  const renderMobileFiltersView = () => (
    <motion.div 
        key="filters"
        initial="hidden" animate="visible" exit="exit" variants={viewVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col h-full space-y-4 px-4"
    >
      <div className="flex-shrink-0">
        <Button variant="ghost" onClick={() => setActiveView('list')} className="mb-2 -ml-4">
          <ArrowLeft size={16} className="mr-2" /> Back to Results
        </Button>
        <h2 className="text-2xl font-bold">Filters</h2>
      </div>
      
      <div className="flex-grow space-y-8 overflow-y-auto pr-2 scrollbar-thin py-4">
        {/* Step 1: Location */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Step 1: Set Location</h3>
            <div>
                <Label htmlFor="location-search-mobile" className="sr-only">Enter a city or address</Label>
                <LocationSearchInput inputId="location-search-mobile" onLocationSelect={(loc) => fetchClinicsByLocation(loc, searchRadius)} />
            </div>
            <div className="relative">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div>
            </div>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <Button variant="outline" onClick={handleGetCurrentLocation} className="w-full">
                            <LocateFixed size={16} className="mr-2"/> Use My Current Location
                        </Button>
                    </TooltipTrigger>
                    <TooltipContent><p>Uses your browser&apos;s location. You may need to grant permission.</p></TooltipContent>
                </Tooltip>
            </TooltipProvider>
        </div>

        {/* Step 2: Radius */}
        <div className="space-y-4">
            <h3 className="font-semibold text-lg">Step 2: Adjust Radius</h3>
            <Label htmlFor="radius-slider-mobile" className="text-sm">Search Radius: {searchRadius} km</Label>
            <TooltipProvider>
                <Tooltip>
                    <TooltipTrigger className="w-full">
                        <div className="mt-1">
                            <Slider id="radius-slider-mobile" min={1} max={50} step={1} value={[searchRadius]} onValueChange={(v: number[]) => setSearchRadius(v[0])} disabled={!userLocation} />
                        </div>
                    </TooltipTrigger>
                    {!userLocation && (
                        <TooltipContent><p>Set a location in Step 1 to enable.</p></TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        </div>
        
        {/* Step 3: Services */}
        <div className="space-y-4">
            <div className="flex flex-row items-center justify-between">
                <h3 className="font-semibold text-lg">Step 3: Filter Services</h3>
                <Button variant="link" size="sm" onClick={handleClearFilters} className="text-pink-600 hover:text-pink-700 p-0 h-auto">Clear</Button>
            </div>
            <ServiceFilter services={initialServices} selectedServices={selectedServices} onServiceChange={setSelectedServices} />
        </div>
      </div>

      <div className="flex-shrink-0 py-4 border-t">
        <Button onClick={handleApplyFilters} className="w-full bg-pink-600 hover:bg-pink-700">Show {finalFilteredClinics.length} Results</Button>
      </div>
    </motion.div>
  );

  const renderMobileListView = () => (
    <motion.div
        key="list"
        initial="hidden" animate="visible" exit="exit" variants={viewVariants}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="flex flex-col h-full px-4"
    >
      <div className="flex-shrink-0 mb-4">
          <Button variant="secondary" onClick={() => setActiveView('filters')} className="w-full">
            <SlidersHorizontal size={16} className="mr-2" /> Filters & Search
          </Button>
      </div>
      <h2 className="text-xl font-semibold mb-2 flex-shrink-0">{isLoading ? "Finding clinics..." : `${finalFilteredClinics.length} Clinics Found`}</h2>
      <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={32} className="animate-spin text-pink-500"/></div>
        ) : (
          <ClinicList 
            clinics={finalFilteredClinics} 
            onViewDetails={handleViewDetailsClick}
            onShowRoute={handleShowRoute}
            highlightedClinic={highlightedClinic}
            onHighlightChange={setHighlightedClinic}
          />
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="w-full h-full">
        {isDesktop ? (
            <div className="grid grid-cols-12 gap-x-6 h-full">
                {/* Left Panel: Filters & Results */}
                <div className="col-span-12 lg:col-span-5 xl:col-span-4 h-full flex flex-col">
                    <Card className="w-full h-full flex flex-col overflow-hidden">
                        {/* Filters Section */}
                        <div className="p-4 pb-3 lg:p-6 lg:pb-4 space-y-6 flex-shrink-0 border-b">
                            <div className="space-y-3">
                                <h3 className="font-semibold">Step 1: Set Your Location</h3>
                                <LocationSearchInput inputId="location-search-desktop" onLocationSelect={(loc) => fetchClinicsByLocation(loc, searchRadius)} />
                                <div className="relative">
                                    <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                                    <div className="relative flex justify-center text-xs uppercase"><span className="bg-white px-2 text-muted-foreground dark:bg-gray-950">Or</span></div>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button variant="outline" onClick={handleGetCurrentLocation} className="w-full">
                                                <LocateFixed size={16} className="mr-2" /> Use My Current Location
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                        <p>Uses your browser&apos;s location to find clinics near you. You may need to grant permission.</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="space-y-4">
                                <h3 className="font-semibold">Step 2: Adjust Search Radius</h3>
                                <Label htmlFor="radius-slider-desktop" className="text-sm font-medium">Search Radius: {searchRadius} km</Label>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger className="w-full">
                                            <div className="mt-1">
                                                <Slider id="radius-slider-desktop" min={1} max={50} step={1} value={[searchRadius]} onValueChange={(v: number[]) => setSearchRadius(v[0])} disabled={!userLocation} />
                                            </div>
                                        </TooltipTrigger>
                                        {!userLocation && (
                                            <TooltipContent>
                                                <p>Set a location in Step 1 to enable the radius slider.</p>
                                            </TooltipContent>
                                        )}
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <h3 className="font-semibold">Step 3: Filter by Service</h3>
                                    <Button variant="link" size="sm" onClick={handleClearFilters} className="text-pink-600 hover:text-pink-700 p-0 h-auto">Clear</Button>
                                </div>
                                <ServiceFilter services={initialServices} selectedServices={selectedServices} onServiceChange={setSelectedServices} />
                            </div>
                            <Button onClick={handleApplyFilters} className="w-full bg-pink-600 hover:bg-pink-700">Update Search</Button>
                        </div>
                        {/* Results Section */}
                        <div className="flex-1 px-4 pt-3 lg:px-6 lg:pt-4 flex flex-col space-y-4">
                            <h2 className="text-xl font-semibold flex-shrink-0">{isLoading ? "Finding clinics..." : `${finalFilteredClinics.length} Clinics Found`}</h2>
                            
                            <Input 
                                type="text"
                                placeholder="Search by name or address..."
                                value={clinicSearchQuery}
                                onChange={(e) => setClinicSearchQuery(e.target.value)}
                                className="h-9"
                            />

                            {isLoading ? (
                                <div className="flex-1 flex items-center justify-center"><Loader2 size={32} className="animate-spin text-pink-500"/></div>
                            ) : (
                                <div className="overflow-y-auto scrollbar-thin h-64">
                                    <ClinicList 
                                        clinics={finalFilteredClinics} 
                                        onViewDetails={handleViewDetailsClick}
                                        onShowRoute={handleShowRoute}
                                        highlightedClinic={highlightedClinic}
                                        onHighlightChange={setHighlightedClinic}
                                    />
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
                {/* Right Panel: Map */}
                <div className="col-span-12 lg:col-span-7 xl:col-span-8 h-full">
                     <DynamicMapLoader 
                        clinics={finalFilteredClinics} 
                        userLocation={userLocation}
                        routeDestination={routeDestination}
                        highlightedClinic={highlightedClinic}
                        onHighlightChange={setHighlightedClinic}
                        panelState={'collapsed'}
                    />
                </div>
            </div>
        ) : (
            <div className="relative h-full overflow-hidden">
                <div className="w-full h-full">
                    <DynamicMapLoader 
                        clinics={finalFilteredClinics} 
                        userLocation={userLocation}
                        routeDestination={routeDestination}
                        highlightedClinic={highlightedClinic}
                        onHighlightChange={setHighlightedClinic}
                        panelState={panelState}
                    />
                </div>
                <SlidingPanel 
                    panelState={panelState} 
                    setPanelState={setPanelState}
                >
                    <AnimatePresence mode="wait">
                        {activeView === 'list' ? renderMobileListView() : renderMobileFiltersView()}
                    </AnimatePresence>
                </SlidingPanel>
            </div>
        )}

        <AnimatePresence>
            {isModalOpen && selectedClinic && (
                <ClinicDetailModal
                    clinic={selectedClinic}
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    allServices={initialServices}
                />
            )}
        </AnimatePresence>
    </div>
  );
} 