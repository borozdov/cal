import { useContext } from 'react';
import { ThemeContext } from './ThemeContext.js';

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme должен использоваться внутри ThemeProvider');
  return ctx;
}
