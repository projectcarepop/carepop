import { serviceSupabase } from '@/lib/supabase/service-client';
import { AppError } from '@/lib/utils/appError';

type HealthEntryPayload = {
    type: 'MOOD' | 'BLOOD_PRESSURE' | 'ACTIVITY';
    value_text?: string;
    value_numeric?: number;
    notes?: string;
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

export const getHealthEntries = async (userId: string, type: HealthEntryPayload['type']) => {
    const { data, error } = await serviceSupabase
        .from('health_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('type', type)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${type} entries:`, error);
        throw new AppError(`Could not fetch ${type} data.`, 500);
    }
    return data;
} 