'use server';
 
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { z } from 'zod';
 
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
    success: boolean; // Add success flag
};
 
export async function login(
  prevState: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const validatedFields = LoginSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );
 
  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
 
  const { email, password } = validatedFields.data;
  const supabase = await createSupabaseServerClient();
 
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
 
  if (error) {
    console.error('Supabase login error:', error.message);
    return {
        message: 'Server error.',
        errors: {
            server: ['Invalid login credentials. Please try again.']
        },
        success: false,
    };
  }
 
  // Return success state instead of redirecting
  return {
      message: 'Login successful.',
      errors: {},
      success: true,
  }
}

// Zod schema for registration
const RegisterSchema = z.object({
    email: z.string().email({ message: 'Invalid email address.' }),
    password: z.string().min(8, { message: 'Password must be at least 8 characters long.' }),
    confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match.",
    path: ["confirmPassword"],
});

export type RegisterFormState = {
    message: string;
    errors?: {
        email?: string[];
        password?: string[];
        confirmPassword?: string[];
        server?: string[];
    };
    success: boolean; // Add success flag
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
            success: false,
        };
    }

    const { email, password } = validatedFields.data;
    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            emailRedirectTo: `${process.env.NEXT_PUBLIC_BASE_URL}/auth/callback`,
        },
    });

    if (error) {
        console.error('Supabase sign up error:', error.message);
        if (error.message.includes('User already registered')) {
             return {
                message: 'Server error.',
                errors: { email: ['A user with this email already exists.'] },
                success: false,
            };
        }
        return {
            message: 'Server error.',
            errors: { server: ['Could not create account. Please try again later.'] },
            success: false,
        };
    }

    // Return success instead of redirecting
    return {
        message: 'Registration successful! Please check your email.',
        errors: {},
        success: true,
    };
}