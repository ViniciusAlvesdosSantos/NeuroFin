import { useState } from 'react';
import { useLocation } from 'wouter';
import { useAuthStore } from '@/stores/useAuthStore';
import { useAccountStore } from '@/stores/useAccountStore';
import { Button } from '@/components/ui/Button';
import { formatCurrency } from '@/lib/formatters';
import { 
  Wallet, 
  LogOut, 
  Menu, 
  X, 
  Home, 
  CreditCard, 
  ArrowLeftRight, 
  TrendingUp,
  Tag,
  Sparkles,
  LineChart,
  User,
  MoreHorizontal
} from 'lucide-react';
import { toast } from 'sonner';

interface HeaderProps {
  showBalance?: boolean;
}

export default function Header({ showBalance = true }: HeaderProps) {
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuthStore();
  const { accounts } = useAccountStore();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  const handleLogout = () => {
    logout();
    setLocation('/login');
    toast.success('Logout realizado com sucesso');
  };

  const navigate = (path: string) => {
    setLocation(path);
    setIsMenuOpen(false);
  };

  const isActive = (path: string) => location === path;

  // Itens principais para TopBar (Desktop) e BottomBar (Mobile)
  const mainNavItems = [
    { icon: Home, label: 'Início', path: '/dashboard' },
    { icon: ArrowLeftRight, label: 'Transações', path: '/transactions' },
    { icon: CreditCard, label: 'Contas', path: '/accounts' },
    { icon: Tag, label: 'Categorias', path: '/categories' },
  ];

  // Itens secundários (Investimentos, Metas, Simulador)
  const secondaryNavItems = [
    { icon: TrendingUp, label: 'Investimentos', path: '/investments' },
    { icon: Sparkles, label: 'Minhas Metas', path: '/goals' },
    { icon: LineChart, label: 'Simulador', path: '/simulator' },
  ];

  return (
    <>
      {/* --- DESKTOP TOP NAVBAR --- */}
      <header className="bg-card border-b border-border sticky top-0 z-40 hidden md:block">
        <div className="container flex items-center justify-between h-16">
          
          <div className="flex items-center gap-8">
            {/* Logo */}
            <div 
              className="flex items-center gap-2 cursor-pointer group" 
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm">
                <Wallet className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="font-bold text-xl text-foreground tracking-tight">NeuroFin</span>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="flex items-center gap-1">
              {mainNavItems.map(item => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                onClick={() => setIsMenuOpen(true)}
                className="px-4 py-2 rounded-full text-sm font-semibold text-muted-foreground hover:bg-muted hover:text-foreground transition-all flex items-center gap-1"
              >
                Mais <MoreHorizontal className="w-4 h-4" />
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {showBalance && (
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-0.5">Saldo Total</p>
                <p className="text-lg font-bold font-currency text-foreground">
                  {formatCurrency(totalBalance)}
                </p>
              </div>
            )}

            <div className="flex items-center gap-3 pl-4 border-l border-border">
              <div className="flex flex-col items-end">
                <p className="text-sm font-semibold text-foreground">{user?.name?.split(' ')[0]}</p>
                <p className="text-xs text-muted-foreground">Meu Perfil</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center cursor-pointer hover:bg-primary/20 transition-colors" onClick={() => setIsMenuOpen(true)}>
                <User className="w-5 h-5 text-primary" />
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* --- MOBILE TOP NAVBAR (Compact) --- */}
      <header className="bg-card border-b border-border sticky top-0 z-40 md:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg text-foreground tracking-tight">NeuroFin</span>
          </div>
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center" onClick={() => setIsMenuOpen(true)}>
             <User className="w-4 h-4 text-primary" />
          </div>
        </div>
      </header>

      {/* --- MOBILE BOTTOM NAVIGATION BAR --- */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border z-40">
        <div className="flex justify-around items-center h-16 px-1">
          {mainNavItems.map(item => {
            const active = isActive(item.path);
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className="flex flex-col items-center justify-center w-full h-full space-y-1 relative"
              >
                {/* Indicador de ativo em cima do ícone */}
                {active && (
                  <div className="absolute top-0 w-8 h-1 bg-primary rounded-b-full" />
                )}
                <Icon className={`w-6 h-6 transition-colors duration-200 mt-1 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
                <span className={`text-[10px] font-bold transition-colors duration-200 ${active ? 'text-primary' : 'text-muted-foreground'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
          <button
             onClick={() => setIsMenuOpen(true)}
             className="flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground relative"
          >
             <Menu className="w-6 h-6 mt-1" />
             <span className="text-[10px] font-bold">Menu</span>
          </button>
        </div>
      </div>

      {/* --- SIDEBAR DRAWER (Menu Extra / Mobile Menu) --- */}
      <div
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsMenuOpen(false)}
      >
        <div
          className={`fixed right-0 top-0 h-full w-[280px] bg-card shadow-2xl transform transition-transform duration-300 flex flex-col ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header do Menu */}
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-bold text-lg text-foreground">Menu</h2>
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 hover:bg-muted rounded-full transition-colors bg-muted/50"
            >
              <X className="w-4 h-4 text-foreground" />
            </button>
          </div>

          {/* User Info */}
          <div className="p-5 border-b border-border bg-primary/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center border border-primary/20">
                <span className="text-xl font-bold text-primary">
                  {user?.name?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 overflow-hidden">
                <p className="font-bold text-foreground truncate">{user?.name}</p>
                <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              </div>
            </div>
          </div>

          {/* Links Secundários */}
          <div className="flex-1 overflow-y-auto py-2">
            <div className="px-3 mb-2 mt-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3">Explorar</p>
            </div>
            <nav className="px-2 space-y-1">
              {secondaryNavItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left font-semibold ${
                    isActive(item.path)
                      ? 'bg-primary/10 text-primary'
                      : 'text-foreground hover:bg-muted'
                  }`}
                >
                  <item.icon className={`w-5 h-5 ${isActive(item.path) ? 'text-primary' : 'text-muted-foreground'}`} />
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="px-3 mb-2 mt-6">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider px-3">Opções</p>
            </div>
            <nav className="px-2 space-y-1">
              <button
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-left font-semibold text-foreground hover:bg-muted"
                onClick={() => { toast.info('Em breve: Configurações de Perfil'); setIsMenuOpen(false); }}
              >
                <User className="w-5 h-5 text-muted-foreground" />
                Meu Perfil
              </button>
            </nav>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-border">
            <Button
              variant="secondary"
              className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50"
              leftIcon={<LogOut className="w-4 h-4" />}
              onClick={handleLogout}
            >
              Sair da conta
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
