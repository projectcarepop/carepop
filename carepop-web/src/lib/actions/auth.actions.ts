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
});

export type RegisterFormState = {
    message: string;
    errors?: {
        email?: string[];
        password?: string[];
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
        await api.signUp({ email, password });
        return {
            message: 'Registration successful! Please check your email.',
            errors: {},
            success: true,
        };
    } catch (error) {
        // Enhanced error logging to capture the full server response
        console.error('API register error (Full Details):', JSON.stringify(error, null, 2));
        if (isAxiosError(error) && error.response) {
            console.error('Axios Response Data:', JSON.stringify(error.response.data, null, 2));
        }

        let errorMessage = 'An unexpected error occurred. Please try again later.';
        
        // Handle structured Axios errors from our backend
        if (isAxiosError(error) && error.response?.data?.error) {
            const errorData = error.response.data.error;
            // The error from our backend can be a string or an object like { message: '...' }
            errorMessage = typeof errorData === 'object' && errorData !== null && 'message' in errorData 
                ? (errorData as { message: string }).message 
                : String(errorData);
        }
        
        // Provide user-friendly feedback for common, known errors
        if (errorMessage.includes('already registered')) {
             return {
                message: 'Registration Failed',
                errors: { email: ['A user with this email already exists.'] },
                success: false,
            };
        }

        // Return the specific error message from the server
        return {
            message: 'Registration Failed',
            errors: { server: [errorMessage] },
            success: false,
        };
    }
}