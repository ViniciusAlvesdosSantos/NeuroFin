import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, TrendingDown, TrendingUp, ArrowRightLeft, TrendingUpIcon } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { ACCOUNT_ICONS } from '@/lib/constants';
import { TransactionType } from '@/types';
import { toast } from 'sonner';

interface QuickAddTransactionProps {
  isOpen: boolean;
  onClose: () => void;
  preSelectedAccountId?: string; // Conta pré-selecionada do Dashboard
  defaultType?: TransactionType; // Pular para step 2 com o tipo selecionado
}

export default function QuickAddTransaction({ isOpen, onClose, preSelectedAccountId, defaultType }: QuickAddTransactionProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  
  const { createTransaction, fetchTransactions } = useTransactionStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      fetchCategories();
      // Se tem conta pré-selecionada, usar ela
      if (preSelectedAccountId) {
        setAccountId(preSelectedAccountId);
      }

      if (defaultType) {
        setType(defaultType);
        setStep(2);
      } else {
        setType(TransactionType.EXPENSE);
        setStep(1);
      }
    }
  }, [isOpen, fetchAccounts, fetchCategories, preSelectedAccountId, defaultType]);

  // Filtrar categorias por tipo selecionado
  const filteredCategories = categories.filter((cat) => cat.type === type);
  
  // Contas ativas - verificar se status existe, se não, considerar todas como ativas
  const activeAccounts = accounts.filter((acc) => {
    // Se não tem campo status ou status é ACTIVE, considera ativa
    if (!acc.status || acc.status === 'ACTIVE') {
      return true;
    }
    return false;
  });
  const defaultAccount = activeAccounts[0];

  useEffect(() => {
    // Se tem conta pré-selecionada, usar ela
    if (preSelectedAccountId) {
      setAccountId(preSelectedAccountId);
      return;
    }
    // Se não tem accountId selecionado e tem contas ativas, selecionar a primeira
    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0].id);
    }
  }, [activeAccounts, accountId, preSelectedAccountId]);

  const handleSubmit = async () => {
    // Validação antes de enviar
    const parsedAmount = parseFloat(amount);
    
    if (!amount || isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Valor inválido');
      return;
    }
    
    // Converter para string se necessário
    const catId = String(categoryId || '').trim();
    const accId = String(accountId || '').trim();
    
    if (!catId) {
      toast.error('Selecione uma categoria');
      return;
    }
    
    if (!accId) {
      toast.error('Selecione uma conta');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const payload = {
        description: description || 'Registro rápido',
        amount: parsedAmount,
        date: new Date().toISOString(),
        type,
        categoryId: catId,
        accountId: accId,
      };
      
      console.log('Payload:', payload); // Debug
      
      await createTransaction(payload);

      const category = categories.find(c => c.id === categoryId);
      toast.success('🎉 Transação registrada!', {
        description: `${category?.icon || '💰'} ${category?.name || ''} • R$ ${parseFloat(amount).toFixed(2)}`,
      });
      
      // Recarregar dados
      await fetchTransactions();
      await fetchAccounts();
      
      // Reset
      reset();
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);
      const message = error.response?.data?.message || error.message || 'Erro ao registrar transação';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const reset = () => {
    setAmount('');
    setCategoryId('');
    setAccountId('');
    setDescription('');
    if (defaultType) {
      setType(defaultType);
      setStep(2);
    } else {
      setType(TransactionType.EXPENSE);
      setStep(1);
    }
    onClose();
  };

  const getTypeConfig = (transactionType: TransactionType) => {
    const configs = {
      [TransactionType.EXPENSE]: {
        label: 'Gastei',
        description: 'Registrar uma saída',
        icon: TrendingDown,
        gradient: 'from-rose-50 to-red-50',
        border: 'border-rose-200',
        iconBg: 'bg-rose-100',
        iconColor: 'text-rose-600',
      },
      [TransactionType.INCOME]: {
        label: 'Recebi',
        description: 'Registrar uma entrada',
        icon: TrendingUp,
        gradient: 'from-green-50 to-emerald-50',
        border: 'border-green-200',
        iconBg: 'bg-green-100',
        iconColor: 'text-green-600',
      },
      [TransactionType.INVESTMENT]: {
        label: 'Investi',
        description: 'Registrar investimento',
        icon: TrendingUpIcon,
        gradient: 'from-blue-50 to-indigo-50',
        border: 'border-blue-200',
        iconBg: 'bg-blue-100',
        iconColor: 'text-blue-600',
      },
      [TransactionType.TRANSFER]: {
        label: 'Transferi',
        description: 'Mover entre contas',
        icon: ArrowRightLeft,
        gradient: 'from-purple-50 to-pink-50',
        border: 'border-purple-200',
        iconBg: 'bg-purple-100',
        iconColor: 'text-purple-600',
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
            className="bg-card text-card-foreground border border-border w-full sm:w-[480px] sm:rounded-[2rem] rounded-t-[2rem] p-6 sm:p-8 max-h-[90vh] overflow-y-auto shadow-2xl"
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mb-6 sm:hidden" />

            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold tracking-tight">
                {step === 1 && '⚡ Tipo de registro'}
                {step === 2 && '💰 Quanto?'}
                {step === 3 && '🏷️ Qual categoria?'}
              </h2>
              <Button variant="ghost" size="sm" onClick={reset} className="rounded-full bg-muted/50 hover:bg-muted p-2 h-auto">
                <X className="w-5 h-5 text-muted-foreground" />
              </Button>
            </div>
            
            {/* Step 1: Type */}
            {step === 1 && (
              <div className="space-y-3">
                {[TransactionType.EXPENSE, TransactionType.INCOME, TransactionType.INVESTMENT, TransactionType.TRANSFER].map((transactionType) => {
                  const config = getTypeConfig(transactionType);
                  const Icon = config.icon;
                  
                  return (
                    <motion.button
                      key={transactionType}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        setType(transactionType);
                        setCategoryId(''); // Reset categoria ao mudar tipo
                        setStep(2);
                      }}
                      className={`w-full p-4 rounded-2xl bg-gradient-to-r ${config.gradient} 
                        border-2 ${config.border} flex items-center gap-4 text-left transition-all hover:shadow-md`}
                    >
                      <div className={`w-12 h-12 ${config.iconBg} rounded-xl flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${config.iconColor}`} />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">{config.label}</p>
                        <p className="text-sm text-muted-foreground">{config.description}</p>
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            )}
            
            {/* Step 2: Amount */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center py-6">
                  <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-6">
                    {type === TransactionType.EXPENSE && 'Valor do Gasto'}
                    {type === TransactionType.INCOME && 'Valor do Recebimento'}
                    {type === TransactionType.INVESTMENT && 'Valor do Investimento'}
                    {type === TransactionType.TRANSFER && 'Valor da Transferência'}
                  </p>
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <span className="text-4xl text-muted-foreground font-light mb-1">R$</span>
                    <input
                      type="number"
                      placeholder="0,00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      step="0.01"
                      min="0"
                      className="text-6xl md:text-7xl font-bold text-center border-none bg-transparent w-full max-w-[280px] 
                        focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/30"
                      autoFocus
                    />
                  </div>
                </div>
                
                {/* Quick amounts */}
                <div className="flex flex-wrap gap-2 justify-center">
                  {[10, 20, 50, 100, 200, 500].map((val) => (
                    <Button
                      key={val}
                      variant="primary"
                      size="sm"
                      type="button"
                      onClick={() => {
                        const currentAmount = parseFloat(amount) || 0;
                        setAmount((currentAmount + val).toString());
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
                    onClick={() => amount && parseFloat(amount) > 0 && setStep(3)}
                    disabled={!amount || parseFloat(amount) <= 0}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-indigo-500 to-purple-500 
                      hover:from-indigo-600 hover:to-purple-600 text-base font-semibold disabled:opacity-50"
                  >
                    Continuar
                  </Button>
                </div>
              </div>
            )}
            
            {/* Step 3: Category & Account */}
            {step === 3 && (
              <div className="space-y-5">
                {/* Categories Grid */}
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-3">
                    Escolha a categoria
                  </label>
                  <div className="grid grid-cols-3 gap-3 max-h-64 overflow-y-auto pr-1">
                    {filteredCategories.length === 0 ? (
                      <p className="col-span-3 text-center text-sm text-muted-foreground py-8">
                        Nenhuma categoria disponível. Crie uma primeiro!
                      </p>
                    ) : (
                      filteredCategories.map((cat) => (
                        <motion.button
                          key={cat.id}
                          type="button"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setCategoryId(cat.id)}
                          className={`p-3 rounded-2xl flex flex-col items-center gap-2 transition-all border-2
                              ${categoryId === cat.id 
                                ? 'bg-primary/10 border-primary shadow-sm' 
                                : 'bg-muted border-transparent hover:border-border'
                              }`}
                          >
                            <span className="text-3xl">{cat.icon}</span>
                            <span className="text-xs font-medium text-foreground text-center leading-tight">
                              {cat.name}
                            </span>
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>

                {/* Account Selection - Só mostra se não tem conta pré-selecionada e tem múltiplas contas */}
                {!preSelectedAccountId && activeAccounts.length > 1 && (
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Conta
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {activeAccounts.map((acc) => {
                        const accIcon = ACCOUNT_ICONS.find(i => i.value === acc.icon);
                        return (
                          <button
                            key={acc.id}
                            type="button"
                            onClick={() => setAccountId(acc.id)}
                              className={`flex-1 min-w-[140px] p-3 rounded-xl border-2 transition-all ${
                                accountId === acc.id
                                  ? 'border-primary bg-primary/10'
                                  : 'border-border hover:border-primary/50'
                              }`}
                            >
                              <div className="flex flex-col items-center gap-1">
                                <span className="text-2xl">{accIcon?.icon || '💳'}</span>
                                <p className="text-sm font-medium text-foreground">{acc.accountName}</p>
                              </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Mostra conta pré-selecionada ou única conta disponível */}
                {(preSelectedAccountId || activeAccounts.length === 1) && (() => {
                  const selectedAcc = preSelectedAccountId 
                    ? accounts.find(a => a.id === preSelectedAccountId)
                    : defaultAccount;
                  if (!selectedAcc) return null;
                  
                  // Buscar ícone da conta nas constantes pelo value
                  const iconData = ACCOUNT_ICONS.find(i => i.value === selectedAcc.icon);
                  
                  return (
                    <div className="p-3 rounded-xl bg-primary/10 border-2 border-primary/20">
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{iconData?.icon || '💳'}</span>
                        <div>
                          <p className="text-xs text-muted-foreground">Conta</p>
                          <p className="text-sm font-semibold text-foreground">{selectedAcc.accountName}</p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Sem contas - só mostra se não tem conta pré-selecionada */}
                {!preSelectedAccountId && activeAccounts.length === 0 && (
                  <div className="p-3 rounded-xl bg-amber-50 border-2 border-amber-200">
                    <p className="text-sm text-amber-700 text-center">
                      ⚠️ Nenhuma conta ativa. Crie uma conta primeiro!
                    </p>
                  </div>
                )}
                
                {/* Optional Description */}
                <Input
                  placeholder="Descrição (opcional)"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="rounded-xl"
                />
                
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
                    disabled={!categoryId || !accountId || isSubmitting || activeAccounts.length === 0}
                    className="flex-1 h-12 rounded-2xl bg-gradient-to-r from-green-500 to-emerald-500 
                      hover:from-green-600 hover:to-emerald-600 text-base font-semibold 
                      disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      '⏳ Salvando...'
                    ) : (
                      <>
                        <Check className="w-5 h-5 mr-2" />
                        Salvar
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
                    s < step ? 'w-2 bg-indigo-300' : 'w-2 bg-slate-200'
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
