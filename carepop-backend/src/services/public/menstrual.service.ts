import { serviceSupabase } from '@/lib/supabase/service-client';
import { AppError } from '@/lib/utils/appError';

// --- Cycle Management ---

export const getCyclesForUser = async (userId: string) => {
    const { data, error } = await serviceSupabase
        .from('menstrual_cycles')
        .select('*')
        .eq('user_id', userId)
        .order('start_date', { ascending: false });

    if (error) throw new AppError('Could not fetch menstrual cycles.', 500);
    return data;
};

export const startCycle = async (userId: string, startDate: string) => {
    // End any previous open cycle first
    const { error: updateError } = await serviceSupabase
        .from('menstrual_cycles')
        .update({ end_date: new Date(new Date(startDate).getTime() - 86400000).toISOString().split('T')[0] }) // yesterday
        .eq('user_id', userId)
        .is('end_date', null);

    if (updateError) console.error("Could not auto-close previous cycle, proceeding anyway.", updateError);

    const { data, error } = await serviceSupabase
        .from('menstrual_cycles')
        .insert({ user_id: userId, start_date: startDate })
        .select()
        .single();
    
    if (error) throw new AppError('Could not start new cycle.', 500);
    return data;
};

export const endCycle = async (cycleId: string, userId: string, endDate: string) => {
     const { data, error } = await serviceSupabase
        .from('menstrual_cycles')
        .update({ end_date: endDate, updated_at: new Date().toISOString() })
        .eq('id', cycleId)
        .eq('user_id', userId)
        .select()
        .single();

    if (error) throw new AppError('Could not end cycle.', 500);
    return data;
};

// --- Symptom Logging ---

export const upsertSymptomLog = async (userId: string, logDate: string, symptoms: string[], notes?: string) => {
    const { data, error } = await serviceSupabase
        .from('symptom_logs')
        .upsert({ user_id: userId, log_date: logDate, symptoms, notes }, { onConflict: 'user_id, log_date' })
        .select()
        .single();

    if (error) throw new AppError('Could not log symptoms.', 500);
    return data;
};

export const getSymptomLogsForPeriod = async (userId: string, startDate: string, endDate: string) => {
    const { data, error } = await serviceSupabase
        .from('symptom_logs')
        .select('log_date, symptoms, notes')
        .eq('user_id', userId)
        .gte('log_date', startDate)
        .lte('log_date', endDate)
        .order('log_date', { ascending: true });
    
    if (error) throw new AppError('Could not fetch symptom logs.', 500);
    return data;
}; 