'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, FormProvider } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { useMemo } from 'react';
import { providerFormSchema, ProviderFormValues } from './providerForm-types';
import { AvailabilityManager } from './AvailabilityManager';
import { ServiceManager } from './ServiceManager';

// This is the data structure the form expects for initialData
interface ProviderData extends Partial<ProviderFormValues> {
  id: string;
}

interface ProviderFormProps {
  initialData?: ProviderData | null;
  onSubmitSuccess: () => void;
}

export function ProviderForm({ initialData, onSubmitSuccess }: ProviderFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || '',
      lastName: initialData?.lastName || '',
      email: initialData?.email || '',
      phoneNumber: initialData?.phoneNumber || '',
      specialization: initialData?.specialization || '',
      licenseNumber: initialData?.licenseNumber || '',
      credentials: initialData?.credentials || '',
      bio: initialData?.bio || '',
      isActive: initialData?.isActive ?? true,
      serviceIds: initialData?.serviceIds || [],
      weeklyAvailability: initialData?.weeklyAvailability || [],
    },
  });

  const isEditing = !!initialData?.id;

  async function onSubmit(data: ProviderFormValues) {
    console.log("Submitting data:", data);
    form.clearErrors();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      form.setError("root.submit", { type: "manual", message: "Not authenticated. Please log in." });
      return;
    }
    const token = sessionData.session.access_token;
    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `/api/v1/admin/providers/${initialData.id}` : '/api/v1/admin/providers';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An unknown error occurred.');
      }

      onSubmitSuccess();
      
    } catch (error: unknown) {
        let errorMessage = "An unexpected error occurred.";
        if (error instanceof Error) {
            errorMessage = error.message;
        }
        console.error("Submit error:", errorMessage);
        form.setError("root.submit", { type: "manual", message: errorMessage });
    }
  }

  return (
    <FormProvider {...form}>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="john.doe@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input placeholder="+1234567890" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  Optional contact number for the provider.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <FormField
                  control={form.control}
                  name="specialization"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Specialization</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., General Practice, Dermatology" {...field} value={field.value ?? ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="licenseNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>License Number</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., 12345678" {...field} value={field.value ?? ''} />
                      </FormControl>
                       <FormMessage />
                    </FormItem>
                  )}
                />
           </div>
          
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">
                    Active Status
                  </FormLabel>
                  <FormDescription>
                    Inactive providers will not be visible to users.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <AvailabilityManager name="weeklyAvailability" />
          
          <ServiceManager form={form} />
          
          {form.formState.errors.root?.submit && (
             <p className="text-sm font-medium text-destructive">{form.formState.errors.root.submit.message}</p>
          )}

          <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" onClick={() => router.back()}>
                  Cancel
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Provider')}
              </Button>
          </div>
        </form>
      </Form>
    </FormProvider>
  );
} 