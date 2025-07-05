'use client';

import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/lib/contexts/auth-context';
import { getProductCategories, upsertProductCategory } from '@/services/api';
import { type ProductCategory } from '@/lib/types/inventory';
import { categoryColumns } from '../../_components/category-columns';
import { CategoryForm, type CategoryFormValues } from '../../_components/CategoryForm';

interface CategoryClientProps {
    initialCategories: ProductCategory[];
}

export default function CategoryClient({ initialCategories }: CategoryClientProps) {
    const { toast } = useToast();
    const { session } = useAuth();
    const accessToken = session?.access_token;

    const [globalFilter, setGlobalFilter] = React.useState('');
    const [isSheetOpen, setIsSheetOpen] = React.useState(false);
    const [sheetMode, setSheetMode] = React.useState<'addCategory' | 'editCategory' | null>(null);
    const [selectedItem, setSelectedItem] = React.useState<ProductCategory | null>(null);

    const queryClient = useQueryClient();

    const { data: categories, isLoading: isLoadingCategories } = useQuery({
        queryKey: ['admin-product-categories'],
        queryFn: () => getProductCategories(accessToken!),
        enabled: !!accessToken,
        select: (data) => data.data,
        initialData: { data: initialCategories },
    });

    const handleMutationSuccess = () => {
        toast({ title: `Category saved successfully.` });
        setIsSheetOpen(false);
        queryClient.invalidateQueries({ queryKey: ['admin-product-categories'] });
    };

    const handleMutationError = (error: Error) => {
        toast({ title: `Error saving Category`, description: error.message, variant: 'destructive' });
    };

    const categoryMutation = useMutation({
        mutationFn: (data: { item: CategoryFormValues; id?: string }) => upsertProductCategory(data.item, accessToken!, data.id),
        onSuccess: handleMutationSuccess,
        onError: handleMutationError,
    });

    const handleOpenSheet = React.useCallback((
        mode: 'addCategory' | 'editCategory',
        item?: ProductCategory
    ) => {
        setSheetMode(mode);
        setSelectedItem(item || null);
        setIsSheetOpen(true);
    }, []);

    const categoryCols = React.useMemo(() => categoryColumns({
        openSheet: (mode, category) => handleOpenSheet(mode, category),
    }), [handleOpenSheet]);

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
                    <Button onClick={() => handleOpenSheet('addCategory')}>
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
                        filterColumn="name"
                        globalFilter={globalFilter}
                        isLoading={isLoadingCategories}
                    />
                </CardContent>
            </Card>
            <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
                <SheetContent>
                    <SheetHeader>
                        <SheetTitle>
                            {`${sheetMode?.includes('edit') ? 'Edit' : 'Add'} Category`}
                        </SheetTitle>
                        <SheetDescription>
                            Fill in the details for the category.
                        </SheetDescription>
                    </SheetHeader>
                    <div className="py-4">
                        <CategoryForm
                            onSubmit={(values) => categoryMutation.mutate({ item: values, id: (selectedItem as ProductCategory)?.id })}
                            initialData={selectedItem as ProductCategory | undefined}
                            isPending={categoryMutation.isPending}
                        />
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
} 