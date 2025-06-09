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
import { useMemo, useState } from 'react';
import { providerFormSchema, ProviderFormValues } from './providerForm-types';
import { AvailabilityManager } from './AvailabilityManager';
import { ServiceManager } from './ServiceManager';
import Image from 'next/image';

// This is the data structure the form expects for initialData
interface ProviderData extends Partial<ProviderFormValues> {
  id: string;
  avatarUrl?: string | null;
}

interface ProviderFormProps {
  initialData?: ProviderData | null;
  onSubmitSuccess: () => void;
}

export function ProviderForm({ initialData, onSubmitSuccess }: ProviderFormProps) {
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(initialData?.avatarUrl || null);
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
      avatarUrl: initialData?.avatarUrl || null,
    },
  });

  const isEditing = !!initialData?.id;

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarPreview(URL.createObjectURL(file));
      form.setValue('avatarFile', file);
    }
  };

  async function onSubmit(data: ProviderFormValues) {
    console.log("Submitting data:", data);
    form.clearErrors();

    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !sessionData?.session) {
      form.setError("root.submit", { type: "manual", message: "Not authenticated. Please log in." });
      return;
    }
    const token = sessionData.session.access_token;
    
    let avatarUrl = initialData?.avatarUrl || null;

    // Step 1: Handle avatar upload if a new file is present
    if (data.avatarFile) {
        const file = data.avatarFile;
        const fileName = `${Date.now()}-${file.name}`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('avatars')
            .upload(`providers/${fileName}`, file, {
                cacheControl: '3600',
                upsert: true,
            });

        if (uploadError) {
            form.setError("root.submit", { type: "manual", message: `Avatar Upload Failed: ${uploadError.message}` });
            return;
        }

        // Get the public URL of the uploaded file
        const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(uploadData.path);
        avatarUrl = urlData.publicUrl;
    }

    // Step 2: Prepare the provider data for submission
    const providerPayload = { ...data, avatarUrl: avatarUrl };
    // We don't want to send the file object to the API
    delete providerPayload.avatarFile; 

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `/api/v1/admin/providers/${initialData.id}` : '/api/v1/admin/providers';

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(providerPayload),
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
          <FormField
            control={form.control}
            name="avatarUrl"
            render={() => (
              <FormItem>
                <FormLabel>Provider Avatar</FormLabel>
                <FormControl>
                  <div className="flex items-center gap-4">
                    <div className="w-24 h-24 rounded-full bg-secondary overflow-hidden flex items-center justify-center">
                        {avatarPreview ? (
                            <Image src={avatarPreview} alt="Avatar Preview" width={96} height={96} className="object-cover" />
                        ) : (
                            <span className="text-xs text-muted-foreground">No Image</span>
                        )}
                    </div>
                    <Input type="file" accept="image/*" onChange={handleAvatarChange} className="max-w-xs" />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
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