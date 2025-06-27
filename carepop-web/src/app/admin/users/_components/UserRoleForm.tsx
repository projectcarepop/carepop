'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AdminUser } from '@/lib/types';
import { Loader2 } from 'lucide-react';
import { userRoleEnum } from '@/lib/types';

const formSchema = z.object({
  role: z.enum(userRoleEnum),
});

type UserRoleFormValues = z.infer<typeof formSchema>;

interface UserRoleFormProps {
  initialData: AdminUser;
  onSubmit: (values: UserRoleFormValues) => void;
  isPending: boolean;
}

export function UserRoleForm({
  initialData,
  onSubmit,
  isPending,
}: UserRoleFormProps) {
  const form = useForm<UserRoleFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: initialData.role as 'patient' | 'admin',
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="role"
          render={({ field }) => (
            <FormItem>
              <FormLabel>User Role</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userRoleEnum.map((role) => (
                    <SelectItem key={role} value={role}>
                      {role}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Changing this will alter the user&apos;s permissions across the
                platform.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Save changes
        </Button>
      </form>
    </Form>
  );
} 