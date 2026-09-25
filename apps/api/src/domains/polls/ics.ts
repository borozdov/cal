import type { Request, Response } from 'express';
import { prisma } from '../../db/client.js';
import { notFound } from '../../middleware/http-error.js';
import { param } from '../../lib/params.js';

function pad(n: number): string {
  return n.toString().padStart(2, '0');
}

// Minutes past midnight may run into the next day (a 23:00 start lasting 2 hours).
function toIcsDate(date: string, minute: number): string {
  const [y, m, d] = date.split('-').map(Number);
  const at = new Date(Date.UTC(y, m - 1, d, 0, minute));
  return `${at.getUTCFullYear()}${pad(at.getUTCMonth() + 1)}${pad(at.getUTCDate())}T${pad(at.getUTCHours())}${pad(at.getUTCMinutes())}00`;
}

function nextDay(date: string): string {
  const [y, m, d] = date.split('-').map(Number);
  const at = new Date(Date.UTC(y, m - 1, d + 1));
  return `${at.getUTCFullYear()}${pad(at.getUTCMonth() + 1)}${pad(at.getUTCDate())}`;
}

function escapeIcsText(text: string): string {
  return text.replace(/\\/g, '\\\\').replace(/;/g, '\\;').replace(/,/g, '\\,').replace(/\n/g, '\\n');
}

export async function getIcs(req: Request, res: Response): Promise<void> {
  const poll = await prisma.poll.findUnique({ where: { slug: param(req.params.slug) } });
  if (!poll) throw notFound('Встреча не найдена');
  if (poll.confirmedDate === null || poll.confirmedStartMinute === null) {
    throw notFound('Время встречи ещё не назначено');
  }

  const isAllDay = (poll.times as number[]).length === 0;
  const dtStart = isAllDay
    ? `;VALUE=DATE:${poll.confirmedDate.replaceAll('-', '')}`
    : `:${toIcsDate(poll.confirmedDate, poll.confirmedStartMinute)}`;
  const dtEnd = isAllDay
    ? `;VALUE=DATE:${nextDay(poll.confirmedDate)}`
    : `:${toIcsDate(poll.confirmedDate, poll.confirmedStartMinute + poll.duration)}`;
  const now = new Date();
  const stamp = `${now.getUTCFullYear()}${pad(now.getUTCMonth() + 1)}${pad(now.getUTCDate())}T${pad(now.getUTCHours())}${pad(now.getUTCMinutes())}${pad(now.getUTCSeconds())}Z`;

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//BOROZDOV//Cal//RU',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${poll.slug}@cal`,
    `DTSTAMP:${stamp}`,
    `DTSTART${dtStart}`,
    `DTEND${dtEnd}`,
    `SUMMARY:${escapeIcsText(poll.title)}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ];

  res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="${poll.slug}.ics"`);
  res.send(lines.join('\r\n'));
}
