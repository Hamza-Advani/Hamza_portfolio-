---
title: Building a Clean REST API with Express 5 and Zod Validation
slug: express-rest-api-zod-validation
excerpt: Structure an Express API that is easy to read and hard to break — routers, controllers, schema validation with Zod, consistent errors and Express 5's built-in async error handling.
category: Backend
tags: express, nodejs, zod, rest-api, validation
publishedAt: 2026-10-18
seoTitle: Express 5 REST API with Zod Validation — A Practical Structure
---
Express is small and flexible, which is great for learning — and dangerous for growing projects, because nothing stops you putting everything in one file. The APIs behind this portfolio, AH Clothing Hub and my LMS all follow the same structure, and it keeps each part easy to find.

## A simple folder structure

```text
server/src/
  app.js            # creates the Express app, adds middleware, mounts routers
  routes/           # which URL calls which controller
  controllers/      # request → response logic
  schemas/          # Zod schemas describing valid input
  middleware/       # auth, rate limiting, error handler
  db/               # data access (Firestore, Blob, MongoDB...)
```

Routes stay tiny; controllers do the work:

```js
// routes/projects.js
import { Router } from 'express';
import * as projects from '../controllers/projects.js';
import { requireAdmin } from '../middleware/auth.js';

export const router = Router();
router.get('/', projects.list);
router.get('/:slug', projects.getBySlug);
router.post('/', requireAdmin, projects.create);
router.patch('/:id', requireAdmin, projects.update);
router.delete('/:id', requireAdmin, projects.remove);
```

## Validate every request body with Zod

Never save `req.body` directly. A Zod schema documents what you accept, removes unknown fields and gives clear error messages:

```js
// schemas/project.js
import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(120),
  summary: z.string().trim().max(400).default(''),
  technologies: z.array(z.string().trim().min(1).max(40)).max(30).default([]),
  liveUrl: z.string().trim().url().or(z.literal('')).default(''),
  published: z.boolean().default(false),
});
```

A small helper turns validation failures into a `400` response with field-level details:

```js
export function validate(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const details = Object.fromEntries(result.error.issues.map((i) => [i.path.join('.'), i.message]));
    throw Object.assign(new Error('Please check the highlighted fields.'), { status: 400, details });
  }
  return result.data; // cleaned, with defaults applied and unknown keys removed
}
```

For updates (`PATCH`), use `schema.partial()` so every field is optional — and only apply the keys the client actually sent, so defaults never overwrite existing data.

## Express 5 handles async errors for you

In Express 4, an error thrown inside an `async` handler crashed the request unless you wrapped it in `try/catch`. **Express 5 forwards rejected promises to your error handler automatically**, so controllers can simply `throw`:

```js
export async function getBySlug(req, res) {
  const project = await db.findBySlug(req.params.slug);
  if (!project) throw Object.assign(new Error('Project not found'), { status: 404 });
  res.json(project);
}
```

## One error handler, one error format

Register it **after** all routes. It decides what the client sees and hides internal details in production:

```js
app.use((err, req, res, _next) => {
  const status = err.status || 500;
  if (status >= 500) console.error(err); // log the real problem on the server
  res.status(status).json({
    error: status >= 500 ? 'Something went wrong. Please try again.' : err.message,
    ...(err.details ? { details: err.details } : {}),
  });
});
```

Because every error has the same shape (`{ error, details? }`), the frontend can show a toast with `error` and highlight fields from `details`.

## Useful middleware

```js
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

app.use(helmet());                       // secure HTTP headers
app.use(express.json({ limit: '1mb' })); // reject huge bodies early
app.use('/api/contact', rateLimit({ windowMs: 15 * 60_000, limit: 5 })); // stop form spam
```

## Use the right status codes

- `200` OK, `201` Created (after `POST`), `204` No Content (after `DELETE`).
- `400` invalid input, `401` not signed in, `403` not allowed, `404` not found, `409` conflict, `429` too many requests.

## Conclusion

Thin routes, focused controllers, Zod at the edges and one error handler: that structure keeps an Express API predictable. When something breaks, you know exactly which file to open — and invalid data never reaches your database.
