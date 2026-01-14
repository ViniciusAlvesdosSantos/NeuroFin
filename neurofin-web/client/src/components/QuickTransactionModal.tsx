import { useState, useEffect, useMemo } from 'react';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TransactionType } from '@/types';
import { toast } from 'sonner';
import { Zap, TrendingDown, TrendingUp } from 'lucide-react';

// Schema simplificado - apenas 2 campos obrigatórios
const quickTransactionSchema = z.object({
  amount: z.number().min(0.01, 'Valor deve ser maior que zero'),
  categoryId: z.string().min(1, 'Selecione uma categoria'),
  type: z.nativeEnum(TransactionType),
  accountId: z.string().optional(),
  description: z.string().optional(),
});

type QuickTransactionForm = z.infer<typeof quickTransactionSchema>;

interface QuickTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Templates de gastos frequentes (você pode personalizar isso)
interface QuickTemplate {
  icon: string;
  label: string;
  amount: number;
  categoryName: string;
  type: TransactionType;
}

const QUICK_TEMPLATES: QuickTemplate[] = [
  { icon: '🍕', label: 'Delivery', amount: 50, categoryName: 'Alimentação', type: TransactionType.EXPENSE },
  { icon: '🚕', label: 'Uber', amount: 25, categoryName: 'Transporte', type: TransactionType.EXPENSE },
  { icon: '☕', label: 'Café', amount: 8, categoryName: 'Lazer', type: TransactionType.EXPENSE },
  { icon: '🛒', label: 'Mercado', amount: 150, categoryName: 'Alimentação', type: TransactionType.EXPENSE },
  { icon: '💰', label: 'Salário', amount: 3000, categoryName: 'Salário', type: TransactionType.INCOME },
  { icon: '💵', label: 'Freelance', amount: 500, categoryName: 'Freelance', type: TransactionType.INCOME },
];

