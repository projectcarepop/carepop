import { serviceSupabase } from '../../lib/supabase/service-client';
import { AppError } from '../../lib/utils/appError';

export interface HealthEntryPayload {
    type: 'MOOD' | 'BLOOD_PRESSURE' | 'ACTIVITY' | 'MEDICATION' | 'MENSTRUAL_CYCLE';
    value_text?: string;
    value_numeric?: number;
    value_numeric_secondary?: number;
    notes?: string;
    metadata?: object;
}

export const createHealthEntry = async (userId: string, payload: HealthEntryPayload) => {
    const { data, error } = await serviceSupabase
        .from('health_entries')
        .insert({ user_id: userId, ...payload })
        .select()
        .single();

    if (error) {
        console.error('Error creating health entry:', error);
        throw new AppError('Could not save health data.', 500);
    }
    return data;
};

export const getHealthEntries = async (userId: string, type: HealthEntryPayload['type'], startDate?: string, endDate?: string) => {
    let query = serviceSupabase
        .from('health_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type);

    if (startDate) {
        query = query.gte('created_at', startDate);
    }
    if (endDate) {
        query = query.lte('created_at', endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${type} entries:`, error);
        throw new AppError(`Could not fetch ${type} data.`, 500);
    }
    return data;
} 