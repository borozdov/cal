export interface StoredParticipant {
  id: string;
  name: string;
}

export interface MyPoll {
  slug: string;
  adminToken: string;
  title: string;
}

function read<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* private mode / storage blocked — non-critical */
  }
}

const MINE_KEY = 'cal:mine';
const MINE_LIMIT = 20;

function myPolls(): MyPoll[] {
  return read<MyPoll[]>(MINE_KEY) ?? [];
}

export const storage = {
  participant: (slug: string) => read<StoredParticipant>(`cal:${slug}:participant`),
  saveParticipant: (slug: string, p: StoredParticipant) => write(`cal:${slug}:participant`, p),
  // Polls this device organizes, newest first — the only way back to a lost admin link.
  myPolls,
  adminToken: (slug: string) => myPolls().find((p) => p.slug === slug)?.adminToken ?? null,
  rememberMyPoll: (poll: MyPoll) =>
    write(MINE_KEY, [poll, ...myPolls().filter((p) => p.slug !== poll.slug)].slice(0, MINE_LIMIT)),
};
