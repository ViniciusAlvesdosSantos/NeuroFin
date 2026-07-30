import { useMemo } from 'react';
import { formatCurrency } from '@/lib/formatters';
import type { SafeToSpendData } from '@/types';

interface SafeToSpendGaugeProps {
  data: SafeToSpendData;
}

export default function SafeToSpendGauge({ data }: SafeToSpendGaugeProps) {
  const { safeToSpendDaily, dailyUsagePercent, status, daysRemaining } = data;
  
  // SVG semi-circular gauge calculations
  const radius = 80;
  const circumference = Math.PI * radius; // semi-circle
  const usedPercent = Math.min(dailyUsagePercent, 100);
  const strokeDashoffset = circumference - (circumference * usedPercent) / 100;
  
  const colorMap = {
    healthy: { stroke: '#10B981', bg: 'from-emerald-50 to-green-50', text: 'text-emerald-600', glow: 'shadow-emerald-200' },
    warning: { stroke: '#F59E0B', bg: 'from-amber-50 to-orange-50', text: 'text-amber-600', glow: 'shadow-amber-200' },
    danger: { stroke: '#EF4444', bg: 'from-red-50 to-rose-50', text: 'text-red-600', glow: 'shadow-red-200' },
  };
  
  const colors = colorMap[status];
  const emoji = status === 'healthy' ? '😊' : status === 'warning' ? '😐' : '😰';

  return (
    <div className={`relative bg-gradient-to-br ${colors.bg} rounded-2xl p-6 border border-white/60 shadow-lg ${colors.glow} animate-fade-in-up`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Valor Seguro Hoje</p>
          <p className="text-xs text-gray-400 mt-0.5">{daysRemaining} dias restantes no mês</p>
        </div>
        <span className="text-3xl">{emoji}</span>
      </div>
      
      {/* Gauge SVG */}
      <div className="flex justify-center my-4">
        <div className="relative">
          <svg width="200" height="110" viewBox="0 0 200 110">
            {/* Background track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke="#e5e7eb"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Filled track */}
            <path
              d="M 20 100 A 80 80 0 0 1 180 100"
              fill="none"
              stroke={colors.stroke}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={`${circumference}`}
              strokeDashoffset={strokeDashoffset}
              className="animate-gauge-fill transition-all duration-1000"
              style={{ '--gauge-value': strokeDashoffset } as React.CSSProperties}
            />
          </svg>
          
          {/* Center value */}
          <div className="absolute inset-0 flex items-end justify-center pb-2">
            <div className="text-center">
              <p className={`text-3xl font-bold font-currency ${colors.text}`}>
                {formatCurrency(safeToSpendDaily)}
              </p>
              <p className="text-xs text-gray-500 font-medium mt-1">por dia</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Usage bar */}
      <div className="mt-2">
        <div className="flex justify-between items-center mb-1.5">
          <span className="text-xs text-gray-500">Consumo diário</span>
          <span className={`text-xs font-bold font-currency ${colors.text}`}>
            {usedPercent.toFixed(0)}%
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${usedPercent}%`,
              backgroundColor: colors.stroke,
            }}
          />
        </div>
      </div>
    </div>
  );
}
