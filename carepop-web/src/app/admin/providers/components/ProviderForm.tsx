'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";
import * as z from "zod";
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
// import { Textarea } from "@/components/ui/textarea"; // REMOVED Textarea import
import React, { useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
// import { toast } from "@/components/ui/use-toast"; // Assuming you have toasts

// Define the Zod schema based on backend validation
// This should align with CreateProviderBody and UpdateProviderBody from the backend
const providerFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().optional().nullable(),
  isActive: z.boolean(),
});

// Export ProviderFormValues type
export type ProviderFormValues = z.infer<typeof providerFormSchema>;

interface ProviderFormProps {
  initialData?: Partial<ProviderFormValues> & { 
    id?: string; 
    isActive?: boolean;
    // These can remain in the prop type for now, as the page might still fetch them
    // but the form itself won't use or display them.
    specialization?: string | null; 
    licenseNumber?: string | null;  
    credentials?: string | null;    
    bio?: string | null;            
  };
  onSubmitSuccess?: () => void;
}

// Interface for the data structure being sent to the backend PUT request
interface ProviderUpdatePayload {
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string | null;
  is_active: boolean;
  // Add other DB fields here if they become updatable through the form
}

export function ProviderForm({ initialData, onSubmitSuccess }: ProviderFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || null,
      isActive: initialData?.isActive === undefined ? true : initialData.isActive,
    },
  });

  const isEditing = !!initialData?.id;

  async function onSubmit(data: ProviderFormValues) {
    form.clearErrors();
    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !sessionData.session) {
        throw new Error(sessionError?.message || 'User not authenticated. Please log in.');
      }
      const token = sessionData.session.access_token;

      const payload: ProviderUpdatePayload = {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        contact_number: data.phoneNumber,
        is_active: data.isActive,
      };
      
      let response;
      if (isEditing) {
        if (!initialData?.id) {
          throw new Error("Provider ID is missing for editing.");
        }

        console.log('[ProviderForm] Submitting PUT request to:', `/api/v1/admin/providers/${initialData.id}`);
        console.log('[ProviderForm] Payload:', JSON.stringify(payload, null, 2));

        response = await fetch(`/api/v1/admin/providers/${initialData.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
          },
          body: JSON.stringify(payload), 
        });
      } else {
        console.log("Create mode not fully implemented in this step. Payload:", payload);
        if (onSubmitSuccess) {
          onSubmitSuccess();
        }
        return;
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: `Request failed with status ${response.status}` }));
        if (errorData.errors && Array.isArray(errorData.errors)) {
            errorData.errors.forEach((err: { path?: (string | number)[], message: string }) => {
                if (err.path && err.path.length > 0) {
                    form.setError(err.path.join('.') as keyof ProviderFormValues, { type: 'manual', message: err.message });
                } else if (err.message) {
                    form.setError("root.serverError", { type: 'manual', message: err.message });
                }
            });
        }
        throw new Error(errorData.message || "Something went wrong while saving the provider.");
      }

      console.log(isEditing ? "Provider updated successfully" : "Provider creation placeholder success");
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
      
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
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
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="Enter email address" {...field} />
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
                <FormLabel>Phone Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter phone number" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Controller
          control={form.control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Active Status</FormLabel>
                <FormDescription>
                  Inactive providers will not be available for new bookings or shown in public searches.
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

        <Button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Saving..." : (isEditing ? "Save Changes" : "Create Provider")}
        </Button>
      </form>
    </Form>
  );
} 