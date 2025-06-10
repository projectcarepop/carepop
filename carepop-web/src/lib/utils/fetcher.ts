interface FetcherError extends Error {
  info?: unknown;
  status?: number;
}

export const fetcher = async (url: string) => {
    // In a real app, you would get the user's auth token here
    // e.g., const { data } = await supabase.auth.getSession();
    // const token = data.session?.access_token;

    const res = await fetch(url, {
        headers: {
            'Content-Type': 'application/json',
            // Authorization: `Bearer ${token}`
        }
    });

    if (!res.ok) {
        const error: FetcherError = new Error('An error occurred while fetching the data.');
        // Attach extra info to the error object.
        error.info = await res.json();
        error.status = res.status;
        throw error;
    }

    const result = await res.json();
    return result.data; // Our responseHandler wraps data in a 'data' property
}; 