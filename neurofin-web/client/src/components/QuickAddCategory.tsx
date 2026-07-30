import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { CATEGORY_ICONS, CATEGORY_COLORS, TRANSACTION_TYPE_LABELS } from '@/lib/constants';
import { TransactionType } from '@/types';
import { toast } from 'sonner';

interface QuickAddCategoryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickAddCategory({ isOpen, onClose }: QuickAddCategoryProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [budget, setBudget] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createCategory, fetchCategories } = useCategoryStore();

  const handleSubmit = async () => {
    if (!name || !icon || !color) return;
    
    setIsSubmitting(true);
    try {
      await createCategory({
        name,
        type,
        icon,
        color,
        budget: budget ? parseFloat(budget) : undefined,
      });

      toast.success('🎉 Categoria criada!', {
        description: `${icon} ${name}`,
      });
      
      // Recarregar categorias
      await fetchCategories();
      
      // Reset
      reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar categoria';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reset = () => {
    setStep(1);
    setName('');
    setType(TransactionType.EXPENSE);
    setIcon('');
    setColor('');
    setBudget('');
    onClose();
  };

  const getTypeConfig = (transactionType: TransactionType) => {
    const configs = {
      [TransactionType.EXPENSE]: {
        emoji: '💸',
        gradient: 'from-rose-50 to-red-50',
        border: 'border-rose-200',
      },
      [TransactionType.INCOME]: {
        emoji: '💰',
        gradient: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
      },
      [TransactionType.INVESTMENT]: {
        emoji: '📈',
        gradient: 'from-blue-50 to-indigo-50',
        border: 'border-blue-200',
      },
      [TransactionType.TRANSFER]: {
        emoji: '🔄',
        gradient: 'from-purple-50 to-pink-50',
        border: 'border-purple-200',
      },
    };
    return configs[transactionType];
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center"
          onClick={reset}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card text-card-foreground border border-border w-full sm:w-[480px] sm:rounded-[2rem] rounded-t-[2rem] p-6 max-h-[85vh] overflow-y-auto shadow-2xl sm:p-8"
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">
                {step === 1 && '🏷️ Nome da Categoria'}
                {step === 2 && '📋 Tipo e Limite'}
                {step === 3 && '🎨 Personalizar'}
              </h2>
              <Button variant="ghost" size="sm" onClick={reset} className="rounded-full bg-muted/50 hover:bg-muted p-2 h-auto">
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Step 1: Name */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Como você quer chamar essa categoria?
                  </label>
                  <Input
                    placeholder="Ex: Alimentação, Transporte, Lazer"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Dica: Use nomes descritivos e fáceis de lembrar
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={reset}
                    className="flex-1 h-12 rounded-2xl text-base font-semibold"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => name && setStep(2)}
                    disabled={!name}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 
                      hover:from-indigo-600 hover:to-purple-600 text-base font-semibold disabled:opacity-50"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 2: Type and Budget */}
            {step === 2 && (
              <div className="space-y-6">
                {/* Type Selection */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Tipo de categoria
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => {
                      const config = getTypeConfig(value as TransactionType);
                      return (
                        <motion.button
                          key={value}
                          type="button"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setType(value as TransactionType)}
                          className={`p-4 rounded-2xl bg-gradient-to-r ${config.gradient} 
                            border-2 ${type === value ? config.border : 'border-transparent'} 
                            flex flex-col items-center gap-2 text-center transition-all
                            ${type === value ? 'shadow-md' : 'hover:shadow-sm'}`}
                        >
                          <span className="text-3xl">{config.emoji}</span>
                          <span className="text-sm font-semibold text-foreground">{label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>

                {/* Budget (opcional) */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Limite mensal (opcional)
                  </label>
                  <div className="flex items-center gap-2">
                    <span className="text-xl text-muted-foreground font-bold">R$</span>
                    <Input
                      type="number"
                      placeholder="0,00"
                      value={budget}
                      onChange={(e) => setBudget(e.target.value)}
                      step="0.01"
                      min="0"
                      className="text-2xl font-bold"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Define quanto você quer gastar no máximo por mês
                  </p>
                </div>

                {/* Quick budgets */}
                {type === TransactionType.EXPENSE && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {[100, 200, 500, 1000].map((val) => (
                      <Button
                        key={val}
                        variant="secondary"
                        size="sm"
                        type="button"
                        onClick={() => setBudget(val.toString())}
                        className="rounded-full hover:bg-indigo-50 hover:border-indigo-300"
                      >
                        R$ {val}
                      </Button>
                    ))}
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(1)}
                    className="flex-1 h-12 rounded-2xl text-base font-semibold"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setStep(3)}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 
                      hover:from-indigo-600 hover:to-purple-600 text-base font-semibold"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Icon & Color */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Icon Selection */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Escolha um ícone
                  </label>
                  <div className="grid grid-cols-6 gap-3 max-h-64 overflow-y-auto pr-1">
                    {CATEGORY_ICONS.map((emoji) => (
                      <motion.button
                        key={emoji}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIcon(emoji)}
                        className={`p-3 rounded-2xl flex items-center justify-center transition-all border-2
                          ${icon === emoji 
                            ? 'bg-indigo-100 border-indigo-400 shadow-md' 
                            : 'bg-muted border-transparent hover:border-border'
                          }`}
                      >
                        <span className="text-3xl">{emoji}</span>
                      </motion.button>
                    ))}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Escolha uma cor
                  </label>
                  <div className="grid grid-cols-8 gap-3">
                    {CATEGORY_COLORS.map((colorValue) => (
                      <motion.button
                        key={colorValue}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setColor(colorValue)}
                        className={`w-10 h-10 rounded-full transition-all border-4
                          ${color === colorValue 
                            ? 'border-foreground shadow-lg' 
                            : 'border-transparent hover:border-border'
                          }`}
                        style={{ backgroundColor: colorValue }}
                      />
                    ))}
                  </div>
                </div>

                {/* Preview */}
                {name && icon && color && (
                  <div className="p-4 rounded-xl border-2 border-dashed border-border bg-muted">
                    <p className="text-xs text-muted-foreground mb-2 font-semibold">📱 PREVIEW</p>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                        style={{ backgroundColor: color }}
                      >
                        <span className="text-2xl">{icon}</span>
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{name}</p>
                        <p className="text-xs text-muted-foreground">
                          {TRANSACTION_TYPE_LABELS[type]}
                          {budget && ` • Limite: R$ ${parseFloat(budget).toFixed(2)}`}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setStep(2)}
                    className="flex-1 h-12 rounded-2xl text-base font-semibold"
                  >
                    Voltar
                  </Button>
                  <Button
                    type="button"
                    onClick={handleSubmit}
                    disabled={!icon || !color || isSubmitting}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 
                      hover:from-green-600 hover:to-emerald-600 text-base font-semibold 
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      '⏳ Criando...'
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Criar Categoria
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
            
            {/* Progress dots */}
            <div className="flex justify-center gap-2 mt-6">
              {[1, 2, 3].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s === step ? 'w-6 bg-indigo-500' : 
                    s < step ? 'w-2 bg-indigo-300' : 'w-2 bg-muted'
                  }`}
                />
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
