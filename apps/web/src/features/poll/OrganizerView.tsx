import { useState } from 'react';
import { Link } from 'react-router';
import type { Poll } from '@cal/shared';
import { api, ApiError } from '../../api/client.js';
import { Banner } from '../../primitives/Banner.js';
import { Button } from '../../primitives/Button.js';
import { CopyButton } from '../../primitives/CopyButton.js';
import { formatDayShort, formatMinutes } from '../../lib/date.js';
import { Board } from './Board.js';
import { BestLine } from './BestLine.js';
import { bestKey, parseKey, whoCan } from './options.js';
import styles from './poll.module.css';

interface OrganizerViewProps {
  poll: Poll;
  adminToken: string;
  onChange: () => Promise<void>;
}

export function OrganizerView({ poll, adminToken, onChange }: OrganizerViewProps) {
  const names = whoCan(poll);
  const best = bestKey(names);
  const total = poll.participants.length;
  const [picked, setPicked] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [day, setDay] = useState(best ? parseKey(best).date : poll.dates[0]);

  const choice = picked ?? best;
  const shareUrl = `${globalThis.location.origin}/p/${poll.slug}`;
  const adminUrl = `${shareUrl}/admin/${adminToken}`;

  function bestOn(date: string): string {
    const max = Math.max(0, ...[...names].filter(([k]) => k.startsWith(`${date}:`)).map(([, who]) => who.length));
    return max ? String(max) : '';
  }

  async function confirm() {
    if (!choice) return;
    setBusy(true);
    setError(null);
    try {
      await api.post(`/polls/${poll.slug}/admin/${adminToken}/confirm`, parseKey(choice));
      await onChange();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Не удалось назначить время');
      setBusy(false);
    }
  }

  const choiceLabel = choice ? describe(choice, poll.times.length === 0) : null;

  return (
    <div className={styles.page}>
      <header className={styles.head}>
        <h1 className={styles.title}>{poll.title}</h1>
        <Link className={styles.sideLink} to={`/p/${poll.slug}`}>
          ОТМЕТИТЬ СЕБЯ →
        </Link>
      </header>

      <div className={styles.shareBox}>
        <span className={styles.label}>СКОПИРУЙ ССЫЛКУ</span>
        <div className={styles.shareButtons}>
          <CopyButton value={shareUrl} label="ДЛЯ УЧАСТНИКОВ" variant="primary" />
          <CopyButton value={adminUrl} label="ДЛЯ ОРГАНИЗАТОРОВ" />
        </div>
      </div>

      <Board
        poll={poll}
        names={names}
        total={total}
        active={new Set(choice ? [choice] : [])}
        best={best}
        day={day}
        onDay={setDay}
        dayBadge={bestOn}
        onToggle={setPicked}
      />

      {total > 0 ? (
        <BestLine poll={poll} names={names} total={total} best={best} />
      ) : (
        <p className={styles.hint}>Отправь ссылку участникам — их ответы появятся здесь.</p>
      )}

      <div className={styles.footer}>
        {error && <Banner variant="error">{error}</Banner>}
        <div className={styles.actions}>
          <Button type="button" disabled={!choice || busy} onClick={() => void confirm()}>
            {choiceLabel ? `НАЗНАЧИТЬ ${choiceLabel}` : 'НАЗНАЧИТЬ'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function describe(key: string, isAllDay: boolean): string {
  const { date, startMinute } = parseKey(key);
  const { weekday, day } = formatDayShort(date);
  return `${weekday} ${day}${isAllDay ? '' : ` · ${formatMinutes(startMinute)}`}`.toUpperCase();
}
