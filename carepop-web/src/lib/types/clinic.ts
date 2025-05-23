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
  
  // Address components (assuming these are separate fields in your DB)
  address_street?: string | null;
  address_barangay?: string | null;
  address_city: string; // Or city/municipality
  address_province: string;
  address_postal_code?: string | null;
  full_address?: string | null; // Optional: if the backend provides a concatenated version

  latitude: number;
  longitude: number;
  
  contact_phone?: string | null;
  contact_email?: string | null;
  
  // Store as JSONB in DB, define a clear structure for it
  // The API might return it as a structured object or a pre-formatted summary string
  operating_hours?: OperatingHours | string | null; 
                                        
  services_offered?: Service[]; // Array of service objects offered by the clinic
  
  fpop_chapter_affiliation?: string | null;
  is_active: boolean;
  
  // Optional fields that might be added by the API (e.g., distance)
  distance_km?: number | null;

  // Any other relevant fields from your \`clinics\` table
  // e.g., website_url, social_media_links (JSONB?), specific_details_json (JSONB?)
} 