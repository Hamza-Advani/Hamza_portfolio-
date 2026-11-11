import { rateLimit } from 'express-rate-limit';
import { ZodError } from 'zod';
import { HttpError, badRequest } from '../utils/httpError.js';
import { env } from '../config/env.js';

export const validate = (schema, data) => {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message }));
    throw badRequest(details[0]?.message || 'Invalid input', details);
  }
  return result.data;
};

const limiterBase = {
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  skip: () => env.isTest,
  handler: (_req, res) => res.status(429).json({ error: 'Too many requests. Please try again later.' }),
};

export const apiLimiter = rateLimit({ ...limiterBase, windowMs: 15 * 60 * 1000, limit: 400 });
export const contactLimiter = rateLimit({ ...limiterBase, windowMs: 15 * 60 * 1000, limit: 5 });

export function notFoundHandler(req, res) {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.originalUrl}` });
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, _req, res, _next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  if (err instanceof ZodError) {
    return res.status(400).json({ error: 'Invalid input', details: err.issues });
  }
  if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large' });
  if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Malformed JSON body' });

  console.error('[api] Unhandled error:', err);
  res.status(500).json({ error: 'Something went wrong on the server.' });
}
