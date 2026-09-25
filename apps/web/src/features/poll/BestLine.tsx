import type { Poll } from '@cal/shared';
import { formatDayLong, formatMinutes, pluralPeople } from '../../lib/date.js';
import { Star } from './Board.js';
import { parseKey } from './options.js';
import styles from './poll.module.css';

interface BestLineProps {
  poll: Poll;
  names: Map<string, string[]>;
  total: number;
  best: string | null;
}

export function BestLine({ poll, names, total, best }: BestLineProps) {
  if (!best) return <p className={styles.best}>Пока никто не ответил.</p>;
  const { date, startMinute } = parseKey(best);
  const who = names.get(best) ?? [];
  return (
    <p className={styles.best}>
      <Star className={styles.bestStar} />
      <span>
        <b>
          {formatDayLong(date)}
          {poll.times.length > 0 && <span className="num"> · {formatMinutes(startMinute)}</span>}
        </b>
        {' — '}
        {who.length === total ? 'могут все' : `могут ${who.length} из ${total} ${pluralPeople(total)}`}
        <span className={styles.bestNames}>: {who.join(', ')}</span>
      </span>
    </p>
  );
}
