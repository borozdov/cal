import { badRequest } from '../middleware/http-error.js';

export function param(value: string | string[] | undefined): string {
  if (typeof value !== 'string') throw badRequest('Некорректный параметр запроса');
  return value;
}
