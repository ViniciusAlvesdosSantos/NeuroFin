import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { registerSchema, type RegisterFormData } from '@/lib/validators';
import { maskCPF, maskPhone, unmaskCPF, unmaskPhone } from '@/lib/formatters';
import api from '@/lib/api';
import { Mail, User, FileText, Phone, Lock, Wallet, ArrowRight, Eye, EyeOff, ChevronDown, ChevronUp, CheckCircle, MailCheck } from 'lucide-react';

export default function Register() {
  const [, setLocation] = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationMessage, setShowVerificationMessage] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch('password');

  const getPasswordStrength = (pwd: string | undefined): { level: number; label: string; color: string } => {
    if (!pwd || pwd.length === 0) return { level: 0, label: '', color: '' };
    if (pwd.length < 6) return { level: 1, label: 'Fraca', color: 'bg-red-500' };
    const hasUpper = /[A-Z]/.test(pwd);
    const hasLower = /[a-z]/.test(pwd);
    const hasNumber = /\d/.test(pwd);
    const hasSpecial = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(pwd);
    const score = [hasUpper, hasLower, hasNumber, hasSpecial, pwd.length >= 8].filter(Boolean).length;
    if (score <= 2) return { level: 2, label: 'Razoável', color: 'bg-orange-500' };
    if (score <= 3) return { level: 3, label: 'Boa', color: 'bg-yellow-500' };
    return { level: 4, label: 'Forte', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    try {
      const cleanCpf = unmaskCPF(data.cpf);
      const cleanPhone = unmaskPhone(data.phone);
      const payload: any = {
        name: data.name,
        email: data.email,
        cpf: cleanCpf,
        phone: cleanPhone,
      };
      if (data.password && data.password.length > 0) {
        payload.password = data.password;
      }
      await api.post('/auth/register', payload);
      setRegisteredEmail(data.email);
      setShowVerificationMessage(true);
      toast.success('Registro realizado! Verifique seu email para continuar.');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao registrar';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resendEmail = async () => {
    try {
      await api.post('auth/resend-verification', { email: registeredEmail });
      toast.success('Email reenviado com sucesso!');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao reenviar';
      toast.error(message);
    }
  };

  if (showVerificationMessage) {
    return (
      <div className="auth-layout">
        <div className="auth-card text-center">
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <MailCheck className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-foreground mb-2">Verifique seu Email</h2>
          <p className="text-sm text-muted-foreground mb-1">
            Enviamos um link de confirmação para
          </p>
          <p className="text-sm font-semibold text-primary mb-6">{registeredEmail}</p>

          <div className="space-y-3">
            <p className="text-xs text-muted-foreground">Não recebeu o email?</p>
            <Button variant="secondary" className="w-full" onClick={resendEmail}>
              Enviar novamente
            </Button>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setLocation('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Ir para Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card">
        {/* Logo + Title */}
        <div className="text-center mb-6">
          <div className="auth-logo">
            <Wallet className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Criar Conta</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Comece a organizar suas finanças agora
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Nome Completo"
            placeholder="João Silva"
            icon={<User className="w-4 h-4" />}
            error={errors.name}
            {...register('name')}
          />

          <Input
            label="Email"
            type="email"
            placeholder="seu@email.com"
            icon={<Mail className="w-4 h-4" />}
            error={errors.email}
            {...register('email')}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="CPF"
              placeholder="000.000.000-00"
              icon={<FileText className="w-4 h-4" />}
              error={errors.cpf}
              mask={maskCPF}
              {...register('cpf')}
            />

            <Input
              label="Telefone"
              placeholder="(11) 98765-4321"
              icon={<Phone className="w-4 h-4" />}
              error={errors.phone}
              mask={maskPhone}
              {...register('phone')}
            />
          </div>

          {/* Optional password section */}
          <div className="pt-1">
            <button
              type="button"
              onClick={() => setShowPasswordSection(!showPasswordSection)}
              className="flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors w-full"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Definir senha (opcional)</span>
              {showPasswordSection ? (
                <ChevronUp className="w-3.5 h-3.5 ml-auto" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 ml-auto" />
              )}
            </button>

            {showPasswordSection && (
              <div className="mt-3 space-y-3 p-3 rounded-lg bg-accent/30 border border-accent">
                <p className="text-xs text-muted-foreground">
                  Com uma senha, você poderá fazer login rapidamente sem precisar de um código OTP por email.
                </p>

                <div className="relative">
                  <Input
                    label="Senha"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 6 caracteres"
                    icon={<Lock className="w-4 h-4" />}
                    error={errors.password}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password strength indicator */}
                {password && password.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all duration-300 ${
                            i <= strength.level ? strength.color : 'bg-muted'
                          }`}
                        />
                      ))}
                    </div>
                    <p className={`text-xs font-medium ${
                      strength.level <= 1 ? 'text-red-500' :
                      strength.level <= 2 ? 'text-orange-500' :
                      strength.level <= 3 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {strength.label}
                    </p>
                  </div>
                )}

                <div className="relative">
                  <Input
                    label="Confirmar Senha"
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Repita a senha"
                    icon={<CheckCircle className="w-4 h-4" />}
                    error={errors.confirmPassword}
                    {...register('confirmPassword')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-[38px] text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            )}
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            isLoading={isSubmitting}
            rightIcon={!isSubmitting ? <ArrowRight className="w-4 h-4" /> : undefined}
          >
            {isSubmitting ? 'Criando conta...' : 'Criar Conta'}
          </Button>

          {/* Footer */}
          <div className="auth-divider">
            <span>ou</span>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Já tem conta?{' '}
              <button
                type="button"
                onClick={() => setLocation('/login')}
                className="text-primary hover:underline font-semibold transition-colors"
              >
                Faça login
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
