import React, { useId } from 'react';
import { cn } from '@/lib/utils';

export const fieldInputSemantic =
  'w-full min-h-[44px] bg-card border border-input rounded-none px-3.5 py-2 text-base sm:text-sm text-foreground placeholder:text-muted-foreground/80 outline-none transition-colors focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/20 disabled:opacity-50 disabled:bg-secondary disabled:cursor-not-allowed';

export const fieldInputBase = fieldInputSemantic;

export const fieldInputLight =
  'w-full min-h-[46px] bg-white border border-[#B8B5AC] rounded-none px-3.5 py-2.5 text-base sm:text-sm text-[#141413] placeholder:text-[#6E6D68] outline-none transition-colors focus:border-[#141413] focus:ring-2 focus:ring-[#141413]/15 disabled:opacity-50 disabled:bg-[#EAE8E1] disabled:cursor-not-allowed';

interface FormFieldProps {
  label: string;
  htmlFor?: string;
  required?: boolean;
  hint?: string;
  error?: string;
  theme?: 'dark' | 'light' | 'auto';
  className?: string;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  htmlFor,
  required,
  hint,
  error,
  theme = 'auto',
  className,
  children,
}) => {
  const isLightFixed = theme === 'light';
  const isDarkFixed = theme === 'dark';

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label
        htmlFor={htmlFor}
        className={cn(
          'text-xs font-semibold tracking-wide flex items-center gap-1',
          isLightFixed
            ? 'text-[#141413]'
            : isDarkFixed
            ? 'text-[#E4E4E7]'
            : 'text-foreground'
        )}
      >
        <span>{label}</span>
        {required && (
          <span
            className={
              isLightFixed
                ? 'text-[#C81E1E]'
                : isDarkFixed
                ? 'text-[#D4FF2A]'
                : 'text-[#C81E1E] dark:text-[#D4FF2A]'
            }
            aria-hidden="true"
          >
            *
          </span>
        )}
      </label>
      {children}
      {hint && !error && (
        <p
          className={cn(
            'text-xs leading-relaxed m-0',
            isLightFixed
              ? 'text-[#6E6D68]'
              : isDarkFixed
              ? 'text-[#94A3B8]'
              : 'text-muted-foreground'
          )}
        >
          {hint}
        </p>
      )}
      {error && (
        <p
          role="alert"
          className={cn(
            'text-xs leading-relaxed m-0',
            isLightFixed
              ? 'text-[#C81E1E]'
              : isDarkFixed
              ? 'text-rose-400'
              : 'text-[#C81E1E] dark:text-rose-400'
          )}
        >
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
  theme?: 'dark' | 'light' | 'auto';
  onValueChange: (value: string) => void;
  containerClassName?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  label,
  hint,
  error,
  theme = 'auto',
  onValueChange,
  containerClassName,
  className,
  required,
  id,
  ...rest
}) => {
  const autoId = useId();
  const fieldId = id || autoId;
  const isLightFixed = theme === 'light';

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
          isLightFixed ? fieldInputLight : fieldInputSemantic,
          error && 'border-[#C81E1E] focus-visible:border-[#C81E1E] focus-visible:ring-[#C81E1E]/20',
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
  theme?: 'dark' | 'light' | 'auto';
  onValueChange: (value: string) => void;
  containerClassName?: string;
}

export const TextAreaField: React.FC<TextAreaFieldProps> = ({
  label,
  hint,
  error,
  theme = 'auto',
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
  const isLightFixed = theme === 'light';

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
          isLightFixed ? fieldInputLight : fieldInputSemantic,
          'min-h-[108px] resize-y leading-relaxed',
          error && 'border-[#C81E1E] focus-visible:border-[#C81E1E] focus-visible:ring-[#C81E1E]/20',
          className
        )}
        {...rest}
      />
    </FormField>
  );
};
