import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { env } from './config/env.js';
import { publicRouter, adminRouter } from './routes/index.js';
import { apiLimiter, publicReadLimiter, errorHandler, notFoundHandler } from './middleware/common.js';
import { sitemap } from './controllers/sitemapController.js';

const app = express();

app.set('trust proxy', 1); // behind Vercel's proxy: req.ip is the real client
app.disable('x-powered-by');
app.use(helmet({ crossOriginResourcePolicy: { policy: 'same-site' } }));
app.use(
  cors({
    origin(origin, cb) {
      // Same-origin requests (production on Vercel) send no Origin header for GET.
      if (!origin || env.corsOrigins.includes(origin)) return cb(null, true);
      return cb(null, false);
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    maxAge: 600,
  }),
);
app.use(express.json({ limit: '1mb' }));
app.use('/api', publicReadLimiter, apiLimiter);

app.get('/sitemap.xml', sitemap); // Vercel rewrites /sitemap.xml to this function
app.use('/api', publicRouter);
app.use('/api/admin', adminRouter);

app.use('/api', notFoundHandler);
app.use(errorHandler);

export default app;
