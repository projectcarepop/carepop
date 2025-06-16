import { Alert } from 'react-native';
import api from '../../utils/api';
import { Medication } from '../../types/medication';

const MEDS_BASE_URL = '/medications';

// --- Mutations ---

export const addMedication = async (name: string, dosage?: string): Promise<Medication | null> => {
  try {
    const response = await api.post(MEDS_BASE_URL, { name, dosage });
    return response.data.data;
  } catch (error: any) {
    console.error('Error adding medication:', error.response?.data);
    Alert.alert('Error', 'Could not add your medication. Please try again.');
    return null;
  }
};

export const updateMedicationApi = async (id: string, name?: string, dosage?: string): Promise<Medication | null> => {
    try {
        const response = await api.patch(`${MEDS_BASE_URL}/${id}`, { name, dosage });
        return response.data.data;
    } catch (error: any) {
        console.error('Error updating medication:', error.response?.data);
        Alert.alert('Error', 'Could not update your medication. Please try again.');
        return null;
    }
}

export const deactivateMedication = async (id: string): Promise<boolean> => {
  try {
    await api.delete(`${MEDS_BASE_URL}/${id}`);
    return true;
  } catch (error: any) {
    console.error('Error deactivating medication:', error.response?.data);
    Alert.alert('Error', 'Could not deactivate your medication. Please try again.');
    return false;
  }
};

export const logMedication = async (medication_id: string): Promise<boolean> => {
    try {
        await api.post(`${MEDS_BASE_URL}/logs`, { medication_id });
        return true;
    } catch (error: any) {
        console.error('Error logging medication:', error.response?.data);
        Alert.alert('Error', 'Could not log your medication. Please try again.');
        return false;
    }
}


// --- Queries ---

export const getMedications = async (): Promise<Medication[]> => {
  try {
    const response = await api.get(MEDS_BASE_URL);
    return response.data.data || [];
  } catch (error: any) {
    console.error('Error fetching medications:', error.response?.data);
    Alert.alert('Error', 'Could not fetch your medications.');
    return [];
  }
};

export const getMedicationLogs = async (date: string): Promise<any[]> => {
    try {
        const response = await api.get(`${MEDS_BASE_URL}/logs`, { params: { date } });
        return response.data.data || [];
    } catch (error: any) {
        console.error('Error fetching medication logs:', error.response?.data);
        Alert.alert('Error', 'Could not fetch your medication logs.');
        return [];
    }
} 