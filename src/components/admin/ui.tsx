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
  label, value, subtext, icon: Icon, badgeText, trendColor = 'text-white border-white/20 bg-white/10',
}) => (
  <div className="p-5 sm:p-6 border border-[#272A38] bg-[#14161F] rounded-xl relative group hover:border-white/30 transition-all duration-300 shadow-lg overflow-hidden">
    <div className="absolute top-0 right-0 w-28 h-28 bg-white/[0.02] rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

    <div className="flex items-center justify-between mb-3 relative z-10">
      <span className="text-[11px] font-medium text-[#A1A1AA] tracking-[0.12em] uppercase">{label}</span>
      <div className="w-8 h-8 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white group-hover:border-white/40 transition-colors">
        <Icon size={15} strokeWidth={1.5} />
      </div>
    </div>

    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 relative z-10 font-sans tabular-nums">{value}</div>

    <div className="flex items-center justify-between text-xs font-normal text-[#A1A1AA] relative z-10">
      <span className="truncate mr-2">{subtext}</span>
      {badgeText && (
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border shrink-0 ${trendColor}`}>
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
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded">
        ● {label}
      </span>
    );
  }
  if (s === 'CHECKED_IN') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-white bg-white/10 border border-white/20 px-2 py-0.5 rounded">
        ✓ CHECKED_IN
      </span>
    );
  }
  if (s === 'PENDING' || s === 'REFUND_REQUESTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
        ⏳ {s}
      </span>
    );
  }
  if (s === 'REFUNDED' || s === 'CANCELLED' || s === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-mono text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded">
        ✕ {s}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-mono text-[#A1A1AA] bg-[#0C0D12] border border-[#272A38] px-2 py-0.5 rounded">
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
  let styleClasses = 'bg-[#14161F] text-white border-[#272A38] hover:border-white/40 rounded-lg';
  if (variant === 'primary') {
    styleClasses = 'bg-white text-[#0C0D12] border-white hover:bg-neutral-200 font-semibold rounded-lg';
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 rounded-lg';
  }

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-4 py-2 text-[13px] font-medium border transition-all duration-200 flex items-center justify-center gap-2 ${styleClasses} ${
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
    <div className={`w-full bg-[#272A38] h-1.5 rounded-full overflow-hidden ${className}`}>
      <div
        className="bg-white h-full rounded-full transition-all duration-500"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
