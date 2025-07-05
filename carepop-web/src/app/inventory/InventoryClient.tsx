'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';
import { 
  getAdminProducts, 
  getProductCategories,
  upsertInventoryItem, 
  upsertProductCategory, 
} from '@/services/api';
import { type InventoryItem, type ProductCategory } from '@/lib/types/inventory';
import { productColumns } from './_components/columns';
import { categoryColumns } from './_components/category-columns';
import { ProductForm, type ProductFormValues } from './_components/ProductForm';
import { CategoryForm, type CategoryFormValues } from './_components/CategoryForm';

export default function InventoryClient() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { session } = useAuth();
  const accessToken = session?.access_token;
  const [activeTab, setActiveTab] = React.useState('products');
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [isSheetOpen, setIsSheetOpen] = React.useState(false);
  const [sheetMode, setSheetMode] = React.useState<'addProduct' | 'editProduct' | 'addCategory' | 'editCategory' | 'updateStock' | 'manageBatches' | null>(null);
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | ProductCategory | null>(null);

  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['admin-products'],
    queryFn: () => getAdminProducts(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  const { data: categories, isLoading: isLoadingCategories } = useQuery({
    queryKey: ['admin-product-categories'],
    queryFn: () => getProductCategories(accessToken!),
    enabled: !!accessToken,
    select: (data) => data.data,
  });

  const handleMutationSuccess = (entity: string) => {
    toast({ title: `${entity} saved successfully.` });
    queryClient.invalidateQueries({ queryKey: ['admin-products'] });
    queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
    setIsSheetOpen(false);
    setSelectedItem(null);
  };

  const handleMutationError = (error: Error, entity: string) => {
    toast({ title: `Error saving ${entity}`, description: error.message, variant: 'destructive' });
  };

  const productMutation = useMutation({
    mutationFn: (data: { item: ProductFormValues; id?: string }) => {
        const { sellingPrice, purchasePrice, ...rest } = data.item;
        
        const payload = {
            ...rest,
            clinicId: 'f8d3e236-8c6e-4b99-9e0a-1b0b3a3b3a3b',
            sellingPrice: sellingPrice ? parseFloat(sellingPrice) : null,
            purchasePrice: purchasePrice ? parseFloat(purchasePrice) : null,
        };
        return upsertInventoryItem(payload, accessToken!, data.id);
    },
    onSuccess: () => handleMutationSuccess('Product'),
    onError: (error: Error) => handleMutationError(error, 'product'),
  });

  const categoryMutation = useMutation({
    mutationFn: (data: { item: CategoryFormValues; id?: string }) => upsertProductCategory(data.item, accessToken!, data.id),
    onSuccess: () => handleMutationSuccess('Category'),
    onError: (error: Error) => handleMutationError(error, 'category'),
  });
  
  const handleOpenSheet = (mode: typeof sheetMode, item: InventoryItem | ProductCategory | null = null) => {
    setSheetMode(mode);
    setSelectedItem(item);
    setIsSheetOpen(true);
  };
  
  const handleEditProduct = (item: InventoryItem) => handleOpenSheet('editProduct', item);
  const handleEditCategory = (category: ProductCategory) => handleOpenSheet('editCategory', category);
  const handleUpdateStock = (item: InventoryItem) => handleOpenSheet('updateStock', item);
  
  const handleDeleteProduct = (item: InventoryItem) => console.log('Delete product', item.id);
  const handleDeleteCategory = (category: ProductCategory) => console.log('Delete category', category.id);

  const renderSheetContent = () => {
    if (!isSheetOpen || !sheetMode) return null;

    switch (sheetMode) {
      case 'addProduct':
      case 'editProduct':
        return (
          <SheetContent className="sm:max-w-2xl">
            <SheetHeader>
              <SheetTitle>{sheetMode === 'addProduct' ? 'Add New Product' : 'Edit Product'}</SheetTitle>
            </SheetHeader>
            <ProductForm
              initialData={selectedItem as InventoryItem | undefined}
              categories={categories || []}
              isPending={productMutation.isPending}
              onSubmit={(values) => productMutation.mutate({ item: values, id: (selectedItem as InventoryItem)?.id })}
            />
          </SheetContent>
        );
      case 'addCategory':
      case 'editCategory':
        return (
          <SheetContent>
            <SheetHeader>
              <SheetTitle>{sheetMode === 'addCategory' ? 'Add New Category' : 'Edit Category'}</SheetTitle>
            </SheetHeader>
            <CategoryForm
              initialData={selectedItem as ProductCategory | undefined}
              isPending={categoryMutation.isPending}
              onSubmit={(values) => categoryMutation.mutate({ item: values, id: (selectedItem as ProductCategory)?.id })}
            />
          </SheetContent>
        );
      default:
        return null;
    }
  };

  const filterColumn = activeTab === 'products' ? 'itemName' : 'name';
  const filterPlaceholder = activeTab === 'products' ? 'Filter by product name...' : 'Filter by category name...';

  return (
    <>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          <div className="ml-auto flex items-center gap-2">
            <Button size="sm" className="h-8 gap-1" onClick={() => handleOpenSheet(activeTab === 'products' ? 'addProduct' : 'addCategory')}>
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                {activeTab === 'products' ? 'Add Product' : 'Add Category'}
              </span>
            </Button>
          </div>
        </div>
        <div className="py-4">
           <Input
                placeholder={filterPlaceholder}
                value={globalFilter}
                onChange={(event) => setGlobalFilter(event.target.value)}
                className="w-full"
            />
        </div>
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your products and view their inventory levels.</CardDescription>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={productColumns({ onEdit: handleEditProduct, onDelete: handleDeleteProduct, onUpdateStock: handleUpdateStock })}
                data={products || []}
                isLoading={isLoadingProducts}
                filterColumn={filterColumn}
                globalFilter={globalFilter}
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
                 columns={categoryColumns({ onEdit: handleEditCategory, onDelete: handleDeleteCategory })}
                 data={categories || []}
                 isLoading={isLoadingCategories}
                 filterColumn={filterColumn}
                 globalFilter={globalFilter}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        {renderSheetContent()}
      </Sheet>
    </>
  );
} 