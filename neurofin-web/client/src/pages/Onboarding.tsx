import { useState } from 'react';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { ChevronRight, ChevronLeft, Target, PiggyBank, Shield, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGoalStore } from '@/stores/useGoalStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { toast } from 'sonner';

type Focus = 'debt' | 'savings' | 'control' | null;

const FOCUS_OPTIONS = [
  {
    id: 'debt' as Focus,
    icon: <Shield className="w-8 h-8" />,
    emoji: '🛡️',
    title: 'Sair das Dívidas',
    description: 'Quero organizar e eliminar minhas dívidas',
    color: 'from-red-500 to-rose-500',
    bgLight: 'from-red-50 to-rose-50',
    border: 'border-red-200',
  },
  {
    id: 'savings' as Focus,
    icon: <PiggyBank className="w-8 h-8" />,
    emoji: '🐷',
    title: 'Poupar para Metas',
    description: 'Quero guardar dinheiro para realizar metas',
    color: 'from-emerald-500 to-teal-500',
    bgLight: 'from-emerald-50 to-green-50',
    border: 'border-emerald-200',
  },
  {
    id: 'control' as Focus,
    icon: <Target className="w-8 h-8" />,
    emoji: '🎯',
    title: 'Controle Diário',
    description: 'Quero saber exatamente para onde vai meu dinheiro',
    color: 'from-indigo-500 to-purple-500',
    bgLight: 'from-indigo-50 to-purple-50',
    border: 'border-indigo-200',
  },
];

// Default categories based on focus
const DEFAULT_CATEGORIES: Record<string, { name: string; icon: string; type: 'EXPENSE' | 'INCOME' }[]> = {
  debt: [
    { name: 'Cartão de Crédito', icon: '💳', type: 'EXPENSE' },
    { name: 'Empréstimo', icon: '🏦', type: 'EXPENSE' },
    { name: 'Parcelamento', icon: '📋', type: 'EXPENSE' },
    { name: 'Contas Fixas', icon: '📌', type: 'EXPENSE' },
    { name: 'Salário', icon: '💰', type: 'INCOME' },
  ],
  savings: [
    { name: 'Alimentação', icon: '🍔', type: 'EXPENSE' },
    { name: 'Transporte', icon: '🚗', type: 'EXPENSE' },
    { name: 'Lazer', icon: '🎬', type: 'EXPENSE' },
    { name: 'Salário', icon: '💰', type: 'INCOME' },
    { name: 'Freelance', icon: '💻', type: 'INCOME' },
  ],
  control: [
    { name: 'Alimentação', icon: '🍔', type: 'EXPENSE' },
    { name: 'Transporte', icon: '🚗', type: 'EXPENSE' },
    { name: 'Moradia', icon: '🏠', type: 'EXPENSE' },
    { name: 'Saúde', icon: '🏥', type: 'EXPENSE' },
    { name: 'Lazer', icon: '🎬', type: 'EXPENSE' },
    { name: 'Educação', icon: '🎓', type: 'EXPENSE' },
    { name: 'Assinaturas', icon: '📱', type: 'EXPENSE' },
    { name: 'Salário', icon: '💰', type: 'INCOME' },
  ],
};

const DEFAULT_GOALS: Record<string, { title: string; icon: string; color: string; targetAmount: number }[]> = {
  debt: [],
  savings: [
    { title: 'Reserva de Emergência', icon: '🛟', color: '#10B981', targetAmount: 10000 },
    { title: 'Viagem de Férias', icon: '✈️', color: '#6366F1', targetAmount: 5000 },
  ],
  control: [
    { title: 'Reserva de Emergência', icon: '🛟', color: '#10B981', targetAmount: 10000 },
  ],
};

