import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Check,
  TrendingDown,
  TrendingUp,
  ArrowRightLeft,
  WalletCards,
  ChevronLeft,
} from 'lucide-react';

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
  preSelectedAccountId?: string;
  defaultType?: TransactionType;
}

export default function QuickAddTransaction({
  isOpen,
  onClose,
  preSelectedAccountId,
  defaultType,
}: QuickAddTransactionProps) {
  const [step, setStep] = useState(1);
  const [type, setType] = useState<TransactionType>(
    TransactionType.EXPENSE
  );
  const [amount, setAmount] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [accountId, setAccountId] = useState('');
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { createTransaction, fetchTransactions } = useTransactionStore();
  const { accounts, fetchAccounts } = useAccountStore();
  const { categories, fetchCategories } = useCategoryStore();

  useEffect(() => {
    if (!isOpen) return;

    fetchAccounts();
    fetchCategories();

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
  }, [
    isOpen,
    fetchAccounts,
    fetchCategories,
    preSelectedAccountId,
    defaultType,
  ]);

  const filteredCategories = categories.filter(
    (cat) => cat.type === type
  );

  const activeAccounts = accounts.filter(
    (acc) => !acc.status || acc.status === 'ACTIVE'
  );

  const selectedAccount =
    accounts.find((account) => account.id === accountId) ||
    activeAccounts[0];

  useEffect(() => {
    if (preSelectedAccountId) {
      setAccountId(preSelectedAccountId);
      return;
    }

    if (!accountId && activeAccounts.length > 0) {
      setAccountId(activeAccounts[0].id);
    }
  }, [activeAccounts, accountId, preSelectedAccountId]);

  const typeConfig = {
    [TransactionType.EXPENSE]: {
      label: 'Gasto',
      verb: 'Gastei',
      description: 'Registrar uma saída',
      icon: TrendingDown,
      color: 'text-rose-600',
      bg: 'bg-rose-500/10',
      selected: 'border-rose-500 bg-rose-500/[0.07]',
    },

    [TransactionType.INCOME]: {
      label: 'Receita',
      verb: 'Recebi',
      description: 'Registrar uma entrada',
      icon: TrendingUp,
      color: 'text-emerald-600',
      bg: 'bg-emerald-500/10',
      selected: 'border-emerald-500 bg-emerald-500/[0.07]',
    },

    [TransactionType.INVESTMENT]: {
      label: 'Investimento',
      verb: 'Investi',
      description: 'Registrar um investimento',
      icon: TrendingUp,
      color: 'text-blue-600',
      bg: 'bg-blue-500/10',
      selected: 'border-blue-500 bg-blue-500/[0.07]',
    },

    [TransactionType.TRANSFER]: {
      label: 'Transferência',
      verb: 'Transferi',
      description: 'Mover dinheiro entre contas',
      icon: ArrowRightLeft,
      color: 'text-violet-600',
      bg: 'bg-violet-500/10',
      selected: 'border-violet-500 bg-violet-500/[0.07]',
    },
  };

  const currentConfig = typeConfig[type];
  const CurrentIcon = currentConfig.icon;

  const formattedAmount = amount
    ? Number(amount).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })
    : '0,00';

  const handleAmountChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = event.target.value;

    if (!/^\d*[.,]?\d{0,2}$/.test(value)) {
      return;
    }

    setAmount(value.replace(',', '.'));
  };

  const addQuickAmount = (value: number) => {
    const current = Number(amount) || 0;
    setAmount((current + value).toFixed(2));
  };

  const handleSubmit = async () => {
    const parsedAmount = parseFloat(amount);

    if (!amount || Number.isNaN(parsedAmount) || parsedAmount <= 0) {
      toast.error('Informe um valor válido.');
      return;
    }

    const catId = String(categoryId || '').trim();
    const accId = String(accountId || '').trim();

    if (!catId) {
      toast.error('Selecione uma categoria.');
      return;
    }

    if (!accId) {
      toast.error('Selecione uma conta.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        description: description.trim() || 'Registro rápido',
        amount: parsedAmount,
        date: new Date().toISOString(),
        type,
        categoryId: catId,
        accountId: accId,
      };

      await createTransaction(payload);

      const category = categories.find(
        (category) => category.id === categoryId
      );

      toast.success('Transação registrada', {
        description: `${category?.icon || '💰'} ${
          category?.name || ''
        } • R$ ${parsedAmount.toFixed(2)}`,
      });

      await fetchTransactions();
      await fetchAccounts();

      reset();
    } catch (error: any) {
      console.error('Erro ao criar transação:', error);

      const message =
        error?.response?.data?.message ||
        error?.message ||
        'Erro ao registrar transação';

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

  const selectType = (selectedType: TransactionType) => {
    setType(selectedType);
    setCategoryId('');
    setStep(2);
  };

  const goBack = () => {
    if (step === 3) {
      setStep(2);
      return;
    }

    if (step === 2 && !defaultType) {
      setStep(1);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={reset}
            className="
              fixed inset-0 z-[100]
              bg-black/50
              backdrop-blur-md
            "
          />

          {/* Modal */}
          <div className="
            fixed inset-0 z-[101]
            flex items-end justify-center
            sm:items-center sm:p-6
            pointer-events-none
          ">
            <motion.div
              initial={{
                opacity: 0,
                y: 40,
                scale: 0.98,
              }}
              animate={{
                opacity: 1,
                y: 0,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                y: 30,
                scale: 0.98,
              }}
              transition={{
                duration: 0.25,
                ease: [0.22, 1, 0.36, 1],
              }}
              onClick={(event) => event.stopPropagation()}
              className="
                pointer-events-auto
                relative
                w-full
                sm:max-w-lg
                max-h-[92dvh]
                sm:max-h-[calc(100dvh-48px)]
                overflow-hidden

                rounded-t-[28px]
                sm:rounded-[24px]

                bg-background
                text-foreground

                shadow-2xl
                ring-1 ring-black/5
                dark:ring-white/10

                flex flex-col
              "
            >
              {/* Mobile handle */}
              <div className="flex justify-center pt-3 sm:hidden">
                <div className="
                  h-1.5
                  w-10
                  rounded-full
                  bg-muted-foreground/20
                " />
              </div>

              {/* Header */}
              <div className="
                flex items-center
                gap-3
                px-5 py-4
                sm:px-6 sm:py-5
              ">
                {step > 1 && !defaultType && (
                  <button
                    type="button"
                    onClick={goBack}
                    className="
                      flex size-9 shrink-0
                      items-center justify-center
                      rounded-full
                      bg-muted/60
                      text-muted-foreground
                      transition
                      hover:bg-muted
                      hover:text-foreground
                      active:scale-95
                    "
                    aria-label="Voltar"
                  >
                    <ChevronLeft className="size-5" />
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  <p className="
                    text-xs
                    font-medium
                    text-muted-foreground
                    mb-0.5
                  ">
                    Nova transação
                  </p>

                  <h2 className="
                    text-lg
                    font-semibold
                    tracking-tight
                  ">
                    {step === 1 && 'O que aconteceu?'}
                    {step === 2 && 'Quanto você movimentou?'}
                    {step === 3 && 'Como classificar?'}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={reset}
                  className="
                    flex size-9 shrink-0
                    items-center justify-center
                    rounded-full
                    bg-muted/60
                    text-muted-foreground
                    transition
                    hover:bg-muted
                    hover:text-foreground
                    active:scale-95
                  "
                  aria-label="Fechar"
                >
                  <X className="size-[18px]" />
                </button>
              </div>

              {/* Progress */}
              <div className="px-5 sm:px-6">
                <div className="h-1 w-full rounded-full bg-muted overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    animate={{
                      width: `${(step / 3) * 100}%`,
                    }}
                    transition={{
                      duration: 0.25,
                    }}
                  />
                </div>
              </div>

              {/* Content */}
              <div className="
                flex-1
                min-h-0
                overflow-y-auto
                overscroll-contain
                px-5
                pb-6
                pt-6
                sm:px-6
              ">
                <AnimatePresence mode="wait">
                  {/* STEP 1 */}
                  {step === 1 && (
                    <motion.div
                      key="step-1"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-2"
                    >
                      {Object.entries(typeConfig).map(
                        ([transactionType, config]) => {
                          const Icon = config.icon;

                          return (
                            <button
                              key={transactionType}
                              type="button"
                              onClick={() =>
                                selectType(
                                  transactionType as TransactionType
                                )
                              }
                              className="
                                group
                                w-full
                                flex items-center
                                gap-4
                                rounded-2xl
                                border border-border
                                bg-card
                                p-4
                                text-left
                                transition-all
                                duration-150

                                hover:border-border
                                hover:bg-muted/40
                                hover:shadow-sm

                                active:scale-[0.99]
                              "
                            >
                              <div
                                className={`
                                  flex size-11 shrink-0
                                  items-center justify-center
                                  rounded-xl
                                  ${config.bg}
                                `}
                              >
                                <Icon
                                  className={`
                                    size-5
                                    ${config.color}
                                  `}
                                />
                              </div>

                              <div className="min-w-0 flex-1">
                                <p className="
                                  font-semibold
                                  text-sm
                                ">
                                  {config.verb}
                                </p>

                                <p className="
                                  mt-0.5
                                  text-xs
                                  text-muted-foreground
                                ">
                                  {config.description}
                                </p>
                              </div>

                              <ChevronLeft
                                className="
                                  size-4
                                  rotate-180
                                  text-muted-foreground/40
                                  transition
                                  group-hover:text-muted-foreground
                                "
                              />
                            </button>
                          );
                        }
                      )}
                    </motion.div>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-7"
                    >
                      {/* Selected type */}
                      <div className="
                        flex items-center
                        justify-center
                        gap-2
                      ">
                        <div
                          className={`
                            flex size-8
                            items-center justify-center
                            rounded-lg
                            ${currentConfig.bg}
                          `}
                        >
                          <CurrentIcon
                            className={`
                              size-4
                              ${currentConfig.color}
                            `}
                          />
                        </div>

                        <span className="
                          text-sm
                          font-medium
                          text-muted-foreground
                        ">
                          {currentConfig.label}
                        </span>
                      </div>

                      {/* Amount */}
                      <div className="text-center">
                        <p className="
                          text-xs
                          font-medium
                          uppercase
                          tracking-[0.12em]
                          text-muted-foreground
                          mb-3
                        ">
                          Valor
                        </p>

                        <div className="
                          flex
                          items-baseline
                          justify-center
                          gap-2
                        ">
                          <span className="
                            text-xl
                            font-medium
                            text-muted-foreground
                          ">
                            R$
                          </span>

                          <input
                            type="text"
                            inputMode="decimal"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="0,00"
                            autoFocus
                            className="
                              w-[240px]
                              bg-transparent
                              border-none
                              outline-none
                              text-center
                              text-5xl
                              sm:text-6xl
                              font-bold
                              tracking-[-0.04em]
                              text-foreground
                              placeholder:text-muted-foreground/20
                              focus:ring-0
                            "
                          />
                        </div>

                        <p className="
                          mt-3
                          text-sm
                          text-muted-foreground
                        ">
                          R$ {formattedAmount}
                        </p>
                      </div>

                      {/* Quick values */}
                      <div>
                        <p className="
                          text-xs
                          font-medium
                          text-muted-foreground
                          mb-2.5
                          text-center
                        ">
                          Adicionar rapidamente
                        </p>

                        <div className="
                          flex
                          flex-wrap
                          justify-center
                          gap-2
                        ">
                          {[10, 20, 50, 100, 200].map(
                            (value) => (
                              <button
                                key={value}
                                type="button"
                                onClick={() =>
                                  addQuickAmount(value)
                                }
                                className="
                                  rounded-full
                                  border border-border
                                  bg-background
                                  px-3.5 py-2
                                  text-sm
                                  font-medium
                                  text-muted-foreground
                                  transition
                                  hover:border-primary/40
                                  hover:bg-primary/5
                                  hover:text-primary
                                  active:scale-95
                                "
                              >
                                + R$ {value}
                              </button>
                            )
                          )}
                        </div>
                      </div>

                      {/* Continue */}
                      <Button
                        type="button"
                        onClick={() =>
                          amount &&
                          parseFloat(amount) > 0 &&
                          setStep(3)
                        }
                        disabled={
                          !amount ||
                          parseFloat(amount) <= 0
                        }
                        className="
                          w-full
                          h-12
                          rounded-xl
                          text-sm
                          font-semibold
                        "
                      >
                        Continuar
                      </Button>
                    </motion.div>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 15 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -15 }}
                      transition={{ duration: 0.18 }}
                      className="space-y-6"
                    >
                      {/* Category */}
                      <section>
                        <div className="
                          flex items-center
                          justify-between
                          mb-3
                        ">
                          <label className="
                            text-sm
                            font-semibold
                          ">
                            Categoria
                          </label>

                          <span className="
                            text-xs
                            text-muted-foreground
                          ">
                            {filteredCategories.length} opções
                          </span>
                        </div>

                        {filteredCategories.length === 0 ? (
                          <div className="
                            rounded-2xl
                            border border-dashed
                            border-border
                            py-8
                            text-center
                          ">
                            <p className="
                              text-sm
                              text-muted-foreground
                            ">
                              Nenhuma categoria disponível.
                            </p>

                            <p className="
                              mt-1
                              text-xs
                              text-muted-foreground/70
                            ">
                              Crie uma categoria primeiro.
                            </p>
                          </div>
                        ) : (
                          <div className="
                            grid
                            grid-cols-4
                            gap-2
                            max-h-64
                            overflow-y-auto
                            pr-1
                          ">
                            {filteredCategories.map(
                              (category) => {
                                const selected =
                                  categoryId === category.id;

                                return (
                                  <button
                                    key={category.id}
                                    type="button"
                                    onClick={() =>
                                      setCategoryId(
                                        category.id
                                      )
                                    }
                                    className={`
                                      relative
                                      flex
                                      flex-col
                                      items-center
                                      justify-center
                                      gap-2
                                      min-h-[82px]
                                      rounded-2xl
                                      border
                                      p-2
                                      transition-all
                                      active:scale-95

                                      ${
                                        selected
                                          ? `
                                            border-primary
                                            bg-primary/5
                                            shadow-sm
                                          `
                                          : `
                                            border-transparent
                                            bg-muted/50
                                            hover:bg-muted
                                          `
                                      }
                                    `}
                                  >
                                    {selected && (
                                      <span className="
                                        absolute
                                        right-1.5
                                        top-1.5
                                        flex size-4
                                        items-center
                                        justify-center
                                        rounded-full
                                        bg-primary
                                        text-primary-foreground
                                      ">
                                        <Check
                                          className="size-2.5"
                                          strokeWidth={3}
                                        />
                                      </span>
                                    )}

                                    <span className="text-2xl">
                                      {category.icon}
                                    </span>

                                    <span className="
                                      max-w-full
                                      truncate
                                      text-[11px]
                                      font-medium
                                      text-center
                                    ">
                                      {category.name}
                                    </span>
                                  </button>
                                );
                              }
                            )}
                          </div>
                        )}
                      </section>

                      {/* Account */}
                      {activeAccounts.length > 0 && (
                        <section>
                          <label className="
                            block
                            text-sm
                            font-semibold
                            mb-3
                          ">
                            Conta
                          </label>

                          {preSelectedAccountId ||
                          activeAccounts.length === 1 ? (
                            selectedAccount && (
                              <div className="
                                flex items-center
                                gap-3
                                rounded-2xl
                                border border-border
                                bg-muted/30
                                px-4 py-3
                              ">
                                <div className="
                                  flex size-10
                                  items-center justify-center
                                  rounded-xl
                                  bg-background
                                  border border-border
                                  text-xl
                                ">
                                  {ACCOUNT_ICONS.find(
                                    (icon) =>
                                      icon.value ===
                                      selectedAccount.icon
                                  )?.icon || '💳'}
                                </div>

                                <div className="min-w-0">
                                  <p className="
                                    text-xs
                                    text-muted-foreground
                                  ">
                                    Pagando com
                                  </p>

                                  <p className="
                                    text-sm
                                    font-semibold
                                    truncate
                                  ">
                                    {
                                      selectedAccount.accountName
                                    }
                                  </p>
                                </div>
                              </div>
                            )
                          ) : (
                            <div className="
                              grid
                              grid-cols-2
                              gap-2
                            ">
                              {activeAccounts.map(
                                (account) => {
                                  const selected =
                                    accountId === account.id;

                                  const icon =
                                    ACCOUNT_ICONS.find(
                                      (item) =>
                                        item.value ===
                                        account.icon
                                    )?.icon || '💳';

                                  return (
                                    <button
                                      key={account.id}
                                      type="button"
                                      onClick={() =>
                                        setAccountId(
                                          account.id
                                        )
                                      }
                                      className={`
                                        flex items-center
                                        gap-3
                                        rounded-2xl
                                        border
                                        p-3
                                        text-left
                                        transition

                                        ${
                                          selected
                                            ? `
                                              border-primary
                                              bg-primary/5
                                            `
                                            : `
                                              border-border
                                              hover:bg-muted/50
                                            `
                                        }
                                      `}
                                    >
                                      <span className="text-xl">
                                        {icon}
                                      </span>

                                      <span className="
                                        min-w-0
                                        text-sm
                                        font-medium
                                        truncate
                                      ">
                                        {
                                          account.accountName
                                        }
                                      </span>
                                    </button>
                                  );
                                }
                              )}
                            </div>
                          )}
                        </section>
                      )}

                      {/* No account */}
                      {activeAccounts.length === 0 && (
                        <div className="
                          rounded-2xl
                          border
                          border-amber-500/20
                          bg-amber-500/5
                          px-4 py-3
                        ">
                          <div className="
                            flex items-start
                            gap-3
                          ">
                            <WalletCards className="
                              size-5
                              shrink-0
                              text-amber-600
                            " />

                            <div>
                              <p className="
                                text-sm
                                font-semibold
                              ">
                                Nenhuma conta disponível
                              </p>

                              <p className="
                                mt-0.5
                                text-xs
                                text-muted-foreground
                              ">
                                Crie uma conta antes de
                                registrar uma transação.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Description */}
                      <Input
                        placeholder="Descrição (opcional)"
                        value={description}
                        onChange={(event) =>
                          setDescription(
                            event.target.value
                          )
                        }
                        className="
                          h-11
                          rounded-xl
                        "
                      />

                      {/* Actions */}
                      <div className="
                        flex
                        gap-2
                        pt-1
                      ">
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={goBack}
                          className="
                            h-12
                            rounded-xl
                            px-5
                          "
                        >
                          Voltar
                        </Button>

                        <Button
                          type="button"
                          onClick={handleSubmit}
                          disabled={
                            !categoryId ||
                            !accountId ||
                            isSubmitting ||
                            activeAccounts.length === 0
                          }
                          className="
                            flex-1
                            h-12
                            rounded-xl
                            text-sm
                            font-semibold
                          "
                        >
                          {isSubmitting ? (
                            'Salvando...'
                          ) : (
                            <>
                              <Check className="size-4 mr-2" />
                              Registrar transação
                            </>
                          )}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Footer */}
              <div className="
                shrink-0
                px-5 pb-4 pt-1
                sm:px-6
                text-center
              ">
                <p className="
                  text-[11px]
                  text-muted-foreground/60
                ">
                  {step === 1 &&
                    'Leva poucos segundos para registrar.'}

                  {step === 2 &&
                    'Você poderá escolher a categoria em seguida.'}

                  {step === 3 &&
                    'Tudo certo? Revise e registre sua transação.'}
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}

