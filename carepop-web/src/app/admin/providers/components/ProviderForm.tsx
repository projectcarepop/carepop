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
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { providerFormSchema, ProviderFormValues } from './providerForm-types';
import { AvailabilityManager } from './AvailabilityManager';
import { ServiceManager } from './ServiceManager';
import Image from 'next/image';
import { useToast } from "@/hooks/use-toast";
import { createProvider, updateProvider } from "@/lib/actions/provider.admin.actions";

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
  const { toast } = useToast();
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
    const formData = new FormData();
    
    // Append all form data to FormData object
    Object.entries(data).forEach(([key, value]) => {
        if (key === 'avatarFile' && value instanceof File) {
            formData.append(key, value);
        } else if (value !== null && value !== undefined) {
            formData.append(key, String(value));
        }
    });

    try {
        const result = isEditing 
            ? await updateProvider(initialData.id, formData)
            : await createProvider(formData);

        if (!result.success) {
            throw new Error(result.message);
        }

        toast({
            title: "Success!",
            description: result.message,
        });

        onSubmitSuccess();
      
    } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        console.error("Submit error:", errorMessage);
        toast({
            title: isEditing ? "Error Updating Provider" : "Error Creating Provider",
            description: errorMessage,
            variant: "destructive",
        });
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