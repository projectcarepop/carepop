'use client';

import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";

interface SearchClinicsButtonProps {
  onClick?: () => void; // Optional click handler for future use
  isLoading?: boolean;  // Optional loading state for future use
}

export default function SearchClinicsButton({ onClick, isLoading }: SearchClinicsButtonProps) {
  const handleClick = () => {
    // TODO: Implement actual search logic or call parent handler
    console.log("Search button clicked");
    if (onClick) {
      onClick();
    }
  };

  return (
    <Button 
      type="button" 
      className="w-full" 
      onClick={handleClick}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          {/* Consider a spinner icon here */}
          <span className="animate-pulse">Searching...</span>
        </>
      ) : (
        <>
          <Search size={18} className="mr-2" />
          Search Clinics
        </>
      )}
    </Button>
  );
} 