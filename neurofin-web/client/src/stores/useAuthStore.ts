import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  setUser: (user: User) => void;
  login: (identifier: string, otpCode: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => Promise<boolean>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      login: async (identifier: string, otpCode: string) => {
        set({ isLoading: true, error: null });
        try {
          // Backend vai setar cookies automaticamente
          const response = await api.post('/auth/verify-otp', {
            identifier,
            otpCode,
          });

          const { user } = response.data;

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
          return true;
        } catch (error: any) {
          console.error('❌ Erro no login:', error);
          const errorMessage = error.response?.data?.message || 'Erro ao fazer login';
          set({ error: errorMessage, isLoading: false, isAuthenticated: false });
          throw error;
        }
      },

      logout: () => {
        // Limpar tokens do localStorage
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        
        set({
          user: null,
          isAuthenticated: false,
          error: null,
        });
      },

      // ✅ ESTE É O SENTIDO DO checkAuth:
      // Ao recarregar a página, verifica se existe cookie válido
      // e restaura a sessão do usuário
      checkAuth: async () => {
        console.log('🔍 checkAuth iniciado');
        
        // Se não tem token no localStorage, não está autenticado
        const hasToken = localStorage.getItem('accessToken');
        if (!hasToken) {
          console.log('❌ checkAuth: Sem token');
          set({ isAuthenticated: false, user: null });
          return false;
        }

        // Tem token, mas não tem user no state → buscar do backend
        const currentUser = get().user;
        console.log('🔍 checkAuth: currentUser no state:', currentUser?.email || 'null');
        
        if (!currentUser) {
          try {
            console.log('🔄 checkAuth: Buscando user do backend...');
            const response = await api.get<User>('/auth/profile');
            console.log('✅ checkAuth: User recebido do backend:', response.data.email);
            set({ 
              user: response.data, 
              isAuthenticated: true 
            });
            return true;
          } catch (error) {
            console.error('❌ checkAuth: Token inválido:', error);
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            set({ isAuthenticated: false, user: null });
            return false;
          }
        }

        // Já tem user no state, mantém autenticado
        console.log('✅ checkAuth: User já existe no state, mantendo autenticado');
        set({ isAuthenticated: true });
        return true;
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      // Persistir apenas user (tokens ficam em cookies HttpOnly)
      partialize: (state) => ({
        user: state.user,
      }),
    }
  )
);
