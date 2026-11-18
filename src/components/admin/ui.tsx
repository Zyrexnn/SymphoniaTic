import React from 'react';
import { CheckCircle2, Clock, XCircle, CircleDot } from 'lucide-react';
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
  <div className="p-5 sm:p-6 border border-[#272A38] bg-[#14161F] rounded-xl transition-colors duration-200 hover:border-white/30">
    <div className="flex items-center justify-between mb-3">
      <span className="text-xs font-medium text-[#A1A1AA] tracking-wider uppercase">{label}</span>
      <div className="w-9 h-9 rounded-lg border border-[#272A38] bg-[#0C0D12] flex items-center justify-center text-white">
        <Icon size={16} strokeWidth={1.6} aria-hidden="true" />
      </div>
    </div>

    <div className="text-2xl sm:text-3xl font-bold text-white tracking-tight mb-2 font-sans tabular-nums">{value}</div>

    <div className="flex items-center justify-between text-xs font-normal text-[#A1A1AA] gap-2">
      <span className="truncate">{subtext}</span>
      {badgeText && (
        <span className={`text-[11px] font-mono px-2 py-0.5 rounded border shrink-0 ${trendColor}`}>
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
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-300 bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 rounded-md">
        <CircleDot size={12} aria-hidden="true" />
        <span>{label}</span>
      </span>
    );
  }
  if (s === 'CHECKED_IN') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-white bg-white/10 border border-white/25 px-2.5 py-1 rounded-md">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>CHECKED_IN</span>
      </span>
    );
  }
  if (s === 'PENDING' || s === 'REFUND_REQUESTED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-md">
        <Clock size={12} aria-hidden="true" />
        <span>{s}</span>
      </span>
    );
  }
  if (s === 'REFUNDED' || s === 'CANCELLED' || s === 'REJECTED') {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-rose-300 bg-rose-500/10 border border-rose-500/30 px-2.5 py-1 rounded-md">
        <XCircle size={12} aria-hidden="true" />
        <span>{s}</span>
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#A1A1AA] bg-[#0C0D12] border border-[#272A38] px-2.5 py-1 rounded-md">
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
  let styleClasses = 'bg-[#14161F] text-white border-[#3E4357] hover:border-white/50 rounded-lg';
  if (variant === 'primary') {
    styleClasses = 'bg-white text-[#0C0D12] border-white hover:bg-neutral-200 font-semibold rounded-lg';
  } else if (variant === 'danger') {
    styleClasses = 'bg-rose-500/10 text-rose-300 border-rose-500/30 hover:bg-rose-500/20 rounded-lg';
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`min-h-[44px] px-4 py-2 text-sm font-medium border transition-colors flex items-center justify-center gap-2 ${styleClasses} ${
        disabled ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'
      } ${className}`}
    >
      {children}
    </button>
  );
};

export const ProgressBar: React.FC<{ value: number; max: number; className?: string }> = ({ value, max, className = '' }) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <div className={`w-full bg-[#272A38] h-2 rounded-full overflow-hidden ${className}`}>
      <div
        className="bg-white h-full rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      />
    </div>
  );
};
