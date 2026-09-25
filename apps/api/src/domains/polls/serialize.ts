import type { Poll as PrismaPoll } from '../../generated/prisma/client.js';
import type { Poll } from '@cal/shared';

type PollWithParticipants = PrismaPoll & {
  participants: { id: string; name: string; slots: { date: string; startMinute: number }[] }[];
};

export const withParticipants = {
  participants: { include: { slots: true }, orderBy: { createdAt: 'asc' } },
} as const;

export function toPoll(poll: PollWithParticipants): Poll {
  return {
    slug: poll.slug,
    title: poll.title,
    dates: poll.dates as string[],
    times: poll.times as number[],
    duration: poll.duration,
    confirmed:
      poll.confirmedDate !== null && poll.confirmedStartMinute !== null
        ? { date: poll.confirmedDate, startMinute: poll.confirmedStartMinute }
        : null,
    participants: poll.participants.map((p) => ({
      id: p.id,
      name: p.name,
      slots: p.slots.map((s) => ({ date: s.date, startMinute: s.startMinute })),
    })),
  };
}
