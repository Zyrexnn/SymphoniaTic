import React, { createContext, useContext, useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export type AdminThemeMode = 'light' | 'dark';

const STORAGE_KEY = 'symphoniatic_admin_theme';

interface AdminThemeContextValue {
  theme: AdminThemeMode;
  setTheme: (mode: AdminThemeMode) => void;
  toggleTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextValue>({
  theme: 'light',
  setTheme: () => {},
  toggleTheme: () => {},
});

export const AdminThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<AdminThemeMode>(() => {
    if (typeof window === 'undefined') return 'light';
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved === 'dark' || saved === 'light') return saved;
    } catch {}
    return 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const prevHadDark = root.classList.contains('dark');
    const prevColorScheme = root.style.colorScheme;

    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }

    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {}

    return () => {
      // Restore document state on unmount so public pages remain unaffected
      if (prevHadDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
      root.style.colorScheme = prevColorScheme;
    };
  }, [theme]);

  const setTheme = (mode: AdminThemeMode) => setThemeState(mode);
  const toggleTheme = () => setThemeState((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export function useAdminTheme() {
  return useContext(AdminThemeContext);
}

export const AdminThemeToggle: React.FC<{
  showLabel?: boolean;
  className?: string;
}> = ({ showLabel = false, className = '' }) => {
  const { theme, toggleTheme } = useAdminTheme();
  const isDark = theme === 'dark';

  const btn = (
    <Button
      type="button"
      variant="outline"
      size={showLabel ? 'default' : 'icon'}
      onClick={toggleTheme}
      aria-label={isDark ? 'Aktifkan mode terang (Playbill Paper)' : 'Aktifkan mode gelap (Concert Stage)'}
      aria-pressed={isDark}
      className={className}
    >
      {isDark ? (
        <Sun className="size-4 text-amber-300" aria-hidden="true" />
      ) : (
        <Moon className="size-4 text-foreground" aria-hidden="true" />
      )}
      {showLabel && (
        <span className="text-xs font-medium">
          {isDark ? 'Mode Terang' : 'Mode Gelap'}
        </span>
      )}
    </Button>
  );

  if (showLabel) return btn;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent>
        {isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
      </TooltipContent>
    </Tooltip>
  );
};
