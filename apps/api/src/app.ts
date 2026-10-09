import { existsSync } from 'node:fs';
import path from 'node:path';
import express from 'express';
import { pollsRouter } from './domains/polls/router.js';
import { errorHandler } from './middleware/error-handler.js';

export const app = express();

// Behind the shared Caddy: the client IP (for rate limiting) is in X-Forwarded-For.
app.set('trust proxy', 1);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

app.use('/api/polls', pollsRouter);
app.use('/api', (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Не найдено' } });
});

// In production the same process serves the built SPA; in dev Vite does it.
const webDist = path.resolve(import.meta.dirname, '../../web/dist');
if (existsSync(webDist)) {
  app.use('/assets', express.static(path.join(webDist, 'assets'), { immutable: true, maxAge: '1y' }));
  app.use(express.static(webDist, { index: false, maxAge: '1h' }));
  // Paths the SPA routes to. Anything else still gets the SPA (it renders NotFound) but
  // with a real 404, so search engines do not index junk addresses as copies of `/`.
  const spaRoute = /^\/(p\/[^/]+(\/admin\/[^/]+)?|kitchen-sink)?\/?$/;
  app.get('/{*path}', (req, res) => {
    res.setHeader('Cache-Control', 'no-cache');
    if (!spaRoute.test(req.path)) res.status(404);
    res.sendFile(path.join(webDist, 'index.html'));
  });
}

app.use(errorHandler);
