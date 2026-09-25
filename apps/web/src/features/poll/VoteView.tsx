import { useState, type FormEvent } from 'react';
import { Link } from 'react-router';
import type { Poll } from '@cal/shared';
import { api, ApiError } from '../../api/client.js';
import { Banner } from '../../primitives/Banner.js';
import { Button } from '../../primitives/Button.js';
import { Input } from '../../primitives/Input.js';
import { storage } from '../../lib/storage.js';
import { Board } from './Board.js';
import { BestLine } from './BestLine.js';
import { bestKey, optionKeys, optionTimes, parseKey, whoCan } from './options.js';
import { slotKey } from '@cal/shared';
import styles from './poll.module.css';

export function VoteView({ poll, onSaved }: { poll: Poll; onSaved: () => Promise<void> }) {
  const stored = storage.participant(poll.slug);
  const me = poll.participants.find((p) => p.id === stored?.id);
  const adminToken = storage.adminToken(poll.slug);

  const [name, setName] = useState(me?.name ?? stored?.name ?? '');
  const [selected, setSelected] = useState(() => new Set(me?.slots.map((s) => slotKey(s.date, s.startMinute))));
  const [participantId, setParticipantId] = useState(me?.id);
  const [dirty, setDirty] = useState(!me);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameTaken, setNameTaken] = useState<string | null>(null);
  const [day, setDay] = useState(poll.dates[0]);

  // Everyone else's answers plus my live, not yet saved taps.
  const names = whoCan(poll, participantId);
  const myLabel = name.trim() || 'Ты';
  for (const key of selected) names.get(key)?.push(myLabel);
  const total = poll.participants.filter((p) => p.id !== participantId).length + 1;
  const best = bestKey(names);

  function update(change: (next: Set<string>) => void) {
    setSelected((prev) => {
      const next = new Set(prev);
      change(next);
      return next;
    });
    setDirty(true);
    setError(null);
  }

  function toggle(key: string) {
    update((next) => (next.has(key) ? next.delete(key) : next.add(key)));
  }

  const dayKeys = optionTimes(poll).map((t) => slotKey(day, t));
  const wholeDayOn = dayKeys.every((k) => selected.has(k));

  function toggleWholeDay() {
    update((next) => dayKeys.forEach((k) => (wholeDayOn ? next.delete(k) : next.add(k))));
  }

  function marksOn(date: string): string {
    const n = [...selected].filter((k) => k.startsWith(`${date}:`)).length;
    return n ? String(n) : '';
  }

  async function save(slots: Set<string>, force = false) {
    if (!name.trim()) return setError('Сначала напиши своё имя');
    setSubmitting(true);
    setError(null);
    setNameTaken(null);
    try {
      const result = await api.post<{ participantId: string }>(`/polls/${poll.slug}/respond`, {
        name: name.trim(),
        participantId,
        slots: [...slots].filter((k) => optionKeys(poll).includes(k)).map(parseKey),
        force: force || undefined,
      });
      storage.saveParticipant(poll.slug, { id: result.participantId, name: name.trim() });
      setParticipantId(result.participantId);
      setSelected(slots);
      setDirty(false);
      await onSaved();
    } catch (err) {
      if (err instanceof ApiError && err.code === 'NAME_TAKEN') setNameTaken(err.message);
      else setError(err instanceof ApiError ? err.message : 'Не удалось сохранить');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form
      className={styles.page}
      onSubmit={(e: FormEvent) => {
        e.preventDefault();
        void save(selected);
      }}
    >
      <header className={styles.head}>
        <h1 className={styles.title}>{poll.title}</h1>
        {adminToken && (
          <Link className={styles.sideLink} to={`/p/${poll.slug}/admin/${adminToken}`}>
            ОРГАНИЗАТОР →
          </Link>
        )}
      </header>

      <Input
        value={name}
        onChange={(e) => {
          setName(e.target.value);
          setDirty(true);
        }}
        placeholder="Как тебя зовут?"
        aria-label="Как тебя зовут?"
        maxLength={40}
      />

      <div className={styles.hintRow}>
        <p className={styles.hint}>
          Нажми, когда <b>можешь</b>. Цифра — сколько уже могут.
        </p>
        {poll.times.length > 0 && (
          <button type="button" className={styles.textBtn} onClick={toggleWholeDay}>
            {wholeDayOn ? 'СНЯТЬ ДЕНЬ' : 'ВЕСЬ ДЕНЬ'}
          </button>
        )}
      </div>

      <Board
        poll={poll}
        names={names}
        total={total}
        active={selected}
        best={best}
        day={day}
        onDay={setDay}
        dayBadge={marksOn}
        onToggle={toggle}
      />

      <BestLine poll={poll} names={names} total={total} best={best} />

      <div className={styles.footer}>
        {error && <Banner variant="error">{error}</Banner>}
        {nameTaken && (
          <Banner variant="error">
            {nameTaken}{' '}
            <button type="button" className={styles.inlineLink} onClick={() => void save(selected, true)}>
              ДА, ЭТО Я
            </button>
          </Banner>
        )}
        {!dirty && !error && <Banner>Готово, ответ сохранён. Можно вернуться по этой ссылке и поменять.</Banner>}
        <div className={styles.actions}>
          <Button type="button" variant="secondary" disabled={submitting} onClick={() => void save(new Set())}>
            НИЧЕГО НЕ ПОДХОДИТ
          </Button>
          <Button type="submit" disabled={submitting || !dirty}>
            {submitting ? 'СОХРАНЯЕМ…' : participantId ? 'СОХРАНИТЬ' : 'ГОТОВО'}
          </Button>
        </div>
      </div>
    </form>
  );
}
