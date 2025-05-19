'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, Profile } from '@/lib/contexts/AuthContext'; // Assuming Profile is exported
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress"; // For step indication
import { User as UserIcon, AlertTriangle, CheckCircle, Loader2, ArrowLeft, ArrowRight, Building, Map, UserCircle, HeartPulse } from 'lucide-react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { motion, AnimatePresence } from "framer-motion";
import { cn } from '@/lib/utils';

const supabase = createSupabaseBrowserClient();

interface StepConfig {
  title: string;
  subtitle: string;
  icon: React.ElementType;
  fields: (keyof Profile)[]; // Fields for this step
}

// Define profile fields as used in the form, matching the Profile interface
type FormProfile = Omit<Profile, 'user_id' | 'age' | 'username' | 'avatar_url'>;


const stepsConfig: StepConfig[] = [
  {
    title: "Personal Details",
    subtitle: "Let's start with some basic information about you.",
    icon: UserCircle,
    fields: ['firstName', 'middleInitial', 'lastName', 'dateOfBirth', 'contactNo']
  },
  {
    title: "Gender Identity",
    subtitle: "Help us understand you better.",
    icon: HeartPulse,
    fields: ['genderIdentity', 'pronouns', 'assignedSexAtBirth', 'civilStatus', 'religion']
  },
  {
    title: "Professional & Health ID",
    subtitle: "A little more about your professional life and health coverage.",
    icon: Building,
    fields: ['occupation', 'philhealthNo']
  },
  {
    title: "Your Address",
    subtitle: "Where can we reach you or send information?",
    icon: Map,
    fields: ['provinceCode', 'cityMunicipalityCode', 'barangayCode', 'street']
  }
];

