import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { getAdminProducts } from '@/services/api';
import { InventoryManagementClient } from './_components/inventory-management-client';

export const dynamic = 'force-dynamic';

export default async function InventoryManagementPage() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const initialProducts = await getAdminProducts(supabase);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Inventory Management</h1>
        <p className="text-muted-foreground">
          A list of all products in the system.
        </p>
      </div>
      <InventoryManagementClient initialProducts={initialProducts} />
    </div>
  );
} 