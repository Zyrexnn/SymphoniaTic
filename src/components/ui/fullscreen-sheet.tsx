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
  theme?: 'dark' | 'light';
  children: React.ReactNode;
}

/**
 * Fullscreen responsive workspace replacing cramped centered popup modals
 * for forms, checkouts, and detailed review flows across mobile and desktop.
 */
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
  theme = 'dark',
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const titleId = React.useId();
  const isLight = theme === 'light';

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
        isLight ? 'bg-[#F6F4EE] text-[#171614]' : 'bg-[#0C0D12] text-white'
      )}
    >
      <header
        className={cn(
          'shrink-0 border-b',
          isLight ? 'border-[#E4DFD3] bg-white' : 'border-[#272A38] bg-[#14161F]'
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
                'inline-flex items-center justify-center gap-2 min-h-[44px] min-w-[44px] px-3 rounded-lg border transition-colors shrink-0 focus-visible:outline-none focus-visible:ring-2',
                isLight
                  ? 'bg-[#F6F4EE] border-[#CFC9BC] text-[#171614] hover:border-[#171614] focus-visible:ring-[#C93018]'
                  : 'bg-[#0C0D12] border-[#3E4357] text-[#E4E4E7] hover:text-white hover:border-white/60 focus-visible:ring-white'
              )}
            >
              <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={1.8} />
              <span className="hidden sm:inline text-xs font-medium">{backLabel}</span>
            </button>

            <div className="min-w-0">
              {eyebrow && (
                <span
                  className={cn(
                    'block text-[11px] font-semibold uppercase tracking-wider truncate',
                    isLight ? 'text-[#C93018]' : 'text-[#A1A1AA]'
                  )}
                >
                  {eyebrow}
                </span>
              )}
              <h2
                id={titleId}
                className={cn(
                  'text-base sm:text-lg font-semibold tracking-tight truncate m-0',
                  isLight ? 'font-display text-xl sm:text-2xl text-[#171614]' : 'text-white'
                )}
              >
                {title}
              </h2>
              {subtitle && (
                <p
                  className={cn(
                    'text-xs truncate mt-0.5 m-0',
                    isLight ? 'text-[#5C5850]' : 'text-[#A1A1AA]'
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
                'inline-flex items-center justify-center h-11 w-11 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2',
                isLight
                  ? 'bg-[#F6F4EE] border-[#CFC9BC] text-[#5C5850] hover:text-[#171614] hover:border-[#171614] focus-visible:ring-[#C93018]'
                  : 'bg-[#0C0D12] border-[#3E4357] text-[#A1A1AA] hover:text-white hover:border-white/60 focus-visible:ring-white'
              )}
            >
              <X className="w-5 h-5" strokeWidth={1.8} />
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
            isLight ? 'border-[#E4DFD3] bg-white' : 'border-[#272A38] bg-[#14161F]'
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
  theme?: 'dark' | 'light';
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
  theme = 'dark',
  onConfirm,
  onCancel,
}) => {
  const titleId = React.useId();
  const descId = React.useId();
  const isLight = theme === 'light';

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
      className={cn(
        'fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4',
        isLight ? 'bg-[#11100E]/65' : 'bg-black/80'
      )}
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'w-full sm:max-w-md border-t sm:border rounded-t-2xl sm:rounded-2xl p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]',
          isLight
            ? 'bg-white border-[#E4DFD3] text-[#171614]'
            : 'bg-[#14161F] border-[#3E4357] text-white'
        )}
      >
        <div className="flex items-start gap-3 mb-3">
          <AlertCircle
            className={cn(
              'w-5 h-5 shrink-0 mt-0.5',
              variant === 'danger'
                ? isLight
                  ? 'text-[#B91C1C]'
                  : 'text-rose-400'
                : isLight
                ? 'text-[#855A0E]'
                : 'text-amber-400'
            )}
            aria-hidden="true"
          />
          <div>
            <h3
              id={titleId}
              className={cn(
                'text-base font-semibold m-0',
                isLight ? 'text-[#171614]' : 'text-white'
              )}
            >
              {title}
            </h3>
            <p
              id={descId}
              className={cn(
                'text-sm leading-relaxed mt-2 mb-0',
                isLight ? 'text-[#5C5850]' : 'text-[#A1A1AA]'
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
              'w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-sm font-medium border rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2',
              isLight
                ? 'text-[#171614] bg-[#F6F4EE] border-[#CFC9BC] hover:border-[#171614] focus-visible:ring-[#C93018]'
                : 'text-[#E4E4E7] hover:text-white bg-[#0C0D12] border-[#3E4357] hover:border-white/50 focus-visible:ring-white'
            )}
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className={cn(
              'w-full sm:w-auto min-h-[44px] px-5 py-2.5 text-sm font-semibold rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2',
              variant === 'danger'
                ? 'text-white bg-[#B91C1C] hover:bg-[#991B1B] focus-visible:ring-[#B91C1C]'
                : isLight
                ? 'text-white bg-[#C93018] hover:bg-[#A82511] focus-visible:ring-[#C93018]'
                : 'text-[#0C0D12] bg-white hover:bg-neutral-200 focus-visible:ring-white'
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
