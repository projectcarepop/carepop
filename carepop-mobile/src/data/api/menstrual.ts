import { Alert } from 'react-native';
import api from '../../utils/api';
import { Cycle, SymptomLog } from '../../types/menstrual';

const MENSTRUAL_BASE_URL = '/menstrual';

// --- Cycle Mutations ---

export const startNewCycleApi = async (start_date: string): Promise<Cycle | null> => {
  try {
    const response = await api.post(`${MENSTRUAL_BASE_URL}/cycles`, { start_date });
    return response.data;
  } catch (error: any) {
    console.error('Error starting new cycle:', error.response?.data || error.message);
    Alert.alert('Error', 'Could not start your new cycle. Please try again.');
    return null;
  }
};

export const endCycleApi = async (cycleId: string, end_date: string): Promise<Cycle | null> => {
    try {
        const response = await api.patch(`${MENSTRUAL_BASE_URL}/cycles/${cycleId}`, { end_date });
        return response.data;
    } catch (error: any) {
        console.error('Error ending cycle:', error.response?.data || error.message);
        Alert.alert('Error', 'Could not update your cycle. Please try again.');
        return null;
    }
}

// --- Symptom Mutations ---

export const upsertSymptomsApi = async (log_date: string, symptoms: string[], notes?: string): Promise<SymptomLog | null> => {
    try {
        const response = await api.post(`${MENSTRUAL_BASE_URL}/symptoms`, { log_date, symptoms, notes });
        return response.data;
    } catch (error: any) {
        console.error('Error logging symptoms:', error.response?.data || error.message);
        Alert.alert('Error', 'Could not save your symptoms. Please try again.');
        return null;
    }
}

// --- Queries ---

export const getCyclesApi = async (): Promise<Cycle[]> => {
  try {
    const response = await api.get(`${MENSTRUAL_BASE_URL}/cycles`);
    return response.data || [];
  } catch (error: any) {
    console.error('Error fetching cycles:', error.response?.data || error.message);
    Alert.alert('Error', 'Could not fetch your cycle history.');
    return [];
  }
};

export const getSymptomsApi = async (start_date: string, end_date: string): Promise<SymptomLog[]> => {
    try {
        const response = await api.get(`${MENSTRUAL_BASE_URL}/symptoms`, { start_date, end_date });
        return response.data || [];
    } catch (error: any) {
        console.error('Error fetching symptoms:', error.response?.data || error.message);
        Alert.alert('Error', 'Could not fetch your symptom history.');
        return [];
    }
} 