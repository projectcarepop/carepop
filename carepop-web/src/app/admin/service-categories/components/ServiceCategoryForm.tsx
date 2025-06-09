'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import { useToast } from "@/components/ui/use-toast";
import { getErrorMessage } from "@/lib/utils";

const formSchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  description: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceCategoryFormProps {
  initialData?: Partial<FormValues> & { id?: string };
  onSubmitSuccess?: () => void;
}

export function ServiceCategoryForm({ initialData }: ServiceCategoryFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
    },
  });

  const isEditing = !!initialData?.id;

  async function onSubmit(data: FormValues) {
    try {
      const method = isEditing ? 'PUT' : 'POST';
      const endpoint = isEditing ? `/api/v1/admin/service-categories/${initialData.id}` : '/api/v1/admin/service-categories';
      const response = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error('Failed to save category');
      
      toast({ title: 'Success', description: `Category ${isEditing ? 'updated' : 'created'} successfully.` });
      router.push('/admin/service-categories');
      router.refresh();
    } catch (err) {
      toast({ title: 'Error', description: getErrorMessage(err), variant: 'destructive' });
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
              <FormControl><Input placeholder="e.g., General Consultation" {...field} /></FormControl>
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
              <FormControl><Textarea placeholder="Describe the category" {...field} value={field.value ?? ''} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline" onClick={() => router.back()}>Cancel</Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? 'Saving...' : (isEditing ? 'Save Changes' : 'Create Category')}
            </Button>
        </div>
      </form>
    </Form>
  );
} 