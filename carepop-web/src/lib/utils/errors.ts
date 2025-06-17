import { PostgrestError } from "@supabase/supabase-js";

export class AppError extends Error {
    public readonly statusCode: number;
  
    constructor(message: string, statusCode = 500) {
      super(message);
      this.statusCode = statusCode;
      Object.setPrototypeOf(this, AppError.prototype);
    }
}

export function handleSupabaseError(error: PostgrestError): { message: string, details?: string } {
    console.error('Supabase Error:', {
        message: error.message,
        details: error.details,
        code: error.code,
    });

    // Return a generic, user-friendly error message
    return { 
        message: 'A database error occurred. Please try again later.',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
    };
} 