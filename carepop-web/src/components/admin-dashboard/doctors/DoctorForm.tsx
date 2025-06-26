'use client';

import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { CaretSortIcon, CheckIcon } from '@radix-ui/react-icons';
import { cn } from '@/lib/utils';
import { getAdminUsersByRole, getAdminServiceCategories, getAdminClinics, getAdminServices } from '@/services/api';

import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Loader2 } from 'lucide-react';

import { type AdminDoctor, type AdminService, type Clinic } from '@/lib/types';
import { type ServiceCategory, type UserProfile } from '@/lib/types';
import { type SupabaseClient } from '@supabase/supabase-js';

const formSchema = z.object({
  userId: z.string().min(1, "A doctor must be selected."),
  serviceCategoryId: z.string().min(1, "A service category must be selected."),
  clinicIds: z.array(z.string()).min(1, "Assign at least one clinic."),
  serviceIds: z.array(z.string()).min(1, "Assign at least one service."),
});

type DoctorFormData = z.infer<typeof formSchema>;

interface DoctorFormProps {
    supabase: SupabaseClient<any, "public", any>;
    initialData?: AdminDoctor;
    onSubmit: (values: DoctorFormData) => void;
    isPending: boolean;
}

export function DoctorForm({ supabase, initialData, onSubmit, isPending }: DoctorFormProps) {
    const form = useForm<DoctorFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            userId: initialData?.userId || '',
            serviceCategoryId: initialData?.serviceCategory?.id || '',
            clinicIds: initialData?.clinics.map(c => c.id) || [],
            serviceIds: initialData?.services.map(s => s.id) || [],
        },
    });

    // --- Fetch relational data for selectors ---
    const { data: users, isLoading: isLoadingUsers } = useQuery<UserProfile[]>({
        queryKey: ['adminUsers', 'doctor'],
        queryFn: () => getAdminUsersByRole(supabase, 'doctor'),
    });
    const { data: categories, isLoading: isLoadingCategories } = useQuery<ServiceCategory[]>({
        queryKey: ['adminServiceCategories'],
        queryFn: () => getAdminServiceCategories(supabase),
    });
    const { data: clinics, isLoading: isLoadingClinics } = useQuery<Clinic[]>({
        queryKey: ['adminClinics'],
        queryFn: () => getAdminClinics(supabase),
    });
    const { data: services, isLoading: isLoadingServices } = useQuery<AdminService[]>({
        queryKey: ['adminServices'],
        queryFn: () => getAdminServices(supabase),
    });
    
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                 <FormField
                    control={form.control}
                    name="userId"
                    render={({ field }) => (
                        <FormItem className="flex flex-col">
                            <FormLabel>Doctor User</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                    {field.value 
                                        ? `${users?.find((user) => user.id === field.value)?.firstName} ${users?.find((user) => user.id === field.value)?.lastName}` 
                                        : "Select User"}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search user..." />
                               <CommandList><CommandEmpty>No user found.</CommandEmpty><CommandGroup>
                                    {isLoadingUsers ? <CommandItem disabled>Loading...</CommandItem> : users?.map((user) => (
                                        <CommandItem value={`${user.firstName} ${user.lastName}`} key={user.id} onSelect={() => field.onChange(user.id)}>
                                            {`${user.firstName} ${user.lastName}`}
                                            <CheckIcon className={cn("ml-auto h-4 w-4", user.id === field.value ? "opacity-100" : "opacity-0")}/>
                                        </CommandItem>
                                    ))}
                                </CommandGroup></CommandList>
                            </Command></PopoverContent></Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                
                <FormField
                    control={form.control}
                    name="serviceCategoryId"
                    render={({ field }) => (
                         <FormItem className="flex flex-col">
                            <FormLabel>Service Category (Specialty)</FormLabel>
                            <Popover><PopoverTrigger asChild><FormControl>
                                <Button variant="outline" role="combobox" className={cn("w-full justify-between", !field.value && "text-muted-foreground")}>
                                    {field.value ? categories?.find((cat) => cat.id === field.value)?.name : "Select Category"}
                                    <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                </Button>
                            </FormControl></PopoverTrigger>
                            <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Search category..." />
                               <CommandList><CommandEmpty>No category found.</CommandEmpty><CommandGroup>
                                    {isLoadingCategories ? <CommandItem disabled>Loading...</CommandItem> : categories?.map((cat) => (
                                        <CommandItem value={cat.name} key={cat.id} onSelect={() => field.onChange(cat.id)}>
                                            {cat.name}
                                            <CheckIcon className={cn("ml-auto h-4 w-4", cat.id === field.value ? "opacity-100" : "opacity-0")}/>
                                        </CommandItem>
                                    ))}
                                </CommandGroup></CommandList>
                            </Command></PopoverContent></Popover>
                            <FormMessage />
                        </FormItem>
                    )}
                />

                <Controller name="clinicIds" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Assign to Clinics</FormLabel>
                        {isLoadingClinics ? <p>Loading...</p> : (
                            <ScrollArea className="h-32 w-full rounded-md border p-4">
                            {clinics?.map((clinic) => (
                                <div key={clinic.id} className="flex items-center space-x-2 mb-2">
                                    <Checkbox id={`clinic-${clinic.id}`} checked={field.value?.includes(clinic.id)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, clinic.id]) : field.onChange(field.value?.filter((id) => id !== clinic.id));
                                    }}/>
                                    <label htmlFor={`clinic-${clinic.id}`}>{clinic.name}</label>
                                </div>
                            ))}
                            </ScrollArea>
                        )}
                        <FormMessage />
                    </FormItem>
                )}/>

                 <Controller name="serviceIds" control={form.control} render={({ field }) => (
                    <FormItem>
                        <FormLabel>Assign Services</FormLabel>
                        {isLoadingServices ? <p>Loading...</p> : (
                            <ScrollArea className="h-32 w-full rounded-md border p-4">
                            {services?.map((service) => (
                                <div key={service.id} className="flex items-center space-x-2 mb-2">
                                    <Checkbox id={`service-${service.id}`} checked={field.value?.includes(service.id)} onCheckedChange={(checked) => {
                                        return checked ? field.onChange([...field.value, service.id]) : field.onChange(field.value?.filter((id) => id !== service.id));
                                    }}/>
                                    <label htmlFor={`service-${service.id}`}>{service.name}</label>
                                </div>
                            ))}
                            </ScrollArea>
                        )}
                        <FormMessage />
                    </FormItem>
                )}/>

                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Save Changes' : 'Create Doctor'}
                </Button>
            </form>
        </Form>
    );
} 