export class HttpError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
  }
}

export function notFound(message = 'Не найдено'): HttpError {
  return new HttpError(404, 'NOT_FOUND', message);
}

export function badRequest(message: string): HttpError {
  return new HttpError(400, 'BAD_REQUEST', message);
}

export function forbidden(message = 'Доступ запрещён'): HttpError {
  return new HttpError(403, 'FORBIDDEN', message);
}

export function conflict(message: string): HttpError {
  return new HttpError(409, 'CONFLICT', message);
}
