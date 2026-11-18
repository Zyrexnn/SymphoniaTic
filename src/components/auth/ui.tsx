import React, { useState, useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export const inputClass = [
  'w-full min-h-[46px] bg-[#14161F]',
  'border border-[#3E4357] focus:border-white focus:ring-2 focus:ring-white/25',
  'rounded-lg px-4 py-2.5 text-base sm:text-sm text-white',
  'placeholder:text-[#94A3B8]',
  'outline-none transition-colors',
].join(' ');

export const btnPrimary = [
  'w-full min-h-[48px] inline-flex items-center justify-center gap-2',
  'px-6 py-3',
  'bg-white text-[#0C0D12]',
  'text-sm font-semibold rounded-lg',
  'hover:bg-neutral-200',
  'transition-colors cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#0C0D12]',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

export const btnGhost = [
  'min-h-[44px] inline-flex items-center justify-center gap-2',
  'px-4 py-2.5',
  'border border-[#3E4357] bg-[#14161F] text-[#E4E4E7]',
  'text-xs font-medium tracking-wider uppercase rounded-lg',
  'hover:border-white/60 hover:text-white',
  'transition-colors cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white',
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
      <label htmlFor={inputId} className="block text-xs font-medium text-[#E4E4E7]">
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
      <label htmlFor={inputId} className="block text-xs font-medium text-[#E4E4E7]">
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
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center text-[#94A3B8] hover:text-white rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          {visible ? <EyeOff size={17} strokeWidth={1.7} aria-hidden="true" /> : <Eye size={17} strokeWidth={1.7} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export const ErrorText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div role="alert" className="px-4 py-3 rounded-lg bg-rose-500/10 border border-rose-500/40">
      <span className="text-xs sm:text-sm text-rose-200 font-normal leading-relaxed">{children}</span>
    </div>
  ) : null;

export const InfoText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div role="status" className="px-4 py-3 rounded-lg bg-[#14161F] border border-[#3E4357]">
      <span className="text-xs sm:text-sm text-[#E4E4E7] font-normal leading-relaxed">{children}</span>
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
  <div className="min-h-[100dvh] bg-[#0C0D12] text-white flex flex-col justify-between px-4 sm:px-8 py-8 sm:py-12 selection:bg-white selection:text-black">
    <div className="mx-auto w-full max-w-[440px] my-auto">
      {backHref && (
        <a
          href={backHref}
          className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-medium text-[#A1A1AA] hover:text-white transition-colors mb-6 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
        >
          <ArrowLeft size={15} strokeWidth={1.7} aria-hidden="true" />
          <span>Kembali</span>
        </a>
      )}
      <div className="rounded-2xl border border-[#272A38] bg-[#14161F] p-6 sm:p-8">
        <div className="mb-7">
          <span className="text-xs font-semibold uppercase tracking-widest text-[#A1A1AA]">
            SymphoniaTic
          </span>
          <h1 className="text-2xl sm:text-3xl leading-tight tracking-tight font-semibold text-white mt-2">
            {title}
          </h1>
          <p className="text-sm text-[#A1A1AA] mt-2 font-normal leading-relaxed">
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
