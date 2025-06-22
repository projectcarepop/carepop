'use client';

import React, { useState, useEffect, useMemo, useTransition } from 'react';
import { useUser } from '@clerk/nextjs';
import Link from 'next/link';
import { useActionState } from 'react';
import { useForm, FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { motion, AnimatePresence } from 'framer-motion';

import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { updateUserMetadata, type ProfileMetadataState } from '@/lib/actions/user.metadata.actions';
import { Button } from '@/components/ui/button';
import { Combobox } from "@/components/ui/combobox";
import DatePicker from '@/components/date-picker';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ChevronLeft, ChevronRight, Briefcase, HeartPulse, CheckCircle } from 'lucide-react';

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
  province_code: z.string({ required_error: "Province is required." }).min(1, 'Province is required'),
  city_municipality_code: z.string({ required_error: "City/Municipality is required." }).min(1, 'City/Municipality is required'),
  barangay_code: z.string({ required_error: "Barangay is required." }).min(1, 'Barangay is required'),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

interface CompleteProfileFormProps {
    userProfile: any; 
    psgc: {
        provinces: { province_code: string; province_name: string; }[];
        cities: { city_code: string; city_name: string; province_code: string; }[];
        barangays: { brgy_code: string; brgy_name: string; city_code: string; }[];
    };
}

type StepName = "Demographics" | "Professional & Address";
interface StepConfig {
  name: StepName;
  icon: React.ElementType;
  description: string;
  fields: FieldName<ProfileFormValues>[];
}

const stepsConfig: StepConfig[] = [
  { name: 'Demographics', icon: Users, description: "Help us understand you better.", fields: ['first_name', 'last_name', 'middle_initial', 'date_of_birth', 'contact_no', 'gender_identity', 'pronouns', 'assigned_sex_at_birth', 'civil_status', 'religion'] },
  { name: 'Professional & Address', icon: Briefcase, description: "Your work, health coverage, and location.", fields: ['occupation', 'philhealth_no', 'street', 'province_code', 'city_municipality_code', 'barangay_code'] },
];

const FORM_STORAGE_KEY = 'complete-profile-form';

function FinalSubmitButton({ isPending, onClick }: { isPending: boolean, onClick: () => void }) {
    return (
        <Button type="button" disabled={isPending} onClick={onClick}>
            {isPending ? 'Saving...' : 'Finish & Save Profile'}
        </Button>
    );
}

