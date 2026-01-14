import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAccountStore } from '@/stores/useAccountStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';
import { TransactionType } from '@/types';
import { TrendingUp, TrendingDown, DollarSign, Plus, Wallet } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createAccountSchema } from '@/lib/validators';
import { ACCOUNT_COLORS, ACCOUNT_ICONS } from '@/lib/constants';
import CreateTransactionModal from '@/components/ui/CreateTransactionModal';
import ExpensesByCategory from '@/components/ExpensesByCategory';
import Header from '@/components/Header';
import QuickAddButton from '@/components/QuickAddButton';

export default function Dashboard() {
  const isAuthenticated = useRequireAuth();
  console.log('🔍 Dashboard - isAuthenticated:', isAuthenticated);
  
  const [, setLocation] = useLocation();
  const { accounts, fetchAccounts, createAccount } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAccountId, setSelectedAccountId] = useState<string | 'all'>('all');
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);
  const [isSubmittingAccount, setIsSubmittingAccount] = useState(false);
  const [balanceInput, setBalanceInput] = useState('0.00');

  const {
    register: registerAccount,
    handleSubmit: handleSubmitAccount,
    formState: { errors: errorsAccount },
    reset: resetAccount,
    setValue: setAccountValue,
    watch: watchAccount,
  } = useForm({
    resolver: zodResolver(createAccountSchema),
    defaultValues: {
      name: '',
      balance: '0',
      color: '',
      icon: '',
    },
  });

  const selectedColor = watchAccount('color');
  const selectedIcon = watchAccount('icon');

  useEffect(() => {
    console.log('Dashboard mounted');
    const loadData = async () => {
      try {
        console.log('Loading dashboard data');
        setIsLoading(true);
        await Promise.all([
          fetchAccounts(),
          fetchTransactions(),
          fetchCategories(),
        ]);
      } catch (error) {
        toast.error('Erro ao carregar dados');
      } finally {
        setIsLoading(false);
      }
    };

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  // Mostrar loading enquanto verifica autenticação
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Filtrar transações por conta selecionada
  const filteredTransactions = selectedAccountId === 'all' 
    ? transactions 
    : transactions.filter(t => t.accountId === selectedAccountId);

  // Calcular saldo total (conta selecionada ou todas)
  const totalBalance = selectedAccountId === 'all'
    ? accounts.reduce((sum, acc) => sum + Number(acc.balance), 0)
    : Number(accounts.find(acc => acc.id === selectedAccountId)?.balance || 0);

  const monthlyIncome = filteredTransactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpense = filteredTransactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyBalance = monthlyIncome - monthlyExpense;

  // Cálculos inteligentes para insights
  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;
  const averageDailyExpense = monthlyExpense / 30;
  const projectedMonthlyExpense = averageDailyExpense * 30;
  const daysUntilMonthEnd = 30 - new Date().getDate();
  const budgetRemaining = monthlyIncome - monthlyExpense;
  const canSpendPerDay = daysUntilMonthEnd > 0 ? budgetRemaining / daysUntilMonthEnd : 0;

  // Análise de tendência
  const isHealthyFinance = savingsRate >= 20;
  const isWarningFinance = savingsRate < 20 && savingsRate >= 10;
  const isDangerFinance = savingsRate < 10;

  const handleTransactionCreated = () => {
    fetchAccounts();
    fetchTransactions();
  };

  const onSubmitAccount = async (data: any) => {
    setIsSubmittingAccount(true);
    try {
      // Preparar dados para envio ao backend
      const accountData = {
        accountName: data.name,
        color: data.color,
        icon: data.icon,
        balance: String(data.balance) || '0',
      };
      console.log('📤 Enviando dados de conta:', accountData);
      await createAccount(accountData);
      toast.success('Conta criada com sucesso!');
      setIsCreateAccountModalOpen(false);
      resetAccount();
      setBalanceInput('0.00');
      fetchAccounts();
    } catch (error: any) {
      console.error('❌ Erro ao criar conta:', error);
      const errorMessage = error.response?.data?.message || 'Erro ao criar conta';
      toast.error(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
    } finally {
      setIsSubmittingAccount(false);
    }
  };

  const handleCloseAccountModal = () => {
    setIsCreateAccountModalOpen(false);
    resetAccount();
    setBalanceInput('0.00');
  };

  const handleQuickBalance = (amount: number) => {
    const currentBalance = parseFloat(balanceInput) || 0;
    const newBalance = currentBalance + amount;
    const formattedBalance = newBalance.toFixed(2);
    setBalanceInput(formattedBalance);
    setAccountValue('balance', newBalance.toString());
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    const parts = value.split('.');
    if (parts.length > 2) return; // Evita múltiplos pontos decimais
    
    setBalanceInput(value);
    setAccountValue('balance', value || '0');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBalance={true} />

      {/* Main Content */}
      <main className="container py-8">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Carregando dados...</p>
          </div>
        ) : (
          <>
            {/* Navegação por Contas */}
            <div className="mb-6">
              <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {/* Tab "Todas as Contas" */}
                <button
                  onClick={() => setSelectedAccountId('all')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                    selectedAccountId === 'all'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  <Wallet className="w-4 h-4" />
                  Todas as Contas
                </button>

                {/* Tabs das Contas */}
                {accounts.map((account) => {
                  const iconData = ACCOUNT_ICONS.find(i => i.value === account.icon);
                  return (
                    <button
                      key={account.id}
                      onClick={() => setSelectedAccountId(account.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap ${
                        selectedAccountId === account.id
                          ? 'text-white shadow-md'
                          : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                      }`}
                      style={{
                        backgroundColor: selectedAccountId === account.id ? account.color : undefined
                      }}
                    >
                      <span className="text-lg">{iconData?.icon || '💳'}</span>
                      <span>{account.accountName}</span>
                      <span className="text-xs opacity-80">
                        {formatCurrency(Number(account.balance))}
                      </span>
                    </button>
                  );
                })}

                {/* Botão Adicionar Nova Conta */}
                <button
                  onClick={() => setIsCreateAccountModalOpen(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all whitespace-nowrap bg-white text-indigo-600 hover:bg-indigo-50 border-2 border-dashed border-indigo-300 hover:border-indigo-500"
                >
                  <Plus className="w-4 h-4" />
                  Nova Conta
                </button>
              </div>
            </div>

            {/* Insights Inteligentes - TDAH Friendly */}
            {monthlyIncome > 0 && (
              <div className="mb-4">
                <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${
                  isHealthyFinance ? 'bg-green-50 border-green-200' : 
                  isWarningFinance ? 'bg-orange-50 border-orange-200' : 
                  'bg-red-50 border-red-200'
                }`}>
                  {/* Status Icon */}
                  <div className={`flex-shrink-0 w-16 h-16 rounded-full flex items-center justify-center ${
                    isHealthyFinance ? 'bg-green-100' : 
                    isWarningFinance ? 'bg-orange-100' : 
                    'bg-red-100'
                  }`}>
                    <span className="text-4xl">
                      {isHealthyFinance ? '🎉' : isWarningFinance ? '⚠️' : '🚨'}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xl font-bold ${
                        isHealthyFinance ? 'text-green-700' : 
                        isWarningFinance ? 'text-orange-700' : 
                        'text-red-700'
                      }`}>
                        {savingsRate.toFixed(0)}%
                      </span>
                      <span className={`text-sm font-medium px-2 py-0.5 rounded-full ${
                        isHealthyFinance ? 'bg-green-200 text-green-800' : 
                        isWarningFinance ? 'bg-orange-200 text-orange-800' : 
                        'bg-red-200 text-red-800'
                      }`}>
                        {isHealthyFinance ? 'Saudável ✓' : isWarningFinance ? 'Atenção' : 'Crítico'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 font-medium">
                      {isHealthyFinance && 'Excelente! Continue economizando assim 🚀'}
                      {isWarningFinance && 'Tente economizar mais 20% ao mês'}
                      {isDangerFinance && 'Revise seus gastos urgentemente!'}
                    </p>
                  </div>

                  {/* Daily Budget */}
                  <div className={`flex-shrink-0 text-right px-4 py-2 rounded-lg ${
                    isHealthyFinance ? 'bg-white/50' : 
                    isWarningFinance ? 'bg-white/50' : 
                    'bg-white/50'
                  }`}>
                    <p className="text-xs text-gray-600 font-medium mb-0.5">Pode gastar/dia</p>
                    <p className="text-lg font-bold text-gray-900">{formatCurrency(canSpendPerDay)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Saldo Total</p>
                      <p className="text-2xl font-bold text-foreground">
                        {formatCurrency(totalBalance)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {accounts.length} {accounts.length === 1 ? 'conta' : 'contas'}
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                      <Wallet className="w-6 h-6 text-indigo-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Receitas (Mês)</p>
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(monthlyIncome)}
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        ↑ Entradas
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                      <TrendingUp className="w-6 h-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Despesas (Mês)</p>
                      <p className="text-2xl font-bold text-red-600">
                        {formatCurrency(monthlyExpense)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Média: {formatCurrency(averageDailyExpense)}/dia
                      </p>
                    </div>
                    <div className="w-12 h-12 rounded-lg bg-red-100 flex items-center justify-center">
                      <TrendingDown className="w-6 h-6 text-red-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">Taxa de Poupança</p>
                      <p className={`text-2xl font-bold ${isHealthyFinance ? 'text-green-600' : isWarningFinance ? 'text-orange-600' : 'text-red-600'}`}>
                        {savingsRate.toFixed(1)}%
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {isHealthyFinance ? '✓ Saudável' : isWarningFinance ? '⚠ Atenção' : '⚠ Crítico'}
                      </p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isHealthyFinance ? 'bg-green-100' : isWarningFinance ? 'bg-orange-100' : 'bg-red-100'}`}>
                      <DollarSign className={`w-6 h-6 ${isHealthyFinance ? 'text-green-600' : isWarningFinance ? 'text-orange-600' : 'text-red-600'}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Transactions and Categories Section - Side by Side */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Transactions Section */}
              <Card>
                <CardHeader className="flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <CardTitle>Transações Recentes</CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      leftIcon={<Plus className="w-4 h-4" />}
                      onClick={() => setIsModalOpen(true)}
                    >
                      Nova Transação
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  {filteredTransactions.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      Nenhuma transação registrada
                    </p>
                  ) : (
                    <div className="overflow-y-auto pr-2" style={{ maxHeight: '400px' }}>
                      <div className="space-y-2">
                        {filteredTransactions.slice(0, 10).map((transaction) => {
                          const category = categories.find(cat => cat.id === transaction.categoryId);
                          return (
                            <div
                              key={transaction.id}
                              className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                            >
                              <div className="flex-1">
                                <p className="font-medium text-foreground">{transaction.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs text-muted-foreground">
                                    {formatDate(transaction.createdAt)} | {formatTime(transaction.createdAt)}
                                  </p>
                                  {category && (
                                    <>
                                      <span className="text-xs text-muted-foreground">•</span>
                                      <div className="flex items-center gap-1">
                                        <span className="text-sm">{category.icon}</span>
                                        <p className="text-xs text-muted-foreground">{category.name}</p>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                              <p className={`font-semibold ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                {transaction.type === TransactionType.INCOME ? '+' : '-'}
                                {formatCurrency(transaction.amount)}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Expenses by Category Section */}
              <ExpensesByCategory 
                filteredTransactions={filteredTransactions}
                accountName={
                  selectedAccountId === 'all' 
                    ? 'Todas as Contas' 
                    : accounts.find(acc => acc.id === selectedAccountId)?.accountName
                }
              />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
              <Button
                variant="primary"
                className="w-full"
                onClick={() => setLocation('/accounts')}
              >
                Gerenciar Contas
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setLocation('/transactions')}
              >
                Registrar Transação
              </Button>
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setLocation('/investments')}
              >
                Ver Investimentos
              </Button>
            </div>
          </>
        )}
      </main>

      {/* Create Transaction Modal */}
      <CreateTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleTransactionCreated}
      />

      {/* Create Account Modal */}
      <Modal
        isOpen={isCreateAccountModalOpen}
        onClose={handleCloseAccountModal}
        title="✨ Nova Conta"
        size="md"
      >
        <form onSubmit={handleSubmitAccount(onSubmitAccount)} className="space-y-5">
          {/* Account Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-semibold text-foreground mb-2">
              Nome da Conta
            </label>
            <Input
              id="name"
              placeholder="Ex: Nubank, Carteira, Poupança"
              {...registerAccount('name')}
              error={errorsAccount.name}
              className="text-lg"
            />
          </div>

          {/* Icon Selector - Visual */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Escolha um Ícone
            </label>
            <div className="grid grid-cols-5 gap-2">
              {ACCOUNT_ICONS.map((iconOption) => (
                <button
                  key={iconOption.value}
                  type="button"
                  onClick={() => setAccountValue('icon', iconOption.value)}
                  className={`p-4 rounded-xl border-2 transition-all hover:scale-110 ${
                    selectedIcon === iconOption.value
                      ? 'border-indigo-500 bg-indigo-50 shadow-md'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">{iconOption.icon}</span>
                </button>
              ))}
            </div>
            {errorsAccount.icon && (
              <p className="text-sm text-red-600 mt-1">{errorsAccount.icon.message}</p>
            )}
          </div>

          {/* Color Selector - Visual */}
          <div>
            <label className="block text-sm font-semibold text-foreground mb-2">
              Escolha uma Cor
            </label>
            <div className="grid grid-cols-4 gap-2">
              {ACCOUNT_COLORS.map((colorOption) => (
                <button
                  key={colorOption.value}
                  type="button"
                  onClick={() => setAccountValue('color', colorOption.value)}
                  className={`h-12 w-20 rounded-xl border-2 transition-all hover:scale-105 ${
                    selectedColor === colorOption.value
                      ? 'border-gray-800 shadow-lg'
                      : 'border-gray-200'
                  }`}
                  style={{ backgroundColor: colorOption.value }}
                  title={colorOption.label}
                >
                  {selectedColor === colorOption.value && (
                    <span className="text-white text-2xl">✓</span>
                  )}
                </button>
              ))}
            </div>
            {errorsAccount.color && (
              <p className="text-sm text-red-600 mt-1">{errorsAccount.color.message}</p>
            )}
          </div>

          {/* Balance Input with Quick Buttons */}
          <div>
            <label htmlFor="balance" className="block text-sm font-semibold text-foreground mb-2">
              Saldo Inicial da Conta
            </label>
            
            {/* Balance Input with Currency Display */}
            <div className="relative pb-3">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-semibold text-lg">
                R$
              </span>
              <input
                id="balance"
                type="text"
                value={balanceInput}
                onChange={handleBalanceChange}
                placeholder="0.00"
                className="w-full pl-12 pr-4 py-3 text-2xl font-bold text-right border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <input type="hidden" {...registerAccount('balance')} />
            </div>
            {errorsAccount.balance && (
              <p className="text-sm text-red-600 mt-1">{errorsAccount.balance.message}</p>
            )}
            
            {/* Quick Add Buttons */}
            <div className="flex gap-2 mb-3">
              <button
                type="button"
                onClick={() => handleQuickBalance(10)}
                className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
              >
                +R$ 10
              </button>
              <button
                type="button"
                onClick={() => handleQuickBalance(100)}
                className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
              >
                +R$ 100
              </button>
              <button
                type="button"
                onClick={() => handleQuickBalance(1000)}
                className="flex-1 py-2 px-3 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 transition-colors"
              >
                +R$ 1000
              </button>
              <button
                type="button"
                onClick={() => {
                  setBalanceInput('0.00');
                  setAccountValue('balance', '0');
                }}
                className="py-2 px-3 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 transition-colors"
                title="Zerar"
              >
                🗑️
              </button>
            </div>

            
          </div>

          {/* Preview Card */}
          {selectedIcon && selectedColor && (
            <div className="p-4 rounded-xl border-2 border-dashed border-gray-300 bg-gray-50">
              <p className="text-xs text-gray-500 mb-2 font-semibold">📱 PREVIEW</p>
              <div className="flex items-center gap-3">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: selectedColor }}
                >
                  <span className="text-2xl">
                    {ACCOUNT_ICONS.find(i => i.value === selectedIcon)?.icon}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800">
                    {watchAccount('name') || 'Nome da Conta'}
                  </p>
                  <p className="text-lg font-bold" style={{ color: selectedColor }}>
                    R$ {balanceInput}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={handleCloseAccountModal}
              disabled={isSubmittingAccount}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={isSubmittingAccount}
              className="min-w-[120px]"
            >
              {isSubmittingAccount ? '⏳ Criando...' : '✨ Criar Conta'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Quick Add Button (FAB) */}
      <QuickAddButton />
    </div>
  );
}
