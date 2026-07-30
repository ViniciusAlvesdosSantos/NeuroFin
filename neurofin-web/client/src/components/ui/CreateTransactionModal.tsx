import { useState } from 'react';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectGrid } from '@/components/ui/SelectGrid';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createTransactionSchema } from '@/lib/validators';
import { TransactionType } from '@/types';
import { TRANSACTION_TYPE_LABELS, ACCOUNT_ICONS } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import { toast } from 'sonner';

interface CreateTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateTransactionModal({ 
  isOpen, 
  onClose,
  onSuccess 
}: CreateTransactionModalProps) {
  const { createTransaction } = useTransactionStore();
  const { accounts } = useAccountStore();
  const { categories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amountInput, setAmountInput] = useState('0.00');

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    resolver: zodResolver(createTransactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      date: new Date().toISOString().split('T')[0],
      type: TransactionType.EXPENSE,
      accountId: '',
    },
  });

  const transactionType = watch('type');
  const selectedAccountId = watch('accountId');
  const selectedCategoryId = watch('categoryId');
  const description = watch('description');

  const onSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Enviar amount como número
      const payload = {
        ...data,
        amount: parseFloat(data.amount),
        date: new Date(data.date).toISOString(),
      };
      await createTransaction(payload);
      toast.success('Transação criada com sucesso!');
      reset();
      onClose();
      onSuccess?.();
    } catch (error) {
      toast.error('Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    reset();
    setAmountInput('0.00');
    onClose();
  };

  const handleQuickAmount = (amount: number) => {
    const currentAmount = parseFloat(amountInput) || 0;
    const newAmount = currentAmount + amount;
    const formattedAmount = newAmount.toFixed(2);
    setAmountInput(formattedAmount);
    setValue('amount', newAmount);
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) return;
    
    setAmountInput(value);
    setValue('amount', parseFloat(value) || 0);
  };

  const accountOptions = accounts.map((acc) => ({
    value: acc.id as string,
    label: acc.accountName as string,
  }));

  const typeOptions = Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as string,
    label: label as string,
  }));

  const categoryOptions = categories
    .filter((cat) => !transactionType || cat.type === transactionType)
    .map((cat) => ({
      value: cat.id as string,
      label: cat.name as string,
    }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="✨ Nova Transação"
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Descrição */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-foreground mb-2">
            Descrição
          </label>
          <Input
            id="description"
            placeholder="Ex: Almoço, Uber, Salário..."
            {...register('description')}
            error={errors.description}
            className="text-lg"
          />
        </div>

        {/* Tipo de Transação - Botões visuais */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Tipo
          </label>
          <div className="grid grid-cols-4 gap-2">
            {typeOptions.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setValue('type', type.value as TransactionType)}
                className={`py-3 px-2 rounded-xl border-2 transition-all text-sm font-semibold ${
                  transactionType === type.value
                    ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                    : 'border-gray-200 hover:border-gray-300 text-gray-600'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
          {errors.type && (
            <p className="text-sm text-red-600 mt-1">{errors.type.message}</p>
          )}
        </div>

        {/* Valor - Com botões rápidos */}
        <div>
          <label htmlFor="amount" className="block text-sm font-semibold text-foreground mb-2">
            Valor
          </label>
          
          {/* Quick Add Buttons */}
          <div className="flex gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleQuickAmount(10)}
              className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
            >
              +R$ 10
            </button>
            <button
              type="button"
              onClick={() => handleQuickAmount(50)}
              className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
            >
              +R$ 50
            </button>
            <button
              type="button"
              onClick={() => handleQuickAmount(100)}
              className="flex-1 py-2 px-3 bg-blue-100 text-blue-700 rounded-lg font-semibold hover:bg-blue-200 transition-colors"
            >
              +R$ 100
            </button>
            <button
              type="button"
              onClick={() => {
                setAmountInput('0.00');
                setValue('amount', 0);
              }}
              className="py-2 px-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
              title="Zerar"
            >
              🗑️
            </button>
          </div>

          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
              R$
            </span>
            <input
              id="amount"
              type="text"
              value={amountInput}
              onChange={handleAmountChange}
              placeholder="0.00"
              className="w-full pl-12 pr-4 py-3 text-2xl font-bold text-right border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <input type="hidden" {...register('amount')} />
          </div>
          {errors.amount && (
            <p className="text-sm text-red-600 mt-1">{errors.amount.message}</p>
          )}
        </div>

        {/* Conta - Seletor visual */}
        <div>
          <label className="block text-sm font-semibold text-foreground mb-2">
            Conta
          </label>
          <div className="grid grid-cols-2 gap-2">
            {accounts.map((account) => {
              const iconData = ACCOUNT_ICONS.find(i => i.value === account.icon);
              return (
                <button
                  key={account.id}
                  type="button"
                  onClick={() => setValue('accountId', account.id)}
                  className={`flex items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    selectedAccountId === account.id
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-2xl">{iconData?.icon || '💳'}</span>
                  <span className="text-sm font-medium text-gray-700">{account.accountName}</span>
                </button>
              );
            })}
          </div>
          {errors.accountId && (
            <p className="text-sm text-red-600 mt-1">{errors.accountId.message}</p>
          )}
        </div>

        {/* Categoria - Seletor visual */}
        {categoryOptions.length > 0 && (
          <SelectGrid
            label="Categoria"
            items={categoryOptions.map(opt => {
              const category = categories.find(c => c.id === opt.value);
              return {
                value: opt.value,
                label: opt.label,
                icon: category?.icon || '📁',
              };
            })}
            value={selectedCategoryId}
            onChange={(value) => setValue('categoryId', value)}
            placeholder="Selecione uma categoria"
            columns={5}
          />
        )}

        {/* Data */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold text-foreground mb-2">
            Data
          </label>
          <Input
            id="date"
            type="date"
            {...register('date')}
            error={errors.date}
          />
        </div>

        {/* Preview Card */}
        {description && selectedAccountId && (
          <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
            <p className="text-xs text-gray-500 mb-2 font-semibold">📱 PREVIEW</p>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <span className="text-xl">
                    {categories.find(c => c.id === selectedCategoryId)?.icon || '📝'}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{description}</p>
                  <p className="text-xs text-gray-500">
                    {accounts.find(a => a.id === selectedAccountId)?.accountName}
                  </p>
                </div>
              </div>
              <p className={`text-lg font-bold ${
                transactionType === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
              }`}>
                {transactionType === TransactionType.INCOME ? '+' : '-'}
                R$ {amountInput}
              </p>
            </div>
          </div>
        )}

        <ModalFooter>
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSubmitting}
            className="min-w-[120px]"
          >
            {isSubmitting ? '⏳ Criando...' : '✨ Criar'}
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
