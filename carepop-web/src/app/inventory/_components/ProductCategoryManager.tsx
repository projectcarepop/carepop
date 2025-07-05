"use client";
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { getProductCategories, upsertProductCategory, deleteProductCategory, NewProductCategoryPayload, ProductCategory } from '@/services/api';
import { useAuth } from '@/lib/contexts/auth-context';
import { Trash2, Edit, Loader2 } from 'lucide-react';

const categoryFormSchema = z.object({
  name: z.string().min(1, "Category name is required"),
  description: z.string().optional(),
});

type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export function ProductCategoryManager() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = React.useState(false);
  const [editingCategory, setEditingCategory] = React.useState<ProductCategory | null>(null);

  const { data: categories = [], isLoading } = useQuery({
    queryKey: ['productCategories'],
    queryFn: () => getProductCategories(session!.access_token!).then(res => res.data),
    enabled: !!session?.access_token && isOpen,
  });

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    defaultValues: { name: '', description: '' },
  });

  React.useEffect(() => {
    if (editingCategory) {
      form.reset({
        name: editingCategory.name,
        description: editingCategory.description ?? '',
      });
    } else {
      form.reset({ name: '', description: '' });
    }
  }, [editingCategory, form]);

  const upsertMutation = useMutation({
    mutationFn: (values: NewProductCategoryPayload) => {
      return upsertProductCategory(values, session!.access_token!, editingCategory?.id);
    },
    onSuccess: () => {
      toast({ title: "Success", description: "Category saved." });
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
      setEditingCategory(null);
      form.reset();
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteProductCategory(id, session!.access_token!),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Category deleted.' });
      queryClient.invalidateQueries({ queryKey: ['productCategories'] });
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error.message });
    },
  });

  const handleEdit = (category: ProductCategory) => {
    setEditingCategory(category);
    form.setFocus('name');
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    form.reset();
  };

  const onSubmit = (values: CategoryFormValues) => {
    upsertMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Manage Categories</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Product Category Management</DialogTitle>
          <DialogDescription>
            Add, edit, or remove product categories for your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4">
          <div>
            <h3 className="text-lg font-medium mb-4">
              {editingCategory ? 'Edit Category' : 'Add New Category'}
            </h3>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField control={form.control} name="name" render={({ field }) => ( <FormItem> <FormLabel>Category Name</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <FormField control={form.control} name="description" render={({ field }) => ( <FormItem> <FormLabel>Description</FormLabel> <FormControl> <Input {...field} /> </FormControl> <FormMessage /> </FormItem> )}/>
                <div className="flex justify-end space-x-2">
                  {editingCategory && (
                    <Button type="button" variant="ghost" onClick={handleCancelEdit}>
                      Cancel
                    </Button>
                  )}
                  <Button type="submit" disabled={upsertMutation.isPending}>
                    {upsertMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {editingCategory ? 'Save Changes' : 'Add Category'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
          <div>
            <h3 className="text-lg font-medium mb-4">Existing Categories</h3>
            <div className="rounded-md border h-[300px] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <ul className="divide-y">
                  {categories.map((category) => (
                    <li key={category.id} className="flex items-center justify-between p-3">
                      <div>
                        <p className="font-medium">{category.name}</p>
                        {category.description && (
                          <p className="text-sm text-muted-foreground">{category.description}</p>
                        )}
                      </div>
                      <div className="space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMutation.mutate(category.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
