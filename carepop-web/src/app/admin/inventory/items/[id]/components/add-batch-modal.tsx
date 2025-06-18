'use client';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useState } from 'react';
import { BatchForm } from './batch-form';
import { PlusCircle } from 'lucide-react';
import { ISupplier } from '../page';

interface AddBatchModalProps {
  inventoryItemId: string;
  suppliers: ISupplier[];
}

export function AddBatchModal({ inventoryItemId, suppliers }: AddBatchModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add New Batch
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Batch</DialogTitle>
        </DialogHeader>
        <BatchForm
          inventoryItemId={inventoryItemId}
          suppliers={suppliers}
          onSuccess={() => setIsOpen(false)}
        />
      </DialogContent>
    </Dialog>
  );
} 