export interface Service {
  id: string; // Corresponds to service ID from the services master table
  name: string; // e.g., "General Consultation"
  // Potentially other service-specific details if needed later
}

export interface OperatingHours {
  // Define structure based on how it's stored in JSONB and what's useful for display
  // Example:
  monday?: string; // "9:00 AM - 5:00 PM" or "Closed"
  tuesday?: string;
  wednesday?: string;
  thursday?: string;
  friday?: string;
  saturday?: string;
  sunday?: string;
  notes?: string; // e.g., "Closed on public holidays"
}

export interface Clinic {
  id: string; // UUID from the database
  name: string;
  
  full_address?: string | null; // Optional: if the backend provides a concatenated version
  street_address?: string | null;
  locality?: string | null; // e.g., City/Municipality, was address_city
  region?: string | null; // e.g., NCR, was address_province
  postal_code?: string | null; // was address_postal_code
  country_code?: string | null;

  latitude: number;
  longitude: number;
  
  contact_phone?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  
  operating_hours?: OperatingHours | string | null; 
                                        
  services_offered?: string[]; // Changed from Service[]
  
  fpop_chapter_affiliation?: string | null;
  additional_notes?: string | null;
  is_active: boolean;
  created_at?: string | Date; // Or just string if not parsing
  updated_at?: string | Date; // Or just string if not parsing
  
  distance_km?: number | null;
} 