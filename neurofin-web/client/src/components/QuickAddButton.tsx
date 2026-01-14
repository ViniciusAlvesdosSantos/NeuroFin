import { useState } from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import QuickTransactionModal from './QuickTransactionModal';

/**
 * Floating Action Button (FAB) para adicionar transações rapidamente
 * TDAH-Friendly: Sempre visível, 1 clique para abrir
 */
export default function QuickAddButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsModalOpen(true)}
          className="rounded-full shadow-2xl w-16 h-16 bg-indigo-600 hover:bg-indigo-700 text-white transition-all hover:scale-110 active:scale-95"
          aria-label="Adicionar transação rápida"
        >
          <Plus className="w-7 h-7" />
        </Button>
      </div>

      {/* Quick Transaction Modal */}
      <QuickTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  );
}
