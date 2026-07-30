import { useEffect, useState, useMemo } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { useTransactionStore } from '@/stores/useTransactionStore';
import { useCategoryStore } from '@/stores/useCategoryStore';
import { useAnalyticsStore } from '@/stores/useAnalyticsStore';
import { Button } from '@/components/ui/Button';
import { formatCurrency, formatDate, formatTime } from '@/lib/formatters';
import { TransactionType } from '@/types';
import { ArrowUpRight, ArrowDownRight, Target, LayoutGrid, Eye, EyeOff, Plus, Receipt, Landmark } from 'lucide-react';
import { useLocation } from 'wouter';
import { toast } from 'sonner';
import { ACCOUNT_ICONS } from '@/lib/constants';
import QuickAddTransaction from '@/components/QuickAddTransaction';
import QuickAddAccount from '@/components/QuickAddAccount';
import Header from '@/components/Header';
import QuickAddButton from '@/components/QuickAddButton';
import ExpensesByCategory from '@/components/ExpensesByCategory';
import SafeToSpendGauge from '@/components/SafeToSpendGauge';
import ForgivenessModal from '@/components/ForgivenessModal';
import { DashboardSkeleton } from '@/components/Skeletons';
import { Modal, ModalFooter } from '@/components/ui/Modal';

