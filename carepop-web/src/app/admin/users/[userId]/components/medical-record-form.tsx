'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';

interface MedicalRecordFormProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  onSave: (formData: FormData) => Promise<void>;
}

export function MedicalRecordForm({ isOpen, onClose, userId, onSave }: MedicalRecordFormProps) {
  const [recordType, setRecordType] = useState('');
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async () => {
    if (!file || !userId) return;
    setIsSaving(true);
    
    const formData = new FormData();
    formData.append('user_id', userId);
    formData.append('record_type', recordType);
    formData.append('description', description);
    formData.append('file', file);

    await onSave(formData);

    setIsSaving(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Medical Record</DialogTitle>
          <DialogDescription>
            Select a file and provide the necessary details.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="record_type" className="text-right">
              Record Type
            </Label>
            <Input
              id="record_type"
              value={recordType}
              onChange={(e) => setRecordType(e.target.value)}
              className="col-span-3"
              placeholder="e.g., Lab Result, Prescription"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="col-span-3"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="file" className="text-right">
              File
            </Label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!file || !recordType || isSaving}>
            {isSaving ? 'Uploading...' : 'Upload and Save'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 