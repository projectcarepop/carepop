'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useActionState } from 'react';
import { useForm, FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { updateUserProfile, type ProfileFormState } from '@/lib/actions/user.actions';
import { Button } from '@/components/ui/button';
import { Combobox } from "@/components/ui/combobox";
import DatePicker from '@/components/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { UserCircle, CheckCircle, Users, MapPin, ChevronLeft, ChevronRight, Briefcase, HeartPulse, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Schema, must match the one in the server action
const profileFormSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  middle_initial: z.string().max(2, 'Max 2 characters').optional().nullable(),
  date_of_birth: z.coerce.date({ required_error: 'Date of birth is required' }),
  contact_no: z.string().min(10, 'Must be a valid phone number').optional().nullable(),
  gender_identity: z.string().min(1, 'Gender identity is required'),
  pronouns: z.string().min(1, 'Pronouns are required'),
  assigned_sex_at_birth: z.string().min(1, 'This field is required'),
  civil_status: z.string().min(1, 'Civil status is required'),
  religion: z.string().optional().nullable(),
  occupation: z.string().min(1, 'Occupation is required'),
  philhealth_no: z.string().optional().nullable(),
  street: z.string().min(1, 'Street address is required'),
  province_code: z.string().min(1, 'Province is required'),
  city_municipality_code: z.string().min(1, 'City/Municipality is required'),
  barangay_code: z.string().min(1, 'Barangay is required'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Props for the client component
interface CreateProfileClientPageProps {
    userProfile: any; // Using `any` to avoid type issues from broken generator
    psgc: {
        provinces: { province_code: string; province_name: string; }[];
        cities: { city_code: string; city_name: string; province_code: string; }[];
        barangays: { brgy_code: string; brgy_name: string; city_code: string; }[];
    };
}

// Stepper configuration
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

export function CreateProfileClientPage({ userProfile, psgc }: CreateProfileClientPageProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);

    const initialState: ProfileFormState = { message: '', errors: {}, success: false };
    const [state, formAction] = useActionState(updateUserProfile, initialState);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            first_name: userProfile?.first_name || '',
            last_name: userProfile?.last_name || '',
            middle_initial: userProfile?.middle_initial || '',
            date_of_birth: userProfile?.date_of_birth ? new Date(userProfile.date_of_birth) : undefined,
            contact_no: userProfile?.contact_no || '',
            gender_identity: userProfile?.gender_identity || '',
            pronouns: userProfile?.pronouns || '',
            assigned_sex_at_birth: userProfile?.assigned_sex_at_birth || '',
            civil_status: userProfile?.civil_status || '',
            religion: userProfile?.religion || '',
            occupation: userProfile?.occupation || '',
            philhealth_no: userProfile?.philhealth_no || '',
            street: userProfile?.street || '',
            province_code: userProfile?.province_code || '',
            city_municipality_code: userProfile?.city_municipality_code || '',
            barangay_code: userProfile?.barangay_code || '',
        },
    });

    // Handle successful form submission
    useEffect(() => {
        if (state.success) {
            // Redirect to dashboard after a short delay to show success message
            setTimeout(() => {
                router.push('/dashboard');
            }, 1500);
        }
    }, [state.success, router]);

    // Memoize address options for performance
    const provinceOptions = useMemo(() => psgc.provinces.map(p => ({ value: p.province_code, label: p.province_name })), [psgc.provinces]);
    const selectedProvince = form.watch('province_code');
    const cityOptions = useMemo(() => {
        if (!selectedProvince) return [];
        return psgc.cities.filter(c => c.province_code === selectedProvince).map(c => ({ value: c.city_code, label: c.city_name }));
    }, [selectedProvince, psgc.cities]);

    const selectedCity = form.watch('city_municipality_code');
    const barangayOptions = useMemo(() => {
        if (!selectedCity) return [];
        return psgc.barangays.filter(b => b.city_code === selectedCity).map(b => ({ value: b.brgy_code, label: b.brgy_name }));
    }, [selectedCity, psgc.barangays]);
    
    // Reset city/barangay when province/city changes
    useEffect(() => { form.setValue('city_municipality_code', ''); }, [selectedProvince, form]);
    useEffect(() => { form.setValue('barangay_code', ''); }, [selectedCity, form]);


    const nextStep = async () => {
        const fields = stepsConfig[currentStep].fields;
        const output = await form.trigger(fields as FieldName<ProfileFormValues>[], { shouldFocus: true });
        if (!output) return;
        if (currentStep < stepsConfig.length - 1) {
            setDirection(1);
            setCurrentStep(s => s + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(s => s - 1);
        }
    };
    
    // Framer Motion variants for step transitions
    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 400 : -400, opacity: 0 }),
        center: { zIndex: 1, x: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 400 : -400, opacity: 0 }),
    };

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
                                            <h3 className={cn("font-semibold", isActive ? "text-primary" : "text-gray-800 dark:text-gray-200")}>{step.name}</h3>
                                            <p className="text-xs text-gray-500 dark:text-gray-400">{step.description}</p>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Right Panel: Form */}
                <div className="w-full md:w-3/5 p-6 md:p-8 lg:p-12">
                    <Form {...form}>
                        <form action={formAction} className="space-y-8">
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.div
                                    key={currentStep}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{ x: { type: 'spring', stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
                                >
                                    {currentStep === 0 && (
                                        <div className="space-y-4">
                                            <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="middle_initial" render={({ field }) => (<FormItem><FormLabel>Middle Initial</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="date_of_birth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="contact_no" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    )}
                                     {currentStep === 1 && (
                                        <div className="space-y-4">
                                            <FormField control={form.control} name="gender_identity" render={({ field }) => (<FormItem><FormLabel>Gender Identity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem><SelectItem value="Prefer to self-describe">Prefer to self-describe</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="pronouns" render={({ field }) => (<FormItem><FormLabel>Pronouns</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="he/him">he/him</SelectItem><SelectItem value="she/her">she/her</SelectItem><SelectItem value="they/them">they/them</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="assigned_sex_at_birth" render={({ field }) => (<FormItem><FormLabel>Assigned Sex at Birth</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="civil_status" render={({ field }) => (<FormItem><FormLabel>Civil Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    )}
                                    {currentStep === 2 && (
                                        <div className="space-y-4">
                                            <FormField control={form.control} name="occupation" render={({ field }) => (<FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="philhealth_no" render={({ field }) => (<FormItem><FormLabel>PhilHealth No. (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    )}
                                    {currentStep === 3 && (
                                        <div className="space-y-4">
                                            <FormField control={form.control} name="street" render={({ field }) => (<FormItem><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="province_code" render={({ field }) => (<FormItem><FormLabel>Province</FormLabel><FormControl><Combobox options={provinceOptions} value={field.value} onChange={field.onChange} placeholder="Select province..."/></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="city_municipality_code" render={({ field }) => (<FormItem><FormLabel>City/Municipality</FormLabel><FormControl><Combobox options={cityOptions} value={field.value} onChange={field.onChange} placeholder="Select city..."/></FormControl><FormMessage /></FormItem>)} />
                                            <FormField control={form.control} name="barangay_code" render={({ field }) => (<FormItem><FormLabel>Barangay</FormLabel><FormControl><Combobox options={barangayOptions} value={field.value} onChange={field.onChange} placeholder="Select barangay..."/></FormControl><FormMessage /></FormItem>)} />
                                        </div>
                                    )}
                                </motion.div>
                            </AnimatePresence>
                            
                            <div className="flex justify-between items-center pt-8">
                                <div>
                                    {currentStep > 0 && (
                                        <Button type="button" variant="outline" onClick={prevStep}>
                                            <ChevronLeft className="mr-2 h-4 w-4" /> Previous
                                        </Button>
                                    )}
                                </div>
                                <div className="text-center">
                                    {state.success && (
                                        <div className="flex items-center text-green-600">
                                            <CheckCircle className="mr-2 h-4 w-4" />
                                            {state.message}
                                        </div>
                                    )}
                                    {state.errors?.server && (
                                        <Alert variant="destructive" className="text-left">
                                            <AlertCircle className="h-4 w-4" />
                                            <AlertTitle>Error</AlertTitle>
                                            <AlertDescription>{state.errors.server.join(', ')}</AlertDescription>
                                        </Alert>
                                    )}
                                </div>
                                <div>
                                    {currentStep < stepsConfig.length - 1 && (
                                        <Button type="button" onClick={nextStep}>
                                            Next <ChevronRight className="ml-2 h-4 w-4" />
                                        </Button>
                                    )}
                                    {currentStep === stepsConfig.length - 1 && (
                                        <Button type="submit" disabled={state.success}>
                                            {state.success ? 'Redirecting...' : 'Save Profile'}
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