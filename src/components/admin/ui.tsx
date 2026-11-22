import React from 'react';
import { CheckCircle2, Clock, XCircle, CircleDot } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface StatCardProps {
  label: string;
  value: string;
  subtext: string;
  icon: LucideIcon;
  badgeText?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  subtext,
  icon: Icon,
  badgeText,
}) => (
  <Card className="transition-colors duration-200 hover:border-border-strong">
    <CardContent className="p-5 sm:p-6">
      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-xs font-semibold text-muted-foreground tracking-wider uppercase truncate">
          {label}
        </span>
        <div className="w-9 h-9 rounded-none border border-border-strong bg-[#D4FF2A] text-[#141413] flex items-center justify-center shrink-0">
          <Icon size={16} strokeWidth={1.9} aria-hidden="true" />
        </div>
      </div>

      <div className="font-display text-3xl sm:text-[34px] font-semibold text-card-foreground tracking-tight leading-none mb-2.5 tabular-nums">
        {value}
      </div>

      <div className="flex items-center justify-between text-xs font-normal text-muted-foreground gap-2">
        <span className="truncate">{subtext}</span>
        {badgeText && (
          <Badge variant="secondary" className="font-mono text-[11px] shrink-0">
            {badgeText}
          </Badge>
        )}
      </div>
    </CardContent>
  </Card>
);

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = (status || '').toUpperCase();
  if (s === 'ISSUED' || s === 'VERIFIED' || s === 'APPROVED' || s === 'COMPLETED') {
    const label = s === 'ISSUED' ? 'ISSUED (AKTIF)' : s;
    return (
      <Badge variant="success" className="font-mono text-[11px] py-0.5">
        <CircleDot size={12} aria-hidden="true" />
        <span>{label}</span>
      </Badge>
    );
  }
  if (s === 'CHECKED_IN') {
    return (
      <Badge variant="dark" className="font-mono text-[11px] py-0.5">
        <CheckCircle2 size={12} aria-hidden="true" />
        <span>CHECKED_IN</span>
      </Badge>
    );
  }
  if (s === 'PENDING' || s === 'REFUND_REQUESTED' || s === 'REMINDED') {
    return (
      <Badge variant="warning" className="font-mono text-[11px] py-0.5">
        <Clock size={12} aria-hidden="true" />
        <span>{s}</span>
      </Badge>
    );
  }
  if (s === 'REFUNDED' || s === 'CANCELLED' || s === 'REJECTED') {
    return (
      <Badge variant="destructive" className="font-mono text-[11px] py-0.5">
        <XCircle size={12} aria-hidden="true" />
        <span>{s}</span>
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="font-mono text-[11px] py-0.5">
      {s || 'UNKNOWN'}
    </Badge>
  );
};

interface ActionButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  variant?: 'primary' | 'secondary' | 'danger';
}

export const GlassButton: React.FC<ActionButtonProps> = ({
  children,
  onClick,
  disabled,
  className = '',
  variant = 'secondary',
}) => {
  const mappedVariant =
    variant === 'primary' ? 'default' : variant === 'danger' ? 'destructive' : 'outline';

  return (
    <Button
      type="button"
      variant={mappedVariant}
      onClick={onClick}
      disabled={disabled}
      className={className}
    >
      {children}
    </Button>
  );
};

export const ProgressBar: React.FC<{
  value: number;
  max: number;
  className?: string;
  indicatorClassName?: string;
}> = ({ value, max, className = '', indicatorClassName }) => {
  const percentage = max > 0 ? Math.min(100, Math.max(0, (value / max) * 100)) : 0;
  return (
    <Progress
      value={percentage}
      className={className}
      indicatorClassName={indicatorClassName}
    />
  );
};
