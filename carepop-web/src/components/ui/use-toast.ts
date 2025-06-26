// This file can be used to re-export the toast hook if you are using a different
// toast library. For now, we'll keep it simple and assume Sonner is the default.
// In a larger app, you might abstract the toast creation here.

// For now, this file is not strictly necessary if you directly use `import { toast } from 'sonner'`,
// but creating it aligns with Shadcn UI patterns and provides a central point
// for toast-related logic if needed in the future.

// Since the component that needs this is expecting `useToast`, we will provide a
// simple implementation that maps to sonner's `toast` function.

import { toast } from 'sonner';

type ToastProps = {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive';
};

export const useToast = () => {
  const showToast = ({ title, description, variant }: ToastProps) => {
    if (variant === 'destructive') {
      toast.error(title, { description });
    } else {
      toast.success(title, { description });
    }
  };

  return { toast: showToast };
}; 