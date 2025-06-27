'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { getAdminServices, upsertService, getAdminServiceCategories, upsertServiceCategory } from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type AdminService, type ServiceCategory } from '@/lib/types';
import { columns as serviceColumns } from './columns-service';
import { columns as categoryColumns } from './columns-category';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ServiceForm } from './ServiceForm';
import { CategoryForm } from './CategoryForm';
import { useAuth } from '@/lib/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ServicesClientProps {
  initialServices: AdminService[];
  initialCategories: ServiceCategory[];
}

// Placeholders for delete functions
const deleteService = async (id: string) => console.warn(`DELETE /api/admin/services/${id}`);
const deleteCategory = async (id: string) => console.warn(`DELETE /api/admin/service-categories/${id}`);

export default function ServicesClient({ initialServices, initialCategories }: ServicesClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [serviceModal, setServiceModal] = React.useState(false);
  const [categoryModal, setCategoryModal] = React.useState(false);
  const [selectedService, setSelectedService] = React.useState<AdminService | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = React.useState<ServiceCategory | undefined>(undefined);

  // Queries
  const { data: services } = useQuery({ queryKey: ['adminServices'], queryFn: () => getAdminServices(session!.access_token), initialData: initialServices, enabled: !!session });
  const { data: categories } = useQuery({ queryKey: ['adminServiceCategories'], queryFn: () => getAdminServiceCategories(session!.access_token), initialData: initialCategories, enabled: !!session });

  // Mutations
  const serviceMutation = useMutation({
    mutationFn: (data: Partial<AdminService>) => upsertService(data, session!.access_token, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServices'] });
      toast({ title: 'Success!', description: 'Service has been saved.' });
      setServiceModal(false);
      setSelectedService(undefined);
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to save service: ${e.message}`, variant: 'destructive' }),
  });

  const categoryMutation = useMutation({
    mutationFn: (data: Partial<ServiceCategory>) => upsertServiceCategory(data, session!.access_token, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminServiceCategories'] });
      toast({ title: 'Success!', description: 'Category has been saved.' });
      setCategoryModal(false);
      setSelectedCategory(undefined);
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to save category: ${e.message}`, variant: 'destructive' }),
  });

  // Handlers
  const handleEditService = (service: AdminService) => { setSelectedService(service); setServiceModal(true); };
  const handleEditCategory = (cat: ServiceCategory) => { setSelectedCategory(cat); setCategoryModal(true); };

  const handleServiceSubmit = (values: { name: string; categoryId: string; price: number; description?: string | undefined; }) => {
    serviceMutation.mutate({
      ...values,
      id: selectedService?.id,
      price: String(values.price), // Convert price to string to match API expectation
    });
  };

  const handleCategorySubmit = (values: { name: string; description?: string | undefined;}) => {
      categoryMutation.mutate({
          ...values,
          id: selectedCategory?.id,
      })
  }

  return (
    <>
      <Tabs defaultValue="services">
        <div className="flex justify-between items-center py-4">
          <TabsList>
            <TabsTrigger value="services">Manage Services</TabsTrigger>
            <TabsTrigger value="categories">Manage Categories</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
             <Button onClick={() => { setSelectedService(undefined); setServiceModal(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Service</Button>
             <Button onClick={() => { setSelectedCategory(undefined); setCategoryModal(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Category</Button>
          </div>
        </div>
        <TabsContent value="services" className="mt-4">
          <DataTable columns={serviceColumns({ onEdit: handleEditService, onDelete: (s) => deleteService(s.id) })} data={services || []} filterColumn="name" filterPlaceholder="Filter services..."/>
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <DataTable columns={categoryColumns({ onEdit: handleEditCategory, onDelete: (c) => deleteCategory(c.id) })} data={categories || []} filterColumn="name" filterPlaceholder="Filter categories..."/>
        </TabsContent>
      </Tabs>

      {/* Service Modal */}
      <Dialog open={serviceModal} onOpenChange={setServiceModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedService ? 'Edit Service' : 'Create New Service'}</DialogTitle></DialogHeader>
          <ServiceForm 
            initialData={selectedService} 
            onSubmit={handleServiceSubmit} 
            isPending={serviceMutation.isPending} 
            categories={categories || []} 
          />
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModal} onOpenChange={setCategoryModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle></DialogHeader>
          <CategoryForm 
            initialData={selectedCategory} 
            onSubmit={handleCategorySubmit} 
            isPending={categoryMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