export default function Dashboard() {
  const { isAuthenticated, isLoading: isAuthLoading } = useRequireAuth();
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const { accounts, fetchAccounts } = useAccountStore();
  const { transactions, fetchTransactions } = useTransactionStore();
  const { categories, fetchCategories } = useCategoryStore();
  const { safeToSpend, lastActivity, fetchSafeToSpend, fetchLastActivity, updateLastLogin } = useAnalyticsStore();
  
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [transactionDefaultType, setTransactionDefaultType] = useState<TransactionType | undefined>(undefined);
  const [isCreateAccountModalOpen, setIsCreateAccountModalOpen] = useState(false);

  const openTransactionModal = (type?: TransactionType) => {
    setTransactionDefaultType(type);
    setIsModalOpen(true);
  };
  const [balanceHidden, setBalanceHidden] = useState(true);
  
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null);
  const [isTransactionDetailsOpen, setIsTransactionDetailsOpen] = useState(false);
  const [showForgiveness, setShowForgiveness] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        await Promise.all([
          fetchAccounts(),
          fetchTransactions(),
          fetchCategories(),
          fetchSafeToSpend(),
          fetchLastActivity(),
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
  }, [isAuthenticated, fetchAccounts, fetchTransactions, fetchCategories, fetchSafeToSpend, fetchLastActivity]);

  useEffect(() => {
    if (lastActivity?.isAbsent) {
      setShowForgiveness(true);
    } else if (lastActivity && !lastActivity.isAbsent) {
      updateLastLogin();
    }
  }, [lastActivity, updateLastLogin]);

  // Greeting & Date Logic
  const { greeting, greetingIcon, currentDateFormatted } = useMemo(() => {
    const currentHour = new Date().getHours();
    let greeting = 'Bom dia';
    let greetingIcon = '☀️';
    if (currentHour >= 12 && currentHour < 18) {
      greeting = 'Boa tarde';
      greetingIcon = '⛅';
    } else if (currentHour >= 18) {
      greeting = 'Boa noite';
      greetingIcon = '🌙';
    }

    const currentDateFormatted = new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).format(new Date());

    return { greeting, greetingIcon, currentDateFormatted };
  }, []);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const monthlyIncome = transactions
    .filter((t) => t.type === TransactionType.INCOME)
    .reduce((sum, t) => sum + Number(t.amount), 0);
  const monthlyExpense = transactions
    .filter((t) => t.type === TransactionType.EXPENSE)
    .reduce((sum, t) => sum + Number(t.amount), 0);

  return (
    <div className="min-h-screen bg-background pb-24">
      <Header showBalance={false} />

      {/* Forgiveness Modal */}
      <ForgivenessModal
        isOpen={showForgiveness}
        daysSince={lastActivity?.daysSinceLastLogin || 0}
        onComplete={() => { setShowForgiveness(false); fetchAccounts(); fetchTransactions(); fetchSafeToSpend(); }}
        onSkip={() => setShowForgiveness(false)}
      />

      <main className="container -mt-4">
        {isLoading ? (
          <div className="pt-8"><DashboardSkeleton /></div>
        ) : (
          <>
            {/* TOP BAR (ORGANIZZE STYLE) */}
            <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm animate-fade-in-up">
              <div>
                <p className="text-muted-foreground text-lg mb-1">{greeting},</p>
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {user?.name?.split(' ')[0]}! <span className="text-2xl">{greetingIcon}</span>
                </h1>
                <p className="text-sm font-medium text-muted-foreground mt-2 capitalize">{currentDateFormatted}</p>
              </div>

              <div className="flex items-center gap-6 md:gap-12 md:pl-12 md:border-l border-border">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">receita mensal</p>
                  <p className="text-2xl font-bold text-emerald-600 font-currency">{formatCurrency(monthlyIncome)}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">despesa mensal</p>
                  <p className="text-2xl font-bold text-rose-600 font-currency">{formatCurrency(monthlyExpense)}</p>
                </div>
              </div>
            </div>

            {/* QUICK ACTIONS ROW */}
            <div className="flex gap-3 overflow-x-auto pb-4 mb-4 hide-scrollbar snap-x">
              <button onClick={() => openTransactionModal(TransactionType.INCOME)} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <ArrowUpRight className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground pr-2">Receber</span>
              </button>
              <button onClick={() => openTransactionModal(TransactionType.EXPENSE)} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center">
                  <ArrowDownRight className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground pr-2">Pagar</span>
              </button>
              <button onClick={() => setLocation('/goals')} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-primary/15 text-primary flex items-center justify-center">
                  <Target className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground pr-2">Metas</span>
              </button>
              <button onClick={() => setLocation('/accounts')} className="snap-start flex-shrink-0 flex items-center gap-2 px-4 py-2.5 bg-card border border-border rounded-xl hover:bg-muted/50 transition-colors shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center">
                  <Landmark className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold text-foreground pr-2">Contas</span>
              </button>
            </div>

            {/* MAIN CONTENT GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* LEFT COLUMN: Saldo e Contas */}
              <div className="space-y-8">
                
                {/* Saldo Geral */}
                <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                    <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Saldo geral</h3>
                  </div>
                  <div className="flex items-center gap-4 ml-4">
                    <p className="text-3xl md:text-4xl font-bold font-currency text-foreground tracking-tight">
                      {balanceHidden ? '••••••' : formatCurrency(totalBalance)}
                    </p>
                    <button onClick={() => setBalanceHidden(!balanceHidden)} className="text-muted-foreground hover:text-foreground transition-colors p-1">
                      {balanceHidden ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Minhas Contas (Vertical List) */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-foreground text-lg">Minhas contas</h3>
                    <Button variant="ghost" size="sm" onClick={() => setIsCreateAccountModalOpen(true)} className="h-8 text-xs font-semibold text-primary">
                      + Nova Conta
                    </Button>
                  </div>
                  
                  {accounts.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-muted-foreground">Você ainda não tem contas cadastradas.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {accounts.map((account) => {
                        const iconData = ACCOUNT_ICONS.find(i => i.value === account.icon);
                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group cursor-pointer"
                            onClick={() => setLocation('/accounts')}
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl" style={{ backgroundColor: `${account.color}15`, color: account.color }}>
                                {iconData?.icon || '💳'}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm group-hover:text-primary transition-colors">{account.accountName}</p>
                                <p className="text-xs text-muted-foreground font-medium mt-0.5">Conta {account.status === 'ACTIVE' ? 'ativa' : 'inativa'}</p>
                              </div>
                            </div>
                            <p className="font-bold font-currency text-primary">
                              {balanceHidden ? '••••' : formatCurrency(Number(account.balance))}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <ExpensesByCategory />

              </div>

              {/* RIGHT COLUMN: Safe To Spend & Transações */}
              <div className="space-y-8">
                
                {safeToSpend && <SafeToSpendGauge data={safeToSpend} />}

                {/* Últimas Transações */}
                <div className="bg-card rounded-2xl border border-border shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-bold text-foreground text-lg">Últimas Lançamentos</h3>
                    <Button variant="ghost" size="sm" onClick={() => setLocation('/transactions')} className="h-8 text-xs font-semibold text-primary">
                      Ver histórico
                    </Button>
                  </div>

                  {transactions.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-14 h-14 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                        <Receipt className="w-6 h-6 text-muted-foreground" />
                      </div>
                      <p className="text-sm font-medium text-foreground">Nenhuma transação</p>
                      <p className="text-xs text-muted-foreground mt-1">Sua movimentação aparecerá aqui.</p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {transactions.slice(0, 5).map((transaction) => {
                        const category = categories.find(cat => cat.id === transaction.categoryId);
                        return (
                          <div
                            key={transaction.id}
                            onClick={() => { setSelectedTransaction(transaction); setIsTransactionDetailsOpen(true); }}
                            className="flex items-center justify-between p-3.5 rounded-xl hover:bg-muted/60 transition-colors cursor-pointer group"
                          >
                            <div className="flex items-center gap-4">
                              <div className="w-11 h-11 rounded-xl bg-accent flex items-center justify-center text-xl shadow-sm border border-border/50">
                                {category ? category.icon : '💸'}
                              </div>
                              <div>
                                <p className="font-semibold text-foreground text-sm line-clamp-1 group-hover:text-primary transition-colors">{transaction.description}</p>
                                <p className="text-xs text-muted-foreground mt-0.5 font-medium">{formatDate(transaction.createdAt)}</p>
                              </div>
                            </div>
                            <p className={`font-bold font-currency text-sm ${transaction.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                              {transaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(transaction.amount)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          </>
        )}
      </main>

      <QuickAddTransaction 
        isOpen={isModalOpen} 
        onClose={() => { setIsModalOpen(false); setTransactionDefaultType(undefined); }} 
        defaultType={transactionDefaultType}
      />
      <QuickAddAccount isOpen={isCreateAccountModalOpen} onClose={() => setIsCreateAccountModalOpen(false)} />
      <QuickAddButton />

      {/* Transaction Details Modal */}
      <Modal isOpen={isTransactionDetailsOpen} onClose={() => { setIsTransactionDetailsOpen(false); setSelectedTransaction(null); }} title="Detalhes da Transação" size="md">
        {selectedTransaction && (
          <div className="space-y-6">
            <div className="text-center py-10 bg-gradient-to-br from-primary/10 to-accent/30 rounded-2xl border-2 border-primary/20 shadow-sm relative overflow-hidden">
               <div className="absolute -top-12 -right-12 w-32 h-32 bg-background/40 rounded-full blur-2xl" />
              <p className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-widest">Valor da Transação</p>
              <p className={`text-5xl font-bold font-currency mb-4 tracking-tight ${selectedTransaction.type === TransactionType.INCOME ? 'text-emerald-600' : 'text-rose-600'}`}>
                {selectedTransaction.type === TransactionType.INCOME ? '+' : '-'}{formatCurrency(selectedTransaction.amount)}
              </p>
              <span className={`inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                selectedTransaction.type === TransactionType.INCOME ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {selectedTransaction.type === TransactionType.INCOME ? '💰 Receita' : '💸 Despesa'}
              </span>
            </div>
            
            <div className="bg-muted/50 rounded-xl p-5 border border-border/50">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Descrição</p>
              <p className="text-lg font-semibold text-foreground">{selectedTransaction.description}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Data</p>
                <p className="text-base font-bold text-foreground">{formatDate(selectedTransaction.createdAt)}</p>
              </div>
              <div className="bg-card border border-border rounded-xl p-5 shadow-sm">
                <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">Horário</p>
                <p className="text-base font-bold text-foreground">{formatTime(selectedTransaction.createdAt)}</p>
              </div>
            </div>
          </div>
        )}
        <ModalFooter>
          <Button variant="secondary" onClick={() => { setIsTransactionDetailsOpen(false); setSelectedTransaction(null); }} className="w-full h-12 text-base">
            Fechar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
