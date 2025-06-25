'use client';

import React, { useState, useEffect, useMemo, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm, FieldName } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useFormStatus } from 'react-dom';

import { useToast } from '@/hooks/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { Button } from '@/components/ui/button';
import { Combobox } from "@/components/ui/combobox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, ChevronLeft, ChevronRight, Briefcase, HeartPulse } from 'lucide-react';
import { DatePicker } from '@/components/ui/datepicker';
import { completeUserProfile, FormState } from '@/app/auth/actions';
import { profileFormSchema, ProfileFormValues } from '@/lib/validation/profile';

export interface ProfileFormProps {
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
  { name: 'Demographics', icon: Users, description: "Help us understand you better.", fields: ['firstName', 'lastName', 'middleInitial', 'contactNo', 'birthday', 'genderIdentity', 'pronouns', 'assignedSexAtBirth'] },
  { name: 'Professional & Address', icon: Briefcase, description: "Your work, health coverage, and location.", fields: ['occupation', 'philhealthNo', 'street', 'provinceCode', 'cityMunicipalityCode', 'barangayCode', 'civilStatus', 'religion'] },
];

const FORM_STORAGE_KEY = 'complete-profile-form';

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" disabled={pending}>
            {pending ? 'Saving...' : 'Finish & Save Profile'}
        </Button>
    );
}

