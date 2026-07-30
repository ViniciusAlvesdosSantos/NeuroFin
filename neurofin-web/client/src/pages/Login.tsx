import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import {
  loginSchema,
  loginPasswordSchema,
  type LoginFormData,
  type LoginPasswordFormData,
} from '@/lib/validators';
import { maskCPF } from '@/lib/formatters';
import { useAuthStore } from '@/stores/useAuthStore';
import api from '@/lib/api';
import { Mail, Lock, Wallet, ArrowRight, KeyRound, ShieldCheck } from 'lucide-react';

type LoginMode = 'password' | 'otp';

export default function Login() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState<LoginMode>('password');
  const [showPassword, setShowPassword] = useState(false);

  // Form for OTP flow
  const otpForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  // Form for Password flow
  const passwordForm = useForm<LoginPasswordFormData>({
    resolver: zodResolver(loginPasswordSchema),
  });

  const onSubmitOtp = async (data: LoginFormData) => {
    setIsSubmitting(true);
    try {
      const isEmail = data.identifier.includes('@');
      const identifier = isEmail
        ? data.identifier.trim()
        : data.identifier.replace(/\D/g, '');

      await api.post('/auth/request-login', { identifier });
      sessionStorage.setItem('loginIdentifier', identifier);
      setLocation('/auth/verify-otp');
      toast.success('Código OTP enviado para seu email!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao fazer login';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitPassword = async (data: LoginPasswordFormData) => {
    setIsSubmitting(true);
    try {
      const isEmail = data.identifier.includes('@');
      const identifier = isEmail
        ? data.identifier.trim()
        : data.identifier.replace(/\D/g, '');

      const response = await api.post('/auth/login', {
        identifier,
        password: data.password,
      });

      const { accessToken, refreshToken, user, isFirstLogin } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);

      toast.success('Login realizado com sucesso!');
      setLocation(isFirstLogin ? '/onboarding' : '/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Senha incorreta ou usuário não encontrado';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <div className="auth-logo">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">NeuroFin</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Entre na sua conta para continuar
          </p>
        </div>

        {/* Tabs */}
        <div className="auth-tabs">
          <button
            type="button"
            className={`auth-tab ${mode === 'password' ? 'auth-tab--active' : ''}`}
            onClick={() => setMode('password')}
          >
            <Lock className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
            Senha
          </button>
          <button
            type="button"
            className={`auth-tab ${mode === 'otp' ? 'auth-tab--active' : ''}`}
            onClick={() => setMode('otp')}
          >
            <KeyRound className="w-3.5 h-3.5 inline-block mr-1.5 -mt-0.5" />
            Código OTP
          </button>
        </div>

        {/* Password Form */}
        {mode === 'password' && (
          <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="space-y-4">
            <Input
              label="Email ou CPF"
              placeholder="seu@email.com ou 000.000.000-00"
              icon={<Mail className="w-4 h-4" />}
              error={passwordForm.formState.errors.identifier}
              mask={(value) => {
                if (value.replace(/\D/g, '').length > 5) {
                  return maskCPF(value);
                }
                return value;
              }}
              {...passwordForm.register('identifier')}
            />

            <div className="relative">
              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Sua senha"
                icon={<Lock className="w-4 h-4" />}
                error={passwordForm.formState.errors.password}
                {...passwordForm.register('password')}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors text-xs font-medium"
              >
                {showPassword ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isSubmitting ? 'Entrando...' : 'Entrar'}
            </Button>
          </form>
        )}

        {/* OTP Form */}
        {mode === 'otp' && (
          <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
            <div className="flex items-center gap-2 p-3 rounded-lg bg-accent/50 border border-accent mb-2">
              <ShieldCheck className="w-4 h-4 text-primary flex-shrink-0" />
              <p className="text-xs text-muted-foreground">
                Enviaremos um código de 6 dígitos para o email vinculado à sua conta.
              </p>
            </div>

            <Input
              label="Email ou CPF"
              placeholder="seu@email.com ou 000.000.000-00"
              icon={<Mail className="w-4 h-4" />}
              error={otpForm.formState.errors.identifier}
              mask={(value) => {
                if (value.replace(/\D/g, '').length > 5) {
                  return maskCPF(value);
                }
                return value;
              }}
              {...otpForm.register('identifier')}
            />

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              isLoading={isSubmitting}
              rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
            >
              {isSubmitting ? 'Enviando código...' : 'Enviar Código OTP'}
            </Button>
          </form>
        )}

        {/* Footer */}
        <div className="auth-divider">
          <span>ou</span>
        </div>

        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            Não tem conta?{' '}
            <button
              type="button"
              onClick={() => setLocation('/register')}
              className="text-primary hover:underline font-semibold transition-colors"
            >
              Crie sua conta grátis
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
