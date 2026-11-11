import { Router } from 'express';
import * as content from '../controllers/contentController.js';
import { submitContact } from '../controllers/contactController.js';
import { signUpload, verifyUpload, deleteUpload } from '../controllers/uploadController.js';
import { getGithub } from '../controllers/githubController.js';
import { sitemap } from '../controllers/sitemapController.js';
import { requireAdmin } from '../middleware/auth.js';
import { contactLimiter } from '../middleware/common.js';
import { getDb } from '../db/index.js';
import { isCloudinaryConfigured, isFirebaseConfigured, isResendConfigured, isDevAuthEnabled } from '../config/env.js';

// ── Public API ─────────────────────────────────────────────────────────
export const publicRouter = Router();

publicRouter.get('/health', (_req, res) => {
  res.json({
    ok: true,
    dataSource: getDb().kind,
    services: {
      firebase: isFirebaseConfigured(),
      cloudinary: isCloudinaryConfigured(),
      resend: isResendConfigured(),
      devAuth: isDevAuthEnabled(),
    },
  });
});
publicRouter.get('/sitemap.xml', sitemap);
publicRouter.get('/public/site', content.getSite);
publicRouter.get('/public/github', getGithub);
publicRouter.get('/public/:collection', content.listPublic);
publicRouter.get('/public/:collection/:slug', content.getPublicBySlug);
publicRouter.post('/contact', contactLimiter, submitContact);

// ── Admin API (Firebase ID token + admin custom claim) ────────────────
export const adminRouter = Router();
adminRouter.use(requireAdmin);

adminRouter.get('/me', (req, res) => res.json({ user: req.user }));
adminRouter.get('/stats', content.adminStats);

adminRouter.post('/uploads/sign', signUpload);
adminRouter.post('/uploads/verify', verifyUpload);
adminRouter.delete('/uploads', deleteUpload);

adminRouter.get('/site/:name', content.adminGetSingleton);
adminRouter.put('/site/:name', content.adminSetSingleton);

adminRouter.get('/content/:collection', content.adminList);
adminRouter.post('/content/:collection', content.adminCreate);
adminRouter.get('/content/:collection/:id', content.adminGet);
adminRouter.patch('/content/:collection/:id', content.adminUpdate);
adminRouter.delete('/content/:collection/:id', content.adminDelete);
