import React, { HTMLAttributes, useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

export const Modal = React.forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      title,
      size = 'md',
      closeButton = true,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const modalRef = useRef<HTMLDivElement>(null);

    // Fechar modal ao pressionar ESC
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    // Prevenir scroll do body quando modal está aberto
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
      return () => {
        document.body.style.overflow = 'unset';
      };
    }, [isOpen]);

    // Fechar modal ao clicar no background
    const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    };

    if (!isOpen) return null;

    const sizeClasses = {
      sm: 'max-w-md',
      md: 'max-w-lg',
      lg: 'max-w-2xl',
      xl: 'max-w-4xl',
    };

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-40 transition-opacity animate-in fade-in duration-200"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="fixed inset-0 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div
            ref={ref}
            className={cn(
              'bg-card text-card-foreground shadow-2xl border border-border w-full',
              'rounded-t-[2rem] sm:rounded-2xl',
              'max-h-[90vh] overflow-y-auto',
              'animate-in fade-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300',
              sizeClasses[size],
              className
            )}
            {...props}
          >
            {/* Mobile drag handle */}
            <div className="w-12 h-1.5 bg-muted rounded-full mx-auto mt-4 sm:hidden" />
            
            {/* Header */}
            {(title || closeButton) && (
              <div className="flex items-center justify-between p-6 md:p-8 pb-4 pt-4 sm:pt-8">
                {title && <h2 className="text-xl font-bold tracking-tight">{title}</h2>}
                {closeButton && (
                  <button
                    onClick={onClose}
                    className="ml-auto p-2 bg-muted/50 rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            )}
            {/* Content */}
            <div className="p-6 md:p-8 pt-2">{children}</div>
          </div>
        </div>
      </>
    );
  }
);

Modal.displayName = 'Modal';

export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-between mb-4', className)}
    {...props}
  />
));

ModalHeader.displayName = 'ModalHeader';

export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn('text-lg font-semibold', className)}
    {...props}
  />
));

ModalTitle.displayName = 'ModalTitle';

export const ModalContent = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn('', className)} {...props} />
));

ModalContent.displayName = 'ModalContent';

export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('flex items-center justify-end gap-3 pt-6 mt-2', className)}
    {...props}
  />
));

ModalFooter.displayName = 'ModalFooter';
