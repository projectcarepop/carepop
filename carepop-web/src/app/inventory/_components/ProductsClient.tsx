'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';
import { 
  getInventoryForClinic, 
  getProductCategories,
  upsertInventoryItem,
  deleteInventoryItem,
  deleteItemBatch,
} from '@/services/api';
import { type InventoryItem, type InventoryItemBatch } from '@/lib/types/inventory';
import { productColumns } from './columns';
import { ProductForm, type ProductFormValues } from './ProductForm';
import { UpdateStockForm, type UpdateStockFormValues } from './UpdateStockForm';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ClinicSelector } from './ClinicSelector';
import { getAdminClinics } from '@/services/api';
import { ManageItemBatchesView } from './ManageItemBatchesView';
import { useDebounce } from '@/hooks/useDebounce';


export default function ProductsClient() {
  const { toast } = useToast();
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const selectedClinicId = searchParams.get('clinicId');

  const [globalFilter, setGlobalFilter] = React.useState('');
  const debouncedFilter = useDebounce(globalFilter, 300);
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = React.useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState<'addProduct' | 'editProduct' | 'updateStock' | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [duplicateWarning, setDuplicateWarning] = React.useState<ProductFormValues | null>(null);
  const [batchToDelete, setBatchToDelete] = React.useState<InventoryItemBatch | null>(null);

  const queryClient = useQueryClient();

    const { data: clinics, isLoading: isLoadingClinics } = useQuery({
        queryKey: ['admin-clinics'],
        queryFn: () => getAdminClinics(accessToken!),
        enabled: !!accessToken,
    });

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['inventory-items', selectedClinicId, { lowStock: showLowStockOnly, expiringSoon: showExpiringSoon, q: debouncedFilter }],
    queryFn: () => {
        if (!selectedClinicId || !accessToken) return Promise.resolve({ data: [] });
        return getInventoryForClinic(selectedClinicId, accessToken, {
            lowStock: showLowStockOnly,
            expiringSoon: showExpiringSoon,
            q: debouncedFilter
        });
    },
    enabled: !!accessToken && !!selectedClinicId,
    select: (data) => data.data,
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: () => getProductCategories(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  const handleMutationSuccess = (entity: string) => {
    toast({ title: `${entity} saved successfully.` });
    setIsSheetOpen(false);
    queryClient.invalidateQueries({ queryKey: ['inventory-items', selectedClinicId] });
    queryClient.invalidateQueries({ queryKey: ['inventory-stats', selectedClinicId] });
  };

  const handleMutationError = (error: any, entity: string) => {
    if (error.response?.status === 409) {
        setServerError(error.response.data.message);
    } else {
        toast({ title: `Error saving ${entity}`, description: error.message, variant: 'destructive' });
    }
  };

  const productMutation = useMutation({
    mutationFn: (data: { item: ProductFormValues; id?: string }) => {
        const { sellingPrice, purchasePrice, expiryDate, ...rest } = data.item;
        
        const payload = {
            ...rest,
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : undefined,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : undefined,
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
        };
        return upsertInventoryItem(selectedClinicId!, payload, accessToken!, data.id);
    },
    onSuccess: () => handleMutationSuccess('Product'),
    onError: (error) => handleMutationError(error, 'Product'),
  });

  const stockUpdateMutation = useMutation({
    mutationFn: (data: { values: UpdateStockFormValues, id: string }) => {
      const payload = {
        quantityOnHand: data.values.quantityOnHand,
      };
      return upsertInventoryItem(selectedClinicId!, payload, accessToken!, data.id);
    },
    onSuccess: () => handleMutationSuccess('Stock'),
    onError: (error) => handleMutationError(error, 'Stock'),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (item: InventoryItem) => deleteInventoryItem(selectedClinicId!, item.id, accessToken!),
    onSuccess: () => {
        toast({ title: 'Product deleted successfully.' });
        queryClient.invalidateQueries({ queryKey: ['inventory-items', selectedClinicId] });
        queryClient.invalidateQueries({ queryKey: ['inventory-stats', selectedClinicId] });
    },
    onError: (error) => handleMutationError(error, 'Product deletion'),
  });

  const deleteBatchMutation = useMutation({
    mutationFn: (batchId: string) => deleteItemBatch(batchId, accessToken!),
    onSuccess: () => {
      toast({ title: 'Success', description: 'Batch deleted.' });
      queryClient.invalidateQueries({ queryKey: ['itemBatches', selectedItem?.id] });
    },
    onError: (error: any) => handleMutationError(error, 'Batch deletion'),
    onSettled: () => setBatchToDelete(null),
  });

  const handleSubmitProduct = (values: ProductFormValues) => {
    const isEditing = sheetMode === 'editProduct';
    
    // Check for duplicate name only when adding a new product
    if (!isEditing) {
      const duplicate = products?.find(p => p.itemName.toLowerCase() === values.itemName.toLowerCase());
      if (duplicate) {
        setDuplicateWarning(values);
        return; // Stop the submission and show the warning
      }
    }
    
    // If no duplicate or if editing, proceed with mutation
    productMutation.mutate({ item: values, id: isEditing ? selectedItem?.id : undefined });
  };

  const handleViewDetails = React.useCallback((item: InventoryItem | null) => {
    if (item) {
      setSelectedItem(item);
    }
    setIsDetailsModalOpen(true);
  }, []);

  const handleOpenSheet = React.useCallback((
    mode: 'addProduct' | 'editProduct' | 'updateStock', 
    item?: InventoryItem
  ) => {
    setSheetMode(mode);
    setSelectedItem(item || null);
    setServerError(null);
    setIsSheetOpen(true);
  }, []);
  
  const handleManageBatches = React.useCallback((item: InventoryItem) => {
    setSelectedItem(item);
    setIsBatchModalOpen(true);
  }, []);

  const handleDeleteBatch = (batch: InventoryItemBatch) => {
    setBatchToDelete(batch);
  };

  const handleDeleteProduct = (item: InventoryItem) => {
    setSelectedItem(item);
    setIsDeleteAlertOpen(true);
  }
  
  const handleConfirmDelete = () => {
    if (selectedItem) {
      deleteProductMutation.mutate(selectedItem);
    }
    setIsDeleteAlertOpen(false);
    setSelectedItem(null);
  }
  
  const handleClinicSelect = (clinicId: string | null) => {
      const params = new URLSearchParams(searchParams);
      if (clinicId) {
          params.set('clinicId', clinicId);
      } else {
          params.delete('clinicId');
      }
      router.push(`${pathname}?${params.toString()}`);
  }

  const columns = React.useMemo(() => productColumns({
    onEdit: (item) => handleOpenSheet('editProduct', item),
    onDelete: handleDeleteProduct,
    onUpdateStock: (item) => handleOpenSheet('updateStock', item),
    onViewDetails: handleViewDetails,
    onManageBatches: handleManageBatches,
  }), [handleOpenSheet, handleViewDetails, handleManageBatches]);

  return (
    <div className="space-y-4">
        <div className="flex items-center justify-between">
            <div>
                <h1 className="text-2xl font-bold">Products</h1>
                <p className="text-muted-foreground">
                    View, add, and manage product inventory for a selected clinic.
                </p>
            </div>
            <ClinicSelector
                clinics={clinics || []}
                selectedClinicId={selectedClinicId}
                onClinicSelect={handleClinicSelect}
                isLoading={isLoadingClinics || !accessToken}
            />
        </div>
        
      {!selectedClinicId ? (
        <Card className="flex items-center justify-center h-48">
            <CardContent className="pt-6">
                <p className="text-muted-foreground">Please select a clinic to view products.</p>
            </CardContent>
        </Card>
      ) : (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
            <div>
                <CardTitle>Manage Products</CardTitle>
                <CardDescription>Add, edit, and manage your product inventory.</CardDescription>
            </div>
            <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                <Checkbox
                    id="low-stock"
                    checked={showLowStockOnly}
                    onCheckedChange={(checked) => setShowLowStockOnly(!!checked)}
                />
                <Label htmlFor="low-stock" className="whitespace-nowrap">Low Stock</Label>
                </div>
                <div className="flex items-center space-x-2">
                <Checkbox
                    id="expiring-soon"
                    checked={showExpiringSoon}
                    onCheckedChange={(checked) => setShowExpiringSoon(!!checked)}
                />
                <Label htmlFor="expiring-soon" className="whitespace-nowrap">Expiring Soon</Label>
                </div>
                <Input
                placeholder="Filter by product name..."
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="w-full md:w-64"
                />
                <Button onClick={() => handleOpenSheet('addProduct')}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Add Product
                </Button>
            </div>
            </CardHeader>
            <CardContent>
            <DataTable
                columns={columns}
                data={products || []}
                isLoading={isLoadingProducts}
            />
            </CardContent>
        </Card>
      )}

      <Dialog open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {sheetMode === 'updateStock' && 'Update Stock'}
              {sheetMode !== 'updateStock' && `${sheetMode?.includes('edit') ? 'Edit' : 'Add'} Product`}
            </DialogTitle>
            <DialogDescription>
              {sheetMode === 'updateStock' 
                ? 'Enter the new total quantity for this item.' 
                : `Fill in the details for the product.`
              }
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            { (sheetMode === 'addProduct' || sheetMode === 'editProduct') && 
              <ProductForm 
                onSubmit={handleSubmitProduct} 
                initialData={selectedItem as InventoryItem | undefined}
                isPending={productMutation.isPending}
                categories={categories || []}
                serverError={serverError}
                setServerError={setServerError}
              />
            }
            { sheetMode === 'updateStock' &&
              <UpdateStockForm
                onSubmit={(values) => stockUpdateMutation.mutate({ values, id: (selectedItem as InventoryItem).id })}
                initialData={selectedItem as InventoryItem}
                isPending={stockUpdateMutation.isPending}
              />
            }
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isBatchModalOpen} onOpenChange={setIsBatchModalOpen}>
          <DialogContent className="sm:max-w-4xl">
              <DialogHeader>
                  <DialogTitle>Manage Batches for: {selectedItem?.itemName}</DialogTitle>
                  <DialogDescription>
                    Add new stock or remove existing batches for this item.
                  </DialogDescription>
              </DialogHeader>
              {selectedItem && (
                  <ManageItemBatchesView
                      item={selectedItem}
                      onDeleteBatch={handleDeleteBatch}
                  />
              )}
          </DialogContent>
      </Dialog>

      {selectedItem && (
        <Dialog open={isDetailsModalOpen} onOpenChange={setIsDetailsModalOpen}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>{selectedItem.itemName}</DialogTitle>
                    <DialogDescription>
                        Detailed information for {selectedItem.brandName || 'this product'}.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                   <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm font-medium text-muted-foreground">SKU</p>
                        <p>{selectedItem.sku ?? 'N/A'}</p>

                        <p className="text-sm font-medium text-muted-foreground">Generic Name</p>
                        <p>{selectedItem.genericName ?? 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-muted-foreground">Category</p>
                        <p>{selectedItem.categoryName ?? 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-muted-foreground">Brand</p>
                        <p>{selectedItem.brandName ?? 'N/A'}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Strength</p>
                        <p>{selectedItem.strength ?? 'N/A'}</p>

                        <p className="text-sm font-medium text-muted-foreground">Form</p>
                        <p>{selectedItem.dosageForm ?? 'N/A'}</p>

                        <p className="text-sm font-medium text-muted-foreground">Quantity on Hand</p>
                        <p>{selectedItem.quantityOnHand}</p>
                        
                        <p className="text-sm font-medium text-muted-foreground">Reorder Level</p>
                        <p>{selectedItem.reorderLevel}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Selling Price</p>
                        <p>{selectedItem.sellingPrice ? `₱${Number(selectedItem.sellingPrice).toFixed(2)}` : 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-muted-foreground">Purchase Price</p>
                        <p>{selectedItem.purchasePrice ? `₱${Number(selectedItem.purchasePrice).toFixed(2)}` : 'N/A'}</p>
                   </div>
                    <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Batch Number</p>
                        <p>{selectedItem.batchNumber ?? 'N/A'}</p>
                        
                        <p className="text-sm font-medium text-muted-foreground">Expiry Date</p>
                        <p>{selectedItem.expiryDate ? new Date(selectedItem.expiryDate).toLocaleDateString() : 'N/A'}</p>

                        <p className="text-sm font-medium text-muted-foreground">Location</p>
                        <p>{selectedItem.location ?? 'N/A'}</p>
                    </div>
                     <div className="grid grid-cols-2 gap-2">
                        <p className="text-sm font-medium text-muted-foreground">Last Updated</p>
                        <p>{new Date(selectedItem.updatedAt).toLocaleString()}</p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the product
              &apos;{selectedItem?.itemName}&apos; from the inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedItem(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Confirm
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!batchToDelete} onOpenChange={() => setBatchToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Batch?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete batch &apos;{batchToDelete?.batchNumber || 'N/A'}&apos;
              with {batchToDelete?.quantity} units. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => deleteBatchMutation.mutate(batchToDelete!.id)}
              disabled={deleteBatchMutation.isPending}
            >
              {deleteBatchMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={!!duplicateWarning} onOpenChange={() => setDuplicateWarning(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Duplicate Product Name</AlertDialogTitle>
            <AlertDialogDescription>
              A product named &apos;{duplicateWarning?.itemName}&apos; already exists. 
              It is recommended to manage stock for the existing item instead of creating a duplicate.
              <br/><br/>
              Are you sure you want to create a new product with this name?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              if (duplicateWarning) {
                productMutation.mutate({ item: duplicateWarning, id: undefined });
              }
              setDuplicateWarning(null);
            }}>
              Create Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
} 