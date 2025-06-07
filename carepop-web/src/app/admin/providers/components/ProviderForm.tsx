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
  services: z.array(z.object({ value: z.string() })).optional(),
});

// Export ProviderFormValues type
export type ProviderFormValues = z.infer<typeof providerFormSchema>;

type ProviderFormProps = {
  initialData?: Partial<ProviderFormValues> & { id?: string };
  onSubmitSuccess: () => void;
};

export function ProviderForm({ initialData, onSubmitSuccess }: ProviderFormProps) {
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: initialData || {},
  });

  const isEditing = !!initialData?.id;

  async function onSubmit(data: ProviderFormValues) {
    form.clearErrors();
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      form.setError("root.submit", { type: "manual", message: "Not authenticated. Please log in." });
      return;
    }
    const token = sessionData.session.access_token;
    const method = initialData?.id ? 'PUT' : 'POST';
    const endpoint = initialData?.id ? `/api/v1/admin/providers/${initialData.id}` : '/api/v1/admin/providers';

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