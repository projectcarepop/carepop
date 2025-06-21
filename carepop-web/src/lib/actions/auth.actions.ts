'use server';
 
import { z } from 'zod';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';
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
    success: boolean;
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
  const cookieStore = await cookies()
  const supabase = await createClient(cookieStore)
 
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return {
        message: 'Server error.',
        errors: {
            server: ['Could not authenticate user. Please check your credentials.']
        },
        success: false,
    };
  }

  // On success, we revalidate the whole app to refresh user state
  // and redirect to the dashboard.
  revalidatePath('/', 'layout');
  redirect('/dashboard');
}

export async function logout() {
    const cookieStore = await cookies()
    const supabase = await createClient(cookieStore)
    await supabase.auth.signOut()
    redirect('/login');
}

// Zod schema for registration
const RegisterSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
})

export interface RegisterFormState {
  message: string
  errors?: {
    fullName?: string[]
    email?: string[]
    password?: string[]
    server?: string[]
  }
  success: boolean
}

export async function register(
  prevState: RegisterFormState,
  formData: FormData
): Promise<RegisterFormState> {
  'use server'

  const validatedFields = RegisterSchema.safeParse(
    Object.fromEntries(formData.entries())
  )

  if (!validatedFields.success) {
    return {
      message: 'Invalid form data.',
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    }
  }

  const { fullName, email, password } = validatedFields.data
  const origin = (await headers()).get('origin')!
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${origin}/auth/callback?next=/auth/email-confirmed`,
      data: {
        full_name: fullName,
      },
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return {
        message: 'Registration Failed',
        errors: { email: ['A user with this email already exists.'] },
        success: false,
      }
    }
    return {
      message: 'Registration Failed',
      errors: { server: ['Could not sign up user. Please try again.'] },
      success: false,
    }
  }

  return {
    message:
      'Registration successful! Please check your email to confirm your account.',
    errors: {},
    success: true,
  }
}

export async function loginWithGoogle() {
  'use server'
  const origin = (await headers()).get('origin')!
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    console.error('Google login error:', error)
    return redirect('/login?error=Could not authenticate with Google')
  }

  if (data.url) {
    return redirect(data.url)
  }

  return redirect('/login?error=Could not get Google authentication URL')
}