import React, { useState, useId } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff } from 'lucide-react';

export const inputClass = [
  'w-full min-h-[46px] bg-white',
  'border border-[#B8B5AC] focus:border-[#141413] focus:ring-2 focus:ring-[#141413]/15',
  'rounded-none px-4 py-2.5 text-base sm:text-sm text-[#141413]',
  'placeholder:text-[#6E6D68]',
  'outline-none transition-colors',
].join(' ');

export const btnPrimary = [
  'w-full min-h-[48px] inline-flex items-center justify-center gap-2',
  'px-6 py-3',
  'bg-[#D4FF2A] text-[#141413] border border-[#141413]',
  'text-xs font-bold uppercase tracking-wider rounded-none',
  'hover:bg-[#C2EE1A]',
  'transition-colors cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F4F3EF]',
  'disabled:opacity-40 disabled:cursor-not-allowed',
].join(' ');

export const btnGhost = [
  'min-h-[44px] inline-flex items-center justify-center gap-2',
  'px-4 py-2.5',
  'border border-[#DFDDD6] bg-white text-[#141413]',
  'text-xs font-bold tracking-wider uppercase rounded-none',
  'hover:border-[#141413] hover:bg-[#EAE8E1]',
  'transition-colors cursor-pointer',
  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]',
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
      <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-[#141413]">
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
      <label htmlFor={inputId} className="block text-xs font-bold uppercase tracking-wider text-[#141413]">
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
          className="absolute right-1 top-1/2 -translate-y-1/2 h-10 w-10 inline-flex items-center justify-center text-[#6E6D68] hover:text-[#141413] rounded-none transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#141413]"
        >
          {visible ? <EyeOff size={17} strokeWidth={1.8} aria-hidden="true" /> : <Eye size={17} strokeWidth={1.8} aria-hidden="true" />}
        </button>
      </div>
    </div>
  );
};

export const ErrorText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div role="alert" className="px-4 py-3 rounded-none bg-[#C81E1E]/10 border border-[#C81E1E]">
      <span className="text-xs sm:text-sm text-[#C81E1E] font-medium leading-relaxed">{children}</span>
    </div>
  ) : null;

export const InfoText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? (
    <div role="status" className="px-4 py-3 rounded-none bg-[#156E3F]/10 border border-[#156E3F]">
      <span className="text-xs sm:text-sm text-[#156E3F] font-medium leading-relaxed">{children}</span>
    </div>
  ) : null;

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={`animate-spin ${className || ''}`} strokeWidth={1.8} aria-hidden="true" />
);

export const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: ReactNode;
  backHref?: string;
}> = ({ title, subtitle, children, backHref }) => (
  <div className="min-h-[100dvh] bg-[#F4F3EF] text-[#141413] flex flex-col justify-between px-4 sm:px-8 py-8 sm:py-12">
    <div className="mx-auto w-full max-w-[440px] my-auto">
      {backHref && (
        <a
          href={backHref}
          className="inline-flex items-center gap-2 min-h-[44px] px-2 -ml-2 text-xs font-bold uppercase tracking-wider text-[#52514D] hover:text-[#141413] transition-colors mb-6"
        >
          <ArrowLeft size={15} strokeWidth={1.8} aria-hidden="true" />
          <span>Kembali</span>
        </a>
      )}
      <div className="rounded-none border border-[#141413] bg-white p-6 sm:p-8">
        <div className="mb-7">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#141413] bg-[#D4FF2A] px-2 py-0.5 inline-block">
            SymphoniaTic.
          </span>
          <h1 className="font-display text-3xl sm:text-4xl leading-[0.98] tracking-[-0.04em] font-extrabold text-[#141413] mt-3">
            {title}
          </h1>
          <p className="text-sm text-[#52514D] mt-2 font-normal leading-relaxed">
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
