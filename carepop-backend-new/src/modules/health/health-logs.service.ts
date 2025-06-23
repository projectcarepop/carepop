import { SupabaseClient } from '@supabase/supabase-js';
import { z } from 'zod';
import OpenAI from 'openai';
import { createHealthLogSchema, getHealthLogsSchema } from './health.validation';
import { ApiError } from '../../lib/errors';
import { supabase } from '../../db/supabase';
import { env } from '../../config';

type HealthLogPayload = z.infer<typeof createHealthLogSchema>['body'];
type GetHealthLogsQuery = z.infer<typeof getHealthLogsSchema>['query'];

export class HealthLogService {
  private supabase: SupabaseClient;
  private openai: OpenAI;

  constructor() {
    this.supabase = supabase;
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }
    this.openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async createHealthLog(userId: string, payload: HealthLogPayload) {
    const { date, pillStatus, flowIntensity, symptoms, mood, notes } = payload;

    const { data, error } = await this.supabase
      .from('health_logs')
      .insert({
        user_id: userId,
        date,
        pill_status: pillStatus,
        flow_intensity: flowIntensity,
        symptoms,
        mood,
        notes,
      })
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        throw new ApiError(409, 'A health log for this date already exists.');
      }
      console.error('Error creating health log:', error);
      throw new ApiError(500, 'Could not create health log.');
    }

    return data;
  }

  async getHealthLogs(userId: string, queryParams: GetHealthLogsQuery) {
    let query = this.supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false });

    if (queryParams.startDate) {
      query = query.gte('date', queryParams.startDate);
    }
    if (queryParams.endDate) {
      query = query.lte('date', queryParams.endDate);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching health logs:', error);
      throw new ApiError(500, 'Could not retrieve health logs.');
    }

    return data;
  }

  async getAnalysis(userId: string) {
    // 1. Fetch all health logs for the user
    const { data: healthData, error } = await this.supabase
      .from('health_logs')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: true }); // Get data in chronological order

    if (error) {
      console.error('Error fetching health logs for analysis:', error);
      throw new ApiError(500, 'Could not retrieve health logs for analysis.');
    }

    if (!healthData || healthData.length < 5) { // Require a minimum amount of data
        throw new ApiError(400, 'Not enough data to provide a meaningful analysis. Keep tracking your health daily!');
    }

    // 2. Format the prompt for OpenAI
    const prompt = `
        You are a friendly and knowledgeable reproductive health assistant. A user has provided their daily health log.
        Analyze the entire log history (last 3-6 cycles).
        Provide:
        - Cycle summary (average cycle length, variability)
        - Predictions (next period start, expected fertile window)
        - Symptom forecasts (e.g., "You may experience bloating 2 days before your period")
        - Mood pattern analysis (e.g., "Mood dips before period are common")
        - Personalized suggestions (diet, self-care, pill reminders)
        
        Respond in a friendly, supportive tone.
        Output ONLY a valid JSON object with the following fields:
        - cycleSummary: string
        - nextPeriod: { date: "YYYY-MM-DD", confidence: 0-1 }
        - fertileWindow: { start: "YYYY-MM-DD", end: "YYYY-MM-DD" }
        - symptomForecasts: [ { symptom: string, timeframe: "X days before/after period" }, ... ]
        - moodPatterns: string
        - recommendations: [ string, ... ]

        User's Health Data (JSON format):
        ${JSON.stringify(healthData)}
    `;

    // 3. Call OpenAI API
    try {
        const response = await this.openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106",
            messages: [{ role: "user", content: prompt }],
            response_format: { type: "json_object" },
        });

        const result = JSON.parse(response.choices[0].message.content || '{}');
        return result;

    } catch (err) {
        console.error("Failed to get analysis from OpenAI", err);
        throw new ApiError(503, "Could not generate health analysis at this time. Please try again later.");
    }
  }
} 