'use server';
 
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
 
// Zod schema for login
const LoginSchema = z.object({
  email: z.string().email({ message: 'Invalid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export type LoginFormState = {
    message: string;
    errors?: {
        email?: string[];
        password?: string[];
        server?: string[];
    };
};
 
export async function login(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
 
  // Return validation errors
  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }
 
  const { email, password } = validatedFields.data;
  const supabase = await createSupabaseServerClient();
 
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
 
  // Return server-side auth errors
  if (error) {
    console.error('Supabase login error:', error.message);
    return {
        message: 'Server error.',
        errors: {
            server: ['Invalid login credentials. Please try again.']
        }
    };
  }
 
  // On success, redirect to the dashboard
  return redirect('/dashboard');
}

// Zod schema for registration
const RegisterSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"], // path of error
});

export type RegisterFormState = {
    message: string;
    errors?: {
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
        server?: string[];
    };
}

export async function register(
    prevState: RegisterFormState,
    formData: FormData
): Promise<RegisterFormState> {
    const validatedFields = RegisterSchema.safeParse(
        Object.fromEntries(formData.entries())
    );

    if (!validatedFields.success) {
        return {
            message: 'Invalid form data.',
            errors: validatedFields.error.flatten().fieldErrors,
        };
    }

    const { email, password } = validatedFields.data;
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            // This URL is where the user will be redirected after clicking the verification link.
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
    });

    if (error) {
        console.error('Supabase sign up error:', error.message);
        // It's possible the user already exists.
        if (error.message.includes('User already registered')) {
             return {
                message: 'Server error.',
                errors: {
                    email: ['A user with this email already exists.']
                }
            };
        }
        return {
            message: 'Server error.',
            errors: {
                server: ['Could not create account. Please try again later.']
            }
        };
    }

    // On success, redirect to a page that tells the user to check their email.
    return redirect('/register/check-email');
}