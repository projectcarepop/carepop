import { db } from '../../db/drizzle';
import { health_entries } from '../../db/schema';
import { eq, and, gte, desc } from 'drizzle-orm';

export class HealthService {
  async getTodayStatus(userId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to the beginning of the day

    const result = await db
      .select()
      .from(health_entries)
      .where(
        and(
          eq(health_entries.userId, userId),
          gte(health_entries.entryDate, today) // Use the Date object directly
        )
      )
      .orderBy(desc(health_entries.createdAt))
      .limit(1);

    return result[0] || null;
  }

  async getHealthSummary(userId: string) {
    // This is where you would implement logic to get data for the AI prompt
    // For now, it returns a mock summary.
    return {
      pillLogged: true,
      pillStreak: 12,
      todayMood: 'happy',
      cycleDay: 14,
      nextPeriodDate: '2024-09-15',
    };
  }

  async createEntry(userId: string, entry: any) {
    const newEntry = {
      user_id: userId,
      ...entry,
    };
    const result = await db.insert(health_entries).values(newEntry).returning();
    return result[0];
  }
}
