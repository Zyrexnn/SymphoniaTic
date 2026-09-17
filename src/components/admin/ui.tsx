import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  badgeText?: string;
  trendColor?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label, value, subtext, icon: Icon, badgeText, trendColor = 'text-amber-600 border-amber-500/30 bg-amber-50',
}) => (
  <div className="p-5 sm:p-6 border border-[#E5E7EB] bg-white relative group hover:border-brand transition-all duration-300 shadow-lg overflow-hidden">
    <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-brand/5 via-transparent to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

    <div className="flex items-center justify-between mb-3 relative z-10">
      <span className="text-[11px] font-light text-[#64748B] tracking-[0.12em] uppercase">{label}</span>
      <div className="w-8 h-8 rounded border border-[#E5E7EB] bg-[#F8FAFC] flex items-center justify-center text-[#183B56] group-hover:border-brand transition-colors">
        <Icon size={15} strokeWidth={1.25} />
      </div>
    </div>

    <div className="text-2xl sm:text-3xl font-light text-[#183B56] tracking-tight mb-2 relative z-10 font-sans tabular-nums">{value}</div>

    <div className="flex items-center justify-between text-xs font-light text-[#64748B] relative z-10">
      <span className="truncate mr-2">{subtext}</span>
      {badgeText && (
        <span className={`text-[10px] font-mono px-2 py-0.5 border shrink-0 ${trendColor}`}>
          {badgeText}
        </span>
      )}
    </div>
  </div>
);

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = (status || '').toUpperCase();
  if (s === 'ISSUED' || s === 'VERIFIED' || s === 'APPROVED') {
    const label = s === 'ISSUED' ? 'ISSUED (AKTIF)' : s;
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-500/30 px-2 py-0.5">
        ● {label}
      </span>
    );
  }
  if (s === 'CHECKED_IN') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-brand bg-brand/10 border border-brand/30 px-2 py-0.5">
        ✓ CHECKED_IN
      </span>
    );
  }
  if (s === 'PENDING' || s === 'REFUND_REQUESTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-700 bg-amber-50 border border-amber-500/30 px-2 py-0.5">
        ⏳ {s}
      </span>
    );
  }
  if (s === 'REFUNDED' || s === 'CANCELLED' || s === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-700 bg-rose-50 border border-rose-500/30 px-2 py-0.5">
        ✕ {s}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#64748B] bg-[#F8FAFC] border border-[#E5E7EB] px-2 py-0.5">
      {s || 'UNKNOWN'}
    </span>
  );
};

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children, onClick, disabled, className = '', variant = 'secondary',
}) => {
  let styleClasses = 'bg-[#F8FAFC] text-[#183B56] border-[#E5E7EB] hover:bg-brand-light hover:border-brand';
  if (variant === 'primary') {
    styleClasses = 'bg-brand text-white border-brand hover:bg-brand-dark font-normal';
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-50 text-rose-700 border-rose-500/30 hover:bg-rose-100';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-[13px] font-light border transition-all duration-200 flex items-center justify-center gap-2 ${styleClasses} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer active:scale-[0.98]'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; className?: string }> = ({ value, max, className = '' }) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`w-full bg-[#E5E7EB] h-1.5 overflow-hidden ${className}`}>
      <div
        className="bg-brand h-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
