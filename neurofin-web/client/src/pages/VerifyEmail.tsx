import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Loader2, CheckCircle, XCircle, ArrowRight, RotateCcw, Wallet } from 'lucide-react';
import api from '@/lib/api';

export default function VerifyEmail() {
  const [, setLocation] = useLocation();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          setStatus('error');
          setMessage('Token de verificação não encontrado');
          return;
        }

        const response = await api.post(`/auth/verify-email?token=${token}`);

        setStatus('success');
        setMessage(response.data.message || 'Email verificado com sucesso!');
        toast.success('Email verificado! Você pode fazer login agora.');

        setTimeout(() => {
          setLocation('/login');
        }, 4000);
      } catch (error: any) {
        setStatus('error');
        const errorMessage = error.response?.data?.message || 'Erro ao verificar email';
        setMessage(errorMessage);
        toast.error(errorMessage);
      }
    };

    verifyEmail();
  }, [setLocation]);

  return (
    <div className="auth-layout">
      <div className="auth-card text-center">
        {/* Status Icon */}
        <div className="mb-6">
          {status === 'loading' && (
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          )}
          {status === 'success' && (
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto animate-bounce-success">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          )}
          {status === 'error' && (
            <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
              <XCircle className="w-8 h-8 text-red-600" />
            </div>
          )}
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-2">
          {status === 'loading' && 'Verificando Email...'}
          {status === 'success' && 'Email Verificado!'}
          {status === 'error' && 'Erro na Verificação'}
        </h1>

        <p className="text-sm text-muted-foreground mb-6">
          {status === 'loading' && 'Por favor, aguarde enquanto verificamos seu email.'}
          {message}
        </p>

        {status === 'success' && (
          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Redirecionando para o login em 4 segundos...
            </p>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setLocation('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ir para Login Agora
            </Button>
          </div>
        )}

        {status === 'error' && (
          <div className="space-y-3">
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setLocation('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ir para Login
            </Button>
            <Button
              variant="ghost"
              className="w-full"
              onClick={() => setLocation('/register')}
              leftIcon={<RotateCcw className="w-4 h-4" />}
            >
              Voltar para Registro
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}