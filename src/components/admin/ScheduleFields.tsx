import React, { useId, useState } from 'react';
import { formatTimeString, parseDateFlexible, parseTimeString } from '@/lib/timeUtils';
import { FormField } from '@/components/ui/form-controls';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAdminTheme } from './AdminThemeContext';

export const TIMEZONE_OPTIONS = ['WIB', 'WITA', 'WIT'] as const;

export interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (formattedDate: string) => void;
}

export const DatePickerField: React.FC<DatePickerFieldProps> = ({ label, value, onChange }) => {
  const inputId = useId();
  const { theme } = useAdminTheme();
  const parsed = parseDateFlexible(value);
  const isoValue = parsed ? parsed.iso : '';

  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      onChange('');
      return;
    }
    const parsedNew = parseDateFlexible(rawVal);
    onChange(parsedNew ? parsedNew.formattedID : rawVal);
  };

  return (
    <FormField
      theme="auto"
      label={label}
      htmlFor={inputId}
      required
      hint={value ? `Format tersimpan: ${value}` : 'Pilih tanggal dari kalender'}
    >
      <Input
        id={inputId}
        type="date"
        required
        value={isoValue}
        onChange={handleDateSelect}
        className={theme === 'dark' ? '[color-scheme:dark]' : '[color-scheme:light]'}
      />
    </FormField>
  );
};

export interface TimePickerFieldProps {
  label: string;
  value: string;
  onChange: (formattedTime: string) => void;
  required?: boolean;
}

export const TimePickerField: React.FC<TimePickerFieldProps> = ({
  label,
  value,
  onChange,
  required = true,
}) => {
  const inputId = useId();
  const { theme } = useAdminTheme();
  const parsed = parseTimeString(value);
  const timeValue = parsed ? parsed.raw24 : '';
  const [fallbackTz, setFallbackTz] = useState<string>('WIB');

  const activeTz =
    parsed?.timezone && (TIMEZONE_OPTIONS as readonly string[]).includes(parsed.timezone)
      ? parsed.timezone
      : fallbackTz;

  const handleTimeSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      onChange('');
      return;
    }
    const parsedInput = parseTimeString(rawVal);
    if (parsedInput) {
      onChange(formatTimeString(parsedInput.hours, parsedInput.minutes, activeTz));
    } else {
      onChange(`${rawVal} ${activeTz}`);
    }
  };

  const handleTzChange = (nextTz: string) => {
    setFallbackTz(nextTz);
    if (parsed) {
      onChange(formatTimeString(parsed.hours, parsed.minutes, nextTz));
    }
  };

  return (
    <FormField
      theme="auto"
      label={label}
      htmlFor={inputId}
      required={required}
      hint={value ? `Format tersimpan: ${value}` : undefined}
    >
      <div className="flex items-center gap-2">
        <Input
          id={inputId}
          type="time"
          required={required}
          value={timeValue}
          onChange={handleTimeSelect}
          className={`flex-1 min-w-0 ${
            theme === 'dark' ? '[color-scheme:dark]' : '[color-scheme:light]'
          }`}
        />
        <Select value={activeTz} onValueChange={handleTzChange}>
          <SelectTrigger aria-label={`${label} zona waktu`} className="w-[88px] shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {TIMEZONE_OPTIONS.map((tz) => (
              <SelectItem key={tz} value={tz}>
                {tz}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </FormField>
  );
};

export interface RundownTimeInputProps {
  value: string;
  timezone: string;
  onChange: (formattedTime: string) => void;
  ariaLabel: string;
}

export const RundownTimeInput: React.FC<RundownTimeInputProps> = ({
  value,
  timezone,
  onChange,
  ariaLabel,
}) => {
  const { theme } = useAdminTheme();
  const parsed = parseTimeString(value);
  const timeValue = parsed ? parsed.raw24 : '';
  const activeTz = timezone || 'WIB';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawVal = e.target.value;
    if (!rawVal) {
      onChange('');
      return;
    }
    const parsedInput = parseTimeString(rawVal);
    if (parsedInput) {
      onChange(formatTimeString(parsedInput.hours, parsedInput.minutes, activeTz));
    }
  };

  return (
    <div className="flex items-center gap-1.5 sm:w-44 shrink-0">
      <Input
        type="time"
        aria-label={ariaLabel}
        value={timeValue}
        onChange={handleChange}
        className={`flex-1 min-w-0 font-mono ${
          theme === 'dark' ? '[color-scheme:dark]' : '[color-scheme:light]'
        }`}
      />
      <span className="text-xs font-mono text-muted-foreground shrink-0">{activeTz}</span>
    </div>
  );
};
