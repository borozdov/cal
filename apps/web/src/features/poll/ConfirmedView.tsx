import { useState } from 'react';
import { slotKey, type Poll } from '@cal/shared';
import { api, ApiError } from '../../api/client.js';
import { Banner } from '../../primitives/Banner.js';
import { Button } from '../../primitives/Button.js';
import { formatDayLong, formatMinutes } from '../../lib/date.js';
import buttonStyles from '../../primitives/Button.module.css';
import { whoCan } from './options.js';
import styles from './poll.module.css';

interface ConfirmedViewProps {
  poll: Poll;
  adminToken?: string;
  onChange: () => Promise<void>;
}

export function ConfirmedView({ poll, adminToken, onChange }: ConfirmedViewProps) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const slot = poll.confirmed;
  if (!slot) return null;

  const who = whoCan(poll).get(slotKey(slot.date, slot.startMinute)) ?? [];
  const isAllDay = poll.times.length === 0;

  async function reopen() {
    setBusy(true);
    try {
      await api.post(`/polls/${poll.slug}/admin/${adminToken}/unconfirm`);
      await onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось изменить');
      setBusy(false);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>{poll.title}</h1>
      </header>

      <div className={styles.confirmed}>
        <span className={styles.label}>ВСТРЕЧА НАЗНАЧЕНА</span>
        <p className={styles.confirmedDay}>{formatDayLong(slot.date)}</p>
        <p className={[styles.confirmedTime, 'num'].join(' ')}>
          {isAllDay ? 'ВЕСЬ ДЕНЬ' : `${formatMinutes(slot.startMinute)}–${formatMinutes(slot.startMinute + poll.duration)}`}
        </p>
        <p className={styles.hint}>
          {who.length ? `Могут прийти: ${who.join(', ')}` : 'Никто пока не отметил это время'}
        </p>
      </div>

      <div className={styles.footer}>
        {error && <Banner variant="error">{error}</Banner>}
        <div className={styles.stack}>
          <a href={`/api/polls/${poll.slug}/ics`} className={[buttonStyles.button, buttonStyles.primary].join(' ')}>
            ДОБАВИТЬ В КАЛЕНДАРЬ
          </a>
          {adminToken && (
            <Button type="button" variant="ghost" disabled={busy} onClick={() => void reopen()}>
              ИЗМЕНИТЬ ВРЕМЯ
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