export default function CreateProfileWizardPage() {
  const { user, profile: initialProfile, fetchProfile, isLoading: authLoading, error: authError } = useAuth();
  const router = useRouter();

  const [currentStep, setCurrentStep] = useState(0); // 0-indexed

  const [formData, setFormData] = useState<Partial<FormProfile>>({});

  // Address Info - API Data Lists - COMMENTED OUT
  // const [provincesList, setProvincesList] = useState<AddressSelectItem[]>([]);
  // const [citiesMunicipalitiesList, setCitiesMunicipalitiesList] = useState<AddressSelectItem[]>([]);
  // const [barangaysList, setBarangaysList] = useState<AddressSelectItem[]>([]);

  // Address Info - API Loading States - COMMENTED OUT
  // const [provincesLoading, setProvincesLoading] = useState(false);
  // const [citiesMunicipalitiesLoading, setCitiesMunicipalitiesLoading] = useState(false);
  // const [barangaysLoading, setBarangaysLoading] = useState(false);
  // const [addressApiError, setAddressApiError] = useState<string | null>(null);

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

  // Fetch all provinces on mount - COMMENTED OUT
  // useEffect(() => {
  //   const fetchProvinces = async () => {
  //     setProvincesLoading(true);
  //     setAddressApiError(null);
  //     try {
  //       const response = await fetch('/data/psgc/provinces.json');
  //       if (!response.ok) throw new Error(`Failed to load provinces.json: ${response.status} ${response.statusText}`);
  //       const data = await response.json();
  //       setProvincesList(Array.isArray(data) ? data : []);
  //     } catch (err) {
  //       console.error("Failed to fetch local provinces.json:", err);
  //       const fetchError = err as { message?: string };
  //       setAddressApiError(`Failed to load provinces: ${fetchError.message}`);
  //       setProvincesList([]);
  //     }
  //     setProvincesLoading(false);
  //   };
  //   fetchProvinces();
  // }, []);

  // Load and filter cities/municipalities when provinceCode changes from formData - COMMENTED OUT
  // useEffect(() => {
  //   const currentProvinceCode = formData.provinceCode;
  //   if (currentProvinceCode) {
  //     const loadAndFilterCities = async () => {
  //       setCitiesMunicipalitiesLoading(true);
  //       setAddressApiError(null);
  //       setCitiesMunicipalitiesList([]);
  //       try {
  //         const response = await fetch('/data/psgc/cities-municipalities.json');
  //         if (!response.ok) throw new Error(`Failed to load cities-municipalities.json: ${response.status} ${response.statusText}`);
  //         const allCities = await response.json();
  //         if (Array.isArray(allCities)) {
  //           const filteredCities = allCities.filter(city => city.province_code === currentProvinceCode);
  //           setCitiesMunicipalitiesList(filteredCities);
  //         } else {
  //           setCitiesMunicipalitiesList([]);
  //           throw new Error('Cities data is not an array');
  //         }
  //       } catch (err) {
  //         console.error("Failed to load/filter local cities-municipalities.json:", err);
  //         const fetchError = err as { message?: string };
  //         setAddressApiError(`Failed to load cities/municipalities: ${fetchError.message}`);
  //         setCitiesMunicipalitiesList([]);
  //       }
  //       setCitiesMunicipalitiesLoading(false);
  //     };
  //     loadAndFilterCities();
  //   } else {
  //     setCitiesMunicipalitiesList([]);
  //     handleInputChange('cityMunicipalityCode', '');
  //     setBarangaysList([]);
  //     handleInputChange('barangayCode', '');
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [formData.provinceCode]);

  // Load and filter barangays when cityMunicipalityCode changes from formData - COMMENTED OUT
  // useEffect(() => {
  //   const currentCityMunicipalityCode = formData.cityMunicipalityCode;
  //   if (currentCityMunicipalityCode) {
  //     const loadAndFilterBarangays = async () => {
  //       setBarangaysLoading(true);
  //       setAddressApiError(null);
  //       setBarangaysList([]);
  //       try {
  //         const response = await fetch('/data/psgc/barangays.json');
  //         if (!response.ok) throw new Error(`Failed to load barangays.json: ${response.status} ${response.statusText}`);
  //         const allBarangays = await response.json();
  //         if (Array.isArray(allBarangays)) {
  //           const filteredBarangays = allBarangays.filter(bgy => bgy.city_municipality_code === currentCityMunicipalityCode);
  //           setBarangaysList(filteredBarangays);
  //         } else {
  //           setBarangaysList([]);
  //           throw new Error('Barangays data is not an array');
  //         }
  //       } catch (err) {
  //         console.error("Failed to load/filter local barangays.json:", err);
  //         const fetchError = err as { message?: string };
  //         setAddressApiError(`Failed to load barangays: ${fetchError.message}`);
  //         setBarangaysList([]);
  //       }
  //       setBarangaysLoading(false);
  //     };
  //     loadAndFilterBarangays();
  //   } else {
  //     setBarangaysList([]);
  //     handleInputChange('barangayCode', '');
  //   }
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [formData.cityMunicipalityCode]);


  const handleInputChange = (field: keyof FormProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (field === 'provinceCode') {
        // Reset dependent fields when province changes
        setFormData(prev => ({ ...prev, cityMunicipalityCode: '', barangayCode: '' }));
        // Reset dependent fields when province changes
        setFormData(prev => ({ ...prev, cityMunicipalityCode: '', barangayCode: '' }));
    } else if (field === 'cityMunicipalityCode') {
        // Reset barangay when city/municipality changes
        setFormData(prev => ({ ...prev, barangayCode: '' }));
        setFormData(prev => ({ ...prev, barangayCode: '' }));
    }
  };

  const calculateAge = (dob: string | undefined): number | null => {
    if (!dob) return null;
    const birthDate = new Date(dob);
    if (isNaN(birthDate.getTime())) return null;
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age >= 0 ? age : null;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPageLoading(true);
    setError(null);
    setSuccess(null);

    if (!user) {
      setError('User not authenticated. Please log in again.');
      setPageLoading(false);
      router.push('/login');
      return;
    }

    const age = calculateAge(formData.dateOfBirth);
    const profileDataToSave = {
      ...formData,
      user_id: user.id,
      email: user.email, // Include email from user object
      age: age, // Add calculated age
      updated_at: new Date().toISOString(),
      // Ensure snake_case for Supabase if needed, but AuthContext Profile is camelCase
      // The Profile interface in AuthContext uses camelCase, matching Supabase client expectations.
      // If Supabase table uses snake_case, a mapping might be needed here or server-side via function/trigger.
      // Assuming current setup expects camelCase or handles it.
       first_name: formData.firstName,
       middle_initial: formData.middleInitial,
       last_name: formData.lastName,
       date_of_birth: formData.dateOfBirth,
       gender_identity: formData.genderIdentity,
       assigned_sex_at_birth: formData.assignedSexAtBirth,
       civil_status: formData.civilStatus,
       contact_no: formData.contactNo,
       philhealth_no: formData.philhealthNo,
       province_code: formData.provinceCode,
       city_municipality_code: formData.cityMunicipalityCode,
       barangay_code: formData.barangayCode,
    };
    
    // Remove undefined keys to prevent issues with Supabase client
    Object.keys(profileDataToSave).forEach(key => {
        const typedKey = key as keyof typeof profileDataToSave;
        if (profileDataToSave[typedKey] === undefined) {
            delete profileDataToSave[typedKey];
        }
    });


    try {
      const { error: upsertError } = await supabase
        .from('profiles')
        .upsert(profileDataToSave, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Error saving profile:', upsertError);
        throw upsertError;
      }

      setSuccess('Profile saved successfully!');
      await fetchProfile(user); // Refresh profile in AuthContext
      router.push('/dashboard');

    } catch (err) {
      console.error('Submission error:', err);
      const error = err as { message?: string }; // More specific type
      setError(error.message || 'An unexpected error occurred. Please try again.');
    } finally {
      setPageLoading(false);
    }
  };

  const nextStep = () => {
    // Add validation logic here if needed before proceeding
    if (currentStep < stepsConfig.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      // This is the final step, so submit
      handleSubmit(new Event('submit') as unknown as FormEvent);
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
        case 'middleInitial':
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
                maxLength={field === 'middleInitial' ? 1 : undefined}
              />
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
            </div>
          );
        case 'provinceCode':
        case 'cityMunicipalityCode':
        case 'barangayCode':
          return (
            <div key={field} className="space-y-2">
              <Label htmlFor={field}>
                {field === 'provinceCode' ? 'Province' : field === 'cityMunicipalityCode' ? 'City/Municipality' : 'Barangay'}
              </Label>
              <Input
                id={field}
                value={formData[field] || ''}
                onChange={(e) => handleInputChange(field, e.target.value)}
                placeholder={field === 'provinceCode' ? 'Enter Province' : field === 'cityMunicipalityCode' ? 'Enter City/Municipality' : 'Enter Barangay'}
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
              
              {/* addressApiError && (
                <div className="mt-4 p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-300 rounded-md flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2 shrink-0" />
                  <p className="text-sm">{addressApiError}</p>
                </div>
              )} */}

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
                onClick={nextStep}
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