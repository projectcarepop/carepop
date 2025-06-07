'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Trash2 } from 'lucide-react';
import { MedicalRecordForm } from './medical-record-form';
import { uploadMedicalRecord, deleteMedicalRecord } from '@/lib/actions/admin.actions';

interface MedicalRecord {
  id: string;
  record_type: string;
  description: string | null;
  file_url: string;
  created_at: string;
}

export function MedicalRecordsList({ records, userId }: { records: MedicalRecord[], userId: string }) {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  const handleDownload = (recordUrl: string) => {
    console.log('Downloading record:', recordUrl);
    // In a real app, this would open the URL in a new tab
    window.open(recordUrl, '_blank');
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this medical record?')) {
      await deleteMedicalRecord(recordId);
      // You might want to refresh the data here if needed
    }
  };
  
  const handleSaveRecord = async (formData: FormData) => {
    await uploadMedicalRecord(formData);
    // You might want to refresh the data here if needed
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>A list of the user&apos;s uploaded medical records.</CardDescription>
          </div>
          <Button onClick={() => setIsUploadModalOpen(true)}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Record
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!records || records.length === 0 ? (
            <p>This user has no medical records.</p>
          ) : (
            records.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">{record.record_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {record.description || 'No description'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(record.file_url)}>
                    <Download className="mr-2 h-4 w-4" />
                    View/Download
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(record.id)}>
                     <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <MedicalRecordForm
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        userId={userId}
        onSave={handleSaveRecord}
      />
    </>
  );
} 