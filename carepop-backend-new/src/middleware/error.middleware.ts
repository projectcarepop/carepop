// This file will contain the global error handling middleware.
// It will catch errors, log them, and format a standardized JSON response.

import { Hono } from 'hono'
import { type ErrorHandler } from 'hono';
import { ApiError } from '../lib/errors';

const errorHandler: ErrorHandler = (err, c) => {
    console.error(err); // Log the error for debugging

    if (err instanceof ApiError) {
        // Here, we can't use err.statusCode directly because Hono's c.json
        // expects a specific literal type for the status. We handle common cases.
        if (err.statusCode === 400) {
            return c.json({ error: err.message }, 400);
        }
        if (err.statusCode === 401) {
            return c.json({ error: err.message }, 401);
        }
        if (err.statusCode === 403) {
            return c.json({ error: err.message }, 403);
        }
        if (err.statusCode === 404) {
            return c.json({ error: err.message }, 404);
        }
        // Fallback for other ApiError status codes
        return c.json({ error: err.message }, 500);
    }

    // Handle Supabase and other generic errors
    if (err instanceof Error) {
        if (err.message.includes('Invalid login credentials')) {
            return c.json({ error: 'Invalid email or password.' }, 401);
        }
    }

    return c.json({ error: 'An unexpected internal server error occurred.' }, 500);
};

export default errorHandler; 