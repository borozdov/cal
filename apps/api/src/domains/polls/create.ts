import type { Request, Response } from 'express';
import { pollCreateSchema } from '@cal/shared';
import { prisma } from '../../db/client.js';
import { newAdminToken, newSlug } from './slug.js';
import { badRequest } from '../../middleware/http-error.js';

function isUniqueConstraintClash(err: unknown): boolean {
  return typeof err === 'object' && err !== null && 'code' in err && err.code === 'P2002';
}

export async function createPoll(req: Request, res: Response): Promise<void> {
  const parsed = pollCreateSchema.safeParse(req.body);
  if (!parsed.success) throw badRequest(parsed.error.issues[0]?.message ?? 'Некорректные данные');
  const input = parsed.data;

  for (let attempt = 0; attempt < 5; attempt++) {
    try {
      const poll = await prisma.poll.create({
        data: {
          slug: newSlug(),
          adminToken: newAdminToken(),
          title: input.title,
          dates: [...input.dates].sort(),
          times: [...input.times].sort((a, b) => a - b),
          duration: input.duration,
        },
      });
      res.status(201).json({ data: { slug: poll.slug, adminToken: poll.adminToken } });
      return;
    } catch (err) {
      if (!isUniqueConstraintClash(err)) throw err;
    }
  }
  throw badRequest('Не удалось создать встречу, попробуй ещё раз');
}
