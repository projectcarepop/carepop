'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { grantAdminRole } from "@/lib/actions/dashboard.admin.actions";

export default function GrantAdminTool() {
    const [userId, setUserId] = useState('');
    const [granting, setGranting] = useState(false);
    const [grantResult, setGrantResult] = useState<{ success: boolean, message: string } | null>(null);

    const handleGrantAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        setGranting(true);
        setGrantResult(null);

        try {
            const result = await grantAdminRole(userId);
            setGrantResult(result);
            if (result.success) {
                setUserId(''); // Clear input on success
            }
        } catch (e: unknown) {
            if (e instanceof Error) {
                setGrantResult({ success: false, message: e.message });
            } else {
                setGrantResult({ success: false, message: 'An unknown error occurred while granting the role.' });
            }
        } finally {
            setGranting(false);
        }
    };

    return (
        <form onSubmit={handleGrantAdmin} className="space-y-4">
            <div>
                <label htmlFor="userId" className="block text-sm font-medium text-muted-foreground mb-1">Grant Admin Role</label>
                <div className="flex space-x-2">
                    <Input
                        id="userId"
                        name="userId"
                        type="text"
                        required
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        placeholder="Enter User ID"
                        className="flex-grow"
                    />
                    <Button type="submit" disabled={granting || !userId}>
                        {granting ? 'Granting...' : 'Grant'}
                    </Button>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                    Enter the Supabase User ID to make them an admin.
                </p>
            </div>
            {grantResult && (
              <div className="mt-4">
                <Alert variant={grantResult.success ? 'default' : 'destructive'}>
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>{grantResult.success ? 'Success' : 'Error'}</AlertTitle>
                  <AlertDescription>
                    {grantResult.message}
                  </AlertDescription>
                </Alert>
              </div>
            )}
        </form>
    );
} 