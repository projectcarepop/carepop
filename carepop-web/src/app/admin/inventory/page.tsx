import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InventoryItemsList } from './components/inventory-items-list';
import { SuppliersList } from './components/suppliers-list';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { z } from "zod";

const inventorySearchParamsSchema = z.object({
  tab: z.enum(['items', 'suppliers']).default('items'),
  page: z.coerce.number().default(1),
  per_page: z.coerce.number().default(10),
  sort: z.string().optional(),
  search: z.string().optional(),
});

interface InventoryPageProps {
  searchParams: {
    [key: string]: string | string[] | undefined;
  };
}

export default function InventoryManagementPage({ searchParams }: InventoryPageProps) {
  const tab = searchParams.tab === 'suppliers' ? 'suppliers' : 'items';
  
  const listSearchParams = {
    page: Number(searchParams.page ?? 1),
    per_page: Number(searchParams.per_page ?? 10),
    sort: searchParams.sort as string | undefined,
    search: searchParams.search as string | undefined,
  };

  const getHref = (newTab: 'items' | 'suppliers') => {
    const newParams = new URLSearchParams();
    newParams.set('tab', newTab);
    return `/admin/inventory?${newParams.toString()}`;
  }

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        {tab === 'items' && (
             <Button asChild>
              <Link href="/admin/inventory/items/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Link>
            </Button>
        )}
        {tab === 'suppliers' && (
             <Button asChild>
              <Link href="/admin/inventory/suppliers/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Supplier
              </Link>
            </Button>
        )}
      </div>
       <p className="text-muted-foreground">
        Manage your inventory items and suppliers from one place.
      </p>

      <Tabs value={tab} className="space-y-4">
        <TabsList>
          <Link href={getHref('items')}><TabsTrigger value="items">Inventory Items</TabsTrigger></Link>
          <Link href={getHref('suppliers')}><TabsTrigger value="suppliers">Suppliers</TabsTrigger></Link>
        </TabsList>
        <TabsContent value="items" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Inventory Items</CardTitle>
              <CardDescription>
                Manage all pharmaceutical products and medical supplies.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <InventoryItemsList {...listSearchParams} />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="suppliers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Suppliers</CardTitle>
              <CardDescription>
                Manage all vendors and suppliers for your inventory.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SuppliersList {...listSearchParams} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 