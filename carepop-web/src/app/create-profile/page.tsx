'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/contexts/AuthContext';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { UserCircle, AlertTriangle, CheckCircle, Loader2, Users, MapPin, ChevronLeft, ChevronRight, Briefcase, HeartPulse } from 'lucide-react';
import { Combobox } from "@/components/ui/combobox";
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { useForm, FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';
import DatePicker from '@/components/date-picker';

// Schema for form validation using Zod
const profileFormSchema = z.object({
  // Step 1: Personal Details
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_initial: z.string().max(2, 'Max 2 characters').optional().nullable(),
  date_of_birth: z.date({ required_error: 'Date of birth is required' }),
  contact_no: z.string().min(10, 'Must be a valid contact number').optional().nullable(),
  
  // Step 2: Demographics
  gender_identity: z.string().min(1, 'Gender identity is required'),
  pronouns: z.string().min(1, 'Pronouns are required'),
  assigned_sex_at_birth: z.string().min(1, 'This field is required'),
  civil_status: z.string().min(1, 'Civil status is required'),
  religion: z.string().optional().nullable(),

  // Step 3: Professional & Health
  occupation: z.string().min(1, 'Occupation is required'),
  philhealth_no: z.string().optional().nullable(),
  
  // Step 4: Address
  street: z.string().min(1, 'Street address is required'),
  province_code: z.string().min(1, 'Province is required'),
  city_municipality_code: z.string().min(1, 'City/Municipality is required'),
  barangay_code: z.string().min(1, 'Barangay is required'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

type StepName = "Personal Details" | "Demographics" | "Professional & Health" | "Address";

interface StepConfig {
  name: StepName;
  icon: React.ElementType;
  description: string;
  fields: FieldName<ProfileFormValues>[];
}

const stepsConfig: StepConfig[] = [
  { name: 'Personal Details', icon: UserCircle, description: "Basic information about you.", fields: ['first_name', 'last_name', 'middle_initial', 'date_of_birth', 'contact_no'] },
  { name: 'Demographics', icon: Users, description: "Help us understand you better.", fields: ['gender_identity', 'pronouns', 'assigned_sex_at_birth', 'civil_status', 'religion'] },
  { name: 'Professional & Health', icon: Briefcase, description: "Your professional life & health coverage.", fields: ['occupation', 'philhealth_no'] },
  { name: 'Address', icon: MapPin, description: "Where can we reach you?", fields: ['street', 'province_code', 'city_municipality_code', 'barangay_code'] },
];

interface Barangay { brgy_code: string; brgy_name: string; city_code: string; }
interface CityMunicipality { city_code: string; city_name: string; province_code: string; }
interface Province { province_code: string; province_name: string; }

export default function CreateProfilePage() {
    const { user, session, loading: authLoading, fetchProfile } = useAuth();
    const router = useRouter();

    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            first_name: '', last_name: '', middle_initial: '', contact_no: '',
            date_of_birth: undefined,
            gender_identity: '', pronouns: '', assigned_sex_at_birth: '', civil_status: '', religion: '',
            occupation: '', philhealth_no: '',
            street: '', province_code: '', city_municipality_code: '', barangay_code: '',
        },
    });

    const [provinces, setProvinces] = useState<Province[]>([]);
    const [cities, setCities] = useState<CityMunicipality[]>([]);
    const [barangays, setBarangays] = useState<Barangay[]>([]);
    const [psgcLoading, setPsgcLoading] = useState({ provinces: false, cities: false, barangays: false });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            form.reset({
                first_name: user.first_name || '', last_name: user.last_name || '', middle_initial: user.middle_initial || '',
                date_of_birth: user.date_of_birth ? new Date(user.date_of_birth) : undefined,
                contact_no: user.contact_no || '',
                gender_identity: user.gender_identity || '', pronouns: user.pronouns || '',
                assigned_sex_at_birth: user.assigned_sex_at_birth || '', civil_status: user.civil_status || '',
                religion: user.religion || '', occupation: user.occupation || '', philhealth_no: user.philhealth_no || '',
                street: user.street || '', province_code: user.province_code || '',
                city_municipality_code: user.city_municipality_code || '', barangay_code: user.barangay_code || '',
            });
        }
    }, [user, form]);

    useEffect(() => {
        const fetchProvinces = async () => {
            setPsgcLoading(prev => ({ ...prev, provinces: true }));
            try {
                const res = await fetch('/data/psgc/provinces.json');
                setProvinces(await res.json());
            } catch (err) { console.error("Failed to fetch provinces:", err); }
             finally { setPsgcLoading(prev => ({ ...prev, provinces: false })); }
        };
        fetchProvinces();
    }, []);

    const selectedProvince = form.watch('province_code');
    const selectedCity = form.watch('city_municipality_code');

    useEffect(() => {
        if (!selectedProvince) return;
        const fetchCities = async () => {
            setPsgcLoading(prev => ({ ...prev, cities: true, barangays: false }));
            form.setValue('city_municipality_code', ''); form.setValue('barangay_code', '');
            setCities([]); setBarangays([]);
            try {
                const res = await fetch('/data/psgc/cities-municipalities.json');
                const allCities = await res.json();
                setCities(allCities.filter((c: CityMunicipality) => c.province_code === selectedProvince));
            } catch (err) { console.error("Failed to fetch cities:", err); }
            finally { setPsgcLoading(prev => ({ ...prev, cities: false })); }
        };
        fetchCities();
    }, [selectedProvince, form]);

    useEffect(() => {
        if (!selectedCity) return;
        const fetchBarangays = async () => {
            setPsgcLoading(prev => ({ ...prev, barangays: true }));
            form.setValue('barangay_code', ''); setBarangays([]);
            try {
                const res = await fetch('/data/psgc/barangays.json');
                const allBarangays = await res.json();
                setBarangays(allBarangays.filter((b: Barangay) => b.city_code === selectedCity));
            } catch (err) { console.error("Failed to fetch barangays:", err); }
            finally { setPsgcLoading(prev => ({ ...prev, barangays: false })); }
        };
        fetchBarangays();
    }, [selectedCity, form]);

    const provinceOptions = useMemo(() => provinces.map(p => ({ value: p.province_code, label: p.province_name })), [provinces]);
    const cityOptions = useMemo(() => cities.map(c => ({ value: c.city_code, label: c.city_name })), [cities]);
    const barangayOptions = useMemo(() => barangays.map(b => ({ value: b.brgy_code, label: b.brgy_name })), [barangays]);

    const onSubmit = async (values: ProfileFormValues) => {
        if (!session) { setError("You must be logged in."); return; }
        setIsSubmitting(true); setError(null); setSuccess(null);
        try {
            const response = await fetch('/api/v1/public/users/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
                body: JSON.stringify({ ...values, date_of_birth: format(values.date_of_birth, 'yyyy-MM-dd') }),
            });
            if (!response.ok) throw new Error((await response.json()).message || "An unknown error occurred.");
            setSuccess("Profile updated! Redirecting...");
            await fetchProfile();
            setTimeout(() => router.push('/dashboard'), 1500);
        } catch (err) { setError((err as Error).message);
        } finally { setIsSubmitting(false); }
    };
    
    const nextStep = async () => {
        const fields = stepsConfig[currentStep].fields;
        const output = await form.trigger(fields as FieldName<ProfileFormValues>[], { shouldFocus: true });
        if (!output) return;
        if (currentStep < stepsConfig.length - 1) { setDirection(1); setCurrentStep(s => s + 1); }
    };

    const prevStep = () => {
        if (currentStep > 0) { setDirection(-1); setCurrentStep(s => s - 1); }
    };

    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 400 : -400, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 400 : -400, opacity: 0 }),
    };

    if (authLoading) return <div className="flex h-screen items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
         <div className="min-h-screen bg-gray-100 dark:bg-slate-900 flex justify-center md:items-center p-4 sm:p-6">
            <main className="w-full max-w-6xl mx-auto flex flex-col md:flex-row bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden my-8 md:my-0">
                {/* Left Panel: Stepper */}
                <div className="w-full md:w-2/5 bg-gray-50 dark:bg-slate-900/50 p-6 md:p-8 lg:p-12 flex flex-col justify-center">
                    <div className="space-y-6">
                        <div>
                            <HeartPulse className="h-8 w-8 text-primary mb-3" />
                            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Complete Your Profile</h1>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 mb-6">
                                Please provide these details to personalize your experience.
                            </p>
                        </div>
                        <div className="space-y-1">
                            <div className="relative h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                                <motion.div 
                                    className="absolute top-0 left-0 h-1 bg-primary rounded-full"
                                    animate={{ width: `${((currentStep) / (stepsConfig.length -1)) * 100}%` }}
                                    transition={{ ease: "easeInOut", duration: 0.5 }}
                                />
                            </div>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                Step {currentStep + 1} of {stepsConfig.length}: <span className="font-medium text-gray-700 dark:text-gray-300">{stepsConfig[currentStep].name}</span>
                            </p>
                        </div>
                        <div className="space-y-1">
                            {stepsConfig.map((step, index) => {
                                const isActive = currentStep === index;
                                const isCompleted = currentStep > index;
                                return (
                                    <div key={step.name} className={cn(
                                        "flex items-center p-4 rounded-lg transition-all border-l-4",
                                        isActive ? "border-primary bg-primary/10" : "border-transparent",
                                        isCompleted ? "opacity-60" : ""
                                    )}>
                                        <div className={cn(
                                            "flex items-center justify-center w-10 h-10 rounded-full mr-4 shrink-0",
                                            isActive ? "bg-primary text-primary-foreground" : 
                                            isCompleted ? "bg-green-500 text-white" : 
                                            "bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                                        )}>
                                        {isCompleted ? <CheckCircle className="w-5 h-5" /> : <step.icon className="w-5 h-5" />}
                                        </div>
                                        <div>
                                            <h3 className={cn(
                                                "font-semibold text-base",
                                                isActive ? "text-primary" : "text-gray-800 dark:text-gray-200"
                                            )}>{step.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-12 font-sans">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col justify-between h-full">
                            <div> {/* Wrapper for header and form content */}
                                <CardHeader className="p-0 mb-6">
                                    <CardTitle className="text-2xl font-bold">{stepsConfig[currentStep].name}</CardTitle>
                                    <CardDescription className="text-base text-gray-500">{stepsConfig[currentStep].description}</CardDescription>
                                </CardHeader>

                                <AnimatePresence mode="wait">
                                    <motion.div
                                        key={currentStep}
                                        custom={direction}
                                        variants={variants}
                                        initial="enter"
                                        animate="center"
                                        exit="exit"
                                        transition={{
                                            x: { type: "spring", stiffness: 300, damping: 30 },
                                            opacity: { duration: 0.2 },
                                        }}
                                    >
                                        <div className="space-y-6">
                                            {currentStep === 0 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                                    <FormField control={form.control} name="first_name" render={({ field }) => ( <FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                    <FormField control={form.control} name="last_name" render={({ field }) => ( <FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                    <FormField control={form.control} name="middle_initial" render={({ field }) => ( <FormItem><FormLabel>Middle Initial</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                                                    <FormField
                                                      control={form.control}
                                                      name="date_of_birth"
                                                      render={({ field }) => (
                                                        <FormItem className="flex flex-col">
                                                          <FormLabel>Date of Birth</FormLabel>
                                                          <FormControl>
                                                            <DatePicker
                                                              value={field.value}
                                                              onChange={field.onChange}
                                                              />
                                                          </FormControl>
                                                          <FormMessage />
                                                        </FormItem>
                                                      )}
                                                    />
                                                    <FormField control={form.control} name="contact_no" render={({ field }) => ( <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                                                </div>
                                            )}
                                            {currentStep === 1 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                                    <FormField control={form.control} name="gender_identity" render={({ field }) => ( <FormItem><FormLabel>Gender Identity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Transgender">Transgender</SelectItem><SelectItem value="Non-binary/Non-conforming">Non-binary/Non-conforming</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                                    <FormField control={form.control} name="pronouns" render={({ field }) => ( <FormItem><FormLabel>Pronouns</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="He/Him">He/Him</SelectItem><SelectItem value="She/Her">She/Her</SelectItem><SelectItem value="They/Them">They/Them</SelectItem><SelectItem value="Ze/Hir">Ze/Hir</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                                    <FormField control={form.control} name="assigned_sex_at_birth" render={({ field }) => ( <FormItem><FormLabel>Assigned Sex at Birth</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                                    <FormField control={form.control} name="civil_status" render={({ field }) => ( <FormItem><FormLabel>Civil Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Widowed">Widowed</SelectItem><SelectItem value="Separated">Separated</SelectItem><SelectItem value="Divorced">Divorced</SelectItem></SelectContent></Select><FormMessage /></FormItem> )} />
                                                    <FormField control={form.control} name="religion" render={({ field }) => ( <FormItem><FormLabel>Religion (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                                                </div>
                                            )}
                                            {currentStep === 2 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                                    <FormField control={form.control} name="occupation" render={({ field }) => ( <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem> )} />
                                                    <FormField control={form.control} name="philhealth_no" render={({ field }) => ( <FormItem><FormLabel>PhilHealth No. (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem> )} />
                                                </div>
                                            )}
                                            {currentStep === 3 && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                                                    <FormField control={form.control} name="province_code" render={({ field }) => (<FormItem><FormLabel>Province</FormLabel><FormControl><Combobox options={provinceOptions} value={field.value} onChange={field.onChange} placeholder="Select province..." isLoading={psgcLoading.provinces} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="city_municipality_code" render={({ field }) => (<FormItem><FormLabel>City / Municipality</FormLabel><FormControl><Combobox options={cityOptions} value={field.value} onChange={field.onChange} placeholder="Select city/municipality..." disabled={!selectedProvince} isLoading={psgcLoading.cities} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="barangay_code" render={({ field }) => (<FormItem><FormLabel>Barangay</FormLabel><FormControl><Combobox options={barangayOptions} value={field.value} onChange={field.onChange} placeholder="Select barangay..." disabled={!selectedCity} isLoading={psgcLoading.barangays} /></FormControl><FormMessage /></FormItem>)} />
                                                    <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Street Address & Unit No.</FormLabel><FormControl><Input {...field} placeholder="e.g., 123 Rizal Street, Unit 5" /></FormControl><FormMessage /></FormItem>)} />
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                </AnimatePresence>
                            </div>

                            <div className="mt-8 pt-6 border-t dark:border-slate-700">
                                {error && <div className="mb-4 flex items-center justify-center gap-2 rounded-md bg-destructive/10 p-3 text-sm text-destructive"><AlertTriangle className="h-4 w-4" /> {error}</div>}
                                {success && <div className="mb-4 flex items-center justify-center gap-2 rounded-md bg-green-500/10 p-3 text-sm text-green-600"><CheckCircle className="h-4 w-4" /> {success}</div>}
                                <div className="flex justify-between">
                                    <Button type="button" onClick={prevStep} variant="outline" disabled={currentStep === 0 || isSubmitting}>
                                        <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                    </Button>

                                    {currentStep < stepsConfig.length - 1 ? (
                                        <Button type="button" onClick={nextStep} disabled={isSubmitting}>
                                            Next <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    ) : (
                                        <Button type="submit" disabled={isSubmitting}>
                                            {isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                            Submit Profile
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </Form>
                </div>
            </main>
        </div>
    );
} 