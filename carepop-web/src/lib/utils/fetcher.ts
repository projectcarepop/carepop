'use client';

import { useAuth } from '@/lib/contexts/AuthContext';
import apiClient from "@/lib/apiClient";

interface FetcherError extends Error {
  info?: unknown;
  status?: number;
}

// This is no longer a simple utility, but a hook factory
export const useFetcher = () => {
    const { session } = useAuth();

    const fetcher = async (url: string) => {
        const token = session?.access_token;

        if (!token) {
            // Depending on the use case, you might want to handle this differently.
            // For admin sections, throwing an error is appropriate.
            const error: FetcherError = new Error('Authentication token not found.');
            error.status = 401;
            throw error;
        }

        const res = await fetch(url, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        });

        if (!res.ok) {
            const error: FetcherError = new Error('An error occurred while fetching the data.');
            try {
                error.info = await res.json();
            } catch {
                error.info = { message: res.statusText };
            }
            error.status = res.status;
            throw error;
        }
        
        // Handle cases where the response might be empty (e.g., 204 No Content)
        if (res.status === 204) {
            return null;
        }

        const result = await res.json();
        // The backend response for lists is { data: [...], count: ... }
        // For single items, it's { data: {...} }
        // The SWR hook will get the whole object.
        return result.data;
    };

    return fetcher;
};

/**
 * A generic fetcher function for use with SWR.
 * It uses the global apiClient instance to make a GET request.
 * It assumes the actual data is nested under a `data` property in the response,
 * which is a common pattern for this project.
 * @param url The URL to fetch.
 * @returns The data from the response.
 */
export const fetcher = async (url: string) => {
    try {
        const res = await apiClient.get(url);
        return res.data?.data || res.data;
    } catch (error) {
        console.error(`Fetcher failed for URL: ${url}`, error);
        // You can customize the error handling here
        throw new Error('Failed to fetch data');
    }
}; 