export function ProfileForm({ userProfile, psgc }: ProfileFormProps) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(0);
    const [direction, setDirection] = useState(1);
    const { toast } = useToast();

    const [state, formAction] = useActionState<FormState, FormData>(completeUserProfile, undefined);

    const form = useForm<ProfileFormValues>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: userProfile?.first_name || '',
            lastName: userProfile?.last_name || '',
            middleInitial: userProfile?.middle_initial || '',
            contactNo: userProfile?.contact_no || '',
            birthday: userProfile?.birthday ? new Date(userProfile.birthday) : undefined,
            genderIdentity: userProfile?.gender_identity || '',
            pronouns: userProfile?.pronouns || '',
            assignedSexAtBirth: userProfile?.assigned_sex_at_birth || '',
            civilStatus: userProfile?.civil_status || '',
            religion: userProfile?.religion || '',
            occupation: userProfile?.occupation || '',
            philhealthNo: userProfile?.philhealth_no || '',
            street: userProfile?.street || '',
            provinceCode: userProfile?.province_code || '',
            cityMunicipalityCode: userProfile?.city_municipality_code || '',
            barangayCode: userProfile?.barangay_code || '',
        },
    });

    const watchedValues = form.watch();
    const debouncedValues = useDebounce(watchedValues, 500);

    useEffect(() => {
        if (state?.message === 'success') {
            console.log('Profile update successful. Navigating to dashboard...');
            toast({
                title: "Success!",
                description: "Your profile has been updated.",
            });
            localStorage.removeItem(FORM_STORAGE_KEY);
            router.push('/dashboard');
        } else if (state?.error) {
            console.error('Profile update failed:', state.error);
            toast({
                variant: "destructive",
                title: "An error occurred",
                description: state.error,
            });
        }
    }, [state, router, toast]);

    useEffect(() => {
        const savedData = localStorage.getItem(FORM_STORAGE_KEY);
        if (savedData) {
            const parsedData = JSON.parse(savedData);
            form.reset(parsedData);
        }
    }, [form]);

    useEffect(() => {
        localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(debouncedValues));
    }, [debouncedValues]);

    const nextStep = async () => {
        console.log(`Moving to next step from ${currentStep}`);
        const fields = stepsConfig[currentStep].fields;
        const output = await form.trigger(fields as FieldName<ProfileFormValues>[], { shouldFocus: true });
        if (!output) return;
        if (currentStep < stepsConfig.length - 1) {
            setDirection(1);
            setCurrentStep(s => {
                console.log(`Step state changing from ${s} to ${s + 1}`);
                return s + 1;
            });
        }
    };
    
    const prevStep = () => {
        console.log(`Moving to previous step from ${currentStep}`);
        if (currentStep > 0) {
            setDirection(-1);
            setCurrentStep(s => {
                console.log(`Step state changing from ${s} to ${s - 1}`);
                return s - 1;
            });
        }
    };
    
    const variants = {
        enter: (direction: number) => ({ x: direction > 0 ? 500 : -500, y: 0, opacity: 0 }),
        center: { zIndex: 1, x: 0, y: 0, opacity: 1 },
        exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 500 : -500, y: 0, opacity: 0 }),
    };

    const provinceOptions = psgc.provinces.map(p => ({ value: p.province_code, label: p.province_name }));
    const selectedProvince = form.watch('provinceCode');
    const cityOptions = useMemo(() => {
        if (!selectedProvince) return [];
        return psgc.cities.filter(c => c.province_code === selectedProvince).map(c => ({ value: c.city_code, label: c.city_name }));
    }, [selectedProvince, psgc.cities]);

    const selectedCity = form.watch('cityMunicipalityCode');
    const barangayOptions = useMemo(() => {
        if (!selectedCity) return [];
        return psgc.barangays.filter(b => b.city_code === selectedCity).map(b => ({ value: b.brgy_code, label: b.brgy_name }));
    }, [selectedCity, psgc.barangays]);

    return (
        <div className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 overflow-hidden">
            <Form {...form}>
                <form 
                  className="flex flex-col justify-between" 
                  style={{ minHeight: 'auto' }} 
                  action={formAction}
                >
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
                                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
                                            {stepsConfig.map((step, index) => (
                                                <span key={step.name} className={`font-medium ${index === currentStep ? 'text-primary' : ''}`}>
                                                    {step.name}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {currentStep === 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <FormField control={form.control} name="firstName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
                                            <FormControl><Input placeholder="Juan" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                    <FormField control={form.control} name="lastName" render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Last Name</FormLabel>
                                            <FormControl><Input placeholder="Dela Cruz" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )} />
                                     <FormField control={form.control} name="middleInitial" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Middle Initial</FormLabel>
                                             <FormControl><Input placeholder="R" {...field} value={field.value ?? ''} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="contactNo" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Contact No.</FormLabel>
                                             <FormControl><Input placeholder="09171234567" {...field} value={field.value ?? ''} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="birthday" render={({ field }) => (
                                         <FormItem className="flex flex-col">
                                             <FormLabel>Birthday</FormLabel>
                                             <DatePicker value={field.value} onChange={field.onChange} />
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="genderIdentity" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Gender Identity</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                 <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                                 <SelectContent>
                                                     <SelectItem value="Male">Male</SelectItem>
                                                     <SelectItem value="Female">Female</SelectItem>
                                                     <SelectItem value="Transgender Man">Transgender Man</SelectItem>
                                                     <SelectItem value="Transgender Woman">Transgender Woman</SelectItem>
                                                     <SelectItem value="Non-binary">Non-binary</SelectItem>
                                                     <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                                                 </SelectContent>
                                             </Select>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="pronouns" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Pronouns</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                 <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                                 <SelectContent>
                                                     <SelectItem value="He/Him">He/Him</SelectItem>
                                                     <SelectItem value="She/Her">She/Her</SelectItem>
                                                     <SelectItem value="They/Them">They/Them</SelectItem>
                                                     <SelectItem value="Other">Other</SelectItem>
                                                 </SelectContent>
                                             </Select>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="assignedSexAtBirth" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Assigned Sex at Birth</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                 <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                                 <SelectContent>
                                                     <SelectItem value="Male">Male</SelectItem>
                                                     <SelectItem value="Female">Female</SelectItem>
                                                 </SelectContent>
                                             </Select>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                 </div>
                             )}
                            
                              {currentStep === 1 && (
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                      <FormField control={form.control} name="occupation" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Occupation</FormLabel>
                                             <FormControl><Input placeholder="Software Developer" {...field} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                     <FormField control={form.control} name="philhealthNo" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>PhilHealth No. (Optional)</FormLabel>
                                             <FormControl><Input placeholder="12-345678901-2" {...field} value={field.value ?? ''} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                      <FormField control={form.control} name="civilStatus" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Civil Status</FormLabel>
                                             <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                 <FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                                 <SelectContent>
                                                     <SelectItem value="Single">Single</SelectItem>
                                                     <SelectItem value="Married">Married</SelectItem>
                                                     <SelectItem value="Divorced">Divorced</SelectItem>
                                                     <SelectItem value="Widowed">Widowed</SelectItem>
                                                 </SelectContent>
                                             </Select>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
                                      <FormField control={form.control} name="religion" render={({ field }) => (
                                         <FormItem>
                                             <FormLabel>Religion (Optional)</FormLabel>
                                             <FormControl><Input placeholder="Roman Catholic" {...field} value={field.value ?? ''} /></FormControl>
                                             <FormMessage />
                                         </FormItem>
                                     )} />
 
                                     <div className="md:col-span-2">
                                         <FormLabel>Address</FormLabel>
                                         <div className="grid grid-cols-1 gap-y-6 mt-2">
                                             <FormField control={form.control} name="street" render={({ field }) => (
                                                 <FormItem>
                                                     <FormControl><Input placeholder="123 Maligaya St., Brgy. Central" {...field} /></FormControl>
                                                     <FormMessage />
                                                 </FormItem>
                                             )} />
                                             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                                 <FormField control={form.control} name="provinceCode" render={({ field }) => (
                                                     <FormItem>
                                                         <Combobox options={provinceOptions} value={field.value} onChange={(value) => { field.onChange(value); form.setValue('cityMunicipalityCode', ''); form.setValue('barangayCode', ''); }} placeholder="Select Province" />
                                                         <FormMessage />
                                                     </FormItem>
                                                 )} />
                                                 <FormField control={form.control} name="cityMunicipalityCode" render={({ field }) => (
                                                     <FormItem>
                                                          <Combobox options={cityOptions} value={field.value} onChange={(value) => { field.onChange(value); form.setValue('barangayCode', ''); }} placeholder="Select City/Municipality" disabled={!selectedProvince} />
                                                         <FormMessage />
                                                     </FormItem>
                                                 )} />
                                                 <FormField control={form.control} name="barangayCode" render={({ field }) => (
                                                     <FormItem>
                                                          <Combobox options={barangayOptions} value={field.value} onChange={field.onChange} placeholder="Select Barangay" disabled={!selectedCity} />
                                                         <FormMessage />
                                                     </FormItem>
                                                 )} />
                                             </div>
                                         </div>
                                     </div>
                                 </div>
                             )}
 
                        </motion.div>
                    </AnimatePresence>
                    
                    <div className="flex justify-between items-center pt-8 mt-8 border-t border-gray-200 dark:border-gray-700">
                        <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 0}>
                            <ChevronLeft className="h-4 w-4 mr-2" />
                            Back
                        </Button>

                        {currentStep < stepsConfig.length - 1 ? (
                            <Button type="button" onClick={nextStep} className="mt-8">
                                Next
                                <ChevronRight className="h-4 w-4 ml-2" />
                            </Button>
                        ) : (
                            <SubmitButton />
                        )}
                    </div>
                </form>
            </Form>
        </div>
    );
} 