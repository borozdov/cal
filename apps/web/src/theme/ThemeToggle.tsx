import { useTheme } from './useTheme.js';
import styles from './ThemeToggle.module.css';

const LABEL: Record<'obsidian' | 'titan', string> = {
  obsidian: 'Включить светлую тему',
  titan: 'Включить тёмную тему',
};

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const label = LABEL[theme];

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={() => setTheme(theme === 'obsidian' ? 'titan' : 'obsidian')}
      aria-label={label}
      title={label}
    >
      <svg
        className={[styles.icon, styles.sun].join(' ')}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
      </svg>
      <svg
        className={[styles.icon, styles.moon].join(' ')}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
      </svg>
    </button>
  );
}
