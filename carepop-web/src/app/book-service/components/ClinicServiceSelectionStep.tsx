'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { Check, MapPin, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ServerCrash } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Raw API response types (matching backend structure before frontend mapping)
interface RawApiClinic {
  id: string;
  name: string;
  full_address: string | null; // As per backend controller
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  services_offered?: Record<string, unknown> | null; // Changed from any
  operating_hours?: Record<string, unknown> | null; // Changed from any
  fpop_chapter_affiliation?: string | null;
  is_active: boolean;
  // created_at, updated_at, etc.
}

interface RawApiService {
  id: string;
  name: string;
  description?: string | null;
  category?: string | null;
  typical_duration_minutes?: number | null;
  requires_provider_assignment: boolean; // Changed: now mandatory based on API spec for services
  additional_details?: Record<string, unknown> | null; // Changed from any
  is_active?: boolean; // From nested services object
  created_at?: string;
  updated_at?: string;
  clinic_specific_price?: number | null; // From clinic_services table
}


// Frontend display-focused types
interface ApiClinic {
  id: string;
  name: string;
  full_address: string; // Non-nullable for display, with fallback
}

interface ApiService {
  id: string;
  name: string;
  description?: string | null;
  price?: number | null;
  duration?: string | null;
  requires_provider_assignment: boolean; // Added
  categoryName?: string; // For frontend categorization
}

// Define categories and service name mappings
// In a real app, this mapping might come from a config or be part of the service data itself
const SERVICE_CATEGORIES_CONFIG = [
  {
    name: "Family Planning & Contraception",
    serviceNames: [
      "Family Planning Counseling",
      "IUD Insertion",
      "IUD Check-up",
      "IUD Removal",
    ],
  },
  {
    name: "Maternal & Obstetric Care",
    serviceNames: [
      "Birthing Services",
      "Pre-natal Consultation",
      "Normal Delivery Assistance",
      "Post-natal Check-up",
      "Maternal Immunization - Hepa B",
      "Maternal Immunization - Tetanus Toxoid",
    ],
  },
  {
    name: "Gynecology & Women's Health",
    serviceNames: [
      "Gynecology Consultation",
      "Cervical Cauterization",
      "Albothyl Concentrate Application",
      "Gyne Cervical/Vaginal Douche",
      "Pap Smear Reading/Test",
      "Women Pelvic Examination",
      "Women Breast Examination",
      "Women Infertility Consultation/Management",
      "Women UTI/RTI Management",
      "Other Gynecological Cases",
    ],
  },
  {
    name: "Pediatrics & Child Health",
    serviceNames: [
      "Well-baby/Child Check-up",
      "Child Immunization - Hepa B",
      "Child Immunization - MMR",
      "Child Immunization - Oral Polio",
      "Child Immunization - Measles",
      "Child Immunization - BCG",
      "Child Immunization - Chickenpox",
      "Child Immunization - Hib",
      "Child Immunization - PentactHib",
      "Child Immunization - Mumpa Measles Rubella",
      "Child Immunization - URTI",
      "Child Immunization - DPT",
      "Sick Baby/Child Consultation",
      "Vitamin A Supplementation",
      "Nebulization",
      "Ear Piercing",
      "Circumcision",
      "Other Medical Cases (Child Health)",
    ],
  },
  {
    name: "General Medicine & Consultations",
    serviceNames: [
      "Hypertension (HPN) Management",
      "UTI Management",
      "General Medicine Consultation",
      "Minor Surgery",
      "Ophthalmology Consultation",
      "Blood Pressure Check-up (Non-resupply)",
      "Blood Pressure Check-up (Resupply)",
    ],
  },
  {
    name: "Dental Care",
    serviceNames: [
      "Dental Restoration (Filling)",
      "Dental Prophylaxis (Cleaning)",
      "Tooth Extraction",
    ],
  },
  {
    name: "Men's Health",
    serviceNames: [
      "Men Infertility Consultation/Management",
      "Men Impotency Management",
      "Men Urological Screening",
      // "Men STD Screening / VDRL", // Moved to Lab/Diagnostics to avoid duplication
    ],
  },
  {
    name: "Laboratory & Diagnostics",
    serviceNames: [
      "Pregnancy Test",
      "Urinalysis",
      "Fecalysis",
      "Complete Blood Count (CBC)",
      "Hemoglobin Test (HB/HGB)",
      "Hematocrit Test (HCF)",
      "Blood Chemistry Panel",
      "Platelet Count",
      "Fasting Blood Sugar (FBS)",
      "Ultrasound",
      "Pap Smear Reading/Test", // Appears here and in Gyno, keeping in Gyno as primary for now or we decide one
      "Chest X-ray",
      "Widals Test (Typhoid)",
      "Biopsy Procedure/Reading",
      "Abdominal X-ray",
      "Electrocardiogram (ECG)",
      "Thyroid Clearance Test",
      "Gram Stain",
      "Wet Smear/Mount",
      "STD Screening / VDRL Test", // Primary category
      "Men STD Screening / VDRL", // Will be caught by the above if name is same
      "Hepatitis B Surface Antigen (HBsAg) Test",
      "Sperm Analysis",
      "White Blood Cell (WBC) Count",
      "Clotting Time Test",
      "Bleeding Time Test",
      "Blood Uric Acid (BUA) Test",
      "Other Laboratory Tests",
    ],
  },
];

