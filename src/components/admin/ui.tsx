import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
}

export const StatCard: React.FC<StatCardProps> = ({ label, value, subtext, icon: Icon }) => (
  <div
    style={{
      padding: 20,
      border: '1px solid rgba(255,255,255,0.06)',
      background: '#171717',
    }}
  >
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
      <span style={{ fontSize: 13, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{label}</span>
      <Icon size={16} strokeWidth={1} style={{ color: '#9a9a9a' }} />
    </div>
    <div style={{ fontSize: 24, fontWeight: 300, color: '#ffffff', letterSpacing: '-0.02em' }}>{value}</div>
    <span style={{ fontSize: 12, fontWeight: 300, color: '#9a9a9a', display: 'block', marginTop: 4 }}>{subtext}</span>
  </div>
);

interface BadgeProps {
  children: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({ children }) => (
  <span style={{ fontSize: 10, fontWeight: 300, color: '#9a9a9a', letterSpacing: '0.05em' }}>
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
    className={className}
    style={{
      padding: '8px 16px',
      fontSize: 13,
      fontWeight: 300,
      color: '#ffffff',
      border: '1px solid #ffffff',
      background: 'transparent',
      cursor: disabled ? 'default' : 'pointer',
      opacity: disabled ? 0.4 : 1,
    }}
    onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.opacity = '0.6'; }}
    onMouseLeave={(e) => { if (!disabled) e.currentTarget.style.opacity = '1'; }}
  >
    {children}
  </button>
);

interface PanelCardProps {
  children: React.ReactNode;
  className?: string;
}

export const PanelCard: React.FC<PanelCardProps> = ({ children, className = '' }) => (
  <div className={className} style={{ border: '1px solid rgba(255,255,255,0.06)', background: '#171717' }}>
    {children}
  </div>
);