export default function Onboarding() {
  const [, setLocation] = useLocation();
  const [step, setStep] = useState(0);
  const [selectedFocus, setSelectedFocus] = useState<Focus>(null);
  const [monthlyCost, setMonthlyCost] = useState('');
  const [isSeeding, setIsSeeding] = useState(false);
  const { createGoal } = useGoalStore();

  const TOTAL_STEPS = 3;

  const handleFinish = async () => {
    setIsSeeding(true);
    try {
      // Seed goals based on focus
      if (selectedFocus && DEFAULT_GOALS[selectedFocus]) {
        for (const goal of DEFAULT_GOALS[selectedFocus]) {
          try {
            await createGoal(goal);
          } catch (e) {
            // Ignore duplicates
          }
        }
      }

      localStorage.removeItem('isFirstLogin');
      toast.success('Tudo pronto! Vamos começar 🚀');
      setLocation('/dashboard');
    } catch (error) {
      toast.error('Erro ao configurar. Tente novamente.');
    } finally {
      setIsSeeding(false);
    }
  };

  const handleSkip = () => {
    localStorage.removeItem('isFirstLogin');
    setLocation('/dashboard');
  };

  const canProceed = () => {
    if (step === 0) return true; // Welcome
    if (step === 1) return selectedFocus !== null;
    if (step === 2) return true; // Cost input is optional
    return true;
  };

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: { x: 0, opacity: 1 },
    exit: (direction: number) => ({
      x: direction < 0 ? 300 : -300,
      opacity: 0,
    }),
  };

  const [direction, setDirection] = useState(0);

  const goNext = () => {
    if (step === TOTAL_STEPS - 1) {
      handleFinish();
    } else {
      setDirection(1);
      setStep(step + 1);
    }
  };

  const goPrev = () => {
    if (step > 0) {
      setDirection(-1);
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Progress */}
        <div className="flex gap-2 mb-8 px-4">
          {[...Array(TOTAL_STEPS)].map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full flex-1 transition-all duration-500 ${
                i <= step ? 'bg-indigo-600' : 'bg-gray-200'
              }`}
            />
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden min-h-[500px] flex flex-col">
          <AnimatePresence mode="wait" custom={direction}>
            {/* Step 0: Welcome */}
            {step === 0 && (
              <motion.div
                key="step0"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex-1 flex flex-col items-center justify-center p-8 text-center"
              >
                <div className="text-7xl mb-6">🧠</div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">
                  Bem-vindo ao <span className="text-indigo-600">NeuroFin</span>
                </h1>
                <p className="text-gray-500 leading-relaxed max-w-sm">
                  Seu planejador financeiro pessoal, feito para quem quer simplicidade e resultados reais.
                </p>
                <div className="mt-8 flex items-center gap-2 text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                  <span className="text-sm font-medium">Vamos configurar em 30 segundos</span>
                </div>
              </motion.div>
            )}

            {/* Step 1: Focus Selection */}
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex-1 p-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Qual seu maior foco agora?
                </h2>
                <p className="text-gray-400 text-center mb-6 text-sm">
                  Isso nos ajuda a personalizar sua experiência
                </p>

                <div className="space-y-3">
                  {FOCUS_OPTIONS.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => setSelectedFocus(option.id)}
                      className={`w-full flex items-center gap-4 p-4 rounded-2xl border-2 transition-all duration-200 text-left ${
                        selectedFocus === option.id
                          ? `bg-gradient-to-r ${option.bgLight} ${option.border} shadow-md scale-[1.02]`
                          : 'border-gray-100 hover:border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className={`w-14 h-14 rounded-xl flex items-center justify-center text-white bg-gradient-to-br ${option.color} shadow-sm`}>
                        <span className="text-2xl">{option.emoji}</span>
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-gray-900">{option.title}</p>
                        <p className="text-sm text-gray-500">{option.description}</p>
                      </div>
                      {selectedFocus === option.id && (
                        <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center">
                          <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Step 2: Quick Cost */}
            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="flex-1 p-8 flex flex-col items-center justify-center"
              >
                <div className="text-5xl mb-4">💸</div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">
                  Custo de vida essencial
                </h2>
                <p className="text-gray-400 text-center mb-8 text-sm max-w-xs">
                  Uma estimativa rápida. Isso nos ajuda a calcular seu "valor seguro para gastar".
                </p>

                <div className="w-full max-w-xs">
                  <Input
                    type="number"
                    placeholder="Ex: 3000"
                    value={monthlyCost}
                    onChange={(e) => setMonthlyCost(e.target.value)}
                    className="text-center text-2xl font-currency h-16"
                  />
                  <p className="text-xs text-gray-400 text-center mt-2">
                    Aluguel + contas + alimentação + transporte
                  </p>
                </div>

                {/* What we'll create */}
                {selectedFocus && (
                  <div className="mt-8 w-full bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-xs font-medium text-indigo-600 mb-2">
                      ✨ Vamos criar para você:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {DEFAULT_CATEGORIES[selectedFocus]?.map((cat, i) => (
                        <span key={i} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-100">
                          {cat.icon} {cat.name}
                        </span>
                      ))}
                      {DEFAULT_GOALS[selectedFocus]?.map((goal, i) => (
                        <span key={`g${i}`} className="inline-flex items-center gap-1 px-2 py-1 bg-white rounded-lg text-xs text-gray-600 border border-gray-100">
                          {goal.icon} {goal.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="p-6 border-t border-gray-100 mt-auto">
            <div className="flex gap-3">
              {step > 0 && (
                <Button
                  variant="secondary"
                  onClick={goPrev}
                  leftIcon={<ChevronLeft className="w-4 h-4" />}
                  className="flex-1"
                >
                  Anterior
                </Button>
              )}
              <Button
                variant="primary"
                onClick={goNext}
                rightIcon={step < TOTAL_STEPS - 1 ? <ChevronRight className="w-4 h-4" /> : undefined}
                className={`flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 ${!canProceed() ? 'opacity-50' : ''}`}
                disabled={!canProceed()}
                isLoading={isSeeding}
              >
                {step === TOTAL_STEPS - 1 ? '🚀 Começar!' : 'Próximo'}
              </Button>
            </div>
            {step === 0 && (
              <button
                onClick={handleSkip}
                className="w-full mt-3 text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                Pular configuração
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
