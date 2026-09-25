import { ALL_DAY, slotKey, type Poll } from '@cal/shared';

export function optionTimes(poll: Poll): number[] {
  return poll.times.length ? poll.times : [ALL_DAY];
}

export function optionKeys(poll: Poll): string[] {
  return poll.dates.flatMap((d) => optionTimes(poll).map((t) => slotKey(d, t)));
}

export function parseKey(key: string): { date: string; startMinute: number } {
  const [date, minute] = key.split(':');
  return { date, startMinute: Number(minute) };
}

// key → names of everyone who can make it
export function whoCan(poll: Poll, skipParticipantId?: string): Map<string, string[]> {
  const map = new Map(optionKeys(poll).map((k) => [k, [] as string[]]));
  for (const p of poll.participants) {
    if (p.id === skipParticipantId) continue;
    for (const s of p.slots) map.get(slotKey(s.date, s.startMinute))?.push(p.name);
  }
  return map;
}

// Most people wins; ties go to the earliest option.
export function bestKey(names: Map<string, string[]>): string | null {
  let best: string | null = null;
  let max = 0;
  for (const [key, list] of names) {
    if (list.length > max) {
      max = list.length;
      best = key;
    }
  }
  return best;
}
