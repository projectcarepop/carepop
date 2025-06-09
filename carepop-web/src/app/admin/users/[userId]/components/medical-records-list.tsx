'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Download, Trash2 } from 'lucide-react';
import { deleteMedicalRecord } from '@/lib/actions/admin.actions';
import Link from 'next/link';
import { toast } from 'sonner';

interface MedicalRecord {
  id: string;
  record_title: string;
  record_details: string | null;
  record_file_url: string;
  created_at: string;
}

export function MedicalRecordsList({ records, userId }: { records: MedicalRecord[], userId: string }) {

  const handleDownload = (recordUrl: string) => {
    window.open(recordUrl, '_blank');
  };

  const handleDelete = async (recordId: string) => {
    if (confirm('Are you sure you want to delete this medical record?')) {
      try {
        await deleteMedicalRecord(recordId);
        toast.success('Record deleted successfully.');
        // Note: Relies on revalidatePath in the server action to refresh the list.
      } catch (error: any) {
        toast.error(error.message || 'Failed to delete record.');
      }
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
              <CardTitle>Medical Records</CardTitle>
              <CardDescription>A list of the user&apos;s uploaded medical records.</CardDescription>
          </div>
          <Button asChild>
            <Link href={`/admin/users/${userId}/upload-medical-record`}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Record
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {!records || records.length === 0 ? (
            <p>This user has no medical records.</p>
          ) : (
            records.map((record) => (
              <div key={record.id} className="flex items-center justify-between rounded-lg border p-4">
                <div>
                  <p className="font-semibold">{record.record_title}</p>
                  <p className="text-sm text-muted-foreground">
                    {record.record_details || 'No description'}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Uploaded on {new Date(record.created_at).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="outline" size="sm" onClick={() => handleDownload(record.record_file_url)}>
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
    </>
  );
} 