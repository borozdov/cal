import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { ThemeContext, type Theme } from './ThemeContext.js';

const STORAGE_KEY = 'cal.theme';

function readInitialTheme(): Theme {
  const attr = document.documentElement.getAttribute('data-theme');
  return attr === 'titan' ? 'titan' : 'obsidian';
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(readInitialTheme);

  const setTheme = useCallback((next: Theme) => {
    const root = document.documentElement;
    root.classList.add('theme-switching');
    root.setAttribute('data-theme', next);
    void root.offsetHeight;
    root.classList.remove('theme-switching');

    localStorage.setItem(STORAGE_KEY, next);
    const meta = document.getElementById('meta-theme-color');
    if (meta instanceof HTMLMetaElement) meta.content = next === 'titan' ? '#fafafa' : '#0d0d0d';
    setThemeState(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
