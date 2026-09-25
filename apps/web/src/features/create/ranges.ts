// The organizer's free time is kept as 96 quarter-hours of one day; ranges are the
// runs of marked quarters. Painting on the ruler and typing times both edit this.
export const QUARTERS = 96;
export type Quarters = boolean[];

export interface Range {
  start: number; // minutes
  end: number; // minutes, exclusive, up to 1440
}

export function emptyQuarters(): Quarters {
  return Array<boolean>(QUARTERS).fill(false);
}

export function toRanges(q: Quarters): Range[] {
  const ranges: Range[] = [];
  for (let i = 0; i < QUARTERS; i++) {
    if (!q[i]) continue;
    const start = i;
    while (i < QUARTERS && q[i]) i++;
    ranges.push({ start: start * 15, end: i * 15 });
  }
  return ranges;
}

export function setRange(q: Quarters, range: Range, on: boolean): Quarters {
  const next = [...q];
  const from = Math.round(range.start / 15);
  const to = Math.round(range.end / 15);
  for (let i = from; i < to; i++) next[i] = on;
  return next;
}

export function hourState(q: Quarters, hour: number): 'full' | 'part' | 'none' {
  const marked = q.slice(hour * 4, hour * 4 + 4).filter(Boolean).length;
  return marked === 4 ? 'full' : marked > 0 ? 'part' : 'none';
}

// Short meetings get a start every duration; longer ones every half hour / hour,
// so a 10:00–15:00 window with 1 h meetings offers 10, 11, 12, 13, 14.
export function stepFor(duration: number): number {
  if (duration <= 30) return duration;
  return duration < 60 ? 30 : 60;
}

export function startTimes(ranges: Range[], duration: number): number[] {
  const step = stepFor(duration);
  const times: number[] = [];
  for (const r of ranges) {
    for (let t = r.start; t + duration <= r.end && t < 1440; t += step) times.push(t);
  }
  return times;
}
