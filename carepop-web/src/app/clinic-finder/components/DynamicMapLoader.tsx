/// <reference types="@vis.gl/react-google-maps" />
'use client';

import { Clinic } from '@/lib/types/clinic';
import { PanelState } from './SlidingPanel'; // Assuming PanelState is exported from SlidingPanel
import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';

// Dynamically import MapDisplay with ssr: false
const MapDisplay = dynamic(() => import('./MapDisplay'), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-gray-200"><Loader2 className="animate-spin" size={48} /></div>,
});

interface DynamicMapLoaderProps {
  clinics: Clinic[];
  userLocation: { lat: number; lon: number } | null;
  routeDestination: Clinic | null;
  highlightedClinic: string | null;
  onHighlightChange: (clinicId: string | null) => void;
  panelState: PanelState;
}

// This component now accepts clinics and passes them to MapDisplay
export default function DynamicMapLoader(props: DynamicMapLoaderProps) {
  return <MapDisplay {...props} />;
} 