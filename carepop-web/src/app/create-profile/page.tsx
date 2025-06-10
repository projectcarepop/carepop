'use client';

import React, { useState, useEffect, FormEvent, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Profile } from '@/lib/contexts/AuthContext'; // Assuming Profile is exported
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress"; // For step indication
import { User as UserIcon, AlertTriangle, CheckCircle, Loader2, ArrowLeft, ArrowRight, Building, Map, UserCircle, HeartPulse } from 'lucide-react';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';
import { Combobox } from "@/components/ui/combobox"; // Added Combobox import

interface StepConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  fields: (keyof Profile)[]; // Fields for this step
  requiredFields?: (keyof FormProfile)[]; // Optional: Fields required for this step
  label: string;
}

// Define profile fields as used in the form, matching the Profile interface
type FormProfile = Omit<Profile, 'user_id' | 'age' | 'username' | 'avatar_url'>;

// Define AddressSelectItem type
interface AddressSelectItem {
  value: string;
  label: string;
}

// Define Barangay type based on observed data structure
interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
  region_code: string; // Assuming this is also present or might be useful
  // Add other fields if necessary based on barangays.json structure
}

const stepsConfig: StepConfig[] = [
  {
    title: "Personal Details",
    subtitle: "Let's start with some basic information about you.",
    icon: UserCircle,
    fields: ['firstName', 'middleInitial', 'lastName', 'dateOfBirth', 'contactNo'],
    requiredFields: ['firstName', 'lastName', 'dateOfBirth', 'contactNo'],
    label: "Personal Details"
  },
  {
    title: "Gender Identity",
    subtitle: "Help us understand you better.",
    icon: HeartPulse,
    fields: ['genderIdentity', 'pronouns', 'assignedSexAtBirth', 'civilStatus', 'religion'],
    requiredFields: ['genderIdentity', 'pronouns', 'assignedSexAtBirth', 'civilStatus'], // religion can be optional
    label: "Gender Identity"
  },
  {
    title: "Professional & Health ID",
    subtitle: "A little more about your professional life and health coverage.",
    icon: Building,
    fields: ['occupation', 'philhealthNo'],
    requiredFields: ['occupation'], // philhealthNo can be optional
    label: "Professional & Health ID"
  },
  {
    title: "Your Address",
    subtitle: "Where can we reach you or send information?",
    icon: Map,
    fields: ['provinceCode', 'cityMunicipalityCode', 'barangayCode', 'street'],
    requiredFields: ['provinceCode', 'cityMunicipalityCode', 'barangayCode', 'street'],
    label: "Your Address"
  }
];

