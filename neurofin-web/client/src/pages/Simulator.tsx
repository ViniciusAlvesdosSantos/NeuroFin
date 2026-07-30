import { useState, useMemo } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { formatCurrency } from '@/lib/formatters';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent } from '@/components/ui/Card';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Lightbulb, Zap } from 'lucide-react';
import Header from '@/components/Header';
import { toast } from 'sonner';

export default function Simulator() {
  const { isAuthenticated, isLoading: isAuthLoading } = useRequireAuth();
  const [monthlySaving, setMonthlySaving] = useState(200);
  const [monthlyCutting, setMonthlyCutting] = useState(100);
  const [annualReturn, setAnnualReturn] = useState(12); // % ao ano

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }
  if (!isAuthenticated) return null;

  const totalMonthly = monthlySaving + monthlyCutting;
  const monthlyRate = annualReturn / 100 / 12;

  // Generate projection data (1-10 years)
  const projectionData = useMemo(() => {
    const data = [];
    for (let year = 0; year <= 10; year++) {
      const months = year * 12;
      
      // Without investing (just saving)
      const simpleSaving = totalMonthly * months;
      
      // With compound interest
      let invested = 0;
      for (let m = 0; m < months; m++) {
        invested = (invested + totalMonthly) * (1 + monthlyRate);
      }
      
      data.push({
        year: `${year}a`,
        label: year === 0 ? 'Hoje' : `${year} ${year === 1 ? 'ano' : 'anos'}`,
        simples: Math.round(simpleSaving),
        investido: Math.round(invested),
        ganho: Math.round(invested - simpleSaving),
      });
    }
    return data;
  }, [totalMonthly, monthlyRate]);

  // Insights
  const final10y = projectionData[10];
  const ifoodInsight = monthlyCutting >= 50
    ? `Uau! R$ ${monthlyCutting}/mês a menos em gastos = +${formatCurrency(final10y.investido - projectionData[0].investido)} em 10 anos!`
    : null;

  const insights = useMemo(() => {
    const items = [];
    
    if (final10y.ganho > 0) {
      items.push({
        icon: '💰',
        text: `Seus investimentos renderiam ${formatCurrency(final10y.ganho)} em juros compostos!`,
        color: 'emerald',
      });
    }
    
    if (totalMonthly >= 500) {
      items.push({
        icon: '🚀',
        text: `Com ${formatCurrency(totalMonthly)}/mês, em 5 anos você terá ${formatCurrency(projectionData[5].investido)}!`,
        color: 'blue',
      });
    }
    
    if (monthlyCutting > 0) {
      const extraIn10y = monthlyCutting * 12 * 10;
      items.push({
        icon: '✂️',
        text: `Cortando ${formatCurrency(monthlyCutting)}/mês, são ${formatCurrency(extraIn10y)} a mais em 10 anos (sem juros)!`,
        color: 'amber',
      });
    }

    return items;
  }, [final10y, totalMonthly, monthlyCutting, projectionData]);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 backdrop-blur-sm rounded-xl border border-gray-200 shadow-xl p-4 min-w-[200px]">
          <p className="text-sm font-bold text-gray-900 mb-2">{payload[0]?.payload?.label}</p>
          <div className="space-y-1.5">
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Investido:</span>
              <span className="text-sm font-bold font-currency text-indigo-600">
                {formatCurrency(payload[0]?.value || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <span className="text-xs text-gray-500">Simples:</span>
              <span className="text-sm font-medium font-currency text-gray-600">
                {formatCurrency(payload[1]?.value || 0)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-4 pt-1 border-t border-gray-100">
              <span className="text-xs text-emerald-600 font-medium">Juros ganhos:</span>
              <span className="text-sm font-bold font-currency text-emerald-600">
                +{formatCurrency((payload[0]?.value || 0) - (payload[1]?.value || 0))}
              </span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header showBalance={true} />

      <main className="container py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <span className="text-4xl">🔮</span>
            Simulador de Futuro
          </h1>
          <p className="text-muted-foreground mt-1">
            Veja como pequenas mudanças hoje impactam seu futuro
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sliders Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Saving Slider */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3">
                <div className="flex items-center gap-2 text-white">
                  <TrendingUp className="w-4 h-4" />
                  <p className="text-sm font-semibold">Poupar a mais</p>
                </div>
              </div>
              <CardContent className="pt-5">
                <p className="text-sm text-gray-500 mb-2">E se eu poupar a mais por mês?</p>
                <p className="text-3xl font-bold font-currency text-emerald-600 mb-4">
                  {formatCurrency(monthlySaving)}
                </p>
                <Slider
                  value={[monthlySaving]}
                  onValueChange={(val) => setMonthlySaving(val[0])}
                  min={0}
                  max={5000}
                  step={50}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400 font-currency">
                  <span>R$ 0</span>
                  <span>R$ 5.000</span>
                </div>
              </CardContent>
            </Card>

            {/* Cutting Slider */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-5 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Zap className="w-4 h-4" />
                  <p className="text-sm font-semibold">Cortar gastos</p>
                </div>
              </div>
              <CardContent className="pt-5">
                <p className="text-sm text-gray-500 mb-2">E se eu cortar gastos supérfluos?</p>
                <p className="text-3xl font-bold font-currency text-amber-600 mb-4">
                  {formatCurrency(monthlyCutting)}
                </p>
                <Slider
                  value={[monthlyCutting]}
                  onValueChange={(val) => setMonthlyCutting(val[0])}
                  min={0}
                  max={3000}
                  step={25}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400 font-currency">
                  <span>R$ 0</span>
                  <span>R$ 3.000</span>
                </div>
              </CardContent>
            </Card>

            {/* Return Rate */}
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-indigo-500 to-purple-500 px-5 py-3">
                <div className="flex items-center gap-2 text-white">
                  <Lightbulb className="w-4 h-4" />
                  <p className="text-sm font-semibold">Rentabilidade</p>
                </div>
              </div>
              <CardContent className="pt-5">
                <p className="text-sm text-gray-500 mb-2">Retorno anual esperado</p>
                <p className="text-3xl font-bold font-currency text-indigo-600 mb-4">
                  {annualReturn}% a.a.
                </p>
                <Slider
                  value={[annualReturn]}
                  onValueChange={(val) => setAnnualReturn(val[0])}
                  min={0}
                  max={30}
                  step={0.5}
                />
                <div className="flex justify-between mt-2 text-xs text-gray-400">
                  <span>0%</span>
                  <span>30%</span>
                </div>
              </CardContent>
            </Card>

            {/* Total Monthly */}
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-100">
              <p className="text-xs text-indigo-600/60 font-medium uppercase tracking-wider mb-1">
                Total Mensal
              </p>
              <p className="text-3xl font-bold font-currency text-indigo-700">
                {formatCurrency(totalMonthly)}
              </p>
              <p className="text-xs text-indigo-500 mt-1">
                Poupança + Corte de gastos
              </p>
            </div>
          </div>

          {/* Chart Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Chart */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">Projeção de Patrimônio</h3>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-indigo-500" />
                      <span className="text-gray-500">Com juros</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-gray-300" />
                      <span className="text-gray-500">Sem juros</span>
                    </div>
                  </div>
                </div>
                
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={projectionData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                      <defs>
                        <linearGradient id="colorInvestido" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="colorSimples" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#D1D5DB" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#D1D5DB" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="year"
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <YAxis
                        tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`}
                        tick={{ fontSize: 12, fill: '#9ca3af' }}
                        axisLine={false}
                        tickLine={false}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Area
                        type="monotone"
                        dataKey="investido"
                        stroke="#6366F1"
                        strokeWidth={3}
                        fill="url(#colorInvestido)"
                        animationDuration={1500}
                      />
                      <Area
                        type="monotone"
                        dataKey="simples"
                        stroke="#D1D5DB"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        fill="url(#colorSimples)"
                        animationDuration={1500}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Results Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Em 1 ano</p>
                <p className="text-xl font-bold font-currency text-gray-900">
                  {formatCurrency(projectionData[1]?.investido || 0)}
                </p>
              </div>
              <div className="bg-white rounded-2xl border border-gray-100 p-5 text-center">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-1">Em 5 anos</p>
                <p className="text-xl font-bold font-currency text-indigo-600">
                  {formatCurrency(projectionData[5]?.investido || 0)}
                </p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-5 text-center text-white">
                <p className="text-xs text-white/60 font-medium uppercase tracking-wider mb-1">Em 10 anos</p>
                <p className="text-xl font-bold font-currency">
                  {formatCurrency(projectionData[10]?.investido || 0)}
                </p>
                <p className="text-xs text-white/60 mt-1 font-currency">
                  +{formatCurrency(projectionData[10]?.ganho || 0)} em juros
                </p>
              </div>
            </div>

            {/* Insights */}
            {insights.length > 0 && (
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-amber-500" />
                  Insights
                </h3>
                {insights.map((insight, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 bg-white rounded-xl border border-gray-100 animate-fade-in-up"
                    style={{ animationDelay: `${i * 150}ms` }}
                  >
                    <span className="text-2xl flex-shrink-0">{insight.icon}</span>
                    <p className="text-sm text-gray-700 font-medium leading-relaxed">
                      {insight.text}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
