'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';

import { type Profile } from '@/lib/types';
import { profileFormSchema, type ProfileFormData } from '@/lib/validation/profile-schema';
import { getProvinces, getCities, getBarangays, updateMyProfile } from '@/services/api';

import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Loader2 } from 'lucide-react';

const RequiredLabel = ({ children }: { children: React.ReactNode }) => (
    <FormLabel>{children} <span className="text-red-500">*</span></FormLabel>
);

interface Location {
    code: string;
    name: string;
}

export function CreateProfileForm({ profile }: { profile: Profile | null }) {
    const router = useRouter();
    const { toast } = useToast();
    const [step, setStep] = React.useState(1);

    const form = useForm<ProfileFormData>({
        resolver: zodResolver(profileFormSchema),
        defaultValues: {
            firstName: profile?.firstName || '',
            lastName: profile?.lastName || '',
            middleInitial: profile?.middleInitial || '',
            birthday: profile?.birthday ? format(parseISO(profile.birthday), 'yyyy-MM-dd') : undefined,
            genderIdentity: profile?.genderIdentity || undefined,
            pronouns: profile?.pronouns || undefined,
            civilStatus: profile?.civilStatus || undefined,
            assignedSexAtBirth: profile?.assignedSexAtBirth || undefined,
            contactNo: profile?.contactNo || '',
            street: profile?.street || '',
            provinceCode: profile?.provinceCode || undefined,
            cityMunicipalityCode: profile?.cityMunicipalityCode || undefined,
            barangayCode: profile?.barangayCode || undefined,
        },
    });

    const provinceCode = form.watch('provinceCode');
    const cityMunicipalityCode = form.watch('cityMunicipalityCode');

    // --- Data Fetching for Comboboxes using the new service layer ---
    const { data: provinces, isLoading: isLoadingProvinces } = useQuery<Location[]>({
        queryKey: ['locations', 'provinces'],
        queryFn: getProvinces,
    });

    const { data: cities, isLoading: isLoadingCities } = useQuery<Location[]>({
        queryKey: ['locations', 'cities', provinceCode],
        queryFn: () => getCities(provinceCode!),
        enabled: !!provinceCode,
    });

    const { data: barangays, isLoading: isLoadingBarangays } = useQuery<Location[]>({
        queryKey: ['locations', 'barangays', cityMunicipalityCode],
        queryFn: () => getBarangays(cityMunicipalityCode!),
        enabled: !!cityMunicipalityCode,
    });
    
    // --- Form Submission Mutation using the new service layer ---
    const { mutate: submitProfile, isPending } = useMutation({
        mutationFn: (formData: ProfileFormData) => updateMyProfile(formData),
        onSuccess: () => {
            toast({ title: "Profile Saved!", description: "Your information has been updated successfully." });
            router.push('/main-dashboard');
            router.refresh();
        },
        onError: (error: Error) => {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" });
        },
    });

    // --- Form Step Handling ---
    const handleNextStep = async () => {
        const fieldsToValidate: (keyof ProfileFormData)[] = ['firstName', 'lastName'];
        const isValid = await form.trigger(fieldsToValidate);
        if (isValid) setStep(2);
    };

    const onSubmit = (data: ProfileFormData) => {
        console.log("Submitting form data:", data);
        submitProfile(data);
    };
    
    return (
        <Card className="w-full max-w-3xl">
            <CardHeader>
                <CardTitle>{profile ? 'Edit Your Profile' : 'Create Your Profile'}</CardTitle>
                <CardDescription>
                    Please provide your information. All fields with <span className="text-red-500">*</span> are required.
                </CardDescription>
            </CardHeader>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <CardContent className="space-y-6">
                        {step === 1 && (
                            <section id="step-1" className="space-y-4 animate-in fade-in-50">
                                <h3 className="text-lg font-medium">Personal Information</h3>
                                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                                    <FormField name="firstName" control={form.control} render={({ field }) => (
                                        <FormItem className="md:col-span-2"><RequiredLabel>First Name</RequiredLabel><FormControl><Input {...field} /></FormControl><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                    <FormField name="middleInitial" control={form.control} render={({ field }) => (
                                        <FormItem className="md:col-span-1"><FormLabel>Middle Initial</FormLabel><FormControl><Input {...field} /></FormControl><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                    <FormField name="lastName" control={form.control} render={({ field }) => (
                                        <FormItem className="md:col-span-2"><RequiredLabel>Last Name</RequiredLabel><FormControl><Input {...field} /></FormControl><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <FormField name="birthday" control={form.control} render={({ field }) => (
                                        <FormItem className="flex flex-col"><FormLabel>Date of Birth</FormLabel>
                                            <Popover><PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button variant="outline" className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}>
                                                        {field.value ? format(parseISO(field.value), "PPP") : <span>Pick a date</span>}
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    captionLayout="dropdown"
                                                    selected={field.value ? parseISO(field.value) : undefined}
                                                    onSelect={(date) => field.onChange(date?.toISOString().split('T')[0])}
                                                    disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                                                    initialFocus
                                                    fromYear={1900}
                                                    toYear={new Date().getFullYear()}
                                                />
                                            </PopoverContent></Popover><div className="h-5"><FormMessage /></div>
                                        </FormItem>
                                    )}/>
                                    <FormField name="civilStatus" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Civil Status</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Single">Single</SelectItem><SelectItem value="Married">Married</SelectItem><SelectItem value="Divorced">Divorced</SelectItem><SelectItem value="Widowed">Widowed</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                     <FormField name="genderIdentity" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Gender Identity</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Woman">Woman</SelectItem><SelectItem value="Man">Man</SelectItem><SelectItem value="Non-binary">Non-binary</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                     <FormField name="pronouns" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Pronouns</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="she/her">she/her</SelectItem><SelectItem value="he/him">he/him</SelectItem><SelectItem value="they/them">they/them</SelectItem><SelectItem value="Prefer not to say">Prefer not to say</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                     <FormField name="assignedSexAtBirth" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Assigned Sex at Birth</FormLabel><Select onValueChange={field.onChange} defaultValue={field.value}><FormControl><SelectTrigger className="w-full"><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                                            <SelectContent><SelectItem value="Female">Female</SelectItem><SelectItem value="Male">Male</SelectItem></SelectContent>
                                        </Select><div className="h-5"><FormMessage /></div></FormItem>
                                    )}/>
                                </div>
                            </section>
                        )}
                        {step === 2 && (
                             <section id="step-2" className="space-y-4 animate-in fade-in-50">
                                <h3 className="text-lg font-medium">Contact & Address</h3>
                                <FormField name="contactNo" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Contact Number</FormLabel><FormControl><Input placeholder="09171234567" {...field} /></FormControl><div className="h-5"><FormMessage /></div></FormItem>
                                )}/>
                                <FormField name="street" control={form.control} render={({ field }) => (
                                    <FormItem><FormLabel>Street Address</FormLabel><FormControl><Input placeholder="123 Rizal St, Brgy. Poblacion" {...field} /></FormControl><div className="h-5"><FormMessage /></div></FormItem>
                                )}/>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {/* Province */}
                                    <FormField name="provinceCode" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Province</FormLabel>
                                            <Popover><PopoverTrigger asChild><FormControl>
                                                <Button variant="outline" role="combobox" className="w-full justify-between">{field.value ? provinces?.find(p => p.code === field.value)?.name : "Select province..."}<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                                            </FormControl></PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0"><Command><CommandInput placeholder="Search province..." />
                                                <CommandList><CommandEmpty>No province found.</CommandEmpty><CommandGroup>
                                                    {isLoadingProvinces ? <p className="p-2">Loading...</p> : provinces?.map(p => (
                                                        <CommandItem value={p.name} key={p.code} onSelect={() => {field.onChange(p.code); form.setValue('cityMunicipalityCode', undefined); form.setValue('barangayCode', undefined); }}>
                                                            {p.name}<CheckIcon className={cn("ml-auto h-4 w-4", p.code === field.value ? "opacity-100" : "opacity-0")} />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup></CommandList>
                                            </Command></PopoverContent></Popover><div className="h-5"><FormMessage /></div>
                                        </FormItem>
                                    )}/>
                                    {/* City / Municipality */}
                                     <FormField name="cityMunicipalityCode" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>City/Municipality</FormLabel>
                                            <Popover><PopoverTrigger asChild><FormControl>
                                                <Button variant="outline" role="combobox" disabled={!provinceCode || isLoadingCities} className="w-full justify-between">{field.value ? cities?.find(c => c.code === field.value)?.name : "Select city..."}<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                                            </FormControl></PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0"><Command><CommandInput placeholder="Search city..." />
                                                <CommandList><CommandEmpty>No city found.</CommandEmpty><CommandGroup>
                                                    {isLoadingCities ? <p className="p-2">Loading...</p> : cities?.map(c => (
                                                        <CommandItem value={c.name} key={c.code} onSelect={() => {field.onChange(c.code); form.setValue('barangayCode', undefined);}}>
                                                            {c.name}<CheckIcon className={cn("ml-auto h-4 w-4", c.code === field.value ? "opacity-100" : "opacity-0")} />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup></CommandList>
                                            </Command></PopoverContent></Popover><div className="h-5"><FormMessage /></div>
                                        </FormItem>
                                    )}/>
                                    {/* Barangay */}
                                    <FormField name="barangayCode" control={form.control} render={({ field }) => (
                                        <FormItem><FormLabel>Barangay</FormLabel>
                                            <Popover><PopoverTrigger asChild><FormControl>
                                                <Button variant="outline" role="combobox" disabled={!cityMunicipalityCode || isLoadingBarangays} className="w-full justify-between">{field.value ? barangays?.find(b => b.code === field.value)?.name : "Select barangay..."}<CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button>
                                            </FormControl></PopoverTrigger>
                                            <PopoverContent className="w-[300px] p-0"><Command><CommandInput placeholder="Search barangay..." />
                                                <CommandList><CommandEmpty>No barangay found.</CommandEmpty><CommandGroup>
                                                    {isLoadingBarangays ? <p className="p-2">Loading...</p> : barangays?.map(b => (
                                                        <CommandItem value={b.name} key={b.code} onSelect={() => field.onChange(b.code)}>
                                                            {b.name}<CheckIcon className={cn("ml-auto h-4 w-4", b.code === field.value ? "opacity-100" : "opacity-0")} />
                                                        </CommandItem>
                                                    ))}
                                                </CommandGroup></CommandList>
                                            </Command></PopoverContent></Popover><div className="h-5"><FormMessage /></div>
                                        </FormItem>
                                    )}/>
                                </div>
                            </section>
                        )}
                    </CardContent>
                    <CardFooter className={`flex ${step === 1 ? 'justify-end' : 'justify-between'}`}>
                        {step === 1 && <Button type="button" onClick={handleNextStep} className="mt-4">Next</Button>}
                        {step === 2 && <Button type="button" variant="outline" onClick={() => setStep(1)}>Back</Button>}
                        {step === 2 && <Button type="submit" disabled={isPending}>{isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Profile</Button>}
                    </CardFooter>
                </form>
            </Form>
        </Card>
    );
} 