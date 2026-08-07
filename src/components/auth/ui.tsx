import React, { useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowLeft, Loader2 } from 'lucide-react';

export const inputClass =
  'w-full bg-transparent border border-white/[0.08] focus:border-white/30 px-4 py-3 text-sm text-white placeholder:text-[#9a9a9a]/50 outline-none transition-colors';

export const btnPrimary =
  'w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-[#171717] text-xs font-mono font-medium tracking-wider uppercase hover:bg-neutral-200 transition-colors disabled:opacity-40 disabled:cursor-not-allowed';

export const btnGhost =
  'inline-flex items-center justify-center gap-2 px-4 py-2.5 border border-white/20 text-white text-xs font-mono tracking-wider uppercase hover:border-white hover:bg-white/5 transition-colors';

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
    <span className="block text-[10px] font-mono uppercase tracking-[0.2em] text-[#9a9a9a] mb-2">{label}</span>
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

export const ErrorText: React.FC<{ children?: ReactNode }> = ({ children }) =>
  children ? <p className="text-xs text-white/60 font-light leading-relaxed">{children}</p> : null;

export const Spinner: React.FC<{ className?: string }> = ({ className }) => (
  <Loader2 className={`animate-spin ${className || ''}`} strokeWidth={1.5} />
);

export const AuthShell: React.FC<{
  title: string;
  subtitle: string;
  children: ReactNode;
  backHref?: string;
}> = ({ title, subtitle, children, backHref }) => (
  <div className="min-h-screen bg-[#171717] text-white flex flex-col">
    <div className="mx-auto w-full max-w-md px-5 sm:px-8 pt-10 pb-20 flex-1 flex flex-col justify-center">
      {backHref && (
        <a href={backHref} className="inline-flex items-center gap-2 text-xs font-mono text-[#9a9a9a] hover:text-white transition-colors mb-10">
          <ArrowLeft size={14} strokeWidth={1.5} /> Kembali
        </a>
      )}
      <div className="mb-10">
        <span className="text-[10px] font-mono uppercase tracking-[0.3em] text-[#9a9a9a]">[ SymphoniaTic ]</span>
        <h1 className="text-[32px] leading-[1.1] tracking-[-0.03em] font-light text-white mt-4">{title}</h1>
        <p className="text-sm text-[#9a9a9a] mt-3 font-light leading-relaxed">{subtitle}</p>
      </div>
      {children}
    </div>
  </div>
);

// Hook: cooldown countdown untuk OTP resend
export function useCooldown(seconds = 60) {
  const [left, setLeft] = useState(0);
  const start = () => setLeft(seconds);
  const tick = () => setLeft((p) => (p > 0 ? p - 1 : 0));
  return { left, start, tick };
}