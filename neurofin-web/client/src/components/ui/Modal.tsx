import React, {
  HTMLAttributes,
  useEffect,
  useId,
  useRef,
} from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

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
    const internalRef = useRef<HTMLDivElement>(null);
    const titleId = useId();
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const modalElement = internalRef.current;

    /*
     * ESC + Focus Trap
     */
    useEffect(() => {
      if (!isOpen) return;

      previousActiveElement.current =
        document.activeElement as HTMLElement;

      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          onClose();
          return;
        }

        if (event.key !== 'Tab') return;

        const modal = internalRef.current;
        if (!modal) return;

        const focusableElements = Array.from(
          modal.querySelectorAll<HTMLElement>(FOCUSABLE_ELEMENTS)
        );

        if (!focusableElements.length) {
          event.preventDefault();
          modal.focus();
          return;
        }

        const firstElement = focusableElements[0];
        const lastElement =
          focusableElements[focusableElements.length - 1];

        if (event.shiftKey && document.activeElement === firstElement) {
          event.preventDefault();
          lastElement.focus();
        } else if (
          !event.shiftKey &&
          document.activeElement === lastElement
        ) {
          event.preventDefault();
          firstElement.focus();
        }
      };

      document.addEventListener('keydown', handleKeyDown);

      requestAnimationFrame(() => {
        const modal = internalRef.current;
        if (!modal) return;

        const firstFocusable = modal.querySelector<HTMLElement>(
          FOCUSABLE_ELEMENTS
        );

        firstFocusable?.focus();
      });

      return () => {
        document.removeEventListener('keydown', handleKeyDown);

        requestAnimationFrame(() => {
          previousActiveElement.current?.focus();
        });
      };
    }, [isOpen, onClose]);

    /*
     * Bloqueia scroll do body
     */
    useEffect(() => {
      if (!isOpen) return;

      const previousOverflow = document.body.style.overflow;
      const previousPaddingRight = document.body.style.paddingRight;

      const scrollbarWidth =
        window.innerWidth - document.documentElement.clientWidth;

      document.body.style.overflow = 'hidden';

      if (scrollbarWidth > 0) {
        document.body.style.paddingRight = `${scrollbarWidth}px`;
      }

      return () => {
        document.body.style.overflow = previousOverflow;
        document.body.style.paddingRight = previousPaddingRight;
      };
    }, [isOpen]);

    if (!isOpen) return null;

    const sizeClasses = {
      sm: 'sm:max-w-md',
      md: 'sm:max-w-lg',
      lg: 'sm:max-w-2xl',
      xl: 'sm:max-w-4xl',
    };

    const handleBackdropClick = (
      event: React.MouseEvent<HTMLDivElement>
    ) => {
      if (event.target === event.currentTarget) {
        onClose();
      }
    };

    return (
      <div
        className="fixed inset-0 z-[100] flex items-end justify-center sm:items-center sm:p-6"
        role="presentation"
      >
        {/* Backdrop */}
        <div
          aria-hidden="true"
          onClick={handleBackdropClick}
          className={cn(
            'absolute inset-0',
            'bg-black/50 dark:bg-black/70',
            'backdrop-blur-[6px]',
            'animate-in fade-in duration-200',
            'motion-reduce:animate-none'
          )}
        />

        {/* Modal */}
        <div
          ref={(node) => {
            internalRef.current = node;

            if (typeof ref === 'function') {
              ref(node);
            } else if (ref) {
              ref.current = node;
            }
          }}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? titleId : undefined}
          tabIndex={-1}
          className={cn(
            'relative z-10',
            'w-full',
            sizeClasses[size],

            // Surface
            'bg-background text-foreground',
            'shadow-2xl',
            'ring-1 ring-black/5 dark:ring-white/10',

            // Mobile bottom sheet
            'rounded-t-[28px]',
            'max-h-[92dvh]',

            // Desktop modal
            'sm:rounded-[24px]',
            'sm:max-h-[calc(100dvh-48px)]',

            // Layout
            'flex flex-col',
            'overflow-hidden',

            // Animation
            'animate-in',
            'slide-in-from-bottom-8',
            'duration-300',
            'ease-out',

            'sm:slide-in-from-bottom-4',
            'sm:zoom-in-[0.98]',

            'motion-reduce:animate-none',

            className
          )}
          {...props}
        >
          {/* Mobile drag indicator */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div
              aria-hidden="true"
              className="h-1.5 w-10 rounded-full bg-muted-foreground/20"
            />
          </div>

          {/* Header */}
          {(title || closeButton) && (
            <header
              className={cn(
                'flex items-center gap-4',
                'px-5 py-4 sm:px-6 sm:py-5',
                'shrink-0'
              )}
            >
              {title && (
                <div className="min-w-0 flex-1">
                  <h2
                    id={titleId}
                    className={cn(
                      'text-lg font-semibold',
                      'tracking-[-0.02em]',
                      'text-foreground',
                      'truncate'
                    )}
                  >
                    {title}
                  </h2>
                </div>
              )}

              {closeButton && (
                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Fechar modal"
                  className={cn(
                    'ml-auto shrink-0',
                    'inline-flex items-center justify-center',
                    'size-9',
                    'rounded-full',
                    'text-muted-foreground',

                    'bg-muted/50',
                    'hover:bg-muted',
                    'hover:text-foreground',

                    'transition-all duration-150',
                    'active:scale-95',

                    'focus-visible:outline-none',
                    'focus-visible:ring-2',
                    'focus-visible:ring-ring',
                    'focus-visible:ring-offset-2'
                  )}
                >
                  <X className="size-[18px]" strokeWidth={2} />
                </button>
              )}
            </header>
          )}

          {/* Content */}
          <main
            className={cn(
              'min-h-0 flex-1 overflow-y-auto',
              'overscroll-contain',

              'px-5 pb-6',
              'sm:px-6 sm:pb-6',

              // Scrollbar mais discreta
              '[scrollbar-width:thin]',
              '[scrollbar-color:theme(colors.muted.DEFAULT)_transparent]'
            )}
          >
            {children}
          </main>
        </div>
      </div>
    );
  }
);

Modal.displayName = 'Modal';

/*
 * Header
 */
export const ModalHeader = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'flex items-center justify-between gap-4',
      'mb-5',
      className
    )}
    {...props}
  />
));

ModalHeader.displayName = 'ModalHeader';

/*
 * Title
 */
export const ModalTitle = React.forwardRef<
  HTMLHeadingElement,
  HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn(
      'text-xl font-semibold',
      'tracking-[-0.025em]',
      'text-foreground',
      className
    )}
    {...props}
  />
));

ModalTitle.displayName = 'ModalTitle';

/*
 * Content
 */
export const ModalContent = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn('space-y-5', className)}
    {...props}
  />
));

ModalContent.displayName = 'ModalContent';

/*
 * Footer
 */
export const ModalFooter = React.forwardRef<
  HTMLDivElement,
  HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <footer
    ref={ref}
    className={cn(
      'shrink-0',
      'flex flex-col-reverse sm:flex-row',
      'items-stretch sm:items-center',
      'justify-end',
      'gap-2.5',

      'px-5 py-4',
      'sm:px-6 sm:py-4',

      'border-t border-border/60',
      'bg-muted/20',

      // Safe area para iPhone
      'pb-[max(1rem,env(safe-area-inset-bottom))]',

      className
    )}
    {...props}
  />
));

ModalFooter.displayName = 'ModalFooter';