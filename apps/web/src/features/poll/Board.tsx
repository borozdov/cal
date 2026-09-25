import { slotKey, type Poll } from '@cal/shared';
import { formatDayShort, formatMinutes, parseIsoDate } from '../../lib/date.js';
import { optionTimes } from './options.js';
import styles from './Board.module.css';

interface BoardProps {
  poll: Poll;
  names: Map<string, string[]>;
  total: number;
  active: Set<string>;
  best: string | null;
  day: string;
  onDay: (date: string) => void;
  dayBadge: (date: string) => string;
  onToggle: (key: string) => void;
}

// One day at a time: tabs for the days on top, that day's times as a tight grid below.
// Up to 48 times per day stay on one phone screen. Whole-day polls skip the tabs and
// show the days themselves as the buttons.
export function Board({ poll, names, total, active, best, day, onDay, dayBadge, onToggle }: BoardProps) {
  const isAllDay = poll.times.length === 0;

  function cell(key: string, label: string, sub?: string) {
    const who = names.get(key) ?? [];
    const isOn = active.has(key);
    return (
      <button
        key={key}
        type="button"
        className={[styles.cell, isOn ? styles.on : '', key === best ? styles.best : '', who.length ? styles.some : ''].join(' ')}
        aria-pressed={isOn}
        aria-label={`${sub ? `${sub} ` : ''}${label}: могут ${who.length} из ${total}`}
        title={who.length ? who.join(', ') : undefined}
        onClick={() => onToggle(key)}
      >
        {sub && <span className={styles.sub}>{sub}</span>}
        <span className={styles.time}>{label}</span>
        <span className={styles.count}>{who.length > 0 ? who.length : ''}</span>
        {key === best && <Star className={styles.star} />}
      </button>
    );
  }

  if (isAllDay) {
    return (
      <div className={[styles.grid, styles.days].join(' ')}>
        {poll.dates.map((date) => {
          const { weekday, day: d } = formatDayShort(date);
          return cell(slotKey(date, 0), d, weekday);
        })}
      </div>
    );
  }

  const times = optionTimes(poll);
  const density = times.length > 30 ? styles.dense : times.length > 12 ? styles.mid : styles.roomy;

  return (
    <div className={styles.wrap}>
      <div className={styles.tabs} role="tablist">
        {poll.dates.map((date) => {
          const d = parseIsoDate(date);
          const { weekday } = formatDayShort(date);
          const badge = dayBadge(date);
          return (
            <button
              key={date}
              type="button"
              role="tab"
              aria-selected={date === day}
              className={[styles.tab, date === day ? styles.tabOn : ''].join(' ')}
              onClick={() => onDay(date)}
            >
              <span className={styles.tabWeekday}>{weekday}</span>
              <span className="num">{d.getDate()}</span>
              <span className={styles.tabBadge}>{badge}</span>
            </button>
          );
        })}
      </div>
      <div className={[styles.grid, density].join(' ')} role="tabpanel">
        {times.map((t) => cell(slotKey(day, t), formatMinutes(t)))}
      </div>
    </div>
  );
}

export function Star({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 17.1l-5.9 3.2 1.3-6.5L2.5 9.3l6.6-.8z" />
    </svg>
  );
}
