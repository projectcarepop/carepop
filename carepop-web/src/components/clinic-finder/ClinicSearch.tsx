'use client';

import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';

interface ClinicSearchProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onFindNearMe: () => void;
}

const ClinicSearch: React.FC<ClinicSearchProps> = ({ searchTerm, setSearchTerm, onFindNearMe }) => {
  return (
    <div className="py-12 px-6 bg-primary-foreground rounded-lg shadow-lg mb-8 text-center">
        <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
                Find Your Nearest Clinic
            </h1>
            <p className="text-lg text-gray-600 mb-8">
                Search for clinics by name or service, or use your location to find care near you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <div className="relative flex-grow">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                        type="text"
                        placeholder="Search by clinic name or service..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 h-12 text-base"
                    />
                </div>
                <Button onClick={onFindNearMe} size="lg" className="h-12">
                    <MapPin className="mr-2 h-5 w-5" />
                    Find Near Me
                </Button>
            </div>
      </div>
    </div>
  );
};

export default ClinicSearch; 