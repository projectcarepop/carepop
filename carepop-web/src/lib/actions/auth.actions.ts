'use server';
 
import { z } from 'zod';
import { api } from '@/lib/apiClient'; // We can't use the default export because it's a client-side axios instance
import { isAxiosError } from 'axios';
 
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
    session?: any; // To pass the session back to the client
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
 
  try {
    const response = await api.login({ email, password });
    // The login now returns the full session from our Hono backend
    return {
        message: 'Login successful.',
        errors: {},
        success: true,
        session: response.data, // Pass the session data back
    }
  } catch (error) {
    console.error('API login error:', error);
    let errorMessage = 'Invalid login credentials. Please try again.';
    if (isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
    }
    return {
        message: 'Server error.',
        errors: {
            server: [errorMessage]
        },
        success: false,
    };
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
    success: boolean;
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

    try {
        await api.register({ email, password });
        return {
            message: 'Registration successful! Please check your email.',
            errors: {},
            success: true,
        };
    } catch (error) {
        console.error('API register error:', error);
        let errorMessage = 'Could not create account. Please try again later.';
        if (isAxiosError(error) && error.response?.data?.error) {
            if (error.response.data.error.includes('already registered')) {
                 return {
                    message: 'Server error.',
                    errors: { email: ['A user with this email already exists.'] },
                    success: false,
                };
            }
            errorMessage = error.response.data.error;
        }
        return {
            message: 'Server error.',
            errors: { server: [errorMessage] },
            success: false,
        };
    }
}