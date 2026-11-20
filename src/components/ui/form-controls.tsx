import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export const fieldInputBase =
  'w-full min-h-[46px] bg-[#0C0D12] border border-[#3E4357] rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-[#94A3B8] outline-none transition-colors focus:border-white focus:ring-2 focus:ring-white/25 disabled:opacity-50 disabled:cursor-not-allowed';

export const fieldInputLight =
  'w-full min-h-[46px] bg-white border border-[#CFC9BC] rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-[#171614] placeholder:text-[#6B665D] outline-none transition-colors focus:border-[#C93018] focus:ring-2 focus:ring-[#C93018]/20 disabled:opacity-50 disabled:bg-[#ECE8DF] disabled:cursor-not-allowed';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  theme?: 'dark' | 'light';
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  theme = 'dark',
  className,
  children,
}) => {
  const isLight = theme === 'light';
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          'text-xs font-semibold tracking-wide flex items-center gap-1',
          isLight ? 'text-[#171614]' : 'text-[#E4E4E7]'
        )}
      >
        <span>{label}</span>
        {required && (
          <span className={isLight ? 'text-[#C93018]' : 'text-rose-400'} aria-hidden="true">
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p className={cn('text-xs leading-relaxed m-0', isLight ? 'text-[#6B665D]' : 'text-[#94A3B8]')}>
          {hint}
        </p>
      )}
      {error && (
        <p role="alert" className={cn('text-xs leading-relaxed m-0', isLight ? 'text-[#B91C1C]' : 'text-rose-400')}>
          {error}
        </p>
      )}
    </div>
  );
};

interface TextInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  hint?: string;
  error?: string;
  theme?: 'dark' | 'light';
  onValueChange: (value: string) => void;
  containerClassName?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  hint,
  error,
  theme = 'dark',
  onValueChange,
  containerClassName,
  className,
  required,
  id,
  ...rest
}) => {
  const autoId = useId();
  const fieldId = id || autoId;
  const isLight = theme === 'light';

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      theme={theme}
      className={containerClassName}
    >
      <input
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          isLight ? fieldInputLight : fieldInputBase,
          error &&
            (isLight
              ? 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20'
              : 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/25'),
          className
        )}
        {...rest}
      />
    </FormField>
  );
};

interface TextAreaFieldProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  label: string;
  hint?: string;
  error?: string;
  theme?: 'dark' | 'light';
  onValueChange: (value: string) => void;
  containerClassName?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  hint,
  error,
  theme = 'dark',
  onValueChange,
  containerClassName,
  className,
  required,
  id,
  rows = 4,
  ...rest
}) => {
  const autoId = useId();
  const fieldId = id || autoId;
  const isLight = theme === 'light';

  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      theme={theme}
      className={containerClassName}
    >
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          isLight ? fieldInputLight : fieldInputBase,
          'min-h-[108px] resize-y leading-relaxed',
          error &&
            (isLight
              ? 'border-[#B91C1C] focus:border-[#B91C1C] focus:ring-[#B91C1C]/20'
              : 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/25'),
          className
        )}
        {...rest}
      />
    </FormField>
  );
};
