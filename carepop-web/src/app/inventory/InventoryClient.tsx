'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';
import { 
  getInventoryForClinic, 
  getProductCategories,
  getInventoryStats,
  upsertInventoryItem,
  deleteInventoryItem,
  upsertProductCategory,
  getAdminClinics,
} from '@/services/api';
import { type InventoryItem, type ProductCategory } from '@/lib/types/inventory';
import { productColumns } from './_components/columns';
import { categoryColumns } from './_components/category-columns';
import { ProductForm, type ProductFormValues } from './_components/ProductForm';
import { CategoryForm, type CategoryFormValues } from './_components/CategoryForm';
import { ClinicSelector } from './_components/ClinicSelector';
import { UpdateStockForm, type UpdateStockFormValues } from './_components/UpdateStockForm';
import { InventoryDashboard } from './_components/InventoryDashboard';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export default function InventoryClient() {
  const { toast } = useToast();
  const { session } = useAuth();
  const accessToken = session?.access_token;

  const [activeTab, setActiveTab] = React.useState('products');
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [showLowStockOnly, setShowLowStockOnly] = React.useState(false);
  const [showExpiringSoon, setShowExpiringSoon] = React.useState(false);
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState<'addProduct' | 'editProduct' | 'addCategory' | 'editCategory' | 'updateStock' | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | ProductCategory | null>(null);
  const [selectedClinicId, setSelectedClinicId] = React.useState<string | null>(null);

  const queryClient = useQueryClient();

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['inventory-items', selectedClinicId, { lowStock: showLowStockOnly, expiringSoon: showExpiringSoon }],
    queryFn: () => getInventoryForClinic(selectedClinicId!, accessToken!, {
      lowStock: showLowStockOnly,
      expiringSoon: showExpiringSoon,
    }),
    enabled: !!accessToken && !!selectedClinicId,
    select: (data) => data.data,
  });

  const { data: inventoryStats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['inventory-stats', selectedClinicId],
    queryFn: () => getInventoryStats(selectedClinicId!, accessToken!),
    enabled: !!accessToken && !!selectedClinicId,
    select: (data) => data.data,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: () => getProductCategories(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  const { data: clinics, isLoading: isLoadingClinics } = useQuery({
    queryKey: ['admin-clinics'],
    queryFn: () => getAdminClinics(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  const handleMutationSuccess = (entity: string) => {
    toast({ title: `${entity} saved successfully.` });
    setIsSheetOpen(false);
    queryClient.invalidateQueries({ queryKey: ['inventory-stats', selectedClinicId] });
    if (entity === 'Product' || entity === 'Stock') {
      queryClient.invalidateQueries({ queryKey: ['inventory-items', selectedClinicId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
    }
  };

  const handleMutationError = (error: Error, entity: string) => {
    toast({ title: `Error saving ${entity}`, description: error.message, variant: 'destructive' });
  };

  const productMutation = useMutation({
    mutationFn: (data: { item: ProductFormValues; id?: string }) => {
        const { sellingPrice, purchasePrice, expiryDate, ...rest } = data.item;
        
        const payload = {
            ...rest,
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
            expiryDate: expiryDate ? new Date(expiryDate).toISOString() : null,
        };
        return upsertInventoryItem(selectedClinicId!, payload, accessToken!, data.id);
    },
    onSuccess: () => handleMutationSuccess('Product'),
    onError: (error) => handleMutationError(error, 'Product'),
  });

  const categoryMutation = useMutation({
    mutationFn: (data: { item: CategoryFormValues; id?: string }) => upsertProductCategory(data.item, accessToken!, data.id),
    onSuccess: () => handleMutationSuccess('Category'),
    onError: (error) => handleMutationError(error, 'Category'),
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

  const handleOpenSheet = React.useCallback((
    mode: 'addProduct' | 'editProduct' | 'addCategory' | 'editCategory' | 'updateStock', 
    item?: InventoryItem | ProductCategory
  ) => {
    setSheetMode(mode);
    setSelectedItem(item || null);
    setIsSheetOpen(true);
  }, []);
  
  const handleDeleteProduct = (item: InventoryItem) => {
    deleteProductMutation.mutate(item);
  }

  const columns = React.useMemo(() => productColumns({
    onEdit: (item) => handleOpenSheet('editProduct', item),
    onDelete: handleDeleteProduct,
    onUpdateStock: (item) => handleOpenSheet('updateStock', item)
  }), [handleOpenSheet]);

  const categoryCols = React.useMemo(() => categoryColumns({
    openSheet: (mode, category) => handleOpenSheet(mode, category),
  }), [handleOpenSheet]);

  const filterPlaceholder = activeTab === 'products' ? 'Filter by product name...' : 'Filter by category name...';

  return (
    <>
      <div className="flex items-center justify-between mb-4">
          <ClinicSelector 
            clinics={clinics || []}
            selectedClinicId={selectedClinicId}
            onClinicSelect={setSelectedClinicId}
            isLoading={isLoadingClinics}
          />
      </div>
      <div className="mb-4">
        <InventoryDashboard stats={inventoryStats} isLoading={isLoadingStats} />
      </div>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-4">
            {activeTab === 'products' && (
              <div className="flex items-center space-x-4">
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
              </div>
            )}
            <Input
              placeholder={filterPlaceholder}
              value={globalFilter}
              onChange={(e) => setGlobalFilter(e.target.value)}
              className="w-full md:w-64"
            />
            <Button onClick={() => handleOpenSheet(activeTab === 'products' ? 'addProduct' : 'addCategory')}>
              <PlusCircle className="mr-2 h-4 w-4" />
              {activeTab === 'products' ? 'Add Product' : 'Add Category'}
            </Button>
          </div>
        </div>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your products and view their inventory levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={columns}
                data={products || []}
                filterColumn="itemName"
                globalFilter={globalFilter}
                isLoading={isLoadingProducts}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Categories</CardTitle>
              <CardDescription>Manage your product categories.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={categoryCols}
                data={categories || []}
                filterColumn="name"
                globalFilter={globalFilter}
                isLoading={isLoadingCategories}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent>
          <SheetHeader>
            <SheetTitle>
              {sheetMode === 'updateStock' && 'Update Stock'}
              {sheetMode !== 'updateStock' && `${sheetMode?.includes('edit') ? 'Edit' : 'Add'} ${sheetMode?.includes('Category') ? 'Category' : 'Product'}`}
            </SheetTitle>
            <SheetDescription>
              {sheetMode === 'updateStock' 
                ? 'Enter the new total quantity for this item.' 
                : `Fill in the details for the ${sheetMode?.includes('Category') ? 'category' : 'product'}.`
              }
            </SheetDescription>
          </SheetHeader>
          <div className="py-4">
            { (sheetMode === 'addProduct' || sheetMode === 'editProduct') && 
              <ProductForm 
                onSubmit={(values) => productMutation.mutate({ item: values, id: (selectedItem as InventoryItem)?.id })} 
                initialData={selectedItem as InventoryItem | undefined}
                isPending={productMutation.isPending}
                categories={categories || []}
              />
            }
            { (sheetMode === 'addCategory' || sheetMode === 'editCategory') &&
              <CategoryForm 
                onSubmit={(values) => categoryMutation.mutate({ item: values, id: (selectedItem as ProductCategory)?.id })}
                initialData={selectedItem as ProductCategory | undefined}
                isPending={categoryMutation.isPending}
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
        </SheetContent>
      </Sheet>
    </>
  );
} 