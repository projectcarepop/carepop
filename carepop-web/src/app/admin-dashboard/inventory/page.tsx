import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { InventoryClient } from '@/components/admin-dashboard/inventory/InventoryClient';
import { getAdminProducts, getAdminProductCategories } from '@/services/api';

export default async function ManageInventoryPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    
    const [productsData, categoriesData] = await Promise.all([
        getAdminProducts(supabase),
        getAdminProductCategories(supabase)
    ]);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Inventory</h1>
                <p className="text-muted-foreground">
                    Manage e-commerce products, categories, and stock levels.
                </p>
            </div>
            <InventoryClient initialProducts={productsData || []} initialCategories={categoriesData || []} />
        </div>
    );
} 