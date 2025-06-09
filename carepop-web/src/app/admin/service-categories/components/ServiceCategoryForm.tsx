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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from '@/components/ui/textarea';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const formSchema = z.object({
  name: z.string().min(2, { message: "Category name must be at least 2 characters." }),
  description: z.string().optional(),
});

type ServiceCategoryFormValues = z.infer<typeof formSchema>;

export function ServiceCategoryForm({ initialData }: { initialData?: ServiceCategoryFormValues & { id: string } }) {
  const router = useRouter();
  const supabase = React.useMemo(() => createSupabaseBrowserClient(), []);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const form = useForm<ServiceCategoryFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
    },
  });

  async function onSubmit(data: ServiceCategoryFormValues) {
    setIsSubmitting(true);
    setError(null);
    try {
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError || !sessionData.session) throw new Error("Not authenticated");
        const token = sessionData.session.access_token;

        const method = initialData ? 'PUT' : 'POST';
        const url = initialData 
            ? `/api/v1/admin/service-categories/${initialData.id}` 
            : '/api/v1/admin/service-categories';
        
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

        router.push('/admin/service-categories');
        router.refresh(); 
        
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
              <FormLabel>Category Name</FormLabel>
              <FormControl>
                <Input placeholder="e.g., General Check-ups" {...field} />
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
                <Textarea placeholder="Describe the category..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {error && <p className="text-sm font-medium text-destructive">{error}</p>}

        <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (initialData ? 'Saving...' : 'Creating...') : (initialData ? 'Save Changes' : 'Create Category')}
        </Button>
      </form>
    </Form>
  );
} 