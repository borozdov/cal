import type { Request, Response } from 'express';
import { respondSchema, slotKey } from '@cal/shared';
import { prisma } from '../../db/client.js';
import { badRequest, conflict, notFound, HttpError } from '../../middleware/http-error.js';
import { param } from '../../lib/params.js';

export async function respondToPoll(req: Request, res: Response): Promise<void> {
  const poll = await prisma.poll.findUnique({ where: { slug: param(req.params.slug) } });
  if (!poll) throw notFound('Встреча не найдена');
  if (poll.confirmedDate !== null) throw conflict('Время уже назначено, ответы больше не принимаются');

  const parsed = respondSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Некорректные данные');
  const { name, participantId, force } = parsed.data;

  const dates = poll.dates as string[];
  const times = poll.times as number[];
  const validKeys = new Set(dates.flatMap((d) => (times.length ? times : [0]).map((t) => slotKey(d, t))));
  const slots = parsed.data.slots.filter((s) => validKeys.has(slotKey(s.date, s.startMinute)));

  const existing = await prisma.participant.findUnique({ where: { pollId_name: { pollId: poll.id, name } } });
  if (existing && existing.id !== participantId && force !== true) {
    throw new HttpError(409, 'NAME_TAKEN', `«${name}» уже отвечал(а). Это ты?`);
  }

  const participant = await prisma.$transaction(async (tx) => {
    // Renaming: the stored participant keeps its row, only the name changes.
    const own = !existing && participantId
      ? await tx.participant.findFirst({ where: { id: participantId, pollId: poll.id } })
      : null;
    const p = existing
      ?? (own ? await tx.participant.update({ where: { id: own.id }, data: { name } }) : null)
      ?? (await tx.participant.create({ data: { pollId: poll.id, name } }));
    await tx.availabilitySlot.deleteMany({ where: { participantId: p.id } });
    if (slots.length > 0) {
      await tx.availabilitySlot.createMany({
        data: slots.map((s) => ({ participantId: p.id, date: s.date, startMinute: s.startMinute })),
      });
    }
    return p;
  });

  res.json({ data: { participantId: participant.id } });
}
