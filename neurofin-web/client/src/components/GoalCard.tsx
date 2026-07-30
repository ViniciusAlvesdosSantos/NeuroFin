import { useState } from 'react';
import { formatCurrency } from '@/lib/formatters';
import type { DreamGoal } from '@/types';
import { Droplets, Calendar, MoreVertical, Trash2, Archive } from 'lucide-react';

interface GoalCardProps {
  goal: DreamGoal;
  onAllocate: (goalId: string) => void;
  onDelete: (goalId: string) => void;
  onArchive: (goalId: string) => void;
}

export default function GoalCard({ goal, onAllocate, onDelete, onArchive }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false);
  
  const percentage = goal.targetAmount > 0
    ? Math.min((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100, 100)
    : 0;
  
  const remaining = Number(goal.targetAmount) - Number(goal.currentAmount);
  
  // Calculate months to goal based on average allocation
  const avgAllocation = goal.allocations.length > 0
    ? goal.allocations.reduce((sum, a) => sum + Number(a.amount), 0) / goal.allocations.length
    : 0;
  const monthsToGoal = avgAllocation > 0 ? Math.ceil(remaining / avgAllocation) : null;
  
  // Deadline proximity
  const deadlineDate = goal.deadline ? new Date(goal.deadline) : null;
  const daysUntilDeadline = deadlineDate
    ? Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div
      className="relative bg-card rounded-2xl border-2 border-border shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden group"
    >
      {/* Header */}
      <div className="p-5 pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shadow-sm"
              style={{ backgroundColor: `${goal.color}15` }}
            >
              {goal.icon}
            </div>
            <div>
              <h3 className="font-bold text-foreground text-lg">{goal.title}</h3>
              {deadlineDate && (
                <div className="flex items-center gap-1 mt-0.5">
                  <Calendar className="w-3 h-3 text-gray-400" />
                  <span className={`text-xs font-medium ${
                    daysUntilDeadline && daysUntilDeadline < 30 ? 'text-orange-500' : 'text-muted-foreground'
                  }`}>
                    {daysUntilDeadline && daysUntilDeadline > 0
                      ? `${daysUntilDeadline} dias restantes`
                      : 'Prazo expirado'}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Menu */}
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1.5 rounded-lg hover:bg-muted transition-colors"
            >
              <MoreVertical className="w-4 h-4 text-muted-foreground" />
            </button>
            {showMenu && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-8 bg-card rounded-xl shadow-xl border border-border py-1 z-20 w-44">
                  <button
                    onClick={() => { onArchive(goal.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
                  >
                    <Archive className="w-4 h-4" /> Arquivar
                  </button>
                  <button
                    onClick={() => { onDelete(goal.id); setShowMenu(false); }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" /> Excluir
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      {/* Fill Container - "Copo Enchendo" */}
      <div className="px-5 py-3">
        <div
          className="relative h-36 rounded-xl overflow-hidden border-2"
          style={{
            borderColor: `${goal.color}30`,
            backgroundColor: `${goal.color}08`,
          }}
        >
          {/* Water/Fill */}
          <div
            className="absolute bottom-0 left-0 right-0 rounded-b-lg transition-all duration-1000 ease-out"
            style={{
              height: `${percentage}%`,
              background: `linear-gradient(180deg, ${goal.color}60 0%, ${goal.color}90 100%)`,
              '--fill-height': `${percentage}%`,
            } as React.CSSProperties}
          >
            {/* Shimmer effect on water */}
            <div className="absolute inset-0 animate-shimmer opacity-40" />
            
            {/* Wave effect at top */}
            <svg
              className="absolute -top-1 left-0 w-full"
              viewBox="0 0 400 12"
              preserveAspectRatio="none"
              style={{ height: '8px' }}
            >
              <path
                d="M0 6 Q50 0 100 6 T200 6 T300 6 T400 6 V12 H0 Z"
                fill={`${goal.color}60`}
              />
            </svg>
          </div>
          
          {/* Center percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <p
                className="text-4xl font-bold font-currency"
                style={{ color: percentage > 50 ? '#fff' : goal.color }}
              >
                {percentage.toFixed(0)}%
              </p>
              <Droplets
                className="w-5 h-5 mx-auto mt-1"
                style={{ color: percentage > 50 ? '#ffffffcc' : `${goal.color}80` }}
              />
            </div>
          </div>
        </div>
      </div>
      
      {/* Values */}
      <div className="px-5 pt-2 pb-3">
        <div className="flex justify-between items-end">
          <div>
            <p className="text-xs text-muted-foreground font-medium">Acumulado</p>
            <p className="text-lg font-bold font-currency" style={{ color: goal.color }}>
              {formatCurrency(Number(goal.currentAmount))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground font-medium">Meta</p>
            <p className="text-lg font-bold font-currency text-foreground">
              {formatCurrency(Number(goal.targetAmount))}
            </p>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full mt-3 overflow-hidden border border-border">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${percentage}%`,
              backgroundColor: goal.color,
            }}
          />
        </div>
        
        {/* Projection */}
        {monthsToGoal && (
          <p className="text-xs text-muted-foreground mt-2 text-center italic">
            No seu ritmo atual, você alcança em ~{monthsToGoal} {monthsToGoal === 1 ? 'mês' : 'meses'}
          </p>
        )}
      </div>
      
      {/* Allocate Button */}
      <div className="px-5 pb-5">
        <button
          onClick={() => onAllocate(goal.id)}
          className="w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-md active:scale-[0.98]"
          style={{
            backgroundColor: `${goal.color}15`,
            color: goal.color,
            border: `1.5px solid ${goal.color}30`,
          }}
        >
          💰 Guardar Dinheiro
        </button>
      </div>
    </div>
  );
}
