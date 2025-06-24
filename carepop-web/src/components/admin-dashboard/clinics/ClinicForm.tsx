'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Loader2 } from 'lucide-react';

// This could be imported from columns.tsx or a central types file
import { Clinic } from './columns';

// --- Validation Schema ---
const formSchema = z.object({
  name: z.string().min(3, { message: "Name must be at least 3 characters." }),
  address: z.string().min(5, { message: "Address is required." }),
  city: z.string().min(2, { message: "City is required." }),
  phone: z.string().min(10, { message: "A valid phone number is required." }),
});

type ClinicFormData = z.infer<typeof formSchema>;

interface ClinicFormProps {
    initialData?: Clinic | null;
    onSubmit: (values: ClinicFormData) => void;
    isPending: boolean;
}

export function ClinicForm({ initialData, onSubmit, isPending }: ClinicFormProps) {
    const form = useForm<ClinicFormData>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: initialData?.name || '',
            address: initialData?.address || '',
            city: initialData?.city || '',
            phone: initialData?.phone || '',
        },
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Clinic Name</FormLabel>
                            <FormControl>
                                <Input placeholder="CarePop General Hospital" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="address"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                                <Input placeholder="123 Health St." {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                                <Input placeholder="Quezon City" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Phone Number</FormLabel>
                            <FormControl>
                                <Input placeholder="(+63) 917 123 4567" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                <Button type="submit" disabled={isPending} className="w-full">
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {initialData ? 'Save Changes' : 'Create Clinic'}
                </Button>
            </form>
        </Form>
    )
} 