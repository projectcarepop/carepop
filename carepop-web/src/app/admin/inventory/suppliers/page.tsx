import { Button } from '@/components/ui/button';
import Link from 'next/link';
import SupplierList from './components/SupplierList';

export default function SuppliersPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Suppliers</h1>
        <Button asChild>
          <Link href="/admin/inventory/suppliers/new">Add New Supplier</Link>
        </Button>
      </div>
      <SupplierList />
    </div>
  );
} 