// Helper to assign categoryName to a service
const getCategoryForService = (serviceName: string): string => {
  for (const category of SERVICE_CATEGORIES_CONFIG) {
    if (category.serviceNames.includes(serviceName)) {
      return category.name;
    }
  }
  return "Other Services"; // Fallback category
};

interface ClinicServiceSelectionStepProps {
  selectedClinicId: string | null;
  setSelectedClinicId: (id: string | null) => void;
  selectedServiceId: string | null;
  setSelectedServiceId: (id: string | null, serviceDetails?: { name: string; price?: number | null; duration?: string | null; requiresProviderAssignment: boolean }) => void;
  onNext: (data: { 
    clinicId: string; 
    serviceId: string; 
    clinicName: string; 
    serviceName: string; 
    price?: number | null; // Allow null
    duration?: string | null; // Allow null
    requiresProviderAssignment: boolean; // Added
  }) => void;
}

interface ServiceCategory {
    name: string;
    services: ApiService[];
}

const ClinicServiceSelectionStep: React.FC<ClinicServiceSelectionStepProps> = ({
  selectedClinicId,
  setSelectedClinicId,
  selectedServiceId,
  setSelectedServiceId,
  onNext,
}) => {
  const [clinicsList, setClinicsList] = useState<ApiClinic[]>([]);
  const [isLoadingClinics, setIsLoadingClinics] = useState(true);
  const [clinicError, setClinicError] = useState<string | null>(null);

  const [availableServices, setAvailableServices] = useState<ApiService[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [serviceError, setServiceError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [openAccordionItems, setOpenAccordionItems] = useState<string[]>([]); // For controlled accordion state

  useEffect(() => {
    const fetchClinics = async () => {
      setIsLoadingClinics(true);
      setClinicError(null);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
        if (!baseUrl) {
          throw new Error('Backend API URL is not configured. Please set NEXT_PUBLIC_BACKEND_API_URL.');
        }
        const clinicsUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/directory/clinics/search?`;
        const response = await fetch(clinicsUrl);
        if (!response.ok) {
          throw new Error(`Failed to fetch clinics: ${response.status} ${response.statusText} from ${clinicsUrl}`);
        }
        const data = await response.json(); // Expects { data: RawApiClinic[], ... }
        const fetchedClinics: ApiClinic[] = (data.data || []).map((clinic: RawApiClinic) => ({
          id: clinic.id,
          name: clinic.name,
          full_address: clinic.full_address || 'Address not available',
        }));
        setClinicsList(fetchedClinics);
      } catch (error) {
        console.error("Error fetching clinics:", error);
        setClinicError(error instanceof Error ? error.message : 'An unknown error occurred');
        setClinicsList([]);
      }
      setIsLoadingClinics(false);
    };
    fetchClinics();
  }, []);

  useEffect(() => {
    if (selectedClinicId) {
      const fetchServices = async () => {
        setIsLoadingServices(true);
        setServiceError(null);
        setAvailableServices([]);
        try {
          const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
          if (!baseUrl) {
            throw new Error('Backend API URL is not configured. Please set NEXT_PUBLIC_BACKEND_API_URL.');
          }
          const servicesUrl = `${baseUrl.replace(/\/$/, '')}/api/v1/clinics/${selectedClinicId}/services`;
          const response = await fetch(servicesUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch services: ${response.status} ${response.statusText} from ${servicesUrl}`);
          }
          const rawServicesData = await response.json() as RawApiService[]; // Type assertion here
          
          const fetchedServices: ApiService[] = (rawServicesData || []).map((service: RawApiService) => ({
            id: service.id,
            name: service.name,
            description: service.description,
            price: service.clinic_specific_price,
            duration: service.typical_duration_minutes
              ? `${service.typical_duration_minutes} minutes`
              : 'Duration not specified',
            requires_provider_assignment: service.requires_provider_assignment !== null && service.requires_provider_assignment !== undefined 
                                            ? service.requires_provider_assignment 
                                            : true, // Default to true if undefined/null from API (safer for booking flow)
            categoryName: getCategoryForService(service.name)
          }));
          setAvailableServices(fetchedServices);
        } catch (error) {
          console.error("Error fetching services:", error);
          setServiceError(error instanceof Error ? error.message : 'An unknown error occurred');
          setAvailableServices([]);
        }
        setIsLoadingServices(false);
      };
      fetchServices();
      setSelectedServiceId(null);
      setOpenAccordionItems([]); // Close accordion items when clinic changes
    } else {
      setAvailableServices([]);
      setSelectedServiceId(null);
      setOpenAccordionItems([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedClinicId]);

  // Memoize categorized and filtered services
  const categorizedAndFilteredServices = useMemo(() => {
    const grouped: Record<string, ApiService[]> = {};

    availableServices.forEach(service => {
      if (!service.name.toLowerCase().includes(searchTerm.toLowerCase())) {
        return; // Skip if service name doesn't match search term
      }
      const category = service.categoryName || "Other Services";
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(service);
    });

    // Ensure consistent order of categories based on SERVICE_CATEGORIES_CONFIG
    const result: ServiceCategory[] = SERVICE_CATEGORIES_CONFIG.map(configCategory => ({
      name: configCategory.name,
      services: grouped[configCategory.name] || [],
    })); 

    // Add "Other Services" if it has any services and isn't already in config
    if (grouped["Other Services"] && grouped["Other Services"].length > 0 && !SERVICE_CATEGORIES_CONFIG.find(c => c.name === "Other Services")) {
        result.push({
            name: "Other Services",
            services: grouped["Other Services"]
        });
    }
    return result.filter(category => category.services.length > 0); // Only return categories with services after filtering
  }, [availableServices, searchTerm]);

  const handleClinicSelect = (clinicId: string) => {
    setSelectedClinicId(clinicId);
    setSearchTerm("");
  };

  const handleServiceSelect = (serviceId: string) => {
    const serviceDetails = availableServices.find(s => s.id === serviceId);
    if (serviceDetails) {
        setSelectedServiceId(serviceId, {
            name: serviceDetails.name,
            price: serviceDetails.price,
            duration: serviceDetails.duration,
            requiresProviderAssignment: serviceDetails.requires_provider_assignment,
        });
    } else {
        setSelectedServiceId(serviceId); // Fallback if details not found (should not happen)
    }
  };

  const handleProceed = () => {
    if (selectedClinicId && selectedServiceId) {
      const clinic = clinicsList.find(c => c.id === selectedClinicId);
      const service = availableServices.find(s => s.id === selectedServiceId);
      if (clinic && service) {
        onNext({
          clinicId: selectedClinicId,
          serviceId: selectedServiceId,
          clinicName: clinic.name,
          serviceName: service.name,
          price: service.price,
          duration: service.duration,
          requiresProviderAssignment: service.requires_provider_assignment,
        });
      }
    }
  };

  if (isLoadingClinics && !clinicsList.length) { // Show card skeleton only on initial full load
    return (
      <Card className="p-6 w-full max-w-4xl mx-auto shadow-lg md:max-h-[80vh] overflow-hidden">
        <CardContent className="flex flex-col md:flex-row gap-6 md:gap-8 p-0">
          <div className="w-full md:w-1/3 space-y-2">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-16 w-full mb-2" />
            <Skeleton className="h-16 w-full" />
          </div>
          <div className="w-full md:w-2/3 space-y-2">
            <Skeleton className="h-6 w-3/4 mb-1" />
            <Skeleton className="h-4 w-full mb-4" />
            <Skeleton className="h-10 w-full mb-4" /> {/* Search bar skeleton */}
            <Skeleton className="h-12 w-full mb-2" /> {/* Accordion item skeleton */}
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full mb-2" />
            <Skeleton className="h-12 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  // Main layout as a Card
  return (
    <Card className="w-full max-w-5xl mx-auto shadow-xl flex flex-col overflow-hidden bg-white md:max-h-[600px] lg:max-h-[600px]"> 
      <CardContent className="p-4 md:p-6 flex flex-col md:flex-row gap-4 md:gap-6 flex-grow overflow-hidden"> {/* Flex grow and overflow for internal scrolling */}
        {/* Left Column: Clinic Selection */} 
        <div className="w-full md:w-1/3 flex-shrink-0 overflow-y-auto p-1"> 
          <h2 className="text-lg font-semibold text-gray-800 mb-1 sticky top-0 z-10 pb-2">1. Select Clinic</h2>
          {/* <p className="text-xs text-gray-500 mb-3 sticky top-8 bg-white z-10 pb-2">Choose a clinic to see its services.</p> */}
          
          {clinicError && (
             <Alert variant="destructive" className="mt-2">
                <ServerCrash className="h-4 w-4" />
                <AlertTitle>Clinic Error</AlertTitle>
                <AlertDescription>{clinicError}</AlertDescription>
            </Alert>
          )}
          {!isLoadingClinics && !clinicError && clinicsList.length === 0 && (
            <p className="text-gray-500 text-sm mt-4">No clinics available.</p>
          )}
          {clinicsList.length > 0 && (
            <RadioGroup
              value={selectedClinicId || ''}
              onValueChange={handleClinicSelect}
              className="space-y-1.5"
            >
              {clinicsList.map(clinic => (
                <Label
                  key={clinic.id}
                  htmlFor={`clinic-${clinic.id}`}
                  className={cn(
                    "flex items-center justify-between p-2.5 border-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors bg-white shadow-sm text-xs",
                    selectedClinicId === clinic.id && "bg-primary-50 border-primary ring-1 ring-primary"
                  )}
                >
                  <div className="flex items-center">
                    <MapPin className={cn("h-4 w-4 mr-2 shrink-0", selectedClinicId === clinic.id ? "text-primary-600" : "text-gray-400")} />
                    <div className="flex-grow">
                      <span className="font-medium text-gray-700 block leading-tight">{clinic.name}</span>
                      <p className="text-gray-500 leading-tight">{clinic.full_address}</p>
                    </div>
                  </div>
                  <RadioGroupItem value={clinic.id} id={`clinic-${clinic.id}`} className="sr-only" />
                  {selectedClinicId === clinic.id && <Check className="h-4 w-4 text-primary-600 shrink-0 ml-2" />}
                </Label>
              ))}
            </RadioGroup>
          )}
        </div>

        {/* Right Column: Service Selection */} 
        <div className="w-full md:w-2/3 flex flex-col"> {/* Removed h-full and overflow-hidden */} 
          <div className="flex-shrink-0 sticky top-0 z-10 pt-0"> {/* Reverted p-1 here, kept pt-0 */}
            <h2 className="text-lg font-semibold text-gray-800 mb-1">2. Select Service</h2>
            <p className="text-xs text-gray-500 mb-2">
              {selectedClinicId && clinicsList.find(c => c.id === selectedClinicId) ? `Services at ${clinicsList.find(c => c.id === selectedClinicId)?.name}` : 'Please select a clinic first'}
            </p>
            {selectedClinicId && (
              <div className="relative mb-3 pl-1 pr-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input 
                  type="text"
                  placeholder="Search services..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 text-sm h-9 w-full"
                  disabled={isLoadingServices || !selectedClinicId}
                />
              </div>
            )}
          </div>
          
          {selectedClinicId && (
            <div className="flex-grow overflow-y-auto pr-1 pb-2"> {/* Scrollable area for accordion */} 
              {isLoadingServices && (
                <div className="space-y-2 mt-1">
                  {[1,2,3,4].map(i => (
                      <div key={i} className="flex items-center space-x-2 rounded-md border p-2.5">
                          <Skeleton className="h-3 w-4/5" />
                      </div>
                  ))}
                </div>
              )}
              {serviceError && (
                <Alert variant="destructive" className="mt-1 text-xs">
                  <ServerCrash className="h-3 w-3" />
                  <AlertTitle>Service Error</AlertTitle>
                  <AlertDescription>{serviceError}</AlertDescription>
                </Alert>
              )}
              {!isLoadingServices && !serviceError && categorizedAndFilteredServices.length === 0 && (
                <p className="text-gray-500 text-xs mt-3 text-center py-5">
                  {searchTerm ? `No services match "${searchTerm}".` : "No services available for this clinic."}
                </p>
              )}

              {!isLoadingServices && !serviceError && categorizedAndFilteredServices.length > 0 && (
                <RadioGroup
                  value={selectedServiceId || ''}
                  onValueChange={handleServiceSelect} 
                  className="mt-0"
                >
                  <Accordion 
                      type="multiple" 
                      value={openAccordionItems}
                      onValueChange={setOpenAccordionItems} 
                      className="w-full"
                  >
                    {categorizedAndFilteredServices.map((category) => (
                      category.services.length > 0 && (
                        <AccordionItem value={category.name} key={category.name} className="border-b border-gray-100 last:border-b-0">
                          <AccordionTrigger className="hover:no-underline text-xs font-medium text-gray-600 py-2 px-1 data-[state=open]:text-primary-600 data-[state=open]:font-semibold">
                            {category.name} ({category.services.length})
                          </AccordionTrigger>
                          <AccordionContent className="pt-0 pb-0 pl-0.5 pr-0.5">
                            <div className="space-y-1 py-1.5">
                              {category.services.map((service) => (
                                <Label
                                  key={service.id}
                                  htmlFor={`service-${service.id}`}
                                  className={cn(
                                    "flex items-start justify-between p-2 rounded-md cursor-pointer hover:bg-gray-100 transition-colors text-xs",
                                    selectedServiceId === service.id && "bg-primary-50 border-primary ring-1 ring-primary",
                                    "border border-transparent"
                                  )}
                                >
                                  <div className="flex-grow">
                                    <span className="font-normal text-gray-700 block leading-tight">{service.name}</span>
                                    {service.price !== null && service.price !== undefined && (
                                      <span className="text-gray-500 block mt-0.5">
                                        Price: PHP {service.price.toFixed(2)}
                                      </span>
                                    )}
                                    {service.duration && (
                                      <span className="text-gray-400 block mt-0.5">
                                        Duration: {service.duration}
                                      </span>
                                    )}
                                  </div>
                                  <RadioGroupItem value={service.id} id={`service-${service.id}`} className="sr-only" />
                                  {selectedServiceId === service.id && <Check className="h-4 w-4 text-primary shrink-0 ml-2 mt-0.5" />}
                                </Label>
                              ))}
                            </div>
                          </AccordionContent>
                        </AccordionItem>
                      )
                    ))}
                  </Accordion>
                </RadioGroup>
              )}
            </div>
          )}
          {!selectedClinicId && !isLoadingServices && (
             <p className="text-gray-400 text-sm mt-4 text-center py-10 flex-grow flex items-center justify-center">Please select a clinic to view its services.</p>
          )}
        </div>
      </CardContent>
      <CardFooter className="p-4 md:p-6 border-t flex justify-end">
        <Button
          onClick={handleProceed}
          disabled={!selectedClinicId || !selectedServiceId || isLoadingClinics || isLoadingServices}
          size="lg"
          className="shadow-md"
        >
          Next: Select Provider
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ClinicServiceSelectionStep; 