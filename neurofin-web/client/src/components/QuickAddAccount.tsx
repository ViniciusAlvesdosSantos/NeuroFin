import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useAccountStore } from '@/stores/useAccountStore';
import { ACCOUNT_ICONS, ACCOUNT_COLORS } from '@/lib/constants';
import { toast } from 'sonner';

interface QuickAddAccountProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickAddAccount({ isOpen, onClose }: QuickAddAccountProps) {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [balance, setBalance] = useState('');
  const [icon, setIcon] = useState('');
  const [color, setColor] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createAccount, fetchAccounts } = useAccountStore();

  const handleSubmit = async () => {
    if (!name || !icon || !color) return;
    
    setIsSubmitting(true);
    try {
      await createAccount({
        accountName: name,
        balance: balance || '0',
        icon,
        color,
      });

      toast.success('🎉 Conta criada!', {
        description: `${icon} ${name} • R$ ${parseFloat(balance || '0').toFixed(2)}`,
      });
      
      // Recarregar contas
      await fetchAccounts();
      
      // Reset
      reset();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reset = () => {
    setStep(1);
    setName('');
    setBalance('');
    setIcon('');
    setColor('');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex flex-col justify-end sm:flex-row sm:justify-end p-0"
          onClick={reset}
        >
          <motion.div
            initial={{ opacity: 0, y: '100%' }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: '100%' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-card text-card-foreground border border-border w-full sm:w-[480px] sm:rounded-[2rem] rounded-t-[2rem] p-6 max-h-[85vh] overflow-y-auto shadow-2xl sm:p-8"
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 sm:hidden" />

            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 mb-2 sm:hidden shrink-0" />
            <div className="flex-1 overflow-y-auto p-6 sm:p-8 pt-2 sm:pt-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold tracking-tight">
                {step === 1 && '🏦 Nome da Conta'}
                {step === 2 && '💰 Saldo Inicial'}
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
                    Como você quer chamar essa conta?
                  </label>
                  <Input
                    placeholder="Ex: Carteira, Nubank, Itaú"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="text-lg"
                    autoFocus
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    💡 Dica: Use nomes fáceis de lembrar
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
            
            {/* Step 2: Balance */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                    Valor Inicial da Conta
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-4xl text-muted-foreground font-light mb-1">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={balance}
                      onChange={(e) => setBalance(e.target.value)}
                      step="0.01"
                      min="0"
                      className="text-6xl md:text-7xl font-bold text-center border-none bg-transparent w-full max-w-[280px] 
                        focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/30"
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-3">
                    💡 Você pode deixar em R$0,00 e ajustar depois
                  </p>
                </div>
                
                {/* Quick amounts */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {[100, 500, 1000, 5000].map((val) => (
                    <Button
                      key={val}
                      variant="secondary"
                      size="sm"
                      type="button"
                      onClick={() => {
                        const currentBalance = parseFloat(balance) || 0;
                        setBalance((currentBalance + val).toString());
                      }}
                      className="rounded-full hover:bg-indigo-50 hover:border-indigo-300"
                    >
                      +R$ {val}
                    </Button>
                  ))}
                </div>
                
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
                  <div className="grid grid-cols-5 gap-3">
                    {ACCOUNT_ICONS.map((item) => (
                      <motion.button
                        key={item.value}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setIcon(item.icon)}
                        className={`p-4 rounded-2xl flex items-center justify-center transition-all border-2
                          ${icon === item.icon 
                            ? 'bg-indigo-100 border-indigo-400 shadow-md' 
                            : 'bg-muted border-transparent hover:border-border'
                          }`}
                      >
                        <span className="text-3xl">{item.icon}</span>
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
                    {ACCOUNT_COLORS.map((item) => (
                      <motion.button
                        key={item.value}
                        type="button"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setColor(item.value)}
                        className={`w-10 h-10 rounded-full transition-all border-4
                          ${color === item.value 
                            ? 'border-foreground shadow-lg' 
                            : 'border-transparent hover:border-border'
                          }`}
                        style={{ backgroundColor: item.value }}
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
                        <p className="text-sm text-muted-foreground">
                          Saldo: R$ {parseFloat(balance || '0').toFixed(2)}
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
                        Criar Conta
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
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
