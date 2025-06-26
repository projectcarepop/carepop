'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { format, parse, isValid } from 'date-fns';

import { type Profile } from '@/lib/types';
import { profileFormSchema, type ProfileFormData } from '@/lib/validation/profile-schema';
import { updateMyProfile } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Loader2, Check, ChevronsUpDown } from 'lucide-react';

// --- TYPE DEFINITIONS ---
interface Province {
  province_code: string;
  province_name: string;
}

interface City {
  city_code: string;
  city_name: string;
  province_code: string;
}

interface Barangay {
  brgy_code: string;
  brgy_name: string;
  city_code: string;
  province_code: string;
}

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <FormLabel>{children} <span className="text-red-500">*</span></FormLabel>
);

export function CreateProfileForm({ initialProfile }: { initialProfile: Profile | null }) {
    const router = useRouter();
    const { toast } = useToast();
    const { supabase } = useAuth();
    const [step, setStep] = React.useState(1);
    const queryClient = useQueryClient();

    // --- LOCATION STATE ---
    const [provinces, setProvinces] = React.useState<Province[]>([]);
    const [cities, setCities] = React.useState<City[]>([]);
    const [barangays, setBarangays] = React.useState<Barangay[]>([]);

    const [isLoadingProvinces, setIsLoadingProvinces] = React.useState(false);
    const [isLoadingCities, setIsLoadingCities] = React.useState(false);
    const [isLoadingBarangays, setIsLoadingBarangays] = React.useState(false);
    
    // --- FORM SETUP ---
    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: initialProfile?.firstName || '',
            lastName: initialProfile?.lastName || '',
            middleInitial: initialProfile?.middleInitial || '',
            contactNo: initialProfile?.contactNo || '',
            birthday: initialProfile?.birthday ? format(new Date(initialProfile.birthday), 'yyyy-MM-dd') : '',
            genderIdentity: initialProfile?.genderIdentity || '',
            pronouns: initialProfile?.pronouns || '',
            civilStatus: initialProfile?.civilStatus || '',
            assignedSexAtBirth: initialProfile?.assignedSexAtBirth || '',
            religion: initialProfile?.religion || '',
            occupation: initialProfile?.occupation || '',
            philhealthNo: initialProfile?.philhealthNo || '',
            street: initialProfile?.street || '',
            provinceCode: initialProfile?.provinceCode || '',
            cityMunicipalityCode: initialProfile?.cityMunicipalityCode || '',
            barangayCode: initialProfile?.barangayCode || '',
        },
    });

    const selectedProvinceCode = form.watch('provinceCode');
    const selectedCityCode = form.watch('cityMunicipalityCode');

    // --- DATA FETCHING EFFECTS ---
    // 1. Fetch provinces on component mount
    React.useEffect(() => {
        const fetchProvinces = async () => {
            setIsLoadingProvinces(true);
            try {
                const response = await fetch('/data/psgc/provinces.json');
                if (!response.ok) throw new Error('Network response was not ok');
                const data: Province[] = await response.json();
                setProvinces(data);
            } catch (error) {
                console.error("Failed to load provinces.json", error);
                toast({ title: "Error", description: "Could not load provinces.", variant: "destructive" });
            } finally {
                setIsLoadingProvinces(false);
            }
        };
        fetchProvinces();
    }, []);

    // 2. Fetch and filter cities when a province is selected
    React.useEffect(() => {
        if (!selectedProvinceCode) {
            setCities([]);
            setBarangays([]);
            form.setValue('cityMunicipalityCode', '');
            form.setValue('barangayCode', '');
            return;
        }

        const fetchCities = async () => {
            setIsLoadingCities(true);
            // Reset downstream state
            setCities([]);
            setBarangays([]);
            form.setValue('cityMunicipalityCode', '');
            form.setValue('barangayCode', '');
            try {
                const response = await fetch('/data/psgc/cities-municipalities.json');
                if (!response.ok) throw new Error('Network response was not ok');
                const allCities: City[] = await response.json();
                const filteredCities = allCities.filter(city => city.province_code === selectedProvinceCode);
                setCities(filteredCities);
            } catch (error) {
                console.error("Failed to load cities-municipalities.json", error);
                toast({ title: "Error", description: "Could not load cities/municipalities.", variant: "destructive" });
            } finally {
                setIsLoadingCities(false);
            }
        };
        fetchCities();
    }, [selectedProvinceCode]);

    // 3. Fetch and filter barangays when a city/municipality is selected
    React.useEffect(() => {
        if (!selectedCityCode) {
            setBarangays([]);
            form.setValue('barangayCode', '');
            return;
        }

        const fetchBarangays = async () => {
            setIsLoadingBarangays(true);
            // Reset downstream state
            setBarangays([]);
            form.setValue('barangayCode', '');
            try {
                const response = await fetch('/data/psgc/barangays.json');
                if (!response.ok) throw new Error('Network response was not ok');
                const allBarangays: Barangay[] = await response.json();
                const filteredBarangays = allBarangays.filter(brgy => brgy.city_code === selectedCityCode);
                setBarangays(filteredBarangays);
            } catch (error) {
                console.error("Failed to load barangays.json", error);
                toast({ title: "Error", description: "Could not load barangays.", variant: "destructive" });
            } finally {
                setIsLoadingBarangays(false);
            }
        };
        fetchBarangays();
    }, [selectedCityCode]);

    // --- MUTATION & SUBMISSION ---
    const { mutate: submitProfile, isPending } = useMutation({
        mutationFn: (formData: ProfileFormData) => {
            if (!supabase) throw new Error("Authentication context is not available.");
            return updateMyProfile(supabase, formData);
        },
        onSuccess: (data) => {
            toast({
                title: "Profile Saved!",
                description: `Welcome, ${data.firstName}! Your information has been updated.`,
            });
            
            // Invalidate client-side queries for lists that might be displayed elsewhere.
            queryClient.invalidateQueries({ queryKey: ['myAppointments'] });
            queryClient.invalidateQueries({ queryKey: ['myMedicalRecords'] });

            // Refresh the server-side props to get the latest profile data.
            router.refresh();
            router.push('/main-dashboard');
        },
        onError: (error: Error) => {
            // Log the full error to the console for detailed debugging
            console.error("Profile submission failed:", error);

            // Show a user-friendly toast message
            toast({ 
                title: "Update Failed", 
                description: error.message || "An unexpected error occurred. Please try again.", 
                variant: "destructive" 
            });
        },
    });

    const handleNextStep = async () => {
        // Define the fields that are part of the first step
        const step1Fields: (keyof ProfileFormData)[] = [
          'firstName', 'lastName', 'middleInitial', 'birthday', 
          'civilStatus', 'genderIdentity', 'pronouns', 'assignedSexAtBirth'
        ];
        
        // Trigger validation for only the fields in the current step
        const isValid = await form.trigger(step1Fields, { shouldFocus: true });
      
        // If validation passes, move to the next step
        if (isValid) {
          setStep(2);
        } else {
          toast({
            title: "Incomplete Information",
            description: "Please fill out all required fields in this section before proceeding.",
            variant: "destructive"
          });
        }
      };
    
    const handleBackStep = () => setStep(step - 1);

    const onSubmit = (data: ProfileFormData) => submitProfile(data);
    
    const getParsedDate = (dateString: string | undefined) => {
        if (!dateString) return undefined;
        const date = parse(dateString, 'yyyy-MM-dd', new Date());
        return isValid(date) ? date : undefined;
    }
    
    return (
        <Card className="w-full max-w-3xl">
            <CardHeader>
                <CardTitle>{initialProfile?.firstName ? 'Edit Your Profile' : 'Create Your Profile'}</CardTitle>
                <CardDescription>
                    Please provide your information. Fields with <span className="text-red-500">*</span> are required.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        {step === 1 && (
                            <section id="step-1-personal-info" className="space-y-4 animate-in fade-in-50">
                                <h3 className="text-lg font-medium border-b pb-2">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <FormField name="firstName" control={form.control} render={({ field }) => (
                                        <FormItem className="md:col-span-2"><RequiredLabel>First Name</RequiredLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="middleInitial" control={form.control} render={({ field }) => (
                                        <FormItem className="md:col-span-1"><FormLabel>M.I.</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                    <FormField name="lastName" control={form.control} render={({ field }) => (
                                        <FormItem className="md:col-span-2"><RequiredLabel>Last Name</RequiredLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="birthday" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-col"><RequiredLabel>Date of Birth</RequiredLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(getParsedDate(field.value)!, "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    selected={getParsedDate(field.value)}
                                                    onSelect={(date) => field.onChange(date ? format(date, 'yyyy-MM-dd') : undefined)}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                    fromYear={1900}
                                                    toYear={new Date().getFullYear()}
                                                />
                                            </PopoverContent></Popover><div className="h-5"><FormMessage /></div>
                                        </FormItem>
                                    )}/>
                                    <FormField name="civilStatus" control={form.control} render={({ field }) => (
                                        <FormItem><RequiredLabel>Civil Status</RequiredLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                </div>
                                <h3 className="text-lg font-medium border-b pb-2 pt-4">Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <FormField name="genderIdentity" control={form.control} render={({ field }) => (
                                        <FormItem><RequiredLabel>Gender Identity</RequiredLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Woman">Woman</SelectItem><SelectItem value="Man">Man</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                     <FormField name="pronouns" control={form.control} render={({ field }) => (
                                        <FormItem><RequiredLabel>Pronouns</RequiredLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="she/her">she/her</SelectItem><SelectItem value="he/him">he/him</SelectItem><SelectItem value="they/them">they/them</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                     <FormField name="assignedSexAtBirth" control={form.control} render={({ field }) => (
                                        <FormItem><RequiredLabel>Assigned Sex at Birth</RequiredLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                </div>
                            </section>
                        )}
                        {step === 2 && (
                             <section id="step-2-address-info" className="space-y-4 animate-in fade-in-50">
                                <h3 className="text-lg font-medium border-b pb-2">Address</h3>
                                <div className="grid grid-cols-1 gap-4">
                                <FormField name="street" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <RequiredLabel>Street Address, Building, etc.</RequiredLabel>
                                            <FormControl><Input {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField control={form.control} name="provinceCode" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <RequiredLabel>Province</RequiredLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                        {isLoadingProvinces ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>) : 
                                                         field.value ? provinces.find(p => p.province_code === field.value)?.province_name : "Select province"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command><CommandInput placeholder="Search province..." />
                                                    <CommandList><CommandEmpty>No province found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {provinces.map((province) => (
                                                            <CommandItem value={province.province_name} key={province.province_code} onSelect={() => { form.setValue("provinceCode", province.province_code)}}>
                                                                <Check className={cn("mr-2 h-4 w-4", province.province_code === field.value ? "opacity-100" : "opacity-0")}/>
                                                                {province.province_name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup></CommandList>
                                                </Command>
                                            </PopoverContent></Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField control={form.control} name="cityMunicipalityCode" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <RequiredLabel>City / Municipality</RequiredLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" disabled={!selectedProvinceCode || isLoadingCities} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                        {isLoadingCities ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>) : 
                                                         field.value ? cities.find(c => c.city_code === field.value)?.city_name : "Select city/municipality"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command><CommandInput placeholder="Search city..." />
                                                    <CommandList><CommandEmpty>No city/municipality found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {cities.map((city) => (
                                                            <CommandItem value={city.city_name} key={city.city_code} onSelect={() => { form.setValue("cityMunicipalityCode", city.city_code)}}>
                                                                <Check className={cn("mr-2 h-4 w-4", city.city_code === field.value ? "opacity-100" : "opacity-0")}/>
                                                                {city.city_name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup></CommandList>
                                                </Command>
                                            </PopoverContent></Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                     <FormField control={form.control} name="barangayCode" render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <RequiredLabel>Barangay</RequiredLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" role="combobox" disabled={!selectedCityCode || isLoadingBarangays} className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                                        {isLoadingBarangays ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading...</>) : 
                                                         field.value ? barangays.find(b => b.brgy_code === field.value)?.brgy_name : "Select barangay"}
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                                                <Command><CommandInput placeholder="Search barangay..." />
                                                    <CommandList><CommandEmpty>No barangay found.</CommandEmpty>
                                                    <CommandGroup>
                                                        {barangays.map((barangay) => (
                                                            <CommandItem value={barangay.brgy_name} key={barangay.brgy_code} onSelect={() => { form.setValue("barangayCode", barangay.brgy_code)}}>
                                                                <Check className={cn("mr-2 h-4 w-4", barangay.brgy_code === field.value ? "opacity-100" : "opacity-0")}/>
                                                                {barangay.brgy_name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup></CommandList>
                                                </Command>
                                            </PopoverContent></Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>

                                </div>
                                <h3 className="text-lg font-medium border-b pb-2 pt-4">Contact & Other Info</h3>
                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <FormField name="contactNo" control={form.control} render={({ field }) => (
                                         <FormItem><RequiredLabel>Contact Number</RequiredLabel><FormControl><Input placeholder="09171234567" {...field} /></FormControl><FormMessage /></FormItem>
                                     )}/>
                                      <FormField name="religion" control={form.control} render={({ field }) => (
                                         <FormItem><FormLabel>Religion</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                     )}/>
                                      <FormField name="occupation" control={form.control} render={({ field }) => (
                                         <FormItem><FormLabel>Occupation</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                                     )}/>
                                 </div>
                                <h3 className="text-lg font-medium border-b pb-2 pt-4">Identification</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                     <FormField name="philhealthNo" control={form.control} render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>PhilHealth No. (Optional)</FormLabel>
                                            <FormControl><Input placeholder="12-345678901-2" {...field} /></FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}/>
                                </div>
                            </section>
                        )}
                    </CardContent>
                    <CardFooter className="flex justify-between pt-6">
                        {step > 1 && (<Button type="button" variant="ghost" onClick={handleBackStep}>Back</Button>)}
                        <div />
                        {step < 2 ? (
                            <Button type="button" onClick={handleNextStep}>Next</Button>
                        ) : (
                            <Button type="submit" disabled={isPending}>
                                {isPending ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</>) : "Save Profile"}
                            </Button>
                        )}
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
}