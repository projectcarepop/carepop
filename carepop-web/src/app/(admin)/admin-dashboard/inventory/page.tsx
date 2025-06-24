import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { InventoryClient } from '@/components/admin-dashboard/inventory/InventoryClient';
import { apiClient } from '@/lib/apiClient';

// These types would ideally be in a shared location, e.g., @/types/app
export interface ProductCategory {
  id: string;
  name: string;
  description?: string | null;
}

export interface Product {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  sku?: string | null;
  categoryId: string;
  categoryName?: string; // Joined in the backend view
  quantityOnHand?: number; // Joined from inventory table
}


async function fetchData(accessToken: string) {
    try {
        const [productsRes, categoriesRes] = await Promise.all([
            apiClient.api.admin.products.$get({ headers: { 'Authorization': `Bearer ${accessToken}` } }),
            apiClient.api.admin['product-categories'].$get({ headers: { 'Authorization': `Bearer ${accessToken}` } })
        ]);

        const products = productsRes.ok ? (await productsRes.json()).data : [];
        const categories = categoriesRes.ok ? (await categoriesRes.json()).data : [];
        
        return { products, categories };
    } catch (error) {
        console.error('An unexpected error occurred while fetching inventory data:', error);
        return { products: [], categories: [] };
    }
}

export default async function ManageInventoryPage() {
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) return null;
    
    const { products, categories } = await fetchData(session.access_token);
    
    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold">Manage Inventory</h1>
                <p className="text-muted-foreground">
                    Manage e-commerce products, categories, and stock levels.
                </p>
            </div>
            <InventoryClient initialProducts={products} initialCategories={categories} />
        </div>
    );
} 