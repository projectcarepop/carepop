import api from '../../utils/api';

// Note: In a real component, useAuth would be called once.
// Here we call it in each function for simplicity of this module.

export const getHealthSummary = async (getToken: () => Promise<string | null>) => {
  try {
    const response = await api.get('/health/summary', getToken);
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to get health summary', error);
    throw error;
  }
};

export interface HealthEntryPayload {
  entry_type: 'pill' | 'mood' | 'menstrual_cycle';
  status: string;
  value?: string;
}

export const logHealthEntry = async (data: HealthEntryPayload, getToken: () => Promise<string | null>) => {
  try {
    const response = await api.post('/health/entry', data, getToken);
    return response.data;
  } catch (error) {
    console.error('API Error: Failed to log health entry', error);
    throw error;
  }
};
