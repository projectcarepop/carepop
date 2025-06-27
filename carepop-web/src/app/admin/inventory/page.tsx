import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getAdminProducts, getAdminProductCategories } from '@/services/api';
import InventoryClient from './_components/InventoryClient';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';

/**
 * This is the main server component for the Admin Inventory page.
 * It fetches initial data for both products and product categories
 * and passes it to the client component for the tabbed interface.
 */
export default async function AdminInventoryPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    redirect('/sign-in?redirect=/admin/inventory');
  }

  try {
    const [products, categories] = await Promise.all([
      getAdminProducts(session.access_token),
      getAdminProductCategories(session.access_token)
    ]);
    
    return <InventoryClient initialProducts={products} initialCategories={categories} />;
  } catch (error: any)
  {
    console.error(`[AdminInventoryPage] Error fetching data:`, error);
    if (error.message.includes('Forbidden') || error.message.includes('Unauthorized')) {
        redirect('/forbidden');
    }

    return (
      <div className="container mx-auto p-4">
        <Alert variant="destructive">
          <Terminal className="h-4 w-4" />
          <AlertTitle>Failed to Load Inventory Data</AlertTitle>
          <AlertDescription>
            <p>There was an error fetching the products or categories data from the server.</p>
            <p className="mt-2 font-mono text-xs">Error: {error.message}</p>
          </AlertDescription>
        </Alert>
      </div>
    );
  }
} 