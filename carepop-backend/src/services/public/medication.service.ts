import { serviceSupabase } from '@/lib/supabase/service-client';
import { AppError } from '@/lib/utils/appError';

// --- Medication Management ---

export const getMedicationsForUser = async (userId: string) => {
    const { data, error } = await serviceSupabase
        .from('user_medications')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at', { ascending: true });

    if (error) throw new AppError('Could not fetch medications.', 500);
    return data;
};

export const createMedication = async (userId: string, medData: { name: string; dosage?: string }) => {
    const { data, error } = await serviceSupabase
        .from('user_medications')
        .insert({ user_id: userId, name: medData.name, dosage: medData.dosage })
        .select()
        .single();
    
    if (error) throw new AppError('Could not create medication.', 500);
    return data;
};

export const updateMedication = async (medId: string, userId: string, medData: { name?: string; dosage?: string, is_active?: boolean }) => {
     const { data, error } = await serviceSupabase
        .from('user_medications')
        .update(medData)
        .eq('id', medId)
        .eq('user_id', userId) // Ensure user can only update their own
        .select()
        .single();

    if (error) throw new AppError('Could not update medication.', 500);
    return data;
};

// We'll just deactivate it, not delete, to preserve log history.
export const deleteMedication = async (medId: string, userId: string) => {
    return await updateMedication(medId, userId, { is_active: false });
};


// --- Medication Logging ---

export const logMedicationTaken = async (userId: string, medicationId: string) => {
    const { data, error } = await serviceSupabase
        .from('medication_logs')
        .insert({ user_id: userId, medication_id: medicationId })
        .select()
        .single();

    if (error) throw new AppError('Could not log medication.', 500);
    return data;
};

export const getMedicationLogsForDate = async (userId: string, date: string) => {
    // date should be in 'YYYY-MM-DD' format
    const startDate = `${date}T00:00:00.000Z`;
    const endDate = `${date}T23:59:59.999Z`;

    const { data, error } = await serviceSupabase
        .from('medication_logs')
        .select('medication_id, taken_at')
        .eq('user_id', userId)
        .gte('taken_at', startDate)
        .lte('taken_at', endDate);
    
    if (error) throw new AppError('Could not fetch medication logs.', 500);
    return data;
}; 