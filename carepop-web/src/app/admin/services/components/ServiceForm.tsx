'use client';

import * as React from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from 'sonner';
import { Checkbox } from "@/components/ui/checkbox";

// Define the form schema using Zod
export const formSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, { message: "Service name must be at least 2 characters." }),
  description: z.string().optional(),
  cost: z.coerce.number().min(0).optional(),
  typical_duration_minutes: z.coerce.number().int().positive().optional(),
  category_id: z.string().uuid().optional().nullable(),
  is_active: z.boolean(),
});

type ServiceFormValues = z.infer<typeof formSchema>;

interface ServiceCategory {
  id: string;
  name: string;
}

interface ServiceFormProps {
    initialData?: ServiceFormValues & { id: string };
    categories: ServiceCategory[];
    onSave: (values: ServiceFormValues) => Promise<any>; // Allow for return value
}

// The form component
export function ServiceForm({ initialData, categories, onSave }: ServiceFormProps) {
  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      description: "",
      cost: 0,
      typical_duration_minutes: 30,
      category_id: null,
      is_active: true,
    },
  });

  React.useEffect(() => {
    if (initialData) {
      form.reset(initialData);
    }
  }, [initialData, form]);

  async function onSubmit(values: ServiceFormValues) {
    console.log("Submitting form values:", values);
    try {
      await onSave(values);
      toast.success(`Service ${initialData ? 'updated' : 'created'} successfully.`);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while saving the service.');
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <input type="hidden" {...form.register("id")} />
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
          name="category_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value === "__NONE__" ? null : value)}
                  defaultValue={field.value ?? "__NONE__"}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="__NONE__">None</SelectItem>
                    {categories
                      .filter(cat => cat && cat.id) 
                      .map((cat) => (
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
              name="typical_duration_minutes"
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
          name="is_active"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 shadow">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel>
                  Active
                </FormLabel>
                <FormDescription>
                  Is this service currently available?
                </FormDescription>
              </div>
            </FormItem>
          )}
        />
        
        <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? 'Saving...' : 'Save Service'}
        </Button>
      </form>
    </Form>
  );
} 