export default function CreateProfileWizardPage() {
  const { user, session, profile: initialProfile, fetchProfile, isLoading: authLoading, error: authError } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0); // 0-indexed

  const [formData, setFormData] = useState<Partial<FormProfile>>({});
  const [stepErrors, setStepErrors] = useState<Record<string, string>>({}); // For inline field errors

  // Address Info - API Data Lists
  const [provincesList, setProvincesList] = useState<AddressSelectItem[]>([]);
  const [citiesMunicipalitiesList, setCitiesMunicipalitiesList] = useState<AddressSelectItem[]>([]);
  const [barangaysList, setBarangaysList] = useState<AddressSelectItem[]>([]);

  // Address Info - API Loading States
  const [provincesLoading, setProvincesLoading] = useState(false);
  const [citiesMunicipalitiesLoading, setCitiesMunicipalitiesLoading] = useState(false);
  const [barangaysLoading, setBarangaysLoading] = useState(false);
  const [addressApiError, setAddressApiError] = useState<string | null>(null);

  const [pageLoading, setPageLoading] = useState(false); // For form submission
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace('/login');
    }
    if (initialProfile) {
      setFormData({
        firstName: initialProfile.firstName || '',
        middleInitial: initialProfile.middleInitial || '',
        lastName: initialProfile.lastName || '',
        dateOfBirth: initialProfile.dateOfBirth || '',
        genderIdentity: initialProfile.genderIdentity || '',
        pronouns: initialProfile.pronouns || '',
        assignedSexAtBirth: initialProfile.assignedSexAtBirth || '',
        civilStatus: initialProfile.civilStatus || '',
        religion: initialProfile.religion || '',
        occupation: initialProfile.occupation || '',
        street: initialProfile.street || '',
        provinceCode: initialProfile.provinceCode || '',
        cityMunicipalityCode: initialProfile.cityMunicipalityCode || '',
        barangayCode: initialProfile.barangayCode || '',
        contactNo: initialProfile.contactNo || '',
        philhealthNo: initialProfile.philhealthNo || '',
      });
      // Trigger address dropdown loads if codes are present
      if (initialProfile.provinceCode) {
        // This will trigger the useEffect for cities/municipalities
      }
    }
  }, [user, authLoading, router, initialProfile]);
  
    useEffect(() => {
      if (authError) {
          console.warn("AuthContext has an error:", authError);
      }
    }, [authError]);

  // Fetch all provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      setProvincesLoading(true);
      setAddressApiError(null);
      try {
        const response = await fetch('/data/psgc/provinces.json'); // Use local public file
        if (!response.ok) throw new Error(`Failed to load provinces.json: ${response.status} ${response.statusText}`);
        const data = await response.json();
        setProvincesList(Array.isArray(data) ? data.map((p: { province_code: string; province_name: string; }) => ({ value: p.province_code, label: p.province_name || '' })).sort((a,b) => a.label.localeCompare(b.label)) : []);
      } catch (err) {
        console.error("Failed to fetch local provinces.json:", err);
        const fetchError = err as { message?: string };
        setAddressApiError(`Failed to load provinces: ${fetchError.message}`);
        setProvincesList([]);
      }
      setProvincesLoading(false);
    };
    fetchProvinces();
  }, []);

  // Load and filter cities/municipalities when provinceCode changes from formData
  useEffect(() => {
    const currentProvinceCode = formData.provinceCode;
    if (currentProvinceCode) {
      const loadAndFilterCitiesMunicipalities = async () => {
        console.log('[Debug] loadAndFilterCitiesMunicipalities: START for provinceCode:', currentProvinceCode); // DEBUG LOG
        setCitiesMunicipalitiesLoading(true);
        setAddressApiError(null);
        setCitiesMunicipalitiesList([]); // Clear previous list
        try {
          const response = await fetch('/data/psgc/cities-municipalities.json'); // Use local public file
          console.log('[Debug] loadAndFilterCitiesMunicipalities: Fetch response status:', response.status, response.statusText); // DEBUG LOG
          if (!response.ok) throw new Error(`Failed to load cities-municipalities.json: ${response.status} ${response.statusText}`);
          const allCitiesMunicipalities = await response.json();
          console.log('[Debug] loadAndFilterCitiesMunicipalities: Raw data after response.json():', allCitiesMunicipalities); // DEBUG LOG
          console.log('[Debug] loadAndFilterCitiesMunicipalities: Is raw data an array?', Array.isArray(allCitiesMunicipalities)); // DEBUG LOG
          
          if (Array.isArray(allCitiesMunicipalities)) {
            const filtered = allCitiesMunicipalities
              .filter((item: { province_code: string; }) => {
                // console.log('[Debug] Filtering city/mun item:', item, 'against provinceCode:', currentProvinceCode); // Optional: very verbose log
                return item.province_code === currentProvinceCode;
              });
            console.log('[Debug] loadAndFilterCitiesMunicipalities: Filtered list before map:', filtered); // DEBUG LOG
            
            const mappedList = filtered.map((item: { city_code: string; city_name: string; }) => {
                // console.log('City/Mun Item:', item); // Keep this if needed for individual item structure
                return { value: item.city_code, label: item.city_name || '' };
              })
              .sort((a,b) => a.label.localeCompare(b.label));
            setCitiesMunicipalitiesList(mappedList);
          } else {
            setCitiesMunicipalitiesList([]);
            console.error('[Debug] loadAndFilterCitiesMunicipalities: Data is not an array!'); // DEBUG LOG
            throw new Error('Cities/Municipalities data is not an array');
          }
        } catch (err) {
          console.error("Failed to load/filter local cities-municipalities.json:", err);
          const fetchError = err as { message?: string };
          setAddressApiError(`Failed to load cities/municipalities: ${fetchError.message}`);
          setCitiesMunicipalitiesList([]);
        }
        setCitiesMunicipalitiesLoading(false);
      };
      loadAndFilterCitiesMunicipalities();
    } else {
      setCitiesMunicipalitiesList([]);
      setBarangaysList([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.provinceCode]);

  // Load and filter barangays when cityMunicipalityCode changes from formData
  const loadAndFilterBarangays = useCallback(async (cityCode: string | undefined) => {
    if (!cityCode) {
      setBarangaysList([]);
      // Reset barangayCode in formData if city is cleared
      setFormData(prev => ({ ...prev, barangayCode: '' })); 
      return;
    }
    console.log('[Debug] loadAndFilterBarangays: START for city_code:', cityCode);
    setBarangaysLoading(true);
    setAddressApiError(null);
    try {
      // Corrected fetch path to local JSON file
      const response = await fetch('/data/psgc/barangays.json'); 
      if (!response.ok) {
        console.error('[Debug] loadAndFilterBarangays: Fetch error! Status:', response.status);
        setAddressApiError(`Failed to load barangays: ${response.statusText}`);
        setBarangaysList([]);
        setBarangaysLoading(false); // Ensure loading is set to false on error
        return;
      }
      const rawData: Barangay[] = await response.json();
      console.log('[Debug] loadAndFilterBarangays: Raw data length:', rawData.length);
      console.log('[Debug] loadAndFilterBarangays: First 5 items of raw data:', rawData.slice(0, 5));
      console.log('[Debug] loadAndFilterBarangays: Is raw data an array?', Array.isArray(rawData));

      const targetCodeExists = rawData.some(item => item.city_code === cityCode);
      console.log(`[Debug] loadAndFilterBarangays: Does city_code '${cityCode}' exist in rawData? ${targetCodeExists}`);
      
      if (!targetCodeExists && cityCode) {
        const provinceCodePrefix = cityCode.substring(0, 4); 
        const barangaysInProvince = rawData.filter(item => item.province_code === provinceCodePrefix);
        if (barangaysInProvince.length > 0) {
          const uniqueCityCodesInProvince = new Set(
            barangaysInProvince.map(item => item.city_code)
          );
          console.log(`[Debug] loadAndFilterBarangays: Sample of unique city_codes in barangay data for province ${provinceCodePrefix}:`, Array.from(uniqueCityCodesInProvince).slice(0, 20));
        } else {
          console.log(`[Debug] loadAndFilterBarangays: No barangays found in rawData with province_code ${provinceCodePrefix}. Cannot show sample city_codes.`);
        }
      }

      const filtered = rawData.filter((item: Barangay) => item.city_code === cityCode);
      console.log('[Debug] loadAndFilterBarangays: Filtered list before map:', filtered);
      
      const mappedList = filtered
        .map((item: Barangay) => ({ value: item.brgy_code, label: item.brgy_name || '' }))
        .sort((a, b) => a.label.localeCompare(b.label));
      
      setBarangaysList(mappedList);

    } catch (err) {
      console.error("Failed to load/filter local barangays.json:", err);
      const fetchError = err as { message?: string };
      setAddressApiError(`Failed to load barangays: ${fetchError.message}`);
      setBarangaysList([]);
    }
    setBarangaysLoading(false);
  }, []); // Empty dependency array for useCallback as it doesn't depend on external state/props not listed

  // useEffect to call loadAndFilterBarangays when formData.cityMunicipalityCode changes
  useEffect(() => {
    const currentCityCode = formData.cityMunicipalityCode;
    if (currentCityCode) {
      loadAndFilterBarangays(currentCityCode);
    } else {
      // Clear barangays if city/municipality is not selected
      setBarangaysList([]);
      setFormData(prev => ({ ...prev, barangayCode: '' }));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.cityMunicipalityCode, loadAndFilterBarangays]);

  const handleInputChange = (field: keyof FormProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field when user types
    if (stepErrors[field]) {
      setStepErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (field === 'provinceCode') {
        // Reset dependent fields when province changes
        setFormData(prev => ({ ...prev, cityMunicipalityCode: '', barangayCode: '' }));
    } else if (field === 'cityMunicipalityCode') {
        // Reset barangay when city/municipality changes
        setFormData(prev => ({ ...prev, barangayCode: '' }));
    }
  };

  const calculateAge = (dob: string | undefined): number | null => {
    if (!dob) return null;
    try {
      const birthDate = new Date(dob);
      if (isNaN(birthDate.getTime())) return null; 
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      return age >= 0 ? age : null;
    } catch (e) {
      console.error("Error calculating age:", e);
      return null;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !session?.access_token) {
      setError('User not authenticated or session expired. Please log in.');
      setPageLoading(false);
      return;
    }

    setPageLoading(true);
    setError(null);
    setSuccess(null);

    const profileDataToSubmit: Partial<Profile> = { ...formData };

    if (formData.dateOfBirth) {
      const age = calculateAge(formData.dateOfBirth);
      if (age !== null) {
        profileDataToSubmit.age = age;
      }
    }
    
    console.log('[CreateProfilePage] handleSubmit: profileDataToSubmit:', JSON.stringify(profileDataToSubmit, null, 2)); // Log data being sent

    try {
      const token = session.access_token;

      const apiUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;
      
      if (!apiUrl) {
        console.error("Backend API URL is not configured. Please set NEXT_PUBLIC_BACKEND_API_URL.");
        setError("Application configuration error: Backend URL missing.");
        setPageLoading(false);
        return;
      }

      // Construct the payload according to what the backend expects
      const payload = {
        // ...
      };

      const response = await fetch(`/api/v1/admin/users/profile`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        console.error("Profile update failed. Status:", response.status, "Result (stringified):", JSON.stringify(result, null, 2));
        throw new Error(result.message || `Failed to update profile. Status: ${response.status}`);
      }

      setSuccess('Profile updated successfully!');
      if (fetchProfile && user && session) {
        await fetchProfile(user, session);
      }
      router.push('/dashboard');
    } catch (err) {
      console.error('Error submitting profile:', err);
      const error = err as Error;
      setError(error.message || 'An unexpected error occurred.');
    } finally {
      setPageLoading(false);
    }
  };

  const nextStep = () => {
    const currentStepConfig = stepsConfig[currentStep];
    const required = currentStepConfig.requiredFields || [];
    let hasErrors = false;
    const newErrors: Record<string, string> = {};

    required.forEach(field => {
      if (!formData[field] || String(formData[field]).trim() === '') {
        newErrors[field] = 'This field is required.';
        hasErrors = true;
      }
    });

    // Clear previous errors for non-failing fields in this step before setting new ones
    const currentStepFields = currentStepConfig.fields;
    const updatedStepErrors = { ...stepErrors };
    currentStepFields.forEach(f => {
      if (!newErrors[f]) { // If not a new error for this field
        delete updatedStepErrors[f]; // Remove any old error for this field
      }
    });

    setStepErrors({...updatedStepErrors, ...newErrors});

    if (hasErrors) {
      return; // Stop if there are validation errors
    }

    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      console.log("Final step reached, form ready for submission.");
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };
  
  if (authLoading && !initialProfile) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="ml-4 text-lg">Loading your profile...</p>
      </div>
    );
  }


  const renderCurrentStepFields = () => {
    const step = stepsConfig[currentStep];
    if (!step) return null;

    return step.fields.map((fieldKey) => {
      const field = fieldKey as keyof FormProfile; // Type assertion
      switch (field) {
        case 'firstName':
        case 'lastName':
        case 'street':
        case 'religion':
        case 'occupation':
        case 'contactNo':
        case 'philhealthNo':
          return (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field} className="text-sm font-medium">
                {field.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
              </Label>
              <Input
                id={field}
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
              {stepErrors[field] && <p className="text-xs text-red-500 mt-1">{stepErrors[field]}</p>}
            </div>
          );
        case 'dateOfBirth':
          return (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field} className="text-sm font-medium">Date of Birth</Label>
              <Input
                id={field}
                type="date"
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
              />
              {stepErrors[field] && <p className="text-xs text-red-500 mt-1">{stepErrors[field]}</p>}
            </div>
          );
        case 'genderIdentity':
        case 'pronouns':
        case 'assignedSexAtBirth':
        case 'civilStatus':
          const optionsMap = {
            genderIdentity: ["Woman", "Man", "Transgender Woman", "Transgender Man", "Non-binary", "Genderqueer", "Prefer to self-describe", "Prefer not to say"],
            pronouns: ["She/Her", "He/Him", "They/Them", "Ze/Hir", "Prefer to self-describe", "Prefer not to say"],
            assignedSexAtBirth: ["Female", "Male", "Intersex", "Prefer not to say"],
            civilStatus: ["Single", "Married", "Widowed", "Separated", "Divorced", "Domestic Partnership"],
          };
          const labelMap = {
            genderIdentity: "Gender Identity",
            pronouns: "Pronouns",
            assignedSexAtBirth: "Assigned Sex at Birth",
            civilStatus: "Civil Status",
          }
          return (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field} className="text-sm font-medium">{labelMap[field]}</Label>
              <Select value={formData[field] || ''} onValueChange={(value) => handleInputChange(field, value)}>
                <SelectTrigger id={field}><SelectValue placeholder={`Select ${labelMap[field].toLowerCase()}`} /></SelectTrigger>
                <SelectContent>
                  {(optionsMap[field] || []).map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
              {stepErrors[field] && <p className="text-xs text-red-500 mt-1">{stepErrors[field]}</p>}
            </div>
          );
        case 'provinceCode':
        case 'cityMunicipalityCode':
        case 'barangayCode':
          const list = field === 'provinceCode' ? provincesList : field === 'cityMunicipalityCode' ? citiesMunicipalitiesList : barangaysList;
          const isLoading = field === 'provinceCode' ? provincesLoading : field === 'cityMunicipalityCode' ? citiesMunicipalitiesLoading : barangaysLoading;
          const placeholderText = field === 'provinceCode' ? 'Select Province' : field === 'cityMunicipalityCode' ? 'Select City/Municipality' : 'Select Barangay';
          const labelText = field === 'provinceCode' ? 'Province' : field === 'cityMunicipalityCode' ? 'City/Municipality' : 'Barangay';

          // Check for duplicate values
          if (list && list.length > 0) {
            const valueCounts = list.reduce((acc, item) => {
              acc[item.value] = (acc[item.value] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);

            const duplicates: Record<string, number> = {};
            for (const code in valueCounts) {
              if (valueCounts[code] > 1) {
                duplicates[code] = valueCounts[code];
              }
            }
            if (Object.keys(duplicates).length > 0) {
              console.warn(`Duplicate values found in list for ${field}:`, duplicates);
            }
          }

          return (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field} className="text-sm font-medium">{labelText}</Label>
              <Combobox
                options={list}
                value={formData[field] || ''}
                onChange={(value) => handleInputChange(field, value)}
                placeholder={isLoading ? "Loading..." : placeholderText}
                searchPlaceholder={`Search ${labelText.toLowerCase()}...`}
                emptyStateMessage={`No ${labelText.toLowerCase()} found.`}
                disabled={isLoading || (field === 'cityMunicipalityCode' && !formData.provinceCode) || (field === 'barangayCode' && !formData.cityMunicipalityCode)}
              />
              {stepErrors[field] && <p className="text-xs text-red-500 mt-1">{stepErrors[field]}</p>}
            </div>
          );
        case 'middleInitial':
          return (
            <div key={field} className="space-y-1.5">
              <Label htmlFor={field}>Middle Initial</Label>
              <Input
                id={field}
                type="text"
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                maxLength={2}
                placeholder="e.g., D"
              />
            </div>
          );
        default:
          return null;
      }
    });
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Left Sidebar */}
      <div className="w-full md:w-1/3 lg:w-1/4 bg-slate-100 dark:bg-slate-800 p-6 md:p-10 flex flex-col justify-center border-r border-slate-200 dark:border-slate-700">
        <div className="space-y-8">
          <div>
            <UserIcon className="h-12 w-12 text-primary mb-4" />
            <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Complete Your Profile</h1>
            <p className="text-slate-600 dark:text-slate-400 mt-2">
              Please provide some details to personalize your experience.
            </p>
          </div>
          <div className="space-y-1">
            <Progress value={(currentStep + 1) / stepsConfig.length * 100} className="w-full h-2" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Step {currentStep + 1} of {stepsConfig.length}: {stepsConfig[currentStep].title}
            </p>
          </div>
          <div className="space-y-6">
            {stepsConfig.map((step, index) => {
              const IconComponent = step.icon;
              return (
                <div
                  key={index}
                  className={cn(
                    "flex items-center gap-4 p-3 rounded-lg transition-all duration-300 cursor-pointer",
                    currentStep === index ? "bg-primary/10 dark:bg-primary/20 shadow-sm border-l-4 border-primary" : 
                    currentStep > index ? "opacity-60 hover:bg-slate-200/50 dark:hover:bg-slate-700/50" : 
                                         "opacity-80 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
                  )}
                  onClick={() => {
                     // Allow navigation to previous, completed steps
                     if (index < currentStep) setCurrentStep(index);
                  }}
                >
                  <div
                    className={cn(
                      "flex items-center justify-center w-10 h-10 rounded-full text-sm font-medium shrink-0",
                      currentStep === index ? "bg-primary text-primary-foreground" :
                      currentStep > index ? "bg-green-500 text-white" :
                                           "bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300"
                    )}
                  >
                    {currentStep > index ? <CheckCircle className="h-5 w-5" /> : <IconComponent className="h-5 w-5" />}
                  </div>
                  <div>
                    <h3 className={cn(
                        "font-semibold",
                        currentStep === index ? "text-primary dark:text-sky-300" : "text-slate-700 dark:text-slate-300"
                    )}>{step.title}</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{step.subtitle}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Form Area */}
      <div className="w-full md:w-2/3 lg:w-3/4 p-6 md:p-10 flex items-center justify-center">
        <Card className="w-full max-w-2xl shadow-xl bg-white dark:bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              {stepsConfig[currentStep].title}
            </CardTitle>
            <CardDescription className="text-slate-600 dark:text-slate-400">
              {stepsConfig[currentStep].subtitle}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStep}
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4 md:space-y-6"
                >
                  {renderCurrentStepFields()}
                </motion.div>
              </AnimatePresence>
              
              {addressApiError && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
                  <p className="text-sm">{addressApiError}</p>
                </div>
              )}

            </form>
          </CardContent>
          <CardFooter className="flex flex-col sm:flex-row justify-between items-center pt-6 border-t border-slate-200 dark:border-slate-700">
             <div className="w-full sm:w-auto mb-4 sm:mb-0">
                {error && (
                <div className="text-red-600 dark:text-red-400 text-sm p-2 bg-red-100 dark:bg-red-900/20 rounded-md flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-2 shrink-0" /> {error}
                </div>
                )}
                {success && (
                <div className="text-green-600 dark:text-green-400 text-sm p-2 bg-green-100 dark:bg-green-900/20 rounded-md flex items-center">
                    <CheckCircle className="h-4 w-4 mr-2 shrink-0" /> {success}
                </div>
                )}
            </div>
            <div className="flex gap-3 w-full sm:w-auto">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || pageLoading}
                className="w-full sm:w-auto"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              <Button
                type="button"
                onClick={currentStep === stepsConfig.length - 1 ? handleSubmit : nextStep}
                disabled={pageLoading}
                className="w-full sm:w-auto"
              >
                {pageLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {currentStep === stepsConfig.length - 1 ? 'Submit Profile' : 'Next'}
                {currentStep < stepsConfig.length - 1 && !pageLoading ? <ArrowRight className="ml-2 h-4 w-4" /> : null}
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 