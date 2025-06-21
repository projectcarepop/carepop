'use client';

import apiClient from "@/lib/apiClient";

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