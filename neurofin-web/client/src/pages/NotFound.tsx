import { useLocation } from 'wouter';
import { Button } from '@/components/ui/Button';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="auth-layout">
      <div className="auth-card text-center">
        <div className="text-7xl font-extrabold bg-gradient-to-br from-primary to-purple-600 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Página não encontrada
        </h1>
        <p className="text-sm text-muted-foreground mb-8">
          Desculpe, a página que você está procurando não existe ou foi movida.
        </p>
        <div className="space-y-3">
          <Button
            onClick={() => setLocation('/dashboard')}
            variant="primary"
            className="w-full"
            leftIcon={<Home className="w-4 h-4" />}
          >
            Voltar ao Dashboard
          </Button>
          <Button
            onClick={() => window.history.back()}
            variant="ghost"
            className="w-full"
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Voltar
          </Button>
        </div>
      </div>
    </div>
  );
}
