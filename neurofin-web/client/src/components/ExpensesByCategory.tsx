import { useEffect, useState } from 'react';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { SelectGrid } from '@/components/ui/SelectGrid';
import { formatCurrency } from '@/lib/formatters';
import { Plus, Pencil } from 'lucide-react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { TransactionType } from '@/types';
import { TRANSACTION_TYPE_LABELS, CATEGORY_ICONS, CATEGORY_COLORS } from '@/lib/constants';

const createCategorySchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  icon: z.string().min(1, 'Ícone é obrigatório'),
  color: z.string().min(1, 'Cor é obrigatória'),
  type: z.nativeEnum(TransactionType),
  budget: z.number().min(0, 'Limite deve ser maior ou igual a 0').optional(),
});

const updateBudgetSchema = z.object({
  budget: z.number().min(0, 'Limite deve ser maior ou igual a 0'),
});

type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
type UpdateBudgetFormData = z.infer<typeof updateBudgetSchema>;

interface ExpensesByCategoryProps {
  filteredTransactions?: any[];
  accountName?: string;
}

export default function ExpensesByCategory({ filteredTransactions, accountName }: ExpensesByCategoryProps = {}) {
  const { categories, fetchCategories, createCategory, updateCategory } = useCategoryStore();
  const { transactions: allTransactions, fetchTransactions } = useTransactionStore();
  
  // Usar filteredTransactions se fornecido, caso contrário usar todas as transações
  const transactions = filteredTransactions || allTransactions;
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate },
    reset: resetCreate,
    watch: watchCreate,
    setValue: setValueCreate,
  } = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: '',
      icon: '',
      color: '#6366f1',
      type: TransactionType.EXPENSE,
      budget: undefined,
    },
  });

  const selectedIcon = watchCreate('icon');
  const selectedColor = watchCreate('color');
  const categoryName = watchCreate('name');
  const categoryType = watchCreate('type');

  const {
    register: registerBudget,
    handleSubmit: handleSubmitBudget,
    formState: { errors: errorsBudget },
    reset: resetBudget,
    setValue: setValueBudget,
  } = useForm<UpdateBudgetFormData>({
    resolver: zodResolver(updateBudgetSchema),
    defaultValues: {
      budget: 0,
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, [fetchCategories, fetchTransactions]);

  // Atualizar quando transactions mudar
  useEffect(() => {
    // Este efeito garante que o componente re-renderize quando os dados mudarem
  }, [transactions]);

  const onSubmitCreate = async (data: CreateCategoryFormData) => {
    setIsSubmitting(true);
    try {
      await createCategory(data);
      toast.success('Categoria criada com sucesso!');
      resetCreate();
      setIsCreateModalOpen(false);
      fetchCategories();
      fetchTransactions();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao criar categoria';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onSubmitBudget = async (data: UpdateBudgetFormData) => {
    if (selectedCategory === null) return;
    
    setIsSubmitting(true);
    try {
      await updateCategory(selectedCategory, { budget: data.budget });
      toast.success('Limite atualizado com sucesso!');
      resetBudget();
      setIsBudgetModalOpen(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao atualizar limite';
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenBudgetModal = (categoryId: string, currentBudget: number | null) => {
    setSelectedCategory(categoryId);
    setValueBudget('budget', currentBudget || 0);
    setIsBudgetModalOpen(true);
  };

  const typeOptions = Object.entries(TRANSACTION_TYPE_LABELS).map(([value, label]) => ({
    value: value as string,
    label: label as string,
  }));

  // Calcular gastos por categoria baseado nas transações
  const categoryExpenses = categories.map((category) => {
    // Filtrar apenas transações de DESPESA (EXPENSE) desta categoria
    const categoryTransactions = transactions.filter(
      (transaction) => 
        transaction.categoryId === category.id && 
        transaction.type === TransactionType.EXPENSE
    );
    
    // Somar o total de gastos
    const total = categoryTransactions.reduce((sum, transaction) => sum + Number(transaction.amount), 0);
    
    return {
      ...category,
      total,
      transactionCount: categoryTransactions.length,
    };
  }).sort((a, b) => b.total - a.total); // Ordenar por valor decrescente

  const totalExpenses = categoryExpenses.reduce((sum, cat) => sum + cat.total, 0);
  
  // Separar categorias com e sem gastos
  const categoriesWithExpenses = categoryExpenses.filter((cat) => cat.total > 0);
  const categoriesWithoutExpenses = categoryExpenses.filter((cat) => cat.total === 0);

  return (
    <>
      <Card className="h-full flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <CardTitle>
              Gastos por Categoria
              {accountName && <span className="text-sm font-normal text-muted-foreground ml-2">({accountName})</span>}
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Nova categoria
            </Button>
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden flex flex-col">
          {categories.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              Nenhuma categoria encontrada
            </p>
          ) : (
            <div className="flex-1 overflow-y-auto pr-2 space-y-3" style={{ maxHeight: '400px' }}>
              {/* Categorias com gastos */}
              {categoriesWithExpenses.map((category) => {
                const percentage = totalExpenses > 0 ? (category.total / totalExpenses) * 100 : 0;
                const hasBudget = category.budget && category.budget > 0;
                const budgetPercentage = hasBudget ? (category.total / category.budget!) * 100 : 0;
                const isOverBudget = hasBudget && budgetPercentage > 100;
                const isNearBudget = hasBudget && budgetPercentage > 80 && budgetPercentage <= 100;
                
                return (
                  <div key={category.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-2xl">{category.icon}</span>
                        <div className="flex-1">
                          <p className="font-medium text-sm text-foreground">{category.name}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>
                              {percentage.toFixed(1)}% · {category.transactionCount} {category.transactionCount === 1 ? 'transação' : 'transações'}
                            </span>
                            {hasBudget && (
                              <span className={`font-medium ${
                                isOverBudget ? 'text-red-600' : 
                                isNearBudget ? 'text-yellow-600' : 
                                'text-green-600'
                              }`}>
                                • {budgetPercentage.toFixed(0)}% do limite
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenBudgetModal(category.id, category.budget)}
                          title="Editar limite"
                        >
                          <Pencil className="w-3 h-3" />
                        </Button>
                        <div className="text-right">
                          <p className="font-semibold text-foreground">{formatCurrency(category.total)}</p>
                          {hasBudget && (
                            <p className="text-xs text-muted-foreground">
                              de {formatCurrency(category.budget || 0)}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Barra de progresso do limite */}
                    {hasBudget ? (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all ${
                            isOverBudget ? 'bg-red-500' : 
                            isNearBudget ? 'bg-yellow-500' : 
                            'bg-green-500'
                          }`}
                          style={{
                            width: `${Math.min(budgetPercentage, 100)}%`,
                          }}
                        />
                      </div>
                    ) : (
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className="h-2 rounded-full transition-all"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: category.color || '#6366f1',
                          }}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
              
              {/* Categorias sem gastos */}
              {categoriesWithoutExpenses.length > 0 && categoriesWithExpenses.length > 0 && (
                <div className="pt-3 border-t border-border">
                  <p className="text-xs text-muted-foreground mb-2">Sem gastos:</p>
                </div>
              )}
              
              {categoriesWithoutExpenses.map((category) => (
                <div key={category.id} className="opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{category.icon}</span>
                      <div>
                        <p className="font-medium text-sm text-foreground">{category.name}</p>
                        <p className="text-xs text-muted-foreground">0%</p>
                      </div>
                    </div>
                    <p className="font-semibold text-muted-foreground">{formatCurrency(0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {categoriesWithExpenses.length > 0 && (
            <div className="flex-shrink-0 mt-4 pt-4 border-t border-border">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-foreground">Total</p>
                <p className="font-bold text-lg text-foreground">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Category Modal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          resetCreate();
        }}
        title="✨ Nova Categoria"
        size="md"
      >
        <form onSubmit={handleSubmitCreate(onSubmitCreate)} className="space-y-5">
          {/* Nome */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
              Nome da Categoria
            </label>
            <Input
              id="name"
              placeholder="Ex: Alimentação, Transporte, Lazer"
              error={errorsCreate.name}
              {...registerCreate('name')}
              className="text-lg"
            />
          </div>

          {/* Tipo - Botões visuais */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Tipo
            </label>
            <div className="grid grid-cols-4 gap-2">
              {typeOptions.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setValueCreate('type', type.value as TransactionType)}
                  className={`py-2 px-2 rounded-xl border-2 transition-all text-sm font-semibold ${
                    categoryType === type.value
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 shadow-md'
                      : 'border-gray-200 hover:border-gray-300 text-gray-600'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
            {errorsCreate.type && (
              <p className="text-sm text-red-600 mt-1">{errorsCreate.type.message}</p>
            )}
          </div>

          {/* Ícone - Seletor visual com emojis predefinidos */}
          <SelectGrid
            label="Escolha um Ícone"
            items={CATEGORY_ICONS.map(emoji => ({
              value: emoji,
              label: '',
              icon: emoji,
            }))}
            value={selectedIcon}
            onChange={(value) => setValueCreate('icon', value)}
            placeholder="Selecione um ícone"
            columns={8}
            error={errorsCreate.icon?.message}
          />

          {/* Cor - Seletor visual */}
          <SelectGrid
            label="Escolha uma Cor"
            items={CATEGORY_COLORS.map(color => ({
              value: color,
              label: '',
              color: color,
            }))}
            value={selectedColor}
            onChange={(value) => setValueCreate('color', value)}
            placeholder="Selecione uma cor"
            columns={5}
            error={errorsCreate.color?.message}
          />

          {/* Limite de Gasto (Opcional) */}
          <div>
            <label htmlFor="budget" className="block text-sm font-semibold text-foreground mb-2">
              Limite de Gasto Mensal (Opcional)
            </label>
            <Input
              id="budget"
              placeholder="Ex: 500.00"
              type="number"
              step="0.01"
              min="0"
              error={errorsCreate.budget}
              {...registerCreate('budget', { valueAsNumber: true })}
            />
          </div>

          {/* Preview Card */}
          {categoryName && selectedIcon && selectedColor && (
            <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-semibold">📱 PREVIEW</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                >
                  <span className="text-2xl">{selectedIcon}</span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">{categoryName}</p>
                  <p className="text-xs text-gray-500">
                    {typeOptions.find(t => t.value === categoryType)?.label}
                  </p>
                </div>
              </div>
            </div>
          )}

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsCreateModalOpen(false);
                resetCreate();
              }}
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

      {/* Edit Budget Modal */}
      <Modal
        isOpen={isBudgetModalOpen}
        onClose={() => {
          setIsBudgetModalOpen(false);
          setSelectedCategory(null);
          resetBudget();
        }}
        title="Editar Limite de Gasto"
        size="sm"
      >
        <form onSubmit={handleSubmitBudget(onSubmitBudget)} className="space-y-4">
          <Input
            label="Limite de Gasto"
            placeholder="Ex: 1000.00"
            type="number"
            step="0.01"
            min="0"
            error={errorsBudget.budget}
            {...registerBudget('budget', { valueAsNumber: true })}
          />
          
          <p className="text-sm text-muted-foreground">
            Defina quanto você quer gastar no máximo nesta categoria. 
            A barra de progresso mostrará seu consumo em relação ao limite.
          </p>

          <ModalFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsBudgetModalOpen(false);
                setSelectedCategory(null);
                resetBudget();
              }}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
            >
              Salvar Limite
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </>
  );
}
