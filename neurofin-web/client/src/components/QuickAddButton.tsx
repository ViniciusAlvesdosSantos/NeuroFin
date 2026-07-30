import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import QuickAddTransaction from './QuickAddTransaction';

/**
 * Floating Action Button (FAB) para adicionar transações rapidamente
 * TDAH-Friendly: Sempre visível, 1 clique para abrir
 * Ultra-Rápido: 3 passos (Tipo → Valor → Categoria)
 */
export default function QuickAddButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full shadow-2xl w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 
            hover:from-indigo-700 hover:to-purple-700 text-white transition-all hover:scale-110 active:scale-95"
          aria-label="Adicionar transação rápida"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {/* Quick Add Transaction Modal - 3 Steps */}
      <QuickAddTransaction
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
