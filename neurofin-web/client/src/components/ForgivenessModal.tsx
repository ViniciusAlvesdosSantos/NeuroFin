import { useState } from 'react';
import { useAccountStore } from '@/stores/useAccountStore';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';
import { formatCurrency } from '@/lib/formatters';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ACCOUNT_ICONS } from '@/lib/constants';
import { Heart, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';

interface ForgivenessModalProps {
  isOpen: boolean;
  daysSince: number;
  onComplete: () => void;
  onSkip: () => void;
}

export default function ForgivenessModal({ isOpen, daysSince, onComplete, onSkip }: ForgivenessModalProps) {
  const { accounts, fetchAccounts } = useAccountStore();
  const { freshStart, updateLastLogin } = useAnalyticsStore();
  const [step, setStep] = useState<'welcome' | 'adjust'>('welcome');
  const [balances, setBalances] = useState<Record<number, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleBalanceChange = (accountId: number, value: string) => {
    setBalances((prev) => ({ ...prev, [accountId]: value }));
  };

  const handleFreshStart = async () => {
    setIsSubmitting(true);
    try {
      const accountBalances = Object.entries(balances)
        .filter(([, val]) => val !== '')
        .map(([id, val]) => ({
          accountId: Number(id),
          realBalance: parseFloat(val),
        }));

      if (accountBalances.length === 0) {
        // Apenas atualizar login
        await updateLastLogin();
        toast.success('Bem-vindo de volta! 🎉');
        onComplete();
        return;
      }

      await freshStart({ accountBalances });
      await fetchAccounts();
      toast.success('Saldos ajustados! Agora é um novo começo 🚀');
      onComplete();
    } catch (error) {
      toast.error('Erro ao ajustar saldos');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = async () => {
    await updateLastLogin();
    onSkip();
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/80 via-purple-900/70 to-pink-900/60 backdrop-blur-sm" />

      <AnimatePresence mode="wait">
        {step === 'welcome' ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full mx-4 text-center"
          >
            {/* Floating hearts decoration */}
            <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-16 bg-gradient-to-br from-pink-400 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-8 h-8 text-white" fill="white" />
            </div>

            <div className="mt-8 mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Que bom te ver! 💜
              </h2>
              <p className="text-gray-600 leading-relaxed">
                A vida acontece.{' '}
                {daysSince > 30
                  ? `Faz ${daysSince} dias que você não aparecia.`
                  : `Já faz ${daysSince} dias.`}
              </p>
              <p className="text-gray-600 mt-2 leading-relaxed">
                Quer atualizar seus saldos e <strong>recomeçar de hoje</strong> sem se preocupar
                com as últimas semanas?
              </p>
            </div>

            {/* Motivational message */}
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 mb-6 border border-purple-100">
              <p className="text-sm text-purple-700 font-medium italic">
                "O melhor momento para recomeçar foi ontem. O segundo melhor é agora."
              </p>
            </div>

            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                rightIcon={<ArrowRight className="w-4 h-4" />}
                onClick={() => setStep('adjust')}
              >
                Vamos Atualizar!
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={handleSkip}
              >
                Pular por agora
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="adjust"
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10 bg-white rounded-3xl shadow-2xl p-8 max-w-lg w-full mx-4"
          >
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <RefreshCw className="w-5 h-5 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Ajuste Rápido</h2>
                <p className="text-sm text-gray-500">Informe o saldo real de cada conta</p>
              </div>
            </div>

            {/* Account balances */}
            <div className="space-y-4 mb-6 max-h-[50vh] overflow-y-auto pr-2">
              {accounts.map((account) => {
                const iconData = ACCOUNT_ICONS.find(i => i.value === account.icon);
                return (
                  <div
                    key={account.id}
                    className="p-4 rounded-xl border-2 transition-all"
                    style={{
                      borderColor: `${account.color}30`,
                      backgroundColor: `${account.color}05`,
                    }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <span className="text-xl">{iconData?.icon || '💳'}</span>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">{account.accountName}</p>
                        <p className="text-xs text-gray-400">
                          Saldo no sistema: <span className="font-currency">{formatCurrency(Number(account.balance))}</span>
                        </p>
                      </div>
                    </div>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="Saldo real atual"
                      value={balances[Number(account.id)] || ''}
                      onChange={(e) => handleBalanceChange(Number(account.id), e.target.value)}
                      className="font-currency"
                    />
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                variant="primary"
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                leftIcon={<Sparkles className="w-4 h-4" />}
                onClick={handleFreshStart}
                isLoading={isSubmitting}
              >
                Recomeçar Agora!
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={() => setStep('welcome')}
              >
                ← Voltar
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
