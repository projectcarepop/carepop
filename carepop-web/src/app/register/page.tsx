'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../lib/contexts/AuthContext';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '../../components/ui/card';
import { Lock, Eye, EyeOff } from 'lucide-react'; // Icons
import GoogleIcon from '../../components/ui/GoogleIcon'; // Added GoogleIcon import
import { useGoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useToast } from '@/hooks/use-toast';

const registerSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const { signUp, loginWithGoogle, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState('');

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const {
    handleSubmit,
    register,
    formState: { errors },
  } = form;

  const onSubmit = async (data: RegisterFormValues) => {
    setApiError('');
    try {
      await signUp(data);
      toast({
        title: "Registration Successful",
        description: "Please check your email to verify your account.",
      });
      router.push('/login');
    } catch (err) {
        if (axios.isAxiosError(err) && err.response) {
            if (err.response.data?.message?.includes('already been registered')) {
                setApiError('This email address is already in use. Please log in or use a different email.');
            } else {
                setApiError(err.response.data.message || 'Registration failed. Please try again.');
            }
        } else if (err instanceof Error) {
            setApiError(err.message);
        } else {
            setApiError('An unknown error occurred during registration.');
        }
    }
  };

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: (codeResponse) => {
        loginWithGoogle(codeResponse.code).catch((err: unknown) => {
            if (axios.isAxiosError(err) && err.response) {
                setApiError(err.response.data.message || 'Google login failed.');
            } else if (err instanceof Error) {
                setApiError(err.message);
            } else {
                setApiError('An unknown error occurred during Google login.');
            }
        });
    },
    flow: 'auth-code',
  });

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-200px)] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Create an Account</CardTitle>
          <CardDescription className="text-center">Enter your details to register.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
              {errors.email && <p className="text-sm text-destructive pt-1">{errors.email.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  {...register('password')}
                  className="pl-10 pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </Button>
              </div>
              {errors.password && <p className="text-sm text-destructive pt-1">{errors.password.message}</p>}
            </div>
            {apiError && <p className="text-sm text-destructive text-center">{apiError}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Registering...' : 'Create Account'}
            </Button>
          </form>
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                Or sign up with
              </span>
            </div>
          </div>
          <Button variant="outline" className="w-full" onClick={() => handleGoogleLogin()} disabled={loading}>
            <GoogleIcon className="mr-2 h-4 w-4" />
            Sign up with Google
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center text-sm">
          <p>
            Already have an account?{' '}
            <Button variant="link" className="p-0 h-auto" asChild>
              <Link href="/login">Login here</Link>
            </Button>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
} 