import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';
import type { User } from '@/types';

interface UseRequireAuthResult {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: User | null;
}

/**
 * Hook para proteger rotas que requerem autenticação.
 * SEMPRE valida o token no backend na primeira carga da sessão.
 * Redireciona para /login se não autenticado.
 */
export function useRequireAuth(): UseRequireAuthResult {
  const [, setLocation] = useLocation();
  const { user, status, checkAuth, _hasHydrated, _hasValidatedToken } = useAuthStore();
  
  const isLoading = !_hasHydrated || status === 'idle' || status === 'loading';
  const isAuthenticated = status === 'authenticated';

  useEffect(() => {
    // Aguarda hidratação do Zustand persist
    if (!_hasHydrated) {
      return;
    }

    const verify = async () => {
      const token = localStorage.getItem('accessToken');
      
      // Sem token → redireciona imediatamente
      if (!token) {
        setLocation('/login');
        return;
      }

      // SEMPRE chama checkAuth - ele vai validar no backend se necessário
      const isValid = await checkAuth();
      if (!isValid) {
        setLocation('/login');
      }
    };

    verify();
  }, [_hasHydrated, checkAuth, setLocation]);

  // Redireciona se status for definitivamente não autenticado
  useEffect(() => {
    if (_hasHydrated && status === 'unauthenticated') {
      setLocation('/login');
    }
  }, [_hasHydrated, status, setLocation]);

  return {
    isAuthenticated,
    isLoading,
    user,
  };
}

/**
 * Hook simples para acessar o estado de autenticação sem proteção de rota.
 */
export function useAuth() {
  const store = useAuthStore();
  
  return {
    ...store,
    isAuthenticated: store.status === 'authenticated',
    isLoading: store.status === 'loading' || store.status === 'idle',
  };
}
