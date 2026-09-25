import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { MAX_DAYS, MAX_TIMES, type PollCreated } from '@cal/shared';
import { api, ApiError } from '../../api/client.js';
import { Banner } from '../../primitives/Banner.js';
import { Button } from '../../primitives/Button.js';
import { Chip } from '../../primitives/Chip.js';
import { Input } from '../../primitives/Input.js';
import { TimeInput } from '../../primitives/TimeInput.js';
import {
  addDays, formatDuration, formatMinutes, MONTHS_SHORT, pluralOptions, startOfWeek, toIsoDate, WEEKDAYS_SUN_FIRST,
} from '../../lib/date.js';
import { storage } from '../../lib/storage.js';
import { HourRuler } from './HourRuler.js';
import { emptyQuarters, setRange, startTimes, toRanges, type Quarters, type Range } from './ranges.js';
import styles from './CreatePage.module.css';

const DURATIONS = [30, 60, 90, 120];
const STRIP_DAYS = 14;

export function CreatePage() {
  const navigate = useNavigate();
  const todayIso = toIsoDate(new Date());
  const [weekOffset, setWeekOffset] = useState(0);
  const [title, setTitle] = useState('');
  const [dates, setDates] = useState<string[]>([]);
  const [allDay, setAllDay] = useState(false);
  const [quarters, setQuarters] = useState<Quarters>(emptyQuarters);
  const [duration, setDuration] = useState(60);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const stripStart = addDays(startOfWeek(new Date()), weekOffset * 7);
  const strip = Array.from({ length: STRIP_DAYS }, (_, i) => addDays(stripStart, i));
  const stripEnd = strip[strip.length - 1];
  const ranges = toRanges(quarters);
  const times = startTimes(ranges, duration);
  const optionCount = dates.length * (allDay ? 1 : times.length);

  function toggleDate(iso: string) {
    setError(null);
    if (dates.includes(iso)) return setDates(dates.filter((d) => d !== iso));
    if (dates.length >= MAX_DAYS) return setError(`Можно выбрать не больше ${MAX_DAYS} дней`);
    setDates([...dates, iso].sort());
  }

  function editRanges(next: Quarters) {
    setError(null);
    setAllDay(false);
    setQuarters(next);
  }

  function updateRange(old: Range, next: Range) {
    if (next.end <= next.start) return setError('Конец должен быть позже начала');
    editRanges(setRange(setRange(quarters, old, false), next, true));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError('Напиши, что планируем');
    if (dates.length === 0) return setError('Выбери хотя бы один день');
    if (!allDay && ranges.length === 0) return setError('Отметь часы, когда можно встретиться');
    if (!allDay && times.length === 0) return setError('Промежуток короче встречи — растяни его или сократи длительность');
    if (times.length > MAX_TIMES) {
      return setError(`Слишком много вариантов в день (${times.length}). Максимум ${MAX_TIMES} — сократи часы или увеличь длительность`);
    }
    setSubmitting(true);
    setError(null);
    try {
      const poll = await api.post<PollCreated>('/polls', {
        title: title.trim(),
        dates,
        times: allDay ? [] : times,
        duration,
      });
      storage.rememberMyPoll({ slug: poll.slug, adminToken: poll.adminToken, title: title.trim() });
      navigate(`/p/${poll.slug}/admin/${poll.adminToken}`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось создать встречу');
      setSubmitting(false);
    }
  }

  return (
    <form className={styles.page} onSubmit={handleSubmit}>
      <section className={styles.step}>
        <h2 className={styles.stepTitle}><span className={styles.stepNum}>1</span>ЧТО ПЛАНИРУЕМ?</h2>
        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Например, планёрка по проекту"
          maxLength={80}
          aria-label="Название встречи"
        />
      </section>

      <section className={styles.step}>
        <div className={styles.stepHead}>
          <h2 className={styles.stepTitle}><span className={styles.stepNum}>2</span>КАКИЕ ДНИ?</h2>
          <div className={styles.stripNav}>
            <button
              type="button"
              className={styles.navBtn}
              onClick={() => setWeekOffset(weekOffset - 2)}
              disabled={weekOffset === 0}
              aria-label="Раньше"
            >
              <Arrow dir="left" />
            </button>
            <span className={styles.stripRange}>
              {stripStart.getDate()} {MONTHS_SHORT[stripStart.getMonth()]} — {stripEnd.getDate()}{' '}
              {MONTHS_SHORT[stripEnd.getMonth()]}
            </span>
            <button type="button" className={styles.navBtn} onClick={() => setWeekOffset(weekOffset + 2)} aria-label="Позже">
              <Arrow dir="right" />
            </button>
          </div>
        </div>
        <div className={styles.strip}>
          {strip.map((d) => {
            const iso = toIsoDate(d);
            const selected = dates.includes(iso);
            return (
              <button
                key={iso}
                type="button"
                className={[styles.day, selected ? styles.dayOn : '', iso === todayIso ? styles.today : ''].join(' ')}
                aria-pressed={selected}
                disabled={iso < todayIso}
                onClick={() => toggleDate(iso)}
              >
                <span className={styles.weekday}>{iso === todayIso ? 'СЕГОДНЯ' : WEEKDAYS_SUN_FIRST[d.getDay()]}</span>
                <span className="num">{d.getDate()}</span>
              </button>
            );
          })}
        </div>
      </section>

      <section className={styles.step}>
        <div className={styles.stepHead}>
          <h2 className={styles.stepTitle}><span className={styles.stepNum}>3</span>ВО СКОЛЬКО?</h2>
          <Chip active={allDay} onClick={() => { setAllDay(!allDay); setError(null); }}>ВЕСЬ ДЕНЬ</Chip>
        </div>
        {allDay ? (
          <p className={styles.hint}>Участники выберут подходящие дни целиком, без времени.</p>
        ) : (
          <>
            <HourRuler value={quarters} onChange={editRanges} />
            <div className={styles.ranges}>
              {ranges.length === 0 && <span className={styles.hint}>Проведи пальцем по часам, когда можно встретиться</span>}
              {ranges.map((r) => (
                <span key={`${r.start}-${r.end}`} className={styles.range}>
                  <TimeInput value={r.start} ariaLabel="Начало" onChange={(v) => updateRange(r, { ...r, start: v })} />
                  <span className={styles.dash}>—</span>
                  <TimeInput value={r.end} max={1440} ariaLabel="Конец" onChange={(v) => updateRange(r, { ...r, end: v })} />
                  <button type="button" className={styles.iconBtn} aria-label="Убрать промежуток"
                    onClick={() => editRanges(setRange(quarters, r, false))}>
                    <Icon d="M18 6 6 18M6 6l12 12" />
                  </button>
                </span>
              ))}
            </div>
          </>
        )}
      </section>

      {!allDay && (
        <section className={styles.step}>
          <h2 className={styles.stepTitle}><span className={styles.stepNum}>4</span>СКОЛЬКО ДЛИТСЯ?</h2>
          <div className={styles.durationRow}>
            {DURATIONS.map((d) => (
              <Chip key={d} active={duration === d} onClick={() => setDuration(d)}>
                {formatDuration(d)}
              </Chip>
            ))}
            <DurationInput value={DURATIONS.includes(duration) ? null : duration} onChange={setDuration} />
          </div>
        </section>
      )}

      <div className={styles.footer}>
        {!allDay && times.length > MAX_TIMES && (
          <p className={[styles.preview, styles.previewBad].join(' ')}>
            <b className="num">{times.length}</b> {pluralOptions(times.length)} в день — максимум {MAX_TIMES}. Сократи
            часы или увеличь длительность.
          </p>
        )}
        {!allDay && times.length > 0 && times.length <= MAX_TIMES && (
          <p className={styles.preview}>
            <b className="num">{times.length}</b> {pluralOptions(times.length)} в день:{' '}
            <span className="num">{times.map(formatMinutes).join(', ')}</span>
          </p>
        )}
        {!allDay && ranges.length > 0 && times.length === 0 && (
          <p className={[styles.preview, styles.previewBad].join(' ')}>Промежуток короче встречи — растяни его.</p>
        )}
        {error && <Banner variant="error">{error}</Banner>}
        <Button type="submit" className={styles.submit} disabled={submitting || times.length > MAX_TIMES}>
          {submitting
            ? 'СОЗДАЁМ…'
            : optionCount > 0
              ? `СОЗДАТЬ · ${optionCount} ${pluralOptions(optionCount).toUpperCase()}`
              : 'СОЗДАТЬ'}
        </Button>
      </div>
    </form>
  );
}

function DurationInput({ value, onChange }: { value: number | null; onChange: (minutes: number) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <label className={[styles.durationInput, value !== null ? styles.durationOn : ''].join(' ')}>
      <input
        value={draft ?? (value !== null ? String(value) : '')}
        inputMode="numeric"
        placeholder="своя"
        aria-label="Своя длительность в минутах"
        onChange={(e) => {
          const digits = e.target.value.replace(/\D/g, '').slice(0, 3);
          setDraft(digits);
          if (Number(digits) >= 5) onChange(Number(digits));
        }}
        onBlur={() => setDraft(null)}
      />
      <span>мин</span>
    </label>
  );
}

function Icon({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.25"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}

function Arrow({ dir }: { dir: 'left' | 'right' }) {
  return (
    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.25"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={dir === 'left' ? 'm15 18-6-6 6-6' : 'm9 18 6-6-6-6'} />
    </svg>
  );
}
