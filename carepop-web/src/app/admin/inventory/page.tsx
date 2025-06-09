'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { InventoryItemsList } from './components/inventory-items-list';
import { SuppliersList } from './components/suppliers-list';
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PlusCircle } from "lucide-react";
import { useState } from "react";

export default function InventoryManagementPage() {
  const [activeTab, setActiveTab] = useState("items");

  return (
    <div className="flex flex-col w-full gap-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        {activeTab === 'items' && (
             <Button asChild>
              <Link href="/admin/inventory/items/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Add New Item
              </Link>
            </Button>
        )}
        {activeTab === 'suppliers' && (
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

      <Tabs defaultValue="items" className="space-y-4" onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="items">Inventory Items</TabsTrigger>
          <TabsTrigger value="suppliers">Suppliers</TabsTrigger>
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
              <InventoryItemsList />
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
              <SuppliersList />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 