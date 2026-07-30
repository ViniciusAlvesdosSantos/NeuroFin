import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { User } from '@/types';
import api from '@/lib/api';

type AuthStatus = 'idle' | 'loading' | 'authenticated' | 'unauthenticated';

interface AuthState {
  user: User | null;
  status: AuthStatus;
  error: string | null;
  _hasHydrated: boolean;
  _hasValidatedToken: boolean; // Flag para evitar múltiplas validações na mesma sessão

  // Actions
  setUser: (user: User) => void;
  logout: () => void;
  checkAuth: (forceValidate?: boolean) => Promise<boolean>;
  clearError: () => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      status: 'idle',
      error: null,
      _hasHydrated: false,
      _hasValidatedToken: false,

      setUser: (user: User) => {
        set({ user, status: 'authenticated', error: null, _hasValidatedToken: true });
      },

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },

      logout: () => {
        // Limpar todos os storages do app
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('auth-storage');
        localStorage.removeItem('account-storage');
        localStorage.removeItem('category-storage');
        localStorage.removeItem('transaction-storage');
        localStorage.removeItem('investment-storage');
        
        set({ user: null, status: 'unauthenticated', error: null, _hasValidatedToken: false });
      },

      checkAuth: async (forceValidate = false) => {
        const token = localStorage.getItem('accessToken');
        
        // Sem token = não autenticado
        if (!token) {
          set({ status: 'unauthenticated', user: null });
          return false;
        }

        // Se já validou nesta sessão e não forçou, usar estado atual
        const { _hasValidatedToken, user } = get();
        if (_hasValidatedToken && !forceValidate && user) {
          set({ status: 'authenticated' });
          return true;
        }

        // SEMPRE validar token no backend (primeira vez ou forçado)
        set({ status: 'loading' });
        
        try {
          const response = await api.get<User>('/auth/profile');
          set({ 
            user: response.data, 
            status: 'authenticated',
            _hasValidatedToken: true 
          });
          return true;
        } catch (error) {
          console.error('Token inválido:', error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          set({ status: 'unauthenticated', user: null, _hasValidatedToken: false });
          return false;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        // NÃO persistir _hasValidatedToken - queremos validar a cada nova sessão
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.setHasHydrated(true);
          // NÃO marcar como autenticado aqui - aguardar validação do token
          // Status permanece 'idle' até checkAuth ser chamado
        }
      },
    }
  )
);

// Seletores derivados para facilitar uso
export const selectIsAuthenticated = (state: AuthState) => state.status === 'authenticated';
export const selectIsLoading = (state: AuthState) => state.status === 'loading' || state.status === 'idle';
export const selectIsReady = (state: AuthState) => state._hasHydrated && state.status !== 'idle' && state.status !== 'loading';
