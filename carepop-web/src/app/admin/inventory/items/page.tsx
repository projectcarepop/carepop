import { Button } from '@/components/ui/button';
import Link from 'next/link';
import InventoryList from './components/InventoryList';

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Items</h1>
        <Button asChild>
          <Link href="/admin/inventory/items/new">Add New Item</Link>
        </Button>
      </div>
      <InventoryList />
    </div>
  );
} 