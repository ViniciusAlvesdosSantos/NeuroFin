import { create } from 'zustand';
import { SafeToSpendData, LastActivityData, FreshStartRequest } from '@/types';
import api from '@/lib/api';

interface AnalyticsState {
  safeToSpend: SafeToSpendData | null;
  lastActivity: LastActivityData | null;
  isLoading: boolean;
  error: string | null;

  fetchSafeToSpend: () => Promise<void>;
  fetchLastActivity: () => Promise<void>;
  freshStart: (data: FreshStartRequest) => Promise<any>;
  updateLastLogin: () => Promise<void>;
  clearError: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set) => ({
  safeToSpend: null,
  lastActivity: null,
  isLoading: false,
  error: null,

  fetchSafeToSpend: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<SafeToSpendData>('/analytics/safe-to-spend');
      set({ safeToSpend: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao buscar Safe to Spend';
      set({ error: message, isLoading: false });
    }
  },

  fetchLastActivity: async () => {
    try {
      const response = await api.get<LastActivityData>('/analytics/last-activity');
      set({ lastActivity: response.data });
    } catch (error: any) {
      console.error('Erro ao buscar última atividade:', error);
    }
  },

  freshStart: async (data: FreshStartRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/analytics/fresh-start', data);
      set({ isLoading: false });
      return response.data;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro no Fresh Start';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateLastLogin: async () => {
    try {
      await api.post('/analytics/update-login');
    } catch (error: any) {
      console.error('Erro ao atualizar último login:', error);
    }
  },

  clearError: () => set({ error: null }),
}));
