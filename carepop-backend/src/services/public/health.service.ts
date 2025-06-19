import { serviceSupabase } from '../../lib/supabase/service-client';
import { AppError } from '../../lib/utils/appError';

/**
 * Creates a new health entry for a user.
 * @param userId The ID of the user.
 * @param entryData The data for the new entry.
 * @returns The newly created health entry.
 */
export const createHealthEntry = async (userId: string, entryData: { type: string; value_text?: string; value_numeric?: number; notes?: string }) => {
    const { type, value_text, value_numeric, notes } = entryData;

    if (!type || (!value_text && value_numeric === undefined)) {
        throw new AppError('Entry must have a type and a value.', 400);
    }

    const { data, error } = await serviceSupabase
        .from('health_entries')
        .insert({
            user_id: userId,
            entry_type: type,
            value_text,
            value_numeric,
            notes,
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating health entry:', error);
        throw new AppError('Could not create health entry.', 500);
    }

    return data;
};

/**
 * Retrieves health entries for a user of a specific type.
 * @param userId The ID of the user.
 * @param entryType The type of entry to retrieve (e.g., 'MOOD').
 * @returns An array of health entries.
 */
export const getHealthEntries = async (userId: string, entryType: string) => {
    const { data, error } = await serviceSupabase
        .from('health_entries')
        .select('*')
        .eq('user_id', userId)
        .eq('entry_type', entryType)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(`Error fetching ${entryType} entries:`, error);
        throw new AppError(`Could not fetch ${entryType} entries.`, 500);
    }

    return data;
}; 