export function CompleteProfileForm({ userProfile, psgc }: CompleteProfileFormProps) {
    const { user } = useUser();
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const [isPending, startTransition] = useTransition();

    const { toast } = useToast();
    const initialState: ProfileMetadataState = { message: '', errors: {}, success: false };
    const [state, formAction] = useActionState(updateUserMetadata, initialState);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            first_name: userProfile?.firstName || '',
            last_name: userProfile?.lastName || '',
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

    const watchedValues = form.watch();
    const debouncedValues = useDebounce(watchedValues, 500);

    useEffect(() => {
        const savedData = localStorage.getItem(FORM_STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            if (parsedData.date_of_birth) {
                parsedData.date_of_birth = new Date(parsedData.date_of_birth);
            }
            form.reset(parsedData);
        }
    }, []);

    useEffect(() => {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(debouncedValues));
    }, [debouncedValues]);

    useEffect(() => {
        const handleSuccess = async () => {
            if (state.success && user) {
                localStorage.removeItem(FORM_STORAGE_KEY);
                await user.reload(); // Force a session refresh to update client-side auth state
            }
        };
        handleSuccess();
    }, [state.success, user]);

    useEffect(() => {
        if (state.errors) {
            for (const [field, messages] of Object.entries(state.errors)) {
                if (messages && messages.length > 0) {
                    form.setError(field as FieldName<ProfileFormValues>, {
                        type: 'server',
                        message: messages.join(', '),
                    });
                }
            }
        } else if (state.message && !state.success) {
             toast({
                variant: "destructive",
                title: "An error occurred",
                description: state.message,
            });
        }
    }, [state.errors, state.message, state.success, form, toast]);

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
    
    const handleFinalSubmit = () => {
        const formData = new FormData();
        const allValues = form.getValues();
         for (const key in allValues) {
             const typedKey = key as keyof ProfileFormValues;
            if (allValues[typedKey] !== null && allValues[typedKey] !== undefined) {
                 if (allValues[typedKey] instanceof Date) {
                    formData.append(typedKey, (allValues[typedKey] as Date).toISOString());
                } else {
                    formData.append(typedKey, allValues[typedKey] as string);
                }
            }
        }
        startTransition(() => formAction(formData));
    };

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
    
    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 500 : -500, y: 0, opacity: 0 }),
        center: { zIndex: 1, x: 0, y: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 500 : -500, y: 0, opacity: 0 }),
    };

    if (state.success) {
        return (
            <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 flex flex-col items-center justify-center text-center" style={{ minHeight: '520px' }}>
                <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
                <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Profile Updated!</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 mb-6">
                    Welcome aboard! Your profile has been set up successfully.
                </p>
                <Link href="/dashboard" passHref>
                    <Button>Go to Dashboard</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 overflow-hidden">
            <Form {...form}>
                <form className="flex flex-col justify-between" style={{ minHeight: '520px' }}>
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
                            <div className="mb-8">
                                <div className="space-y-6">
                                    <div>
                                        <HeartPulse className="h-8 w-8 text-primary mb-3" />
                                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Tell us more about you</h1>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            This information helps us personalize your CarePop experience.
                                        </p>
                                    </div>
                                    <div className="space-y-1">
                                        <div className="relative h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full">
                                            <motion.div 
                                                className="absolute top-0 left-0 h-1 bg-primary rounded-full"
                                                animate={{ width: `${((currentStep) / (stepsConfig.length - 1)) * 100}%` }}
                                                transition={{ ease: "easeInOut", duration: 0.5 }}
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            Step {currentStep + 1} of {stepsConfig.length}: <span className="font-medium text-gray-700 dark:text-gray-300">{stepsConfig[currentStep].name}</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                            
                            {currentStep === 0 && (
                                <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                                     <FormField control={form.control} name="first_name" render={({ field }) => (<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                     <FormField control={form.control} name="last_name" render={({ field }) => (<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="middle_initial" render={({ field }) => (<FormItem><FormLabel>Middle Initial</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="date_of_birth" render={({ field }) => (<FormItem><FormLabel>Date of Birth</FormLabel><FormControl><DatePicker value={field.value} onChange={field.onChange} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="contact_no" render={({ field }) => (<FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="gender_identity" render={({ field }) => (<FormItem><FormLabel>Gender Identity</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem><SelectItem value="Prefer to self-describe">Prefer to self-describe</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="pronouns" render={({ field }) => (<FormItem><FormLabel>Pronouns</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="he/him">he/him</SelectItem><SelectItem value="she/her">she/her</SelectItem><SelectItem value="they/them">they/them</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="assigned_sex_at_birth" render={({ field }) => (<FormItem><FormLabel>Assigned Sex at Birth</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="civil_status" render={({ field }) => (<FormItem><FormLabel>Civil Status</FormLabel><Select onValueChange={field.onChange} value={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl><SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent></Select><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="religion" render={({ field }) => (<FormItem><FormLabel>Religion</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                </div>
                            )}
                            {currentStep === 1 && (
                                <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
                                    <FormField control={form.control} name="occupation" render={({ field }) => (<FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="philhealth_no" render={({ field }) => (<FormItem><FormLabel>PhilHealth No. (Optional)</FormLabel><FormControl><Input {...field} value={field.value ?? ''} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField control={form.control} name="street" render={({ field }) => (<FormItem className="md:col-span-2"><FormLabel>Street Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>)} />
                                    <FormField
                                        control={form.control}
                                        name="province_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Province</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        name={field.name}
                                                        options={provinceOptions}
                                                        value={field.value}
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                            form.setValue('city_municipality_code', '');
                                                            form.setValue('barangay_code', '');
                                                        }}
                                                        placeholder="Select province..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="city_municipality_code"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>City/Municipality</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        name={field.name}
                                                        options={cityOptions}
                                                        value={field.value}
                                                        onChange={(value) => {
                                                            field.onChange(value);
                                                            form.setValue('barangay_code', '');
                                                        }}
                                                        placeholder="Select city..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="barangay_code"
                                        render={({ field }) => (
                                            <FormItem className="md:col-span-2">
                                                <FormLabel>Barangay</FormLabel>
                                                <FormControl>
                                                    <Combobox
                                                        name={field.name}
                                                        options={barangayOptions}
                                                        value={field.value}
                                                        onChange={field.onChange}
                                                        placeholder="Select barangay..."
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-auto pt-8">
                         <div className="flex justify-between items-center">
                            <div>
                                {currentStep > 0 && (
                                    <Button type="button" variant="ghost" onClick={prevStep}>
                                        <ChevronLeft className="w-4 h-4 mr-2" />
                                        Back
                                    </Button>
                                )}
                            </div>
                            <div>
                                {currentStep < stepsConfig.length - 1 && (
                                    <Button type="button" onClick={nextStep}>
                                        Next
                                        <ChevronRight className="w-4 h-4 ml-2" />
                                    </Button>
                                )}
                                {currentStep === stepsConfig.length - 1 && (
                                    <FinalSubmitButton isPending={isPending} onClick={handleFinalSubmit} />
                                )}
                            </div>
                        </div>
                    </div>
                </form>
            </Form>
        </div>
    );
} 