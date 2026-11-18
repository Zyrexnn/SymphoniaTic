import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export const fieldInputBase =
  'w-full min-h-[46px] bg-[#0C0D12] border border-[#3E4357] rounded-lg px-3.5 py-2.5 text-base sm:text-sm text-white placeholder:text-[#94A3B8] outline-none transition-colors focus:border-white focus:ring-2 focus:ring-white/25 disabled:opacity-50 disabled:cursor-not-allowed';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  className,
  children,
}) => (
  <div className={cn('flex flex-col gap-1.5', className)}>
    <label
      htmlFor={htmlFor}
      className="text-xs font-medium text-[#E4E4E7] tracking-wide flex items-center gap-1"
    >
      <span>{label}</span>
      {required && (
        <span className="text-rose-400" aria-hidden="true">
          *
        </span>
      )}
    </label>
    {children}
    {hint && !error && (
      <p className="text-xs text-[#94A3B8] leading-relaxed m-0">{hint}</p>
    )}
    {error && (
      <p role="alert" className="text-xs text-rose-400 leading-relaxed m-0">
        {error}
      </p>
    )}
  </div>
);

interface TextInputFieldProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  hint?: string;
  error?: string;
  onValueChange: (value: string) => void;
  containerClassName?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  hint,
  error,
  onValueChange,
  containerClassName,
  className,
  required,
  id,
  ...rest
}) => {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <input
        id={fieldId}
        required={required}
        aria-invalid={Boolean(error)}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          fieldInputBase,
          error && 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/25',
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
  onValueChange: (value: string) => void;
  containerClassName?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  hint,
  error,
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
  return (
    <FormField
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      className={containerClassName}
    >
      <textarea
        id={fieldId}
        rows={rows}
        required={required}
        aria-invalid={Boolean(error)}
        onChange={(e) => onValueChange(e.target.value)}
        className={cn(
          fieldInputBase,
          'min-h-[108px] resize-y leading-relaxed',
          error && 'border-rose-500 focus:border-rose-400 focus:ring-rose-500/25',
          className
        )}
        {...rest}
      />
    </FormField>
  );
};
