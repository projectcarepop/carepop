'use client';

import { useParams } from 'next/navigation';
import { InventoryItemForm } from '../../../components/inventory-item-form';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EditInventoryItemPage() {
  const params = useParams();
  const { id } = params;

  // Ensure id is a string
  const itemId = Array.isArray(id) ? id[0] : id;

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="mb-6">
        <Button variant="outline" asChild>
          <Link href="/admin/inventory">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Inventory
          </Link>
        </Button>
      </div>
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Edit Inventory Item</h2>
      </div>
      <InventoryItemForm itemId={itemId} />
    </div>
  );
} 