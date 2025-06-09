'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, UseFormReturn } from "react-hook-form";
import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation'; // For potential redirect

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
import { Textarea } from "@/components/ui/textarea"; // Assuming you might need it for longer fields like operating hours
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useToast } from "@/hooks/use-toast";
import { ServiceManager } from '../../providers/components/ServiceManager';
import { clinicFormSchema, ClinicFormValues } from './clinicForm-types';
import { ProviderFormValues } from '../../providers/components/providerForm-types';

interface ClinicFormProps {
  initialData?: Partial<ClinicFormValues> & { id?: string; servicesOffered?: string[] };
  onSubmitSuccess?: () => void;
  mode: 'create' | 'edit';
}

// API payload structure (snake_case, matching backend Zod schema & DB)
interface ClinicApiPayload {
  name: string;
  full_address?: string | null;
  street_address?: string | null;
  locality?: string | null;
  region?: string | null;
  postal_code?: string | null;
  country_code?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  website_url?: string | null;
  operating_hours?: string | null;
  services_offered?: string[] | null;
  fpop_chapter_affiliation?: string | null;
  additional_notes?: string | null;
  is_active: boolean;
}

export function ClinicForm({ initialData, onSubmitSuccess, mode }: ClinicFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const router = useRouter();
  const { toast } = useToast();
  
  const form = useForm<ClinicFormValues>({
    resolver: zodResolver(clinicFormSchema),
    defaultValues: {
      name: initialData?.name || "",
      fullAddress: initialData?.fullAddress || "",
      streetAddress: initialData?.streetAddress || "",
      locality: initialData?.locality || "",
      region: initialData?.region || "",
      postalCode: initialData?.postalCode || "",
      countryCode: initialData?.countryCode || "PH", // Default to PH
      latitude: initialData?.latitude === undefined ? null : initialData.latitude, // Allow null for optional number
      longitude: initialData?.longitude === undefined ? null : initialData.longitude, // Allow null for optional number
      contactPhone: initialData?.contactPhone || "",
      contactEmail: initialData?.contactEmail || "",
      websiteUrl: initialData?.websiteUrl || "",
      operatingHours: initialData?.operatingHours || "",
      services: initialData?.services || initialData?.servicesOffered || [],
      fpopChapterAffiliation: initialData?.fpopChapterAffiliation || "",
      additionalNotes: initialData?.additionalNotes || "",
      isActive: initialData?.isActive === undefined ? true : initialData.isActive,
    },
  });

  const isSubmitting = form.formState.isSubmitting;

  async function onSubmit(data: ClinicFormValues) {
    form.clearErrors();
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'User not authenticated. Please log in.');
      }
      const token = sessionData.session.access_token;

      const payload: ClinicApiPayload = {
        name: data.name,
        full_address: data.fullAddress,
        street_address: data.streetAddress,
        locality: data.locality,
        region: data.region,
        postal_code: data.postalCode,
        country_code: data.countryCode,
        latitude: data.latitude,
        longitude: data.longitude,
        contact_phone: data.contactPhone,
        contact_email: data.contactEmail,
        website_url: data.websiteUrl,
        operating_hours: data.operatingHours,
        services_offered: data.services,
        fpop_chapter_affiliation: data.fpopChapterAffiliation,
        additional_notes: data.additionalNotes,
        is_active: data.isActive,
      };

      const endpoint = mode === 'create' 
        ? '/api/v1/admin/clinics' 
        : `/api/v1/admin/clinics/${initialData?.id}`;
      
      const method = mode === 'create' ? 'POST' : 'PUT';

      if (mode === 'edit' && !initialData?.id) {
        throw new Error("Clinic ID is missing for editing.");
      }

      console.log(`[ClinicForm] Submitting ${method} request to:`, endpoint);
      console.log('[ClinicForm] Payload:', JSON.stringify(payload, null, 2));

      const response = await fetch(endpoint, {
        method: method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        if (errorData.errors && Array.isArray(errorData.errors)) {
          errorData.errors.forEach((err: { path?: (string | number)[], message: string }) => {
            if (err.path && err.path.length > 0) {
              form.setError(err.path.join('.') as keyof ClinicFormValues, { type: 'manual', message: err.message });
            } else if (err.message) {
              form.setError("root.serverError", { type: 'manual', message: err.message });
            }
          });
        }
        throw new Error(errorData.message || `Something went wrong while saving the clinic (${response.status}).`);
      }

      const responseData = await response.json();
      console.log(mode === 'edit' ? "Clinic updated successfully:" : "Clinic created successfully:", responseData);
      
      toast({ title: mode === 'edit' ? "Clinic Updated" : "Clinic Created", description: `The clinic ${data.name} has been successfully saved.` });

      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
      router.push('/admin/clinics');
      router.refresh();
      
    } catch (error: unknown) {
      let errorMessage = "An unexpected error occurred.";
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      console.error("Submit error:", errorMessage);
      form.setError("root.submit", { type: "manual", message: errorMessage });
      toast({ title: "Error", description: errorMessage, variant: "destructive" });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Clinic Name <span className="text-red-500">*</span></FormLabel>
              <FormControl>
                <Input placeholder="Enter clinic name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="fullAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Address</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter full address" {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-lg font-medium pt-4 border-t">Address Components</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FormField
            control={form.control}
            name="streetAddress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Street Address</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., 123 Main St" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="locality"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Locality / City</FormLabel>
                <FormControl>
                  <Input placeholder="Enter city or locality" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="region"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Region / State / Province</FormLabel>
                <FormControl>
                  <Input placeholder="Enter region" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="postalCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Postal Code / ZIP</FormLabel>
                <FormControl>
                  <Input placeholder="Enter postal code" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="countryCode"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country Code</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., PH" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-medium pt-4 border-t">Geographical Coordinates</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="latitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Latitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="Enter latitude" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="longitude"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Longitude</FormLabel>
                <FormControl>
                  <Input type="number" step="any" placeholder="Enter longitude" {...field} value={field.value ?? ''} onChange={e => field.onChange(e.target.value === '' ? null : parseFloat(e.target.value))}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <h3 className="text-lg font-medium pt-4 border-t">Contact & Web</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="contactPhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Phone</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="contactEmail"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Contact Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="websiteUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Website URL</FormLabel>
                <FormControl>
                  <Input type="url" placeholder="https://example.com" {...field} value={field.value ?? ''}/>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="operatingHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Operating Hours</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Mon-Fri: 9 AM - 5 PM, Sat: 10 AM - 2 PM. Or JSON string." {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormDescription>
                Describe the clinic&apos;s operating hours (can be a simple string or a JSON string).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="p-4 border-t">
            <h3 className="text-lg font-medium">Services Offered</h3>
            <p className="text-sm text-muted-foreground mb-4">
                Select all services that this clinic provides.
            </p>
            <ServiceManager form={form as unknown as UseFormReturn<ProviderFormValues>} />
        </div>

        <h3 className="text-lg font-medium pt-4 border-t">FPOP Chapter Details</h3>
        <FormField
          control={form.control}
          name="fpopChapterAffiliation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>FPOP Chapter Affiliation</FormLabel>
              <FormControl>
                <Input placeholder="Enter FPOP chapter" {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="additionalNotes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Additional Notes</FormLabel>
              <FormControl>
                <Textarea placeholder="Any other relevant notes" {...field} value={field.value ?? ''}/>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Inactive clinics will not be visible in public searches or available for booking.
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
        
        {form.formState.errors.root?.serverError && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.serverError.message}
          </p>
        )}
        {form.formState.errors.root?.submit && (
          <p className="text-sm font-medium text-destructive">
            {form.formState.errors.root.submit.message}
          </p>
        )}

        <div className="flex justify-end space-x-4 pt-4 border-t">
           <Button type="button" variant="outline" onClick={() => router.back()} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (mode === 'create' ? 'Create Clinic' : 'Save Changes')}
            </Button>
        </div>
      </form>
    </Form>
  );
} 