export default function QuickTransactionModal({ isOpen, onClose }: QuickTransactionModalProps) {
  const { createTransaction, transactions, fetchTransactions } = useTransactionStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedType, setSelectedType] = useState<TransactionType>(TransactionType.EXPENSE);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<QuickTransactionForm>({
    resolver: zodResolver(quickTransactionSchema),
    defaultValues: {
      amount: 0,
      categoryId: '',
      type: TransactionType.EXPENSE,
      description: '',
    },
  });

  const watchedType = watch('type');

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      fetchCategories();
    }
  }, [isOpen]);

  // Sugestão de categoria baseada em histórico
  const suggestedCategory = useMemo(() => {
    const recentTransactions = transactions
      .filter((t) => t.type === selectedType)
      .slice(0, 10);
    
    if (recentTransactions.length === 0) return null;

    // Encontrar categoria mais frequente
    const categoryCount = recentTransactions.reduce((acc, t) => {
      if (t.categoryId) {
        acc[t.categoryId] = (acc[t.categoryId] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    const mostFrequentCategoryId = Object.entries(categoryCount).sort((a, b) => b[1] - a[1])[0]?.[0];
    return categories.find((c) => c.id === mostFrequentCategoryId);
  }, [transactions, categories, selectedType]);

  // Filtrar categorias por tipo
  const filteredCategories = categories.filter((cat) => cat.type === selectedType);

  // Conta padrão (primeira conta ativa)
  const defaultAccount = accounts.find((acc) => acc.status === 'ACTIVE');

  const onSubmit = async (data: QuickTransactionForm) => {
    setIsSubmitting(true);
    try {
      const payload = {
        description: data.description || 'Transação rápida',
        amount: data.amount,
        date: new Date().toISOString().split('T')[0], // Data de hoje
        type: data.type,
        categoryId: data.categoryId,
        accountId: data.accountId || defaultAccount?.id || accounts[0]?.id,
      };

      await createTransaction(payload);
      toast.success('💸 Transação adicionada!', {
        description: `${data.type === TransactionType.EXPENSE ? '-' : '+'}R$ ${data.amount.toFixed(2)}`,
      });
      
      reset();
      fetchTransactions();
      onClose();
    } catch (error) {
      toast.error('Erro ao criar transação');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTemplateClick = (template: QuickTemplate) => {
    // Encontrar categoria correspondente
    const category = categories.find(
      (c) => c.name.toLowerCase().includes(template.categoryName.toLowerCase()) && c.type === template.type
    );

    setValue('amount', template.amount);
    setValue('type', template.type);
    setSelectedType(template.type);
    
    if (category) {
      setValue('categoryId', category.id);
    }
  };

  const handleTypeChange = (type: TransactionType) => {
    setSelectedType(type);
    setValue('type', type);
    setValue('categoryId', ''); // Reset category quando mudar tipo
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="⚡ Adicionar Rápido" size="md">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        
        {/* Seletor de Tipo (Receita/Despesa) */}
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => handleTypeChange(TransactionType.EXPENSE)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              selectedType === TransactionType.EXPENSE
                ? 'bg-red-100 text-red-700 border-2 border-red-500'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <TrendingDown className="w-5 h-5 mx-auto mb-1" />
            Despesa
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange(TransactionType.INCOME)}
            className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all ${
              selectedType === TransactionType.INCOME
                ? 'bg-green-100 text-green-700 border-2 border-green-500'
                : 'bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200'
            }`}
          >
            <TrendingUp className="w-5 h-5 mx-auto mb-1" />
            Receita
          </button>
        </div>

        {/* Templates de Gasto Rápido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Zap className="w-4 h-4 inline mr-1" />
            Templates Rápidos
          </label>
          <div className="grid grid-cols-3 gap-2">
            {QUICK_TEMPLATES.filter((t) => t.type === selectedType).map((template, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleTemplateClick(template)}
                className="p-3 bg-white border-2 border-gray-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all text-center"
              >
                <div className="text-2xl mb-1">{template.icon}</div>
                <div className="text-xs font-semibold text-gray-700">{template.label}</div>
                <div className="text-xs text-gray-500">R$ {template.amount}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Campo de Valor (Destaque) */}
        <div>
          <Input
            type="number"
            label="💵 Valor"
            placeholder="0.00"
            step="0.01"
            error={errors.amount}
            className="text-2xl font-bold text-center"
            {...register('amount', { valueAsNumber: true })}
            autoFocus
          />
        </div>

        {/* Seleção de Categoria com Sugestão */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            📁 Categoria
            {suggestedCategory && (
              <span className="ml-2 text-xs text-indigo-600 font-normal">
                (Sugerida: {suggestedCategory.icon} {suggestedCategory.name})
              </span>
            )}
          </label>
          <select
            {...register('categoryId')}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-base"
          >
            <option value="">Selecione uma categoria</option>
            {suggestedCategory && (
              <option value={suggestedCategory.id} className="font-bold bg-indigo-50">
                ⭐ {suggestedCategory.icon} {suggestedCategory.name} (Sugerida)
              </option>
            )}
            {filteredCategories
              .filter((c) => c.id !== suggestedCategory?.id)
              .map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
          </select>
          {errors.categoryId && (
            <p className="text-red-500 text-sm mt-1">{errors.categoryId.message}</p>
          )}
        </div>

        {/* Campo de Descrição (Opcional) */}
        <details className="text-sm text-gray-600">
          <summary className="cursor-pointer hover:text-gray-800">
            + Adicionar descrição (opcional)
          </summary>
          <div className="mt-2">
            <Input
              label="Descrição"
              placeholder="Ex: Almoço no restaurante"
              {...register('description')}
            />
          </div>
        </details>

        {/* Hidden fields */}
        <input type="hidden" {...register('type')} />

        {/* Footer */}
        <ModalFooter>
          <Button type="button" variant="secondary" onClick={handleClose}>
            Cancelar
          </Button>
          <Button type="submit" variant="primary" isLoading={isSubmitting}>
            ✅ Adicionar
          </Button>
        </ModalFooter>
      </form>
    </Modal>
  );
}
