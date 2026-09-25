import { useState, type KeyboardEvent } from 'react';
import { formatMinutes } from '../lib/date.js';
import styles from './TimeInput.module.css';

interface TimeInputProps {
  value: number;
  onChange: (minutes: number) => void;
  max?: number;
  ariaLabel: string;
}

// "9" → 09:00, "930" → 09:30, "1030" / "10:30" / "10.30" → 10:30.
function parseTime(text: string, max = 1439): number | null {
  const digits = text.replace(/\D/g, '');
  if (!digits || digits.length > 4) return null;
  const h = Number(digits.length <= 2 ? digits : digits.slice(0, -2));
  const m = digits.length <= 2 ? 0 : Number(digits.slice(-2));
  if (h > 24 || m > 59) return null;
  const total = h * 60 + m;
  return total <= max ? total : null;
}

function display(minutes: number): string {
  return minutes === 1440 ? '24:00' : formatMinutes(minutes);
}

// Typed time in HH:MM — faster than two dropdowns, and the colon appears by itself.
export function TimeInput({ value, onChange, max = 1439, ariaLabel }: TimeInputProps) {
  const [draft, setDraft] = useState<string | null>(null);

  function commit(text: string) {
    const parsed = parseTime(text, max);
    if (parsed !== null && parsed !== value) onChange(parsed);
    setDraft(null);
  }

  function handleChange(raw: string) {
    const digits = raw.replace(/\D/g, '').slice(0, 4);
    const masked = digits.length > 2 ? `${digits.slice(0, 2)}:${digits.slice(2)}` : digits;
    setDraft(masked);
    if (digits.length === 4) commit(digits);
  }

  function handleKey(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault();
      commit(e.currentTarget.value);
      e.currentTarget.blur();
    }
    if (e.key === 'Escape') {
      setDraft(null);
      e.currentTarget.blur();
    }
  }

  return (
    <input
      className={styles.input}
      value={draft ?? display(value)}
      inputMode="numeric"
      placeholder="00:00"
      aria-label={ariaLabel}
      onFocus={(e) => {
        setDraft('');
        e.currentTarget.select();
      }}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={(e) => commit(e.target.value)}
      onKeyDown={handleKey}
    />
  );
}
