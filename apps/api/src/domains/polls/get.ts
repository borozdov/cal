import type { Request, Response } from 'express';
import { prisma } from '../../db/client.js';
import { notFound } from '../../middleware/http-error.js';
import { param } from '../../lib/params.js';
import { toPoll, withParticipants } from './serialize.js';

export async function getPoll(req: Request, res: Response): Promise<void> {
  const poll = await prisma.poll.findUnique({ where: { slug: param(req.params.slug) }, include: withParticipants });
  if (!poll) throw notFound('Встреча не найдена');
  res.json({ data: toPoll(poll) });
}
