'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface LocationSearchInputProps {
  onLocationSelect: (location: { lat: number; lon: number }) => void;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function LocationSearchInput({ onLocationSelect }: LocationSearchInputProps) {
  const [query, setQuery] = useState('');

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;

    // This is a placeholder for a future geocoding API call.
    // The 'onLocationSelect' prop is passed for this purpose.
    console.log('Manual search for:', query);
    // When implemented, it would call a geocoding service and then:
    // onLocationSelect({ lat: GOTTEN_LAT, lon: GOTTEN_LON });
  };

  return (
    <form onSubmit={handleSearch} className="flex gap-2">
      <Input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter city, province, or address..."
      />
      <Button type="submit" disabled={!query}>Search</Button>
    </form>
  );
} 