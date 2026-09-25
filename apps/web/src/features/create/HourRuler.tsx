import { useRef, type PointerEvent } from 'react';
import { hourState, setRange, type Quarters } from './ranges.js';
import styles from './HourRuler.module.css';

interface HourRulerProps {
  value: Quarters;
  onChange: (next: Quarters) => void;
}

const HOURS = Array.from({ length: 24 }, (_, h) => h);

// Tap an hour to mark it, or drag across hours to mark a whole window at once.
// A drag that starts on a marked hour erases instead.
export function HourRuler({ value, onChange }: HourRulerProps) {
  const drag = useRef<{ anchor: number; on: boolean; base: Quarters } | null>(null);

  function hourAt(e: PointerEvent): number | null {
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-hour]');
    return el ? Number(el.dataset.hour) : null;
  }

  function paint(to: number) {
    const d = drag.current;
    if (!d) return;
    const from = Math.min(d.anchor, to);
    const until = Math.max(d.anchor, to) + 1;
    onChange(setRange(d.base, { start: from * 60, end: until * 60 }, d.on));
  }

  function handleDown(e: PointerEvent<HTMLDivElement>) {
    const hour = hourAt(e);
    if (hour === null) return;
    drag.current = { anchor: hour, on: hourState(value, hour) !== 'full', base: value };
    paint(hour);
    // Keeps the drag alive when the finger leaves the ruler; some pointers can't be captured.
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* no capture — painting still works while over the ruler */
    }
  }

  function handleMove(e: PointerEvent<HTMLDivElement>) {
    if (!drag.current) return;
    const hour = hourAt(e);
    if (hour !== null) paint(hour);
  }

  return (
    <div
      className={styles.ruler}
      onPointerDown={handleDown}
      onPointerMove={handleMove}
      onPointerUp={() => (drag.current = null)}
      onPointerCancel={() => (drag.current = null)}
      role="group"
      aria-label="Часы: нажми или проведи пальцем"
    >
      {HOURS.map((h) => {
        const state = hourState(value, h);
        return (
          <span
            key={h}
            data-hour={h}
            className={[styles.hour, state === 'full' ? styles.full : '', state === 'part' ? styles.part : ''].join(' ')}
          >
            {String(h).padStart(2, '0')}
          </span>
        );
      })}
    </div>
  );
}
