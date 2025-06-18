'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { createServiceCategory, updateServiceCategory } from "@/lib/actions/service-category.admin.actions";
import { Switch } from "@/components/ui/switch";

const formSchema = z.object({
  name: z.string().min(1, { message: "Category name is required." }),
  description: z.string().optional().nullable(),
  is_active: z.boolean().default(true),
});

type FormValues = z.infer<typeof formSchema>;

interface ServiceCategoryFormProps {
  initialData?: Partial<FormValues> & { id?: string };
}

export function ServiceCategoryForm({ initialData }: ServiceCategoryFormProps) {
  const router = useRouter();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || { name: "", description: "", is_active: true },
  });

  const isEditing = !!initialData?.id;

  async function onSubmit(data: FormValues) {
    try {
      const result = isEditing
        ? await updateServiceCategory(initialData.id!, data)
        : await createServiceCategory(data);

      if (!result.success) {
        throw new Error(result.message);
      }
      
      toast.success(`Category ${isEditing ? "updated" : "created"} successfully.`);
      router.push('/admin/service-categories');
      router.refresh();
    } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "An unexpected error occurred";
      toast.error(errorMessage);
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
        <FormField
            control={form.control}
            name="is_active"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel>Active</FormLabel>
                  <FormDescription>
                    Inactive categories will not be shown to users.
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