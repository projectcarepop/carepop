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
import { updateAvatarAction } from '@/app/main-dashboard/actions';

interface ProfileImageUploadModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  onSuccess?: () => void;
}

export function ProfileImageUploadModal({ isOpen, onOpenChange, onSuccess }: ProfileImageUploadModalProps) {
  const { toast } = useToast();
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };
  
  const handleFormSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!file) return;

    setIsPending(true);
    const formData = new FormData(event.currentTarget);
    
    const result = await updateAvatarAction(formData);

    if (result.success) {
      toast({ title: "Success", description: result.message });
      onSuccess?.();
      handleClose();
    } else {
      toast({ title: "Error", description: result.error, variant: "destructive" });
    }
    setIsPending(false);
  };


  const handleClose = () => {
    if (isPending) return;
    setFile(null);
    setPreviewUrl(null);
    if (formRef.current) {
      formRef.current.reset();
    }
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
        <form onSubmit={handleFormSubmit} ref={formRef}>
          <div className="grid gap-4 py-4">
            <div
              className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              <Input
                id="avatar"
                name="avatar"
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
            <Button variant="outline" onClick={handleClose} disabled={isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={!file || isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isPending ? 'Uploading...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
} 