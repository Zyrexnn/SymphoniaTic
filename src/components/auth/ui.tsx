import React, { useState, useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export const inputClass = [
  'w-full min-h-[46px] bg-white',
  'border border-[#CFC9BC] focus:border-[#C93018] focus:ring-2 focus:ring-[#C93018]/20',
  'rounded-lg px-4 py-2.5 text-base sm:text-sm text-[#171614]',
  'placeholder:text-[#6B665D]',
  'outline-none transition-colors',
].join(' ');

export const btnPrimary = [
  'w-full min-h-[48px] inline-flex items-center justify-center gap-2',
  'px-6 py-3',
  'bg-[#C93018] text-white',
  'text-sm font-semibold rounded-lg',
  'hover:bg-[#A82511]',
  'transition-colors cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F6F4EE]',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

export const btnGhost = [
  'min-h-[44px] inline-flex items-center justify-center gap-2',
  'px-4 py-2.5',
  'border border-[#CFC9BC] bg-white text-[#171614]',
  'text-xs font-semibold tracking-wider uppercase rounded-lg',
  'hover:border-[#171614] hover:bg-[#ECE8DF]/50',
  'transition-colors cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]',
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
}> = ({ label, type = 'text', value, onChange, placeholder, required, autoComplete, maxLength }) => {
  const inputId = useId();
  return (
    <div className="block space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-semibold text-[#171614]">
        {label}
      </label>
      <input
        id={inputId}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        maxLength={maxLength}
        className={inputClass}
      />
    </div>
  );
};

export const PasswordField: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}> = ({ label, value, onChange, placeholder, required, autoComplete }) => {
  const [visible, setVisible] = useState(false);
  const inputId = useId();

  return (
    <div className="block space-y-1.5">
      <label htmlFor={inputId} className="block text-xs font-semibold text-[#171614]">
        {label}
      </label>
      <div className="relative">
        <input
          id={inputId}
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          autoComplete={autoComplete}
          className={inputClass + ' pr-12'}
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center text-[#6B665D] hover:text-[#171614] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
        >
          {visible ? <EyeOff size={17} strokeWidth={1.7} aria-hidden="true" /> : <Eye size={17} strokeWidth={1.7} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export const ErrorText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div role="alert" className="px-4 py-3 rounded-lg bg-[#B91C1C]/10 border border-[#B91C1C]/30">
      <span className="text-xs sm:text-sm text-[#B91C1C] font-normal leading-relaxed">{children}</span>
    </div>
  ) : null;

export const InfoText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div role="status" className="px-4 py-3 rounded-lg bg-[#1F6E43]/10 border border-[#1F6E43]/30">
      <span className="text-xs sm:text-sm text-[#1F6E43] font-normal leading-relaxed">{children}</span>
    </div>
  ) : null;

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={`animate-spin ${className || ''}`} strokeWidth={1.7} aria-hidden="true" />
);

export const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: ReactNode;
  backHref?: string;
}> = ({ title, subtitle, children, backHref }) => (
  <div className="min-h-[100dvh] bg-[#F6F4EE] text-[#171614] flex flex-col justify-between px-4 sm:px-8 py-8 sm:py-12">
    <div className="mx-auto w-full max-w-[440px] my-auto">
      {backHref && (
        <a
          href={backHref}
          className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-medium text-[#5C5850] hover:text-[#171614] transition-colors mb-6 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C93018]"
        >
          <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
          <span>Kembali</span>
        </a>
      )}
      <div className="rounded-2xl border border-[#E4DFD3] bg-white p-6 sm:p-8">
        <div className="mb-7">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C93018]">
            SymphoniaTic
          </span>
          <h1 className="font-display text-3xl sm:text-4xl leading-tight tracking-[-0.02em] font-semibold text-[#171614] mt-2">
            {title}
          </h1>
          <p className="text-sm text-[#5C5850] mt-2 font-normal leading-relaxed">
            {subtitle}
          </p>
        </div>
        {children}
      </div>
    </div>
  </div>
);

export function useCooldown(seconds = 60) {
  const [left, setLeft] = useState(0);
  const start = () => setLeft(seconds);
  const tick = () => setLeft((p) => (p > 0 ? p - 1 : 0));
  return { left, start, tick };
}
