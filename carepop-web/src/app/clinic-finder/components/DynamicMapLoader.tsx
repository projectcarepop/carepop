/// <reference types="@vis.gl/react-google-maps" />
'use client';

import dynamic from 'next/dynamic';
import React from 'react';
import { Clinic } from '@/lib/types/clinic'; // Import the Clinic type

// Dynamically import MapDisplay with ssr: false
const MapDisplay = dynamic(() => import('./MapDisplay'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-gray-100 dark:bg-gray-700 rounded-lg">
      <p className='text-gray-500 dark:text-gray-400'>Loading map...</p>
    </div>
  ),
});

interface DynamicMapLoaderProps {
  clinics: Clinic[]; // Add clinics prop
}

// This component now accepts clinics and passes them to MapDisplay
export default function DynamicMapLoader({ clinics }: DynamicMapLoaderProps) {
  return <MapDisplay clinics={clinics} />;
} 