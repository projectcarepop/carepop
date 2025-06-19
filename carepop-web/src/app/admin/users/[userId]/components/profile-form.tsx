"use client"

import { useState, useTransition } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from 'sonner';
import { saveUserProfile } from '@/lib/actions/admin.actions';
import { UserProfile } from '@/lib/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

// A simple component to display read-only data
const ReadOnlyField = ({ label, value }: { label: string, value: string | null | undefined }) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <div className="text-sm p-2 h-10 w-full rounded-md border border-input bg-background">
        {value || <span className="text-muted-foreground">Not set</span>}
    </div>
  </div>
);

export function ProfileForm({ profile }: { profile: UserProfile }) {
  const [isPending, startTransition] = useTransition();
  const [role, setRole] = useState(profile.roles?.[0] || 'user');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      try {
        const profileData = {
            // Pass existing names back, only role is updated from form state
            first_name: profile.first_name || '',
            last_name: profile.last_name || '',
            role: role
        };
        await saveUserProfile(profile.id, profileData);
        toast.success('User role updated successfully!');
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
        toast.error(`Failed to update user role: ${errorMessage}`);
      }
    });
  };

  return (
    <Card>
      <form onSubmit={handleSubmit} className="space-y-6">
        <CardContent className="space-y-6 pt-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <ReadOnlyField label="User ID" value={profile.id} />
            <ReadOnlyField label="Email" value={profile.email} />
            <ReadOnlyField label="First Name" value={profile.first_name} />
            <ReadOnlyField label="Last Name" value={profile.last_name} />

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select value={role} onValueChange={(value) => setRole(value as 'user' | 'provider' | 'admin')}>
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="provider">Provider</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex justify-end">
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </CardContent>
      </form>
    </Card>
  );
} 