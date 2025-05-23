'use client';

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react"; // Optional: for an icon

export default function LocationSearchInput() {
  // TODO: Add state and handler for input value
  // TODO: Add "Use Current Location" button and geolocation logic

  return (
    <div className="space-y-2">
      <Label htmlFor="location-search" className="text-base font-medium">
        Location
      </Label>
      <div className="relative flex items-center">
        <Input
          type="text"
          id="location-search"
          placeholder="Search by address, city, or area..."
          className="pl-10 pr-4 py-2 border rounded-md w-full"
          // TODO: value and onChange props
        />
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
          <Search size={18} />
        </div>
      </div>
      {/* <Button variant="outline" className="mt-2 w-full">
        <LocateFixed size={18} className="mr-2" /> Use Current Location
      </Button> */}
      {/* Placeholder for geolocation button, add LocateFixed from lucide-react if used */}
    </div>
  );
} 