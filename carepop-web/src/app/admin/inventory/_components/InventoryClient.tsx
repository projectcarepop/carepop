'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import {
  getAdminProducts,
  upsertInventoryItem,
  deleteInventoryItem,
  getProductCategories,
  upsertProductCategory,
  deleteProductCategory,
  addBatchToItem,
  type NewProductCategoryPayload,
} from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type InventoryItem, type ProductCategory } from '@/lib/types/inventory';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { ProductForm } from './ProductForm';
import { CategoryForm } from './CategoryForm';
import { UpdateStockForm } from './UpdateStockForm';
import { productColumns, categoryColumns } from './columns';
import { useAuth } from '@/lib/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface InventoryClientProps {
  initialProducts: InventoryItem[];
  initialCategories: ProductCategory[];
}

export default function InventoryClient({ initialProducts, initialCategories }: InventoryClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [productModal, setProductModal] = React.useState(false);
  const [categoryModal, setCategoryModal] = React.useState(false);
  const [stockModal, setStockModal] = React.useState(false);
  const [deleteDialog, setDeleteDialog] = React.useState<{ type: 'product' | 'category' | null, id: string | null, name: string | null }>({ type: null, id: null, name: null });

  const [selectedProduct, setSelectedProduct] = React.useState<InventoryItem | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | undefined>(undefined);
  const [globalFilter, setGlobalFilter] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('products');

  // Queries
  const { data: products, isError: isErrorProducts } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: () => getAdminProducts(session!.access_token),
    initialData: initialProducts,
    enabled: !!session,
    select: (data: any) => data.data || [], // Select the nested data array safely
  });

  const { data: categories, isError: isErrorCategories } = useQuery({
    queryKey: ['adminProductCategories'],
    queryFn: () => getProductCategories(session!.access_token),
    initialData: initialCategories,
    enabled: !!session,
    select: (data: any) => data.data || [], // Select the nested data array safely
  });


  // Mutations
  const productMutation = useMutation({
    mutationFn: (data: Partial<InventoryItem>) => upsertInventoryItem(data, session!.access_token, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({ title: 'Success!', description: 'Product has been saved.' });
      setProductModal(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to save product: ${e.message}`, variant: 'destructive' }),
  });

  const categoryMutation = useMutation({
    mutationFn: (data: NewProductCategoryPayload) => upsertProductCategory(data, session!.access_token, (data as any).id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProductCategories'] });
      toast({ title: 'Success!', description: 'Category has been saved.' });
      setCategoryModal(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to save category: ${e.message}`, variant: 'destructive' }),
  });

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => deleteInventoryItem(id, session!.access_token),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        toast({ title: 'Product Deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
    onSettled: () => setDeleteDialog({ type: null, id: null, name: null }),
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteProductCategory(id, session!.access_token),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminProductCategories'] });
        toast({ title: 'Category Deleted' });
    },
    onError: (e: any) => toast({ title: 'Error', description: e.message, variant: 'destructive' }),
    onSettled: () => setDeleteDialog({ type: null, id: null, name: null }),
  });

  const updateStockMutation = useMutation({
    mutationFn: (data: { productId: string; quantity: number, batchNumber?: string, expiryDate: string }) => addBatchToItem(data.productId, { quantity: data.quantity, batchNumber: data.batchNumber, expiryDate: data.expiryDate }, session!.access_token),
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
        toast({ title: 'Stock Updated' });
        setStockModal(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to update stock: ${e.message}`, variant: 'destructive' }),
  });

  // Handlers
  const handleEditProduct = (p: InventoryItem) => { setSelectedProduct(p); setProductModal(true); };
  const handleEditCategory = (c: ProductCategory) => { setSelectedCategory(c); setCategoryModal(true); };
  const handleDeleteProduct = (p: InventoryItem) => setDeleteDialog({ type: 'product', id: p.id, name: p.itemName });
  const handleDeleteCategory = (c: ProductCategory) => setDeleteDialog({ type: 'category', id: c.id, name: c.name });
  const handleUpdateStock = (p: InventoryItem) => { setSelectedProduct(p); setStockModal(true); };
  
  const handleProductSubmit = (values: any) => {
    productMutation.mutate({ ...values, id: selectedProduct?.id, price: String(values.price) });
  };
  
  const handleStockSubmit = (values: { quantity: number, batchNumber?: string, expiryDate: string }) => {
    if (selectedProduct) {
        updateStockMutation.mutate({ 
            productId: selectedProduct.id, 
            quantity: values.quantity,
            batchNumber: values.batchNumber,
            expiryDate: values.expiryDate
        });
    }
  }

  const confirmDelete = () => {
    if (deleteDialog.type === 'product' && deleteDialog.id) {
        deleteProductMutation.mutate(deleteDialog.id);
    } else if (deleteDialog.type === 'category' && deleteDialog.id) {
        deleteCategoryMutation.mutate(deleteDialog.id);
    }
  }

  if (isErrorProducts || isErrorCategories) return <div>Error loading data...</div>;

  const filterConfig = {
    products: {
      column: 'itemName',
      placeholder: 'Filter products...',
    },
    categories: {
      column: 'name',
      placeholder: 'Filter categories...',
    },
  };

  const currentFilterColumn = activeTab === 'products' ? filterConfig.products.column : filterConfig.categories.column;
  const currentFilterPlaceholder = activeTab === 'products' ? filterConfig.products.placeholder : filterConfig.categories.placeholder;

  return (
    <div className="p-4 md:p-8 space-y-6">
      <CardHeader className="p-0">
        <CardTitle>Manage Inventory</CardTitle>
        <CardDescription>
          Track and manage product stock and inventory categories.
        </CardDescription>
      </CardHeader>
      <Tabs defaultValue="products" className="w-full" onValueChange={setActiveTab}>
        <div className='flex justify-between items-center'>
          <TabsList>
            <TabsTrigger value="products">Manage Products</TabsTrigger>
            <TabsTrigger value="categories">Manage Categories</TabsTrigger>
          </TabsList>
          <div className='flex space-x-2'>
            {activeTab === 'products' && (
                <Button onClick={() => { setSelectedProduct(undefined); setProductModal(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Product</Button>
            )}
            {activeTab === 'categories' && (
                <Button onClick={() => { setSelectedCategory(undefined); setCategoryModal(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Category</Button>
            )}
          </div>
        </div>

        <div className="flex items-center py-4">
            <Input
                placeholder={currentFilterPlaceholder}
                value={globalFilter}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="max-w-sm"
            />
        </div>

        <TabsContent value="products">
          <DataTable columns={productColumns({ onEdit: handleEditProduct, onDelete: handleDeleteProduct, onUpdateStock: handleUpdateStock })} data={products || []} filterColumn={currentFilterColumn} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter}/>
        </TabsContent>
        <TabsContent value="categories">
          <DataTable columns={categoryColumns({ onEdit: handleEditCategory, onDelete: handleDeleteCategory })} data={categories || []} filterColumn={currentFilterColumn} globalFilter={globalFilter} setGlobalFilter={setGlobalFilter}/>
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle></DialogHeader>
          <ProductForm 
            initialData={selectedProduct} 
            onSubmit={handleProductSubmit} 
            isPending={productMutation.isPending} 
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
            onSubmit={categoryMutation.mutate as any} 
            isPending={categoryMutation.isPending} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Update Stock Modal */}
      <Dialog open={stockModal} onOpenChange={setStockModal}>
        <DialogContent className="sm:max-w-md">
            <DialogHeader>
                <DialogTitle>Update Stock for {selectedProduct?.itemName}</DialogTitle>
            </DialogHeader>
            <UpdateStockForm
                onSubmit={handleStockSubmit}
                isPending={updateStockMutation.isPending}
            />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteDialog.type} onOpenChange={(open) => !open && setDeleteDialog({ type: null, id: null, name: null })}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete the {' '}
                      <span className="font-semibold">{deleteDialog.name}</span> {deleteDialog.type}.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete}>Continue</AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}