'use client';

import { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { uploadMedicalRecord } from '@/lib/actions/admin.actions';
import { toast } from 'sonner';
import Link from 'next/link';

export default function UploadMedicalRecordPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params.userId as string;

  const [recordTitle, setRecordTitle] = useState('');
  const [recordDetails, setRecordDetails] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !recordTitle || !userId) {
      toast.error('Please fill in all required fields and select a file.');
      return;
    }
    setIsSaving(true);
    
    const formData = new FormData();
    formData.append('recordTitle', recordTitle);
    formData.append('recordDetails', recordDetails);
    formData.append('recordFile', file);

    try {
      const result = await uploadMedicalRecord(userId, formData);
      if (result.success) {
        toast.success('Medical record uploaded successfully!');
        router.push(`/admin/users/${userId}`);
      } else {
        throw new Error('Upload failed');
      }
    } catch (error: unknown) {
      console.error(error);
      let errorMessage = 'Failed to upload medical record. Please try again.';
      if (error instanceof Error) {
        errorMessage = error.message;
      }
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload New Medical Record</CardTitle>
          <CardDescription>
            Select a file and provide the necessary details for user ID: {userId}.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="recordTitle">Record Title</Label>
              <Input
                id="recordTitle"
                value={recordTitle}
                onChange={(e) => setRecordTitle(e.target.value)}
                placeholder="e.g., Lab Result, Prescription"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="recordDetails">Description (Optional)</Label>
              <Textarea
                id="recordDetails"
                value={recordDetails}
                onChange={(e) => setRecordDetails(e.target.value)}
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="file">File</Label>
              <Input
                id="file"
                type="file"
                onChange={handleFileChange}
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" asChild disabled={isSaving}>
                <Link href={`/admin/users/${userId}`}>Cancel</Link>
              </Button>
              <Button type="submit" disabled={!file || !recordTitle || isSaving}>
                {isSaving ? 'Uploading...' : 'Upload and Save'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 