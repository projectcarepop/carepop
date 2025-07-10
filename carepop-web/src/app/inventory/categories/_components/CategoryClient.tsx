'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
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
  AlertDialogTitle 
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';
import { getProductCategories, upsertProductCategory, deleteProductCategory } from '@/services/api';
import { type ProductCategory } from '@/lib/types/inventory';
import { categoryColumns } from '../../_components/category-columns';
import { CategoryForm, type CategoryFormValues } from '../../_components/CategoryForm';
import { useDebounce } from '@/hooks/useDebounce';

interface CategoryClientProps {
    initialCategories: ProductCategory[];
}

export default function CategoryClient({ initialCategories }: CategoryClientProps) {
    const { toast } = useToast();
    const { session } = useAuth();
    const accessToken = session?.access_token;

    const [globalFilter, setGlobalFilter] = React.useState('');
    const [debouncedFilter] = useDebounce(globalFilter, 500);
    
    // Server-side pagination state
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [isDeleteAlertOpen, setIsDeleteAlertOpen] = React.useState(false);
    const [dialogMode, setDialogMode] = React.useState<'addCategory' | 'editCategory' | null>(null);
    const [selectedItem, setSelectedItem] = React.useState<ProductCategory | null>(null);
    const [deleteError, setDeleteError] = React.useState<string | null>(null);

    const queryClient = useQueryClient();

    const queryKey = ['admin-product-categories', pagination, debouncedFilter];

    const { data: categoriesResponse, isLoading: isLoadingCategories } = useQuery({
        queryKey,
        queryFn: () => getProductCategories(accessToken!, {
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            q: debouncedFilter || undefined,
        }),
        enabled: !!accessToken,
        initialData: { data: initialCategories, pagination: { totalPages: 1, currentPage: 1, totalCount: initialCategories.length } },
    });

    const categories = categoriesResponse?.data || [];
    const pageCount = categoriesResponse?.pagination?.totalPages ?? 0;

    const handleMutationSuccess = () => {
        toast({ title: `Category saved successfully.` });
        setIsDialogOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    };

    const handleMutationError = (error: Error) => {
        toast({ title: `Error saving Category`, description: error.message, variant: 'destructive' });
    };

    const categoryMutation = useMutation({
        mutationFn: (data: { item: CategoryFormValues; id?: string }) => upsertProductCategory(data.item, accessToken!, data.id),
        onSuccess: handleMutationSuccess,
        onError: handleMutationError,
    });

    const deleteCategoryMutation = useMutation({
        mutationFn: (id: string) => deleteProductCategory(id, accessToken!),
        onSuccess: () => {
            toast({ title: 'Category deleted successfully.' });
            queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
            queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
            setIsDeleteAlertOpen(false);
            setSelectedItem(null);
        },
        onError: (error: any) => {
            if (error.response?.status === 409) {
                setDeleteError(error.response.data.message);
            } else {
                toast({ title: 'Error deleting category', description: error.message, variant: 'destructive' });
                setIsDeleteAlertOpen(false);
            }
            setSelectedItem(null);
        }
    });

    const handleOpenDialog = React.useCallback((
        mode: 'addCategory' | 'editCategory',
        item?: ProductCategory
    ) => {
        setDialogMode(mode);
        setSelectedItem(item || null);
        setIsDialogOpen(true);
    }, []);

    const handleDeleteCategory = React.useCallback((category: ProductCategory) => {
        setSelectedItem(category);
        setDeleteError(null); // Clear previous errors
        setIsDeleteAlertOpen(true);
    }, []);

    const categoryCols = React.useMemo(() => categoryColumns({
        openSheet: (mode, category) => handleOpenDialog(mode, category),
        onDelete: handleDeleteCategory,
    }), [handleOpenDialog, handleDeleteCategory]);

    return (
        <>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h1 className="text-2xl font-bold">Product Categories</h1>
                    <p className="text-muted-foreground">
                        Organize your products by grouping them into categories.
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <Input
                        placeholder="Filter by category name..."
                        value={globalFilter}
                        onChange={(e) => setGlobalFilter(e.target.value)}
                        className="w-full md:w-64"
                    />
                    <Button onClick={() => handleOpenDialog('addCategory')}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Add Category
                    </Button>
                </div>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Categories</CardTitle>
                    <CardDescription>Manage your product categories.</CardDescription>
                </CardHeader>
                <CardContent>
                    <DataTable
                        columns={categoryCols}
                        data={categories || []}
                        pageCount={pageCount}
                        pagination={pagination}
                        setPagination={setPagination as React.Dispatch<React.SetStateAction<any>>}
                        globalFilter={globalFilter}
                        setGlobalFilter={setGlobalFilter}
                        isLoading={isLoadingCategories}
                    />
                </CardContent>
            </Card>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>
                            {`${dialogMode?.includes('edit') ? 'Edit' : 'Add'} Category`}
                        </DialogTitle>
                        <DialogDescription>
                            Fill in the details for the category.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <CategoryForm
                            onSubmit={(values) => categoryMutation.mutate({ item: values, id: (selectedItem as ProductCategory)?.id })}
                            initialData={selectedItem as ProductCategory | undefined}
                            isPending={categoryMutation.isPending}
                        />
                    </div>
                </DialogContent>
            </Dialog>

            <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deleteError
                                ? deleteError
                                : `This will permanently delete the category "${selectedItem?.name}". This action cannot be undone.`
                            }
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteError(null)}>Cancel</AlertDialogCancel>
                        {!deleteError && (
                             <AlertDialogAction onClick={() => deleteCategoryMutation.mutate(selectedItem!.id)}>
                                Delete
                            </AlertDialogAction>
                        )}
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
} 