import type { Request, Response } from 'express';
import { confirmSchema, slotKey } from '@cal/shared';
import { prisma } from '../../db/client.js';
import { badRequest, forbidden, notFound } from '../../middleware/http-error.js';
import { param } from '../../lib/params.js';

async function loadByAdminToken(req: Request) {
  const poll = await prisma.poll.findUnique({ where: { slug: param(req.params.slug) } });
  if (!poll) throw notFound('Встреча не найдена');
  if (poll.adminToken !== param(req.params.adminToken)) throw forbidden('Неверная ссылка организатора');
  return poll;
}

export async function checkAdmin(req: Request, res: Response): Promise<void> {
  await loadByAdminToken(req);
  res.json({ data: { ok: true } });
}

export async function confirmPoll(req: Request, res: Response): Promise<void> {
  const poll = await loadByAdminToken(req);
  const parsed = confirmSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Некорректные данные');
  const { date, startMinute } = parsed.data;
  const times = poll.times as number[];
  const isOption = (poll.dates as string[]).includes(date) && (times.length ? times : [0]).includes(startMinute);
  if (!isOption) throw badRequest(`Такого варианта нет: ${slotKey(date, startMinute)}`);

  await prisma.poll.update({
    where: { id: poll.id },
    data: { confirmedDate: date, confirmedStartMinute: startMinute },
  });
  res.json({ data: { ok: true } });
}

export async function unconfirmPoll(req: Request, res: Response): Promise<void> {
  const poll = await loadByAdminToken(req);
  await prisma.poll.update({ where: { id: poll.id }, data: { confirmedDate: null, confirmedStartMinute: null } });
  res.json({ data: { ok: true } });
}
