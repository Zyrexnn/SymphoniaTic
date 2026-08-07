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
  label, value, subtext, icon: Icon, badgeText, trendColor = 'text-amber-400 border-amber-500/30 bg-amber-500/10',
}) => (
  <div className="p-5 sm:p-6 border border-white/[0.08] bg-[#1a1a1a]/80 backdrop-blur-md relative group hover:border-white/20 transition-all duration-300 shadow-lg overflow-hidden">
    <div className="absolute top-0 right-0 w-28 h-28 bg-gradient-to-br from-white/5 via-transparent to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

    <div className="flex items-center justify-between mb-3 relative z-10">
      <span className="text-[11px] font-light text-[#9a9a9a] tracking-[0.12em] uppercase">{label}</span>
      <div className="w-8 h-8 rounded border border-white/10 bg-white/[0.03] flex items-center justify-center text-white group-hover:border-white/30 transition-colors">
        <Icon size={15} strokeWidth={1.25} />
      </div>
    </div>

    <div className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2 relative z-10 font-sans tabular-nums">{value}</div>

    <div className="flex items-center justify-between text-xs font-light text-[#9a9a9a] relative z-10">
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
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5">
        ● {label}
      </span>
    );
  }
  if (s === 'CHECKED_IN') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-sky-300 bg-sky-500/10 border border-sky-500/30 px-2 py-0.5">
        ✓ CHECKED_IN
      </span>
    );
  }
  if (s === 'PENDING' || s === 'REFUND_REQUESTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5">
        ⏳ {s}
      </span>
    );
  }
  if (s === 'REFUNDED' || s === 'CANCELLED' || s === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5">
        ✕ {s}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#9a9a9a] bg-white/5 border border-white/10 px-2 py-0.5">
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
  let styleClasses = 'bg-white/[0.04] text-white border-white/20 hover:bg-white/[0.08] hover:border-white/40';
  if (variant === 'primary') {
    styleClasses = 'bg-white text-[#171717] border-white hover:bg-white/90 font-normal';
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20';
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
    <div className={`w-full bg-white/10 h-1.5 overflow-hidden ${className}`}>
      <div
        className="bg-white h-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
