import { useEffect, useState } from 'react';
import { useRequireAuth } from '@/hooks/useAuth';
import { useGoalStore } from '@/stores/useGoalStore';
import { Button } from '@/components/ui/Button';
import { Modal, ModalFooter } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { formatCurrency } from '@/lib/formatters';
import { Plus, Target, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Header from '@/components/Header';
import GoalCard from '@/components/GoalCard';
import { GoalsSkeleton } from '@/components/Skeletons';
import { Slider } from '@/components/ui/slider';

const GOAL_ICONS = ['🎯', '✈️', '🏠', '🚗', '💻', '📱', '🎓', '💍', '🏖️', '🎮', '🎵', '🐶', '🏋️', '💝', '🌟', '🏆'];
const GOAL_COLORS = ['#6366F1', '#EC4899', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EF4444', '#06B6D4'];

export default function Goals() {
  const { isAuthenticated, isLoading: isAuthLoading } = useRequireAuth();
  const { goals, fetchGoals, createGoal, deleteGoal, updateGoal, allocateToGoal, isLoading } = useGoalStore();
  
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isAllocateOpen, setIsAllocateOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Create form
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [deadline, setDeadline] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('🎯');
  const [selectedColor, setSelectedColor] = useState('#6366F1');

  // Allocate form
  const [allocAmount, setAllocAmount] = useState(100);
  const [allocNote, setAllocNote] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      fetchGoals();
    }
  }, [isAuthenticated, fetchGoals]);

  if (isAuthLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const handleCreate = async () => {
    if (!title || !targetAmount) {
      toast.error('Preencha o nome e o valor da meta');
      return;
    }
    setIsSubmitting(true);
    try {
      await createGoal({
        title,
        targetAmount: parseFloat(targetAmount),
        deadline: deadline || undefined,
        icon: selectedIcon,
        color: selectedColor,
      });
      toast.success('Meta criada! 🌟');
      setIsCreateOpen(false);
      resetForm();
    } catch {
      toast.error('Erro ao criar meta');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAllocate = async () => {
    if (!selectedGoalId || allocAmount <= 0) return;
    setIsSubmitting(true);
    try {
      const result = await allocateToGoal(selectedGoalId, {
        amount: allocAmount,
        note: allocNote || undefined,
      });
      
      if (result.milestoneReached) {
        toast.success(result.milestoneReached, { duration: 5000 });
      } else {
        toast.success(`${formatCurrency(allocAmount)} guardado com sucesso! 💰`);
      }
      
      setIsAllocateOpen(false);
      setAllocAmount(100);
      setAllocNote('');
      setSelectedGoalId(null);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Erro ao alocar dinheiro');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (goalId: string) => {
    try {
      await deleteGoal(goalId);
      toast.success('Meta removida');
    } catch {
      toast.error('Erro ao remover meta');
    }
  };

  const handleArchive = async (goalId: string) => {
    try {
      await updateGoal(goalId, { isArchived: true });
      toast.success('Meta arquivada');
    } catch {
      toast.error('Erro ao arquivar meta');
    }
  };

  const openAllocateModal = (goalId: string) => {
    setSelectedGoalId(goalId);
    setIsAllocateOpen(true);
  };

  const resetForm = () => {
    setTitle('');
    setTargetAmount('');
    setDeadline('');
    setSelectedIcon('🎯');
    setSelectedColor('#6366F1');
  };

  const selectedGoal = goals.find(g => g.id === selectedGoalId);
  const maxAllocatable = selectedGoal
    ? Number(selectedGoal.targetAmount) - Number(selectedGoal.currentAmount)
    : 10000;

  // Summary stats
  const totalGoals = goals.length;
  const totalSaved = goals.reduce((sum, g) => sum + Number(g.currentAmount), 0);
  const totalTarget = goals.reduce((sum, g) => sum + Number(g.targetAmount), 0);

  return (
    <div className="min-h-screen bg-background">
      <Header showBalance={true} />

      <main className="container py-8">
        {/* TOP BAR (ORGANIZZE STYLE) */}
        <div className="bg-card rounded-2xl border border-border p-6 md:p-8 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm animate-fade-in-up">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground flex items-center gap-3">
              Minhas Metas <span className="text-2xl">🎯</span>
            </h1>
            <p className="text-sm font-medium text-muted-foreground mt-2">
              Planeje o futuro e construa suas metas um pouquinho por vez.
            </p>
          </div>
          <Button
            variant="primary"
            leftIcon={<Plus className="w-4 h-4" />}
            onClick={() => setIsCreateOpen(true)}
            className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm rounded-xl px-6"
          >
            Nova Meta
          </Button>
        </div>

        {/* Summary Cards */}
        {totalGoals > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            {/* Metas Ativas */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Metas Ativas</h3>
              </div>
              <div className="ml-3.5">
                <p className="text-3xl font-bold text-foreground">{totalGoals}</p>
              </div>
            </div>

            {/* Total Guardado */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Total Guardado</h3>
              </div>
              <div className="ml-3.5">
                <p className="text-3xl font-bold font-currency text-emerald-600">{formatCurrency(totalSaved)}</p>
              </div>
            </div>

            {/* Progresso Total */}
            <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-1.5 h-6 bg-amber-500 rounded-full" />
                <h3 className="font-semibold text-muted-foreground text-sm uppercase tracking-wider">Progresso Geral</h3>
              </div>
              <div className="ml-3.5">
                <p className="text-3xl font-bold font-currency text-amber-600">
                  {totalTarget > 0 ? ((totalSaved / totalTarget) * 100).toFixed(0) : 0}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Goals Grid */}
        {isLoading ? (
          <GoalsSkeleton />
        ) : goals.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold text-foreground mb-2">Defina sua primeira meta!</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Crie sua primeira meta e comece a guardar dinheiro para o seu futuro.
            </p>
            <Button
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => setIsCreateOpen(true)}
              className="rounded-xl shadow-sm"
            >
              Criar Primeira Meta
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onAllocate={openAllocateModal}
                onDelete={handleDelete}
                onArchive={handleArchive}
              />
            ))}
          </div>
        )}
      </main>

      {/* Create Goal Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => { setIsCreateOpen(false); resetForm(); }}
        title="Nova Meta ✨"
        size="md"
      >
        <div className="space-y-5">
          <Input
            label="Qual é a sua meta?"
            placeholder="Ex: Viagem ao Japão, Carro Novo..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <Input
            label="Quanto vai custar?"
            type="number"
            placeholder="0.00"
            step="0.01"
            min="1"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            className="font-currency"
          />

          <Input
            label="Prazo (opcional)"
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
          />

          {/* Icon selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Ícone</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_ICONS.map((icon) => (
                <button
                  key={icon}
                  onClick={() => setSelectedIcon(icon)}
                  className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${
                    selectedIcon === icon
                      ? 'bg-indigo-100 ring-2 ring-indigo-500 scale-110'
                      : 'bg-gray-50 hover:bg-gray-100'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>
          </div>

          {/* Color selector */}
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Cor do tema</label>
            <div className="flex gap-2">
              {GOAL_COLORS.map((color) => (
                <button
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  className={`w-8 h-8 rounded-full transition-all ${
                    selectedColor === color ? 'ring-2 ring-offset-2 scale-110' : ''
                  }`}
                  style={{ backgroundColor: color, '--tw-ring-color': color } as React.CSSProperties}
                />
              ))}
            </div>
          </div>
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => { setIsCreateOpen(false); resetForm(); }}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleCreate}
            isLoading={isSubmitting}
            className="bg-gradient-to-r from-indigo-600 to-purple-600"
          >
            Criar Meta ✨
          </Button>
        </ModalFooter>
      </Modal>

      {/* Allocate Money Modal */}
      <Modal
        isOpen={isAllocateOpen}
        onClose={() => { setIsAllocateOpen(false); setSelectedGoalId(null); }}
        title={`Guardar em: ${selectedGoal?.icon} ${selectedGoal?.title || ''}`}
        size="md"
      >
        <div className="space-y-6">
          {/* Value display */}
          <div className="text-center py-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl border border-emerald-100">
            <p className="text-sm text-emerald-600/60 font-medium mb-2">Valor a guardar</p>
            <p className="text-4xl font-bold font-currency text-emerald-600">
              {formatCurrency(allocAmount)}
            </p>
          </div>

          {/* Slider */}
          <div className="px-2">
            <Slider
              value={[allocAmount]}
              onValueChange={(val) => setAllocAmount(val[0])}
              min={1}
              max={Math.max(maxAllocatable, 1)}
              step={10}
            />
            <div className="flex justify-between mt-2 text-xs text-gray-400 font-currency">
              <span>R$ 1</span>
              <span>{formatCurrency(maxAllocatable)}</span>
            </div>
          </div>

          {/* Quick amounts */}
          <div className="flex gap-2 flex-wrap">
            {[50, 100, 200, 500, 1000].map((val) => (
              <button
                key={val}
                onClick={() => setAllocAmount(Math.min(val, maxAllocatable))}
                className="px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-100 hover:bg-indigo-100 hover:text-indigo-700 transition-colors font-currency"
              >
                R$ {val}
              </button>
            ))}
          </div>

          {/* Note */}
          <Input
            label="Nota (opcional)"
            placeholder="Ex: Economizei no almoço essa semana"
            value={allocNote}
            onChange={(e) => setAllocNote(e.target.value)}
          />
        </div>

        <ModalFooter>
          <Button variant="secondary" onClick={() => { setIsAllocateOpen(false); setSelectedGoalId(null); }}>
            Cancelar
          </Button>
          <Button
            variant="primary"
            onClick={handleAllocate}
            isLoading={isSubmitting}
            className="bg-gradient-to-r from-emerald-500 to-teal-500"
          >
            💰 Guardar
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  );
}
