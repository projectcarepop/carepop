'use client';
import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, MoreHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { DataTable } from '@/components/ui/data-table';
import { ProductForm, type ProductFormValues } from './ProductForm';
import { columns } from './columns';
import * as api from '@/services/api';
import { useToast } from '@/hooks/use-toast';
import { type InventoryItem } from '@/lib/types/inventory';
import { ClinicSelector } from './ClinicSelector';
import { Input } from '@/components/ui/input';
import { useDebounce } from '@/hooks/useDebounce';
import { useAuth } from '@/lib/contexts/auth-context';

type ModalState =
  | { type: 'NONE' }
  | { type: 'ADD_PRODUCT' }
  | { type: 'EDIT_PRODUCT'; item: InventoryItem }
  | { type: 'DELETE_PRODUCT'; item: InventoryItem };

export default function ProductsClient() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const [selectedClinicId, setSelectedClinicId] = React.useState<string | null>(null);
  const [modalState, setModalState] = React.useState<ModalState>({ type: 'NONE' });
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [searchTerm, setSearchTerm] = React.useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  // Queries
  const { data: clinics, isLoading: isLoadingClinics } = useQuery({
    queryKey: ['admin-clinics'],
    queryFn: () => api.getAdminClinics(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  React.useEffect(() => {
    if (clinics && clinics.length > 0 && !selectedClinicId) {
      setSelectedClinicId(clinics[0].id);
    }
  }, [clinics, selectedClinicId]);

  const { data: products = [], isLoading: isLoadingProducts } = useQuery({
    queryKey: ['inventory-items', selectedClinicId, { q: debouncedSearchTerm }],
    queryFn: () => api.getInventoryForClinic(selectedClinicId!, accessToken!, { q: debouncedSearchTerm }),
    enabled: !!selectedClinicId && !!accessToken,
    select: (data) => data.data,
  });

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ['product-categories'],
    queryFn: () => api.getProductCategories(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  // Mutations
  const mutationOptions = {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
      queryClient.invalidateQueries({ queryKey: ['inventory-stats'] });
      setModalState({ type: 'NONE' });
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      setServerError(errorMessage);
    },
  };

  const upsertMutation = useMutation({
    mutationFn: (data: { values: api.UpsertInventoryItemPayload; itemId?: string }) =>
      api.upsertInventoryItem(selectedClinicId!, data.values, accessToken!, data.itemId),
    ...mutationOptions,
    onSuccess: (_, variables) => {
        const action = variables.itemId ? 'updated' : 'added';
        toast({ title: 'Success', description: `Product ${action} successfully.` });
        mutationOptions.onSuccess();
      },
  });

  const deleteProductMutation = useMutation({
    mutationFn: (itemId: string) => api.deleteInventoryItem(selectedClinicId!, itemId, accessToken!),
    ...mutationOptions,
    onSuccess: () => {
      toast({ title: 'Success', description: 'Product deleted successfully.' });
      mutationOptions.onSuccess();
    },
    onError: (error: any) => {
      const errorMessage = error.response?.data?.message || 'An unexpected error occurred.';
      toast({ variant: 'destructive', title: 'Error', description: errorMessage });
      setModalState({ type: 'NONE' });
    },
  });

  // Handlers
  const handleSelectClinic = (clinicId: string) => {
    setSelectedClinicId(clinicId);
  };

  const handleOpenSheet = (type: 'ADD' | 'EDIT', item?: InventoryItem) => {
    setServerError(null);
    if (type === 'ADD') {
      setModalState({ type: 'ADD_PRODUCT' });
    } else if (item) {
      setModalState({ type: 'EDIT_PRODUCT', item });
    }
  };

  const handleOpenDeleteDialog = (item: InventoryItem) => {
    setModalState({ type: 'DELETE_PRODUCT', item });
  };

  const handleSubmit = (values: ProductFormValues) => {
    const numericValues: api.UpsertInventoryItemPayload = {
      itemName: values.itemName,
      productCategoryId: values.productCategoryId || null,
      sellingPrice: values.sellingPrice ? parseFloat(values.sellingPrice) : null,
      purchasePrice: values.purchasePrice ? parseFloat(values.purchasePrice) : null,
      reorderLevel: values.reorderLevel ? parseInt(values.reorderLevel, 10) : 10,
      sku: values.sku,
      genericName: values.genericName,
      brandName: values.brandName,
      dosageForm: values.dosageForm,
      strength: values.strength,
      location: values.location,
    };

    if (modalState.type === 'EDIT_PRODUCT') {
      upsertMutation.mutate({ values: numericValues, itemId: modalState.item.id });
    } else {
      upsertMutation.mutate({ values: numericValues });
    }
  };

  const tableColumns = React.useMemo(
    () => [
      ...columns,
      {
        id: 'actions',
        cell: ({ row }: { row: { original: InventoryItem } }) => {
          const item = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">Open menu</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleOpenSheet('EDIT', item)}>
                  Edit Details
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleOpenDeleteDialog(item)}>
                  Delete Product
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Products</CardTitle>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-4">
            <div className='flex gap-2 w-full sm:w-auto'>
              <ClinicSelector
                clinics={clinics ?? []}
                selectedClinicId={selectedClinicId}
                onClinicSelect={handleSelectClinic}
                isLoading={isLoadingClinics}
              />
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Input
                placeholder="Filter products by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full sm:w-[250px] lg:w-[300px]"
              />
              <Button onClick={() => handleOpenSheet('ADD')} disabled={!selectedClinicId}>
                <PlusCircle className="mr-2 h-4 w-4" /> Add Product
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={tableColumns}
            data={products}
            isLoading={isLoadingProducts || (!!accessToken && !clinics)}
          />
        </CardContent>
      </Card>

      {/* Sheet for Add/Edit Product */}
      <Sheet
        open={modalState.type === 'ADD_PRODUCT' || modalState.type === 'EDIT_PRODUCT'}
        onOpenChange={(isOpen) => !isOpen && setModalState({ type: 'NONE' })}
      >
        <SheetContent className="sm:max-w-xl overflow-y-auto">
          <SheetHeader>
            <SheetTitle>
              {modalState.type === 'EDIT_PRODUCT' ? 'Edit Product' : 'Add New Product'}
            </SheetTitle>
            <SheetDescription>
              {modalState.type === 'EDIT_PRODUCT'
                ? 'Update the details of the existing product.'
                : 'Fill in the form to add a new product to the inventory.'}
            </SheetDescription>
          </SheetHeader>
          {modalState.type === 'ADD_PRODUCT' || modalState.type === 'EDIT_PRODUCT' ? (
            <div className="py-4">
              <ProductForm
                initialData={modalState.type === 'EDIT_PRODUCT' ? modalState.item : null}
                onSubmit={handleSubmit}
                isPending={upsertMutation.isPending}
                categories={categories}
                isLoadingCategories={isLoadingCategories}
                serverError={serverError}
                setServerError={setServerError}
              />
            </div>
          ) : null}
        </SheetContent>
      </Sheet>

      {/* Alert Dialog for Delete Product */}
      <AlertDialog
        open={modalState.type === 'DELETE_PRODUCT'}
        onOpenChange={(isOpen) => !isOpen && setModalState({ type: 'NONE' })}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              &quot;{modalState.type === 'DELETE_PRODUCT' && modalState.item.itemName}&quot;.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (modalState.type === 'DELETE_PRODUCT') {
                  deleteProductMutation.mutate(modalState.item.id);
                }
              }}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? 'Deleting...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
} 