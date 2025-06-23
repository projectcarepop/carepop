import { db } from '../../db/drizzle';
import { health_entries, profiles } from '../../db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { ApiError } from '../../lib/errors';

class HealthService {
  public async createEntry(
    clerkId: string,
    entryData: {
      entryType: 'pill' | 'mood' | 'menstrual_cycle';
      status?: string | null;
      value?: string | null;
      details?: Record<string, unknown> | null;
      entryDate?: string;
    }
  ) {
    const user = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.clerkId, clerkId));
    if (user.length === 0) {
      throw new ApiError(404, 'User profile not found.');
    }
    const userId = user[0].id;

    // Convert entryDate string to Date object if it exists
    const dataToInsert = {
      ...entryData,
      userId,
      entryDate: entryData.entryDate ? new Date(entryData.entryDate) : new Date(),
    };

    const [newEntry] = await db
      .insert(health_entries)
      .values(dataToInsert)
      .returning();
      
    return newEntry;
  }

  public async getEntries(clerkId: string, entryType: 'pill' | 'mood' | 'menstrual_cycle') {
    const user = await db.select({ id: profiles.id }).from(profiles).where(eq(profiles.clerkId, clerkId));
    if (user.length === 0) {
      throw new ApiError(404, 'User profile not found.');
    }
    const userId = user[0].id;

    const entries = await db
      .select()
      .from(health_entries)
      .where(and(eq(health_entries.userId, userId), eq(health_entries.entryType, entryType)))
      .orderBy(desc(health_entries.entryDate));

    return entries;
  }

  public async getInsights(clerkId: string) {
    // In a real implementation, this would involve:
    // 1. Fetching recent health data for the user.
    // 2. Running a data analysis or AI model on that data.
    // 3. Returning personalized insights.

    // For now, return a mock insight.
    return {
      title: "Consistent Pill Tracking!",
      message: "Great job! You've successfully taken your pill for 5 days in a row. Consistency is key for effectiveness.",
      suggestion: "Try setting a daily alarm to help maintain your streak."
    };
  }
}

export const healthService = new HealthService(); 