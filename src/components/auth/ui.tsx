import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export const inputClass = [
  'w-full bg-[#14161F]',
  'border border-[#272A38] focus:border-white focus:ring-1 focus:ring-white',
  'rounded-lg px-4 py-3 text-sm text-white',
  'placeholder:text-[#71717A]',
  'outline-none transition-all duration-200',
].join(' ');

export const btnPrimary = [
  'w-full inline-flex items-center justify-center gap-2',
  'px-6 py-3.5',
  'bg-white text-black',
  'text-xs font-semibold tracking-wider uppercase rounded-lg',
  'hover:bg-neutral-200',
  'transition-all duration-200 shadow-sm cursor-pointer',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

export const btnGhost = [
  'inline-flex items-center justify-center gap-2',
  'px-4 py-2.5',
  'border border-[#272A38] bg-[#14161F] text-[#A1A1AA]',
  'text-xs font-medium tracking-wider uppercase rounded-lg',
  'hover:border-white/40 hover:text-white',
  'transition-all duration-200 cursor-pointer',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

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
    <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">
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
      <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#A1A1AA] mb-2">
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
          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#71717A] hover:text-white transition-colors"
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
    <div className="px-3 py-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20">
      <span className="text-xs text-rose-300 font-normal leading-relaxed">{children}</span>
    </div>
  ) : null;

export const InfoText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div className="px-3 py-2.5 rounded-lg bg-[#14161F] border border-[#272A38]">
      <span className="text-xs text-[#A1A1AA] font-normal leading-relaxed">{children}</span>
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
  <div className="min-h-screen bg-[#0C0D12] text-white flex items-center justify-center px-4 py-12 sm:py-16 selection:bg-white selection:text-black">
    <div className="relative w-full max-w-[400px]">
      {backHref && (
        <a
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-mono text-[#71717A] hover:text-white transition-colors mb-8 group"
        >
          <ArrowLeft size={13} strokeWidth={1.5} className="group-hover:-translate-x-0.5 transition-transform" />
          Kembali
        </a>
      )}
      <div className="mb-8">
        <span className="text-[10px] font-mono uppercase tracking-[0.35em] text-[#71717A]">
          SymphoniaTic
        </span>
        <h1 className="text-[28px] sm:text-[32px] leading-[1.15] tracking-tight font-medium text-white mt-3">
          {title}
        </h1>
        <p className="text-sm text-[#A1A1AA] mt-2.5 font-normal leading-relaxed">
          {subtitle}
        </p>
      </div>
      {children}
    </div>
  </div>
);

export function useCooldown(seconds = 60) {
  const [left, setLeft] = useState(0);
  const start = () => setLeft(seconds);
  const tick = () => setLeft((p) => (p > 0 ? p - 1 : 0));
  return { left, start, tick };
}
