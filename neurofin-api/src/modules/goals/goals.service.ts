import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'src/database/prisma.service';
import { CreateGoalDto } from './dto/create-goal.dto';
import { UpdateGoalDto } from './dto/update-goal.dto';
import { AllocateGoalDto } from './dto/allocate-goal.dto';
import { Decimal } from '@prisma/client/runtime/client';

@Injectable()
export class GoalsService {
  constructor(private readonly prisma: PrismaService) {}

  // ========================================
  // CRIAR META
  // ========================================
  async create(userId: number, dto: CreateGoalDto) {
    return this.prisma.dreamGoal.create({
      data: {
        userId,
        title: dto.title,
        targetAmount: dto.targetAmount,
        deadline: dto.deadline ? new Date(dto.deadline) : null,
        icon: dto.icon || '🎯',
        color: dto.color || '#6366F1',
      },
      include: { allocations: true },
    });
  }

  // ========================================
  // LISTAR METAS
  // ========================================
  async findAll(userId: number, includeArchived = false) {
    return this.prisma.dreamGoal.findMany({
      where: {
        userId,
        ...(includeArchived ? {} : { isArchived: false }),
      },
      include: {
        allocations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ========================================
  // BUSCAR META
  // ========================================
  async findOne(id: string, userId: number) {
    const goal = await this.prisma.dreamGoal.findUnique({
      where: { id },
      include: {
        allocations: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!goal || goal.userId !== userId) {
      throw new NotFoundException('Meta não encontrada');
    }

    return goal;
  }

  // ========================================
  // ATUALIZAR META
  // ========================================
  async update(id: string, userId: number, dto: UpdateGoalDto) {
    await this.findOne(id, userId);

    return this.prisma.dreamGoal.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.targetAmount && { targetAmount: dto.targetAmount }),
        ...(dto.deadline !== undefined && { deadline: dto.deadline ? new Date(dto.deadline) : null }),
        ...(dto.icon && { icon: dto.icon }),
        ...(dto.color && { color: dto.color }),
        ...(dto.isArchived !== undefined && { isArchived: dto.isArchived }),
      },
      include: { allocations: true },
    });
  }

  // ========================================
  // DELETAR META
  // ========================================
  async remove(id: string, userId: number) {
    await this.findOne(id, userId);

    await this.prisma.dreamGoal.delete({ where: { id } });

    return { message: 'Meta deletada com sucesso' };
  }

  // ========================================
  // ALOCAR DINHEIRO NA META
  // ========================================
  async allocate(id: string, userId: number, dto: AllocateGoalDto) {
    const goal = await this.findOne(id, userId);

    const currentAmount = new Decimal(goal.currentAmount.toString());
    const allocAmount = new Decimal(dto.amount);
    const newAmount = currentAmount.add(allocAmount);
    const targetAmount = new Decimal(goal.targetAmount.toString());

    // Verificar se ultrapassa a meta
    if (newAmount.greaterThan(targetAmount)) {
      throw new BadRequestException(
        `Alocação excede a meta. Faltam R$ ${targetAmount.sub(currentAmount).toFixed(2)} para completar.`
      );
    }

    return this.prisma.$transaction(async (tx) => {
      // Criar registro de alocação
      const allocation = await tx.goalAllocation.create({
        data: {
          goalId: id,
          userId,
          amount: dto.amount,
          note: dto.note,
        },
      });

      // Atualizar currentAmount da meta
      const updatedGoal = await tx.dreamGoal.update({
        where: { id },
        data: {
          currentAmount: newAmount.toNumber(),
        },
        include: { allocations: { orderBy: { createdAt: 'desc' }, take: 5 } },
      });

      const percentage = newAmount.div(targetAmount).mul(100).toNumber();

      return {
        goal: updatedGoal,
        allocation,
        percentage: Math.min(percentage, 100),
        milestoneReached: this.checkMilestone(percentage),
      };
    });
  }

  // Verificar marcos (25%, 50%, 75%, 100%)
  private checkMilestone(percentage: number): string | null {
    if (percentage >= 100) return '🎉 META ALCANÇADA! Parabéns!';
    if (percentage >= 75) return '🔥 75%! Quase lá, continue!';
    if (percentage >= 50) return '🚀 Metade do caminho! Excelente progresso!';
    if (percentage >= 25) return '💪 25% conquistado! Ótimo início!';
    return null;
  }
}
