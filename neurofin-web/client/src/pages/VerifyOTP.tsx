import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import api from '@/lib/api';
import { ShieldCheck, ArrowLeft, RefreshCw, Wallet } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

export default function VerifyOtp() {
  const [, setLocation] = useLocation();
  const { setUser } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    const storedIdentifier = sessionStorage.getItem('loginIdentifier');
    if (!storedIdentifier) {
      toast.error('Sessão expirada. Faça login novamente.');
      setLocation('/login');
      return;
    }
    setIdentifier(storedIdentifier);
    // Focus first input
    setTimeout(() => inputRefs.current[0]?.focus(), 100);
  }, [setLocation]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit when all digits are entered
    const fullCode = newOtp.join('');
    if (fullCode.length === 6) {
      handleSubmit(fullCode);
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    const newOtp = [...otp];
    for (let i = 0; i < pasted.length; i++) {
      newOtp[i] = pasted[i];
    }
    setOtp(newOtp);
    if (pasted.length === 6) {
      handleSubmit(pasted);
    } else {
      inputRefs.current[pasted.length]?.focus();
    }
  };

  const handleSubmit = async (code: string) => {
    if (code.length !== 6) return;
    setIsSubmitting(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        identifier,
        otpCode: code,
      });

      const { accessToken, refreshToken, user, isFirstLogin } = response.data;

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(user);
      sessionStorage.removeItem('loginIdentifier');

      toast.success('Login realizado com sucesso!');
      setLocation(isFirstLogin ? '/onboarding' : '/dashboard');
    } catch (error: any) {
      const message = error.response?.data?.message || 'Código inválido';
      toast.error(message);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    setIsResending(true);
    try {
      await api.post('/auth/request-login', { identifier });
      toast.success('Novo código enviado para seu email!');
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao reenviar código';
      toast.error(message);
    } finally {
      setIsResending(false);
    }
  };

  const maskedIdentifier = identifier.includes('@')
    ? identifier.replace(/(.{2}).+(@.+)/, '$1***$2')
    : `***.***.${identifier.slice(-5, -2)}-${identifier.slice(-2)}`;

  return (
    <div className="auth-layout">
      <div className="auth-card text-center">
        {/* Logo */}
        <div className="auth-logo animate-pulse-glow">
          <ShieldCheck className="w-7 h-7 text-white" />
        </div>

        <h1 className="text-2xl font-bold text-foreground tracking-tight mb-1">
          Código de Verificação
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Digite o código de 6 dígitos enviado para{' '}
          <span className="font-semibold text-foreground">{maskedIdentifier}</span>
        </p>

        {/* OTP Input Grid */}
        <div className="flex justify-center gap-2.5 mb-6" onPaste={handlePaste}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => { inputRefs.current[index] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`
                w-12 h-14 text-center text-xl font-bold rounded-xl
                border-2 transition-all duration-200 outline-none
                bg-background text-foreground
                ${digit ? 'border-primary shadow-sm shadow-primary/20' : 'border-input'}
                focus:border-primary focus:ring-2 focus:ring-primary/20
                disabled:opacity-50
              `}
              disabled={isSubmitting}
            />
          ))}
        </div>

        {/* Submit button (as fallback) */}
        <Button
          type="button"
          variant="primary"
          className="w-full mb-4"
          isLoading={isSubmitting}
          onClick={() => handleSubmit(otp.join(''))}
          disabled={otp.join('').length !== 6}
        >
          {isSubmitting ? 'Verificando...' : 'Verificar Código'}
        </Button>

        {/* Actions */}
        <div className="space-y-2">
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={handleResendOtp}
            isLoading={isResending}
            leftIcon={<RefreshCw className="w-4 h-4" />}
          >
            {isResending ? 'Reenviando...' : 'Reenviar Código'}
          </Button>

          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => {
              sessionStorage.removeItem('loginIdentifier');
              setLocation('/login');
            }}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar para Login
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          O código expira em <span className="font-semibold">10 minutos</span>
        </p>
      </div>
    </div>
  );
}
