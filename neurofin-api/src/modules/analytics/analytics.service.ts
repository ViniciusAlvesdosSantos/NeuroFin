import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { TransactionType } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // SAFE TO SPEND (Valor Seguro Diário)
  // ========================================
  async getSafeToSpend(userId: number) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const daysInMonth = endOfMonth.getDate();
    const currentDay = now.getDate();
    const daysRemaining = daysInMonth - currentDay;

    // 1. Saldo atual de todas as contas
    const accounts = await this.prisma.account.findMany({
      where: { userId, status: 'ACTIVE' },
    });
    const totalBalance = accounts.reduce(
      (sum, acc) => sum + new Decimal(acc.balance.toString()).toNumber(),
      0
    );

    // 2. Receitas do mês (já recebidas)
    const incomeAgg = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.INCOME,
        data: { gte: startOfMonth, lte: now },
      },
      _sum: { amount: true },
    });
    const monthlyIncome = new Decimal(incomeAgg._sum.amount || 0).toNumber();

    // 3. Despesas do mês (já pagas)
    const expenseAgg = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        data: { gte: startOfMonth, lte: now },
      },
      _sum: { amount: true },
    });
    const monthlyExpenses = new Decimal(expenseAgg._sum.amount || 0).toNumber();

    // 4. Valores alocados em metas ativas (não gastar esse dinheiro)
    const goalsAgg = await this.prisma.dreamGoal.aggregate({
      where: { userId, isArchived: false },
      _sum: { currentAmount: true },
    });
    const allocatedToGoals = new Decimal(goalsAgg._sum.currentAmount || 0).toNumber();

    // 5. Cálculo: (Saldo) - (Valores Alocados em Metas)
    const availableBalance = totalBalance - allocatedToGoals;

    // 6. Valor seguro diário (divido pelos dias restantes do mês)
    const safeToSpendDaily = daysRemaining > 0 ? availableBalance / daysRemaining : availableBalance;

    // 7. Porcentagem do orçamento diário consumido
    const idealDailyBudget = monthlyIncome > 0
      ? (monthlyIncome - allocatedToGoals) / daysInMonth
      : 0;
    const todayExpenses = await this.getTodayExpenses(userId);
    const dailyUsagePercent = idealDailyBudget > 0
      ? (todayExpenses / idealDailyBudget) * 100
      : 0;

    // 8. Despesas fixas pendentes (próximas despesas recorrentes)
    // Estimativa: média das despesas dos últimos 3 meses para projetar o restante
    const avgMonthlyExpense = await this.getAverageMonthlyExpense(userId);
    const projectedRemainingExpenses = Math.max(0, avgMonthlyExpense - monthlyExpenses);

    // Status
    let status: 'healthy' | 'warning' | 'danger';
    if (safeToSpendDaily > idealDailyBudget * 0.8) {
      status = 'healthy';
    } else if (safeToSpendDaily > idealDailyBudget * 0.4) {
      status = 'warning';
    } else {
      status = 'danger';
    }

    return {
      safeToSpendDaily: Math.max(0, safeToSpendDaily),
      safeToSpendTotal: Math.max(0, availableBalance),
      totalBalance,
      monthlyIncome,
      monthlyExpenses,
      allocatedToGoals,
      projectedRemainingExpenses,
      todayExpenses,
      dailyUsagePercent: Math.min(dailyUsagePercent, 100),
      daysRemaining,
      daysInMonth,
      currentDay,
      status,
    };
  }

  private async getTodayExpenses(userId: number): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const agg = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        data: { gte: today, lt: tomorrow },
      },
      _sum: { amount: true },
    });

    return new Decimal(agg._sum.amount || 0).toNumber();
  }

  private async getAverageMonthlyExpense(userId: number): Promise<number> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const agg = await this.prisma.transaction.aggregate({
      where: {
        userId,
        type: TransactionType.EXPENSE,
        data: { gte: threeMonthsAgo },
      },
      _sum: { amount: true },
    });

    const totalExpenses = new Decimal(agg._sum.amount || 0).toNumber();
    return totalExpenses / 3;
  }

  // ========================================
  // FRESH START (Modo Perdão - Reset Fresco)
  // ========================================
  async freshStart(userId: number, accountBalances: { accountId: number; realBalance: number }[]) {
    const results: { accountId: number; previousBalance: number; newBalance: number; adjustment: number }[] = [];

    for (const { accountId, realBalance } of accountBalances) {
      const account = await this.prisma.account.findFirst({
        where: { id: accountId, userId },
      });

      if (!account) continue;

      const currentBalance = new Decimal(account.balance.toString());
      const targetBalance = new Decimal(realBalance);
      const difference = targetBalance.sub(currentBalance);

      if (difference.isZero()) continue;

      // Criar transação de ajuste automática
      const adjustmentType = difference.greaterThan(0)
        ? TransactionType.INCOME
        : TransactionType.EXPENSE;

      await this.prisma.$transaction(async (tx) => {
        await tx.transaction.create({
          data: {
            userId,
            accountId,
            description: '🔄 Ajuste de Saldo (Fresh Start)',
            amount: difference.abs().toNumber(),
            type: adjustmentType,
            data: new Date(),
            balanceBefore: currentBalance.toNumber(),
            balanceAfter: targetBalance.toNumber(),
          },
        });

        await tx.account.update({
          where: { id: accountId },
          data: { balance: targetBalance.toNumber() },
        });
      });

      results.push({
        accountId,
        previousBalance: currentBalance.toNumber(),
        newBalance: targetBalance.toNumber(),
        adjustment: difference.toNumber(),
      });
    }

    // Arquivar metas passadas não cumpridas
    const now = new Date();
    await this.prisma.dreamGoal.updateMany({
      where: {
        userId,
        isArchived: false,
        deadline: { lt: now },
      },
      data: { isArchived: true },
    });

    // Atualizar lastLoginAt
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: now },
    });

    return {
      message: 'Fresh Start realizado com sucesso! Bem-vindo de volta!',
      adjustments: results,
    };
  }

  // ========================================
  // ÚLTIMA ATIVIDADE (para Detector de Ausência)
  // ========================================
  async getLastActivity(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { lastLoginAt: true, updatedAt: true },
    });

    const lastLogin = user?.lastLoginAt || user?.updatedAt;
    const daysSinceLastLogin = lastLogin
      ? Math.floor((Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24))
      : null;

    return {
      lastLoginAt: lastLogin,
      daysSinceLastLogin,
      isAbsent: daysSinceLastLogin !== null && daysSinceLastLogin > 14,
    };
  }

  // ========================================
  // ATUALIZAR ÚLTIMO LOGIN
  // ========================================
  async updateLastLogin(userId: number) {
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });
  }
}
