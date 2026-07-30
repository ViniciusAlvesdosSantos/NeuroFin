import { create } from 'zustand';
import { DreamGoal, CreateGoalRequest, UpdateGoalRequest, AllocateGoalRequest, AllocateGoalResponse } from '@/types';
import api from '@/lib/api';

interface GoalState {
  goals: DreamGoal[];
  isLoading: boolean;
  error: string | null;

  fetchGoals: (includeArchived?: boolean) => Promise<void>;
  createGoal: (data: CreateGoalRequest) => Promise<DreamGoal>;
  updateGoal: (id: string, data: UpdateGoalRequest) => Promise<DreamGoal>;
  deleteGoal: (id: string) => Promise<void>;
  allocateToGoal: (id: string, data: AllocateGoalRequest) => Promise<AllocateGoalResponse>;
  clearError: () => void;
}

export const useGoalStore = create<GoalState>((set, get) => ({
  goals: [],
  isLoading: false,
  error: null,

  fetchGoals: async (includeArchived = false) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get<DreamGoal[]>('/goals', {
        params: { includeArchived },
      });
      set({ goals: response.data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao buscar metas';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  createGoal: async (data: CreateGoalRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<DreamGoal>('/goals', data);
      const newGoal = response.data;
      set((state) => ({
        goals: [newGoal, ...state.goals],
        isLoading: false,
      }));
      return newGoal;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar meta';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  updateGoal: async (id: string, data: UpdateGoalRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.patch<DreamGoal>(`/goals/${id}`, data);
      const updatedGoal = response.data;
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? updatedGoal : g)),
        isLoading: false,
      }));
      return updatedGoal;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar meta';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  deleteGoal: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      await api.delete(`/goals/${id}`);
      set((state) => ({
        goals: state.goals.filter((g) => g.id !== id),
        isLoading: false,
      }));
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao deletar meta';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  allocateToGoal: async (id: string, data: AllocateGoalRequest) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post<AllocateGoalResponse>(`/goals/${id}/allocate`, data);
      const result = response.data;
      set((state) => ({
        goals: state.goals.map((g) => (g.id === id ? result.goal : g)),
        isLoading: false,
      }));
      return result;
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao alocar dinheiro';
      set({ error: message, isLoading: false });
      throw error;
    }
  },

  clearError: () => set({ error: null }),
}));
