'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Icons } from '@/components/icons';
import { updateUserPassword } from '../actions';

export function UpdatePasswordForm() {
  const searchParams = useSearchParams();
  const message = searchParams.get('message');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="w-full max-w-md p-8 my-8 space-y-6 bg-white rounded-lg shadow-md border border-gray-200">
        <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
            Reset Your Password
            </h1>
            <p className="mt-2 text-sm text-gray-600">
            Please enter your new password below.
            </p>
        </div>
        <form action={updateUserPassword} className="space-y-4">
            <div className="relative">
                <label className="text-sm font-medium" htmlFor="password">New Password</label>
                <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your new password"
                    required
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    style={{ top: '1.75rem' }} 
                >
                    {showPassword ? <Icons.eyeOff className="h-5 w-5" /> : <Icons.eye className="h-5 w-5" />}
                </button>
            </div>
            <div className="relative">
                <label className="text-sm font-medium" htmlFor="confirmPassword">Confirm New Password</label>
                <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Confirm your new password"
                    required
                />
                 <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3"
                    style={{ top: '1.75rem' }}
                >
                    {showConfirmPassword ? <Icons.eyeOff className="h-5 w-5" /> : <Icons.eye className="h-5 w-5" />}
                </button>
            </div>
            {message && <p className="text-sm font-medium text-destructive">{message}</p>}
            <Button type="submit" className="w-full">
                Reset Password
            </Button>
        </form>
    </div>
  );
} 