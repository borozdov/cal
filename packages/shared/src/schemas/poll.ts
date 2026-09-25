import { z } from 'zod';

// A poll is a set of options: every chosen day × every chosen start time.
// No times means the options are whole days.
export const MAX_DAYS = 7;
export const MAX_TIMES = 48;
export const ALL_DAY = 0;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Ожидается дата в формате YYYY-MM-DD');
const minute = z.number().int().min(0).max(1439);

export const pollCreateSchema = z.object({
  title: z.string().trim().min(1, 'Напиши, что планируем').max(80),
  dates: z
    .array(isoDate)
    .min(1, 'Выбери хотя бы один день')
    .max(MAX_DAYS, `Не больше ${MAX_DAYS} дней`)
    .refine((d) => new Set(d).size === d.length, 'Дни повторяются'),
  times: z
    .array(minute)
    .max(MAX_TIMES, `Не больше ${MAX_TIMES} вариантов времени`)
    .refine((t) => new Set(t).size === t.length, 'Время повторяется'),
  duration: z.number().int().min(5, 'Встреча — минимум 5 минут').max(720, 'Встреча — максимум 12 часов'),
});
export type PollCreateInput = z.infer<typeof pollCreateSchema>;

export const slotSchema = z.object({ date: isoDate, startMinute: minute });
export type Slot = z.infer<typeof slotSchema>;

export const respondSchema = z.object({
  name: z.string().trim().min(1, 'Напиши своё имя').max(40),
  slots: z.array(slotSchema).max(MAX_DAYS * MAX_TIMES),
  participantId: z.string().min(1).optional(),
  force: z.boolean().optional(),
});
export type RespondInput = z.infer<typeof respondSchema>;

export const confirmSchema = slotSchema;

export interface Participant {
  id: string;
  name: string;
  slots: Slot[];
}

export interface Poll {
  slug: string;
  title: string;
  dates: string[];
  times: number[];
  duration: number;
  confirmed: Slot | null;
  participants: Participant[];
}

export interface PollCreated {
  slug: string;
  adminToken: string;
}

export function slotKey(date: string, startMinute: number): string {
  return `${date}:${startMinute}`;
}

export type ApiResponse<T> = { data: T } | { error: { code: string; message: string } };
