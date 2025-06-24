// src/lib/apiClient.ts
import { createApiClient } from 'carepop-shared-sdk';

const apiUrl = process.env.NEXT_PUBLIC_API_URL;

if (!apiUrl) {
  // This error should be prominent in the developer console
  console.error(
    "FATAL: NEXT_PUBLIC_API_URL is not set. The app will not work correctly."
  );
}

// The '!' non-null assertion is acceptable here because if it's null, 
// the app is in a broken state anyway, and the error above will be logged.
export const apiClient = createApiClient(apiUrl!);
