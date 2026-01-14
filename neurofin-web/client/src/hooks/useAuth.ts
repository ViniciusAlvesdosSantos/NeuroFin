import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';

export function useRequireAuth() {
  const [, setLocation] = useLocation();
  const { isAuthenticated, user, checkAuth } = useAuthStore();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const verifyAuth = async () => {
      // Primeiro verifica se tem token no localStorage
      const token = localStorage.getItem('accessToken');
      
      if (!token) {
        console.log('❌ Sem token - redirecionando para login');
        setLocation('/login');
        setIsChecking(false);
        return;
      }

      // Se tem user no state (do zustand persist), considera autenticado
      if (user) {
        console.log('✅ User encontrado no state:', user.email);
        setIsChecking(false);
        return;
      }

      // Se tem token mas não tem user, tenta buscar do backend
      try {
        console.log('🔄 Buscando user do backend...');
        const isValid = await checkAuth();
        
        if (!isValid) {
          console.log('❌ checkAuth retornou false');
          setLocation('/login');
        } else {
          console.log('✅ checkAuth bem-sucedido');
        }
      } catch (error) {
        console.error('❌ useRequireAuth - Erro ao verificar:', error);
        setLocation('/login');
      } finally {
        setIsChecking(false);
      }
    };

    verifyAuth();
  }, [setLocation, checkAuth, user]);

  if (isChecking) {
    return false;
  }

  return isAuthenticated;
}

export function useAuth() {
  return useAuthStore();
}
