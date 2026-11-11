import { cdnCache } from '../utils/cache.js';
import { getDb } from '../db/index.js';
import { env } from '../config/env.js';
import { escapeHtml } from '../utils/text.js';

const STATIC_ROUTES = ['/', '/about', '/education', '/skills', '/projects', '/certificates', '/blog', '/journey', '/contact', '/cv'];

export async function sitemap(req, res) {
  const db = getDb();
  const base = env.isProduction && req.get('host') ? `https://${req.get('host')}` : env.siteUrl;
  const [projects, posts] = await Promise.all([db.list('projects'), db.list('posts')]);

  const urls = [
    ...STATIC_ROUTES.map((p) => ({ loc: `${base}${p}`, priority: p === '/' ? '1.0' : '0.7' })),
    ...projects.filter((p) => p.published).map((p) => ({ loc: `${base}/projects/${p.slug}`, lastmod: p.updatedAt, priority: '0.6' })),
    ...posts
      .filter((p) => p.status === 'published')
      .map((p) => ({ loc: `${base}/blog/${p.slug}`, lastmod: p.updatedAt || p.publishedAt, priority: '0.6' })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) =>
      `  <url><loc>${escapeHtml(u.loc)}</loc>${u.lastmod ? `<lastmod>${String(u.lastmod).slice(0, 10)}</lastmod>` : ''}<priority>${u.priority}</priority></url>`,
  )
  .join('\n')}
</urlset>`;

  res.set('Content-Type', 'application/xml; charset=utf-8');
  cdnCache(res, 3600);
  res.send(xml);
}
