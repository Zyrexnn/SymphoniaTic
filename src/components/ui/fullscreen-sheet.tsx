import React, { useEffect, useRef } from 'react';
import { X, ArrowLeft, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FullscreenWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  eyebrow?: string;
  headerRight?: React.ReactNode;
  footer?: React.ReactNode;
  maxWidthClass?: string;
  backLabel?: string;
  theme?: 'dark' | 'light' | 'auto';
  children: React.ReactNode;
}

export const FullscreenWorkspace: React.FC<FullscreenWorkspaceProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  eyebrow,
  headerRight,
  footer,
  maxWidthClass = 'max-w-4xl',
  backLabel = 'Tutup',
  theme = 'auto',
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const isLightFixed = theme === 'light';

  useEffect(() => {
    if (!isOpen) return;

    const previousFocused = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    requestAnimationFrame(() => {
      containerRef.current?.focus();
    });

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
      previousFocused?.focus?.();
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={containerRef}
      tabIndex={-1}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      className={cn(
        'fixed inset-0 z-50 flex flex-col outline-none',
        isLightFixed ? 'bg-[#F4F3EF] text-[#141413]' : 'bg-background text-foreground'
      )}
    >
      <header
        className={cn(
          'shrink-0 border-b',
          isLightFixed ? 'border-[#DFDDD6] bg-white' : 'border-border bg-card'
        )}
      >
        <div
          className={cn(
            'mx-auto w-full px-4 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between gap-4',
            maxWidthClass
          )}
        >
          <div className="flex items-center gap-3 sm:gap-4 min-w-0">
            <button
              type="button"
              onClick={onClose}
              aria-label={backLabel}
              className={cn(
                'inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 rounded-none border transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2',
                isLightFixed
                  ? 'bg-[#F4F3EF] border-[#DFDDD6] text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
                  : 'bg-background border-border-strong text-foreground hover:border-foreground focus-visible:ring-ring'
              )}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.8} aria-hidden="true" />
              <span className="hidden sm:inline text-xs font-medium">{backLabel}</span>
            </button>

            <div className="min-w-0">
              {eyebrow && (
                <span
                  className={cn(
                    'block text-[11px] font-semibold uppercase tracking-[0.14em] truncate',
                    isLightFixed ? 'text-[#141413]' : 'text-[#141413] dark:text-[#D4FF2A]'
                  )}
                >
                  • {eyebrow}
                </span>
              )}
              <h2
                id={titleId}
                className={cn(
                  'font-display text-xl sm:text-2xl font-bold tracking-[-0.03em] truncate m-0',
                  isLightFixed ? 'text-[#141413]' : 'text-foreground'
                )}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className={cn(
                    'text-xs truncate mt-0.5 m-0',
                    isLightFixed ? 'text-[#52514D]' : 'text-muted-foreground'
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {headerRight}
            <button
              type="button"
              onClick={onClose}
              aria-label="Tutup jendela"
              className={cn(
                'inline-flex items-center justify-center h-11 w-11 rounded-none border transition-colors focus-visible:outline-none focus-visible:ring-2',
                isLightFixed
                  ? 'bg-[#F4F3EF] border-[#DFDDD6] text-[#52514D] hover:text-[#141413] hover:border-[#141413] focus-visible:ring-[#141413]'
                  : 'bg-background border-border-strong text-muted-foreground hover:text-foreground hover:border-foreground focus-visible:ring-ring'
              )}
            >
              <X className="w-5 h-5" strokeWidth={1.8} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        <div className={cn('mx-auto w-full px-4 sm:px-8 py-6 sm:py-10', maxWidthClass)}>
          {children}
        </div>
      </div>

      {footer && (
        <footer
          className={cn(
            'shrink-0 border-t pb-[env(safe-area-inset-bottom)]',
            isLightFixed ? 'border-[#DFDDD6] bg-white' : 'border-border bg-card'
          )}
        >
          <div className={cn('mx-auto w-full px-4 sm:px-8 py-4', maxWidthClass)}>
            {footer}
          </div>
        </footer>
      )}
    </div>
  );
};

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'default';
  theme?: 'dark' | 'light' | 'auto';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Konfirmasi',
  cancelLabel = 'Batal',
  variant = 'danger',
  theme = 'auto',
  onConfirm,
  onCancel,
}) => {
  const titleId = React.useId();
  const descId = React.useId();
  const isLightFixed = theme === 'light';

  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCancel();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onCancel]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-[#141413]/75"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full sm:max-w-md border-t sm:border rounded-none p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
          isLightFixed
            ? 'bg-white border-[#141413] text-[#141413]'
            : 'bg-card border-border-strong text-card-foreground'
        )}
      >
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle
            className={cn(
              'w-5 h-5 shrink-0 mt-0.5',
              variant === 'danger'
                ? 'text-[#C81E1E] dark:text-rose-400'
                : 'text-[#8A5A00] dark:text-amber-400'
            )}
            aria-hidden="true"
          />
          <div>
            <h3
              id={titleId}
              className={cn(
                'text-base font-bold m-0',
                isLightFixed ? 'text-[#141413]' : 'text-card-foreground'
              )}
            >
              {title}
            </h3>
            <p
              id={descId}
              className={cn(
                'text-sm leading-relaxed mt-2 mb-0',
                isLightFixed ? 'text-[#52514D]' : 'text-muted-foreground'
              )}
            >
              {message}
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-2.5 mt-6">
          <button
            type="button"
            onClick={onCancel}
            className={cn(
              'w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-sm font-semibold border rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2',
              isLightFixed
                ? 'text-[#141413] bg-[#F4F3EF] border-[#DFDDD6] hover:border-[#141413] focus-visible:ring-[#141413]'
                : 'text-foreground bg-background border-border-strong hover:border-foreground focus-visible:ring-ring'
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2',
              variant === 'danger'
                ? 'text-white bg-[#C81E1E] hover:bg-[#A61717] focus-visible:ring-[#C81E1E]'
                : 'text-[#141413] bg-[#D4FF2A] hover:bg-[#C2EE1A] focus-visible:ring-[#141413]'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
