'use client';

import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import ClinicList from './ClinicList';
import DynamicMapLoader from './DynamicMapLoader';
import ClinicDetailModal from './ClinicDetailModal';
import SlidingPanel, { PanelState } from './SlidingPanel';
import { Clinic } from '@/lib/types/clinic';
import { Loader2, SlidersHorizontal, ArrowLeft, Search, LocateFixed } from 'lucide-react';
import LocationSearchInput from './LocationSearchInput';
import ServiceFilter from './ServiceFilter';
import { Service } from '@/lib/types/service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import useMediaQuery from '@/hooks/use-media-query';

type ActiveView = 'list' | 'filters';

interface ClinicFinderClientProps {
  initialClinics: Clinic[];
  initialServices: Service[];
  initialFetchError: string | null;
}

export default function ClinicFinderClient({ initialClinics, initialServices, initialFetchError: initialError }: ClinicFinderClientProps) {
  const isDesktop = useMediaQuery('(min-width: 1024px)'); // Use a wider breakpoint for 2-column layout
  
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
  
  // Mobile-specific state
  const [panelState, setPanelState] = useState<PanelState>('collapsed');
  const [activeView, setActiveView] = useState<ActiveView>('list');

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8080';

  useEffect(() => {
    if (error) {
      toast.error(error);
      setError(null); 
    }
  }, [error]);

  const filteredClinics = clinics.filter(clinic => {
    return selectedServices.length === 0 || 
           selectedServices.every(serviceId => 
             (clinic.services_offered || []).includes(serviceId)
           );
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
      const url = `${API_BASE_URL}/api/v1/clinics?latitude=${lat}&longitude=${lon}&radius=${radius * 1000}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch clinics');
      const data = await response.json();
      setClinics(data.data);
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
      
      <div className="flex-grow space-y-6 overflow-y-auto pr-2 scrollbar-thin">
        <Card className="border-none shadow-none">
            <CardHeader><CardTitle>Search & Location</CardTitle></CardHeader>
            <CardContent className="space-y-4">
                <LocationSearchInput onLocationSelect={(loc) => fetchClinicsByLocation(loc, searchRadius)} />
                 <Button variant="outline" onClick={handleGetCurrentLocation} className="w-full">
                    <LocateFixed size={16} className="mr-2"/> Use My Current Location
                 </Button>
                <div>
                    <Label htmlFor="radius-slider-mobile">Search Radius: {searchRadius} km</Label>
                    <Slider id="radius-slider-mobile" min={1} max={50} step={1} value={[searchRadius]} onValueChange={(v: number[]) => setSearchRadius(v[0])} disabled={!userLocation} />
                </div>
            </CardContent>
        </Card>
        <Card className="border-none shadow-none">
          <CardHeader className="flex flex-row items-center justify-between py-2">
            <CardTitle>Services Offered</CardTitle>
            <Button variant="link" size="sm" onClick={handleClearFilters} className="text-pink-600 hover:text-pink-700 p-0 h-auto">Clear</Button>
          </CardHeader>
          <CardContent>
            <ServiceFilter services={initialServices} selectedServices={selectedServices} onServiceChange={setSelectedServices} />
          </CardContent>
        </Card>
      </div>

      <div className="flex-shrink-0 py-4 border-t">
        <Button onClick={handleApplyFilters} className="w-full bg-pink-600 hover:bg-pink-700">Show {filteredClinics.length} Results</Button>
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
      <h2 className="text-xl font-semibold mb-2 flex-shrink-0">{isLoading ? "Finding clinics..." : `${filteredClinics.length} Clinics Found`}</h2>
      <div className="flex-grow overflow-y-auto pr-2 scrollbar-thin">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Loader2 size={32} className="animate-spin text-pink-500"/></div>
        ) : (
          <ClinicList 
            clinics={filteredClinics} 
            onViewDetails={handleViewDetailsClick}
            onShowRoute={handleShowRoute}
            highlightedClinic={highlightedClinic}
            onHighlightChange={setHighlightedClinic}
          />
        )}
      </div>
    </motion.div>
  );

  const renderMobileCollapsedView = () => (
    <div 
        className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400 cursor-pointer"
        onClick={() => setPanelState('partial')}
    >
        <Search size={20} className="mr-2"/>
        <span className="font-medium">Search for clinics</span>
    </div>
  );
  
  const renderDesktopSidebar = () => {
      return (
        <div className="w-[420px] h-screen flex-shrink-0 bg-white dark:bg-gray-950 flex flex-col border-r border-gray-200 dark:border-gray-800">
            <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-800">
                <h1 className="text-2xl font-bold">Find a Clinic</h1>
            </div>
            <div className="p-4 space-y-4 flex-shrink-0">
                 <LocationSearchInput onLocationSelect={(loc) => fetchClinicsByLocation(loc, searchRadius)} />
                 <Button variant="outline" onClick={handleGetCurrentLocation} className="w-full">
                     <LocateFixed size={16} className="mr-2" /> Use My Current Location
                 </Button>
            </div>
            <div className="flex-grow p-4 space-y-4 overflow-y-auto scrollbar-thin">
                <div className="space-y-2">
                    <Label htmlFor="radius-slider-desktop">Search Radius: {searchRadius} km</Label>
                    <Slider id="radius-slider-desktop" min={1} max={50} step={1} value={[searchRadius]} onValueChange={(v: number[]) => setSearchRadius(v[0])} disabled={!userLocation} />
                </div>
                <div>
                    <div className="flex justify-between items-center mb-2">
                        <Label>Services Offered</Label>
                        <Button variant="link" size="sm" onClick={handleClearFilters} className="text-pink-600 hover:text-pink-700 p-0 h-auto">Clear</Button>
                    </div>
                    <ServiceFilter services={initialServices} selectedServices={selectedServices} onServiceChange={setSelectedServices} />
                </div>
                <Button onClick={handleApplyFilters} className="w-full bg-pink-600 hover:bg-pink-700">Update Search</Button>

                <h2 className="text-xl font-semibold pt-4 border-t">{isLoading ? "Finding clinics..." : `${filteredClinics.length} Clinics Found`}</h2>
                {isLoading ? (
                <div className="flex items-center justify-center h-32"><Loader2 size={32} className="animate-spin text-pink-500"/></div>
                ) : (
                <ClinicList 
                    clinics={filteredClinics} 
                    onViewDetails={handleViewDetailsClick}
                    onShowRoute={handleShowRoute}
                    highlightedClinic={highlightedClinic}
                    onHighlightChange={setHighlightedClinic}
                />
                )}
            </div>
        </div>
      )
  }

  if (isDesktop) {
    return (
        <div className="h-screen w-full flex">
            {renderDesktopSidebar()}
            <div className="flex-grow h-screen relative">
                <DynamicMapLoader 
                    clinics={filteredClinics} 
                    userLocation={userLocation}
                    routeDestination={routeDestination}
                    highlightedClinic={highlightedClinic}
                    onHighlightChange={setHighlightedClinic}
                    panelState={'collapsed'}
                />
            </div>
            <ClinicDetailModal clinic={selectedClinic} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} allServices={initialServices} />
        </div>
    );
  }

  // Mobile View
  return (
    <>
      <div className="h-screen w-full relative overflow-hidden">
        <DynamicMapLoader 
          clinics={filteredClinics} 
          userLocation={userLocation}
          routeDestination={routeDestination}
          highlightedClinic={highlightedClinic}
          onHighlightChange={setHighlightedClinic}
          panelState={panelState}
        />
        
        <SlidingPanel 
            panelState={panelState} 
            setPanelState={setPanelState}
        >
            <AnimatePresence mode="wait">
                {panelState !== 'collapsed' && (activeView === 'list' ? renderMobileListView() : renderMobileFiltersView())}
            </AnimatePresence>
            {panelState === 'collapsed' && renderMobileCollapsedView()}
        </SlidingPanel>
      </div>
      
      <ClinicDetailModal clinic={selectedClinic} isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} allServices={initialServices} />
    </>
  );
} 