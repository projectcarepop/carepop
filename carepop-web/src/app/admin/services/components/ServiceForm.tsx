'use client';

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useRouter } from 'next/navigation';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

// Define the form schema using Zod
const formSchema = z.object({
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
  description: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  typicalDurationMinutes: z.coerce.number().int().positive().optional(),
  categoryId: z.string().uuid().optional().nullable(),
  isActive: z.boolean(),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceCategory {
  id: string;
  name: string;
}

// The form component
export function ServiceForm({ initialData }: { initialData?: ServiceFormValues & { id: string } }) {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [categories, setCategories] = React.useState<ServiceCategory[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      cost: 0,
      typicalDurationMinutes: 30,
      categoryId: null,
      isActive: true,
    },
  });

  // Fetch categories on component mount
  React.useEffect(() => {
    const fetchCategories = async () => {
      try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("Not authenticated");
        const token = sessionData.session.access_token;

        const response = await fetch('/api/v1/admin/service-categories', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch categories");
        const result = await response.json();
        setCategories(result.data);
      } catch (err) {
        // Handle error (e.g., show a toast)
        console.error("Failed to load categories:", err);
      }
    };
    fetchCategories();
  }, [supabase.auth]);

  async function onSubmit(data: ServiceFormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("Not authenticated");
        const token = sessionData.session.access_token;

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData 
            ? `/api/v1/admin/services/${initialData.id}` 
            : '/api/v1/admin/services';
        
        const response = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}` 
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'An error occurred.');
        }

        // Redirect to the services list on success
        router.push('/admin/services');
        router.refresh(); // Refreshes server components
        
    } catch (err: unknown) {
        const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred.';
        setError(errorMessage);
    } finally {
        setIsSubmitting(false);
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
              <FormLabel>Service Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., Family Planning Consultation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe the service..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FormField
              control={form.control}
              name="cost"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cost (PHP)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typicalDurationMinutes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input type="number" placeholder="30" {...field} />
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
                    <FormLabel>Active</FormLabel>
                    <FormDescription>
                        Inactive services will not be available for booking.
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
        
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Service')}
        </Button>
      </form>
    </Form>
  );
} 