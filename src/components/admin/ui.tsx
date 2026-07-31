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
  <div className="p-6 border border-white/10 bg-[#121826]/90 backdrop-blur-md relative group hover:border-amber-500/40 transition-all duration-300 shadow-xl overflow-hidden">
    <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-amber-500/5 to-transparent rounded-full blur-xl pointer-events-none group-hover:scale-150 transition-transform duration-500" />

    <div className="flex items-center justify-between mb-4 relative z-10">
      <span className="text-[11px] font-light text-[#8a99ad] tracking-[0.12em] uppercase">{label}</span>
      <div className="w-8 h-8 rounded-lg border border-white/10 bg-white/[0.03] flex items-center justify-center text-amber-400 group-hover:border-amber-500/40 transition-colors">
        <Icon size={16} strokeWidth={1.5} />
      </div>
    </div>

    <div className="text-2xl sm:text-3xl font-light text-white tracking-tight mb-2 relative z-10 font-sans">{value}</div>

    <div className="flex items-center justify-between text-xs font-light text-[#8a99ad] relative z-10">
      <span>{subtext}</span>
      {badgeText && (
        <span className={`text-[10px] px-2 py-0.5 border font-mono ${trendColor}`}>
          {badgeText}
        </span>
      )}
    </div>
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, className = '' }) => (
  <span className={`text-[10px] font-light tracking-wider px-2 py-0.5 border border-white/10 bg-white/[0.02] text-[#9a9a9a] ${className}`}>
    {children}
  </span>
);

interface GlassButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children, onClick, disabled, className = '',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 text-[13px] font-light text-white border border-white/20 bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/40 transition-all duration-200 ${disabled ? 'opacity-40 cursor-default' : 'cursor-pointer'} ${className}`}
  >
    {children}
  </button>
);

interface PanelCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PanelCard: React.FC<PanelCardProps> = ({ children, className = '' }) => (
  <div className={`border border-white/10 bg-[#121826] shadow-xl ${className}`}>{children}</div>
);
