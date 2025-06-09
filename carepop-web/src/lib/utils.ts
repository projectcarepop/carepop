import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { createSupabaseBrowserClient } from "./supabase/client"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export class AppError extends Error {
  public readonly response: Response;

  constructor(message: string, response: Response) {
    super(message);
    this.response = response;
  }
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof AppError) {
    // You might want to parse the response body for a more specific message
    return `${error.message} (Status: ${error.response.status})`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

export const fetcher = async ([url, token]: [string, string]) => {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` }
  });

  if (!res.ok) {
    const errorInfo = await res.json();
    const error = new Error(errorInfo.message || 'An error occurred while fetching the data.');
    throw error;
  }

  return res.json();
};

export const fetcherWithAuth = async (url: string, options: RequestInit = {}) => {
  const supabase = createSupabaseBrowserClient();
  const { data: { session } } = await supabase.auth.getSession();
  const token = session?.access_token;

  if (!token) {
    throw new Error('Not authenticated. Please log in.');
  }

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorBody = await res.json().catch(() => ({ message: 'An unknown error occurred' }));
    console.error('Fetcher error:', errorBody);
    throw new Error(errorBody.message || 'An error occurred while fetching the data.');
  }

  if (res.status === 204) { // No Content
    return null;
  }
  
  return res.json();
};
