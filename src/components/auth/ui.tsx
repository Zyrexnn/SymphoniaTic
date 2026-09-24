import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

/* ─── Class Strings ─── */

export const inputClass = [
  'w-full bg-transparent',
  'border border-[#E5E7EB] focus:border-brand',
  'px-4 py-3 text-sm text-[#183B56]',
  'placeholder:text-[#94A3B8]',
  'outline-none transition-all duration-200',
].join(' ');

export const btnPrimary = [
  'w-full inline-flex items-center justify-center gap-2',
  'px-6 py-3.5',
  'bg-brand text-white',
  'text-xs font-mono font-medium tracking-wider uppercase',
  'hover:bg-brand-dark',
  'transition-all duration-200',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

export const btnGhost = [
  'inline-flex items-center justify-center gap-2',
  'px-4 py-2.5',
  'border border-[#CBD5E1] text-[#183B56]',
  'text-xs font-mono tracking-wider uppercase',
  'hover:border-brand hover:text-brand-dark hover:bg-[#F8FAFC]',
  'active:bg-[#EFF3F8]',
  'transition-all duration-200',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

/* ─── Components ─── */

export const Field: React.FC<{
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
}> = ({ label, type = 'text', value, onChange, placeholder, required, autoComplete, maxLength }) => (
  <label className="block">
    <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748B] mb-2">
      {label}
    </span>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      required={required}
      autoComplete={autoComplete}
      maxLength={maxLength}
      className={inputClass}
    />
  </label>
);

export const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}> = ({ label, value, onChange, placeholder, required, autoComplete }) => {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#64748B] mb-2">
        {label}
      </span>
      <div className="relative">
        <input
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={inputClass + ' pr-11'}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#183B56] transition-colors"
          tabIndex={-1}
        >
          {visible ? <EyeOff size={16} strokeWidth={1.5} /> : <Eye size={16} strokeWidth={1.5} />}
        </button>
      </div>
    </label>
  );
};

export const ErrorText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div className="px-3 py-2.5 rounded-lg bg-red-500/[0.08] border border-red-500/15">
      <span className="text-[11px] text-red-500/80 font-light leading-relaxed">{children}</span>
    </div>
  ) : null;

export const InfoText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div className="px-3 py-2.5 rounded-lg bg-[#F8FAFC] border border-[#E5E7EB]">
      <span className="text-[11px] text-[#64748B] font-light leading-relaxed">{children}</span>
    </div>
  ) : null;

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={`animate-spin ${className || ''}`} strokeWidth={1.5} />
);

export const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: ReactNode;
  backHref?: string;
}> = ({ title, subtitle, children, backHref }) => (
  <div className="min-h-screen bg-white text-[#183B56] flex items-center justify-center px-4 py-12 sm:py-16">
    <div
      className="fixed inset-0 pointer-events-none"
      style={{
        background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(24,59,86,0.05) 0%, transparent 70%)',
      }}
    />
    <div className="relative w-full max-w-[400px]">
      {backHref && (
        <a
          href={backHref}
          className="inline-flex items-center gap-1.5 text-[11px] font-mono text-[#64748B] hover:text-[#183B56] transition-colors mb-8 group"
        >
          <ArrowLeft size={13} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </a>
      )}
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#94A3B8]">
          SymphoniaTic
        </span>
        <h1 className="text-[28px] sm:text-[32px] leading-[1.15] tracking-[-0.02em] font-light text-[#183B56] mt-3">
          {title}
        </h1>
        <p className="text-[13px] text-[#64748B] mt-2.5 font-light leading-relaxed">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  </div>
);

/* ─── Hook ─── */

export function useCooldown(seconds = 60) {
  const [left, setLeft] = useState(0);
  const start = () => setLeft(seconds);
  const tick = () => setLeft((p) => (p > 0 ? p - 1 : 0));
  return { left, start, tick };
}
