'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// This should match the type fetched from the backend for a single provider
export interface Provider {
    id: string;
    profileId: string;
    licenseNumber: string | null;
    bio: string | null;
    acceptingNewPatients: boolean;
}

// This schema should be compatible with the backend validation
const formSchema = z.object({
  profileId: z.string().uuid({ message: "A valid Profile ID is required." }),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
  acceptingNewPatients: z.boolean(),
});

type ProviderFormValues = z.infer<typeof formSchema>;

interface ProviderFormProps {
  initialData?: Provider | null;
  onSubmit: (values: ProviderFormValues) => void;
  isPending: boolean;
}

export const ProviderForm: React.FC<ProviderFormProps> = ({
  initialData,
  onSubmit,
  isPending,
}) => {
  const form = useForm<ProviderFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: initialData?.profileId || '',
      licenseNumber: initialData?.licenseNumber || '',
      bio: initialData?.bio || '',
      acceptingNewPatients: initialData?.acceptingNewPatients ?? true,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>{initialData ? 'Edit Provider' : 'Create a New Provider'}</CardTitle>
        <CardDescription>Fill out the details for the provider below. Required fields are marked with an asterisk (*).</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="profileId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile ID *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter the user's profile UUID" {...field} />
                  </FormControl>
                  <FormDescription>This must be the ID of an existing user profile.</FormDescription>
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
                    <Input placeholder="e.g., 1234567" {...field} value={field.value ?? ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biography</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Provide a brief professional bio for the provider..."
                      className="resize-none"
                      {...field}
                      value={field.value ?? ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="acceptingNewPatients"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Accepting New Patients</FormLabel>
                    <FormDescription>
                      Can new patients book appointments with this provider?
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
            
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={isPending} size="lg">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {initialData ? 'Save Changes' : 'Create Provider'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}; 