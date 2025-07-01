/**
 * Safely parses a PostgreSQL timestamp string into a JavaScript Date object.
 * Handles the common case where the 'T' separator is a space and the timezone is '+00'.
 * @param dateString The timestamp string from the database.
 * @returns A valid Date object or null if parsing fails.
 */
export function parseISOString(dateString: string | null | undefined): Date | null {
  if (!dateString) {
    return null;
  }
  // Replace space with 'T' and the non-standard '+00' with 'Z' for UTC to create a compliant ISO 8601 string.
  const compliantString = dateString.replace(' ', 'T').replace('+00', 'Z');
  const date = new Date(compliantString);

  if (isNaN(date.getTime())) {
    console.warn(`[date.ts] Failed to parse date: "${compliantString}"`);
    return null;
  }
  return date;
} 