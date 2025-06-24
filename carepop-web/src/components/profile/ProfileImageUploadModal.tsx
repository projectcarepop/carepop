'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Loader2, UploadCloud } from 'lucide-react';
import Image from 'next/image';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { apiClient } from '@/lib/apiClient';
import type { User } from '@supabase/supabase-js';

interface ProfileImageUploadModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  user: User | null;
  onSuccess?: () => void;
}

export function ProfileImageUploadModal({ isOpen, onOpenChange, user, onSuccess }: ProfileImageUploadModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUpload = async () => {
    if (!file || !user) return;

    setIsUploading(true);
    const supabase = createSupabaseBrowserClient();

    try {
      // Step 1: Upload the file to Supabase Storage.
      // A unique path is created for each user to prevent overwrites.
      const filePath = `${user.id}/${Date.now()}_${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('avatars') // NOTE: Assumes an 'avatars' bucket exists and is configured.
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(`Storage Error: ${uploadError.message}`);
      }

      // Step 2: Get the public URL of the uploaded file.
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
      
      if (!urlData.publicUrl) {
          throw new Error("Could not retrieve public URL for the uploaded file.");
      }

      // Step 3: Update the user's profile with the new avatar URL via our Hono API.
      const res = await apiClient.me.profile.$put({
        json: { avatarUrl: urlData.publicUrl },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(`API Error: ${errorData.error || 'Failed to update profile'}`);
      }
      
      toast({
        title: 'Success!',
        description: 'Your profile picture has been updated.',
      });

      onSuccess?.(); // Optionally trigger a refresh on the parent component.
      onOpenChange(false); // Close modal on success.

    } catch (error) {
      console.error('Error uploading profile image:', error);
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong. Please try again.';
      toast({
        variant: 'destructive',
        title: 'Upload Failed',
        description: errorMessage,
      });
    } finally {
      setIsUploading(false);
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleClose = () => {
    if (isUploading) return;
    setFile(null);
    setPreviewUrl(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Profile Picture</DialogTitle>
          <DialogDescription>
            Choose a new image to use for your profile. Square images work best.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer"
            onClick={() => fileInputRef.current?.click()}
          >
            <Input
              id="picture"
              type="file"
              accept="image/png, image/jpeg, image/gif"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
            />
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Image preview"
                width={150}
                height={150}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-gray-400" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Click to browse or drag & drop
                </p>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isUploading}>
            Cancel
          </Button>
          <Button onClick={handleUpload} disabled={!file || isUploading}>
            {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isUploading ? 'Uploading...' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 