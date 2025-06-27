'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';
import { 
  getAdminProducts, 
  upsertProduct, 
  getAdminProductCategories, 
  upsertProductCategory,
  // Placeholders for future API functions
  // deleteProduct, 
  // deleteProductCategory,
  // updateStock
} from '@/services/api';
import { DataTable } from '@/components/ui/data-table';
import { type AdminProduct, type ProductCategory } from '@/lib/types';
import { columns as productColumns } from './columns-product';
import { columns as categoryColumns } from './columns-category';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ProductForm } from './ProductForm';
import { CategoryForm } from './CategoryForm';
import { useAuth } from '@/lib/contexts/auth-context';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface InventoryClientProps {
  initialProducts: AdminProduct[];
  initialCategories: ProductCategory[];
}

// Placeholder delete functions
const deleteProduct = async (id: string) => console.warn(`DELETE /api/admin/products/${id}`);
const deleteProductCategory = async (id: string) => console.warn(`DELETE /api/admin/product-categories/${id}`);

export default function InventoryClient({ initialProducts, initialCategories }: InventoryClientProps) {
  const { session } = useAuth();
  const queryClient = useQueryClient();

  const [productModal, setProductModal] = React.useState(false);
  const [categoryModal, setCategoryModal] = React.useState(false);
  const [selectedProduct, setSelectedProduct] = React.useState<AdminProduct | undefined>(undefined);
  const [selectedCategory, setSelectedCategory] = React.useState<ProductCategory | undefined>(undefined);

  // Queries
  const { data: products } = useQuery({ queryKey: ['adminProducts'], queryFn: () => getAdminProducts(session!.access_token), initialData: initialProducts, enabled: !!session });
  const { data: categories } = useQuery({ queryKey: ['adminProductCategories'], queryFn: () => getAdminProductCategories(session!.access_token), initialData: initialCategories, enabled: !!session });

  // Mutations
  const productMutation = useMutation({
    mutationFn: (data: Partial<AdminProduct>) => upsertProduct(data, session!.access_token, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast({ title: 'Success!', description: 'Product has been saved.' });
      setProductModal(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to save product: ${e.message}`, variant: 'destructive' }),
  });

  const categoryMutation = useMutation({
    mutationFn: (data: Partial<ProductCategory>) => upsertProductCategory(data, session!.access_token, data.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProductCategories'] });
      toast({ title: 'Success!', description: 'Category has been saved.' });
      setCategoryModal(false);
    },
    onError: (e: any) => toast({ title: 'Error', description: `Failed to save category: ${e.message}`, variant: 'destructive' }),
  });

  // Handlers
  const handleEditProduct = (p: AdminProduct) => { setSelectedProduct(p); setProductModal(true); };
  const handleEditCategory = (c: ProductCategory) => { setSelectedCategory(c); setCategoryModal(true); };

  const handleProductSubmit = (values: any) => {
    productMutation.mutate({
      ...values,
      id: selectedProduct?.id,
      price: String(values.price),
    });
  };

  return (
    <>
      <Tabs defaultValue="products">
        <div className="flex justify-between items-center py-4">
          <TabsList>
            <TabsTrigger value="products">Manage Products</TabsTrigger>
            <TabsTrigger value="categories">Manage Categories</TabsTrigger>
          </TabsList>
          <div className="flex gap-2">
             <Button onClick={() => { setSelectedProduct(undefined); setProductModal(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Product</Button>
             <Button onClick={() => { setSelectedCategory(undefined); setCategoryModal(true); }}><PlusCircle className="mr-2 h-4 w-4" />Create Category</Button>
          </div>
        </div>
        <TabsContent value="products" className="mt-4">
          <DataTable columns={productColumns({ onEdit: handleEditProduct, onDelete: deleteProduct })} data={products || []} filterColumn="name" filterPlaceholder="Filter products..."/>
        </TabsContent>
        <TabsContent value="categories" className="mt-4">
          <DataTable columns={categoryColumns({ onEdit: handleEditCategory, onDelete: deleteProductCategory })} data={categories || []} filterColumn="name" filterPlaceholder="Filter categories..."/>
        </TabsContent>
      </Tabs>

      {/* Product Modal */}
      <Dialog open={productModal} onOpenChange={setProductModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedProduct ? 'Edit Product' : 'Create New Product'}</DialogTitle></DialogHeader>
          <ProductForm initialData={selectedProduct} onSubmit={handleProductSubmit} isPending={productMutation.isPending} categories={categories || []} />
        </DialogContent>
      </Dialog>

      {/* Category Modal */}
      <Dialog open={categoryModal} onOpenChange={setCategoryModal}>
        <DialogContent>
          <DialogHeader><DialogTitle>{selectedCategory ? 'Edit Category' : 'Create New Category'}</DialogTitle></DialogHeader>
          <CategoryForm initialData={selectedCategory} onSubmit={categoryMutation.mutate as any} isPending={categoryMutation.isPending} />
        </DialogContent>
      </Dialog>
    </>
  );
} 