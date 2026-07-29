import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon }) => (
  <div className="p-5 border border-white/10 bg-[#171717]">
    <div className="flex items-center justify-between mb-3">
      <span className="text-[13px] font-light text-[#9a9a9a] tracking-wider uppercase">{label}</span>
      <Icon size={16} strokeWidth={1} className="text-[#9a9a9a]" />
    </div>
    <div className="text-2xl font-light text-white tracking-tight">{value}</div>
    <span className="text-xs font-light text-[#9a9a9a] block mt-1">{subtext}</span>
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children }) => (
  <span className="text-[10px] font-light text-[#9a9a9a] tracking-wider">{children}</span>
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
    className={`px-4 py-2 text-[13px] font-light text-white border border-white bg-transparent ${disabled ? 'opacity-40 cursor-default' : 'cursor-pointer hover:opacity-60'} ${className}`}
  >
    {children}
  </button>
);

interface PanelCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PanelCard: React.FC<PanelCardProps> = ({ children, className = '' }) => (
  <div className={`border border-white/10 bg-[#171717] ${className}`}>{children}</div>
);
