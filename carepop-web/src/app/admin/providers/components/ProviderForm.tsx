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
import { Textarea } from "@/components/ui/textarea";
// import { toast } from "@/components/ui/use-toast"; // Assuming you have toasts

// Define the Zod schema based on backend validation
// This should align with CreateProviderBody and UpdateProviderBody from the backend
const providerFormSchema = z.object({
  firstName: z.string().min(1, { message: "First name is required." }),
  lastName: z.string().min(1, { message: "Last name is required." }),
  email: z.string().email({ message: "Invalid email address." }),
  phoneNumber: z.string().optional().nullable(),
  specialization: z.string().optional().nullable(),
  licenseNumber: z.string().optional().nullable(),
  credentials: z.string().optional().nullable(), // e.g., MD, RN, PhD
  bio: z.string().optional().nullable(),
  isActive: z.boolean(), // Made non-optional, default handled by react-hook-form's defaultValues
  // userId: z.string().uuid().optional().nullable(), // For linking to auth.users if needed
});

// Export ProviderFormValues type
export type ProviderFormValues = z.infer<typeof providerFormSchema>;

interface ProviderFormProps {
  initialData?: Partial<ProviderFormValues> & { id?: string; isActive?: boolean }; // id is present if editing
  onSubmitSuccess?: () => void;
}

export function ProviderForm({ initialData, onSubmitSuccess }: ProviderFormProps) {
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(providerFormSchema),
    defaultValues: {
      firstName: initialData?.firstName || "",
      lastName: initialData?.lastName || "",
      email: initialData?.email || "",
      phoneNumber: initialData?.phoneNumber || null,
      specialization: initialData?.specialization || null,
      licenseNumber: initialData?.licenseNumber || null,
      credentials: initialData?.credentials || null,
      bio: initialData?.bio || null,
      isActive: initialData?.isActive === undefined ? true : initialData.isActive, // Explicitly handle default for isActive
    },
  });

  const isEditing = !!initialData?.id;

  async function onSubmit(data: ProviderFormValues) {
    // TODO: Implement API call
    // try {
    //   let response;
    //   if (isEditing) {
    //     response = await fetch(`/api/v1/admin/providers/${initialData.id}`, {
    //       method: "PUT",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(data),
    //     });
    //   } else {
    //     response = await fetch("/api/v1/admin/providers", {
    //       method: "POST",
    //       headers: { "Content-Type": "application/json" },
    //       body: JSON.stringify(data),
    //     });
    //   }

    //   if (!response.ok) {
    //     const errorData = await response.json();
    //     throw new Error(errorData.message || "Something went wrong");
    //   }

    //   toast({
    //     title: isEditing ? "Provider updated" : "Provider created",
    //     description: isEditing
    //       ? "The provider details have been successfully updated."
    //       : "The new provider has been successfully created.",
    //   });
      
    //   if (onSubmitSuccess) {
    //     onSubmitSuccess();
    //   }
      
    // } catch (error: any) {
    //   toast({
    //     variant: "destructive",
    //     title: "Error",
    //     description: error.message || "Failed to save provider.",
    //   });
    // }
    console.log("Form submitted", data);
    if (onSubmitSuccess) onSubmitSuccess(); // Placeholder
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
          <FormField
            control={form.control}
            name="specialization"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Specialization (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Family Medicine, Pediatrics" {...field} value={field.value ?? ''} />
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
                <FormLabel>License Number (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter license number" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="credentials"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Credentials (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., MD, RN, PhD" {...field} value={field.value ?? ''} />
                </FormControl>
                <FormDescription>
                  Comma-separated list of credentials.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="bio"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bio (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter a short bio for the provider..."
                  className="resize-none"
                  {...field}
                  value={field.value ?? ''}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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