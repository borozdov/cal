import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { asyncHandler } from '../../middleware/error-handler.js';
import { createPoll } from './create.js';
import { getPoll } from './get.js';
import { respondToPoll } from './respond.js';
import { checkAdmin, confirmPoll, unconfirmPoll } from './admin.js';
import { getIcs } from './ics.js';

const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

export const pollsRouter = Router();

pollsRouter.post('/', createLimiter, asyncHandler(createPoll));
pollsRouter.get('/:slug', asyncHandler(getPoll));
pollsRouter.post('/:slug/respond', asyncHandler(respondToPoll));
pollsRouter.get('/:slug/ics', asyncHandler(getIcs));
pollsRouter.get('/:slug/admin/:adminToken', asyncHandler(checkAdmin));
pollsRouter.post('/:slug/admin/:adminToken/confirm', asyncHandler(confirmPoll));
pollsRouter.post('/:slug/admin/:adminToken/unconfirm', asyncHandler(unconfirmPoll));
