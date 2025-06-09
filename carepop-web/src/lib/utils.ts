import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

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
