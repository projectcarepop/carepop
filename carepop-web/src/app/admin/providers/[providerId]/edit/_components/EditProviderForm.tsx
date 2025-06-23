'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Combobox } from '@/components/ui/combobox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

// Define the shape of the data we get from the server
interface Provider {
  id: string;
  profile_id: string | null;
  license_number: string | null;
  bio: string | null;
}

interface Profile {
  id: string;
  name: string;
}

interface EditProviderFormProps {
  provider: Provider;
  profiles: Profile[];
}

// Define the validation schema for the form
const formSchema = z.object({
  profileId: z.string().min(1, { message: 'A user profile must be selected.' }),
  licenseNumber: z.string().optional(),
  bio: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export function EditProviderForm({ provider, profiles }: EditProviderFormProps) {
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profileId: provider.profile_id || '',
      licenseNumber: provider.license_number || '',
      bio: provider.bio || '',
    },
  });

  const profileOptions = profiles.map(p => ({
    value: p.id,
    label: p.name,
  }));

  async function onSubmit(values: FormValues) {
    // We will implement the server action to save this data later.
    console.log(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Link Provider to User</CardTitle>
          </CardHeader>
          <CardContent>
             <FormField
                control={form.control}
                name="profileId"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>User Profile</FormLabel>
                    <Combobox
                      options={profileOptions}
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="Select a user to link..."
                      searchPlaceholder="Search users..."
                    />
                    <FormDescription>
                      This will link the provider record to a user profile.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
          </CardContent>
        </Card>
        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
} 