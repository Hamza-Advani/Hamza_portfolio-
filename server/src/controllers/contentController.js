import { cdnCache } from '../utils/cache.js';
import { getDb, COLLECTIONS, SINGLETONS } from '../db/index.js';
import { schemas, singletonSchemas } from '../schemas/index.js';
import { validate } from '../middleware/common.js';
import { notFound, badRequest } from '../utils/httpError.js';
import { slugify, cleanRichText, readingTime, stripHtml } from '../utils/text.js';

// ── Visibility rules for the public site ────────────────────────────────
const isPublic = {
  skills: (d) => d.published !== false,
  education: (d) => d.published !== false,
  certificates: (d) => d.published !== false,
  roadmap: (d) => d.published !== false,
  projects: (d) => d.published === true,
  posts: (d) => d.status === 'published',
};

const PUBLIC_COLLECTIONS = Object.keys(isPublic);

const assertCollection = (name, allowed = COLLECTIONS) => {
  if (!allowed.includes(name)) throw notFound(`Unknown collection "${name}"`);
};

const sortPosts = (posts) =>
  [...posts].sort((a, b) => String(b.publishedAt || b.createdAt).localeCompare(String(a.publishedAt || a.createdAt)));

const sortProjects = (projects) =>
  [...projects].sort((a, b) => Number(b.featured) - Number(a.featured) || (a.order ?? 0) - (b.order ?? 0) || String(b.date).localeCompare(String(a.date)));

// ── Public handlers ────────────────────────────────────────────────────
export async function getSite(_req, res) {
  const db = getDb();
  const [profile, settings, video] = await Promise.all(SINGLETONS.map((s) => db.getSingleton(s)));
  cdnCache(res, 10, 60);
  res.json({ profile, settings, video: video.published === false ? null : video, meta: { dataSource: db.kind } });
}

export async function listPublic(req, res) {
  const { collection } = req.params;
  assertCollection(collection, PUBLIC_COLLECTIONS);
  let docs = (await getDb().list(collection)).filter(isPublic[collection]);
  if (collection === 'posts') docs = sortPosts(docs).map(({ content, ...rest }) => rest);
  if (collection === 'projects') {
    docs = sortProjects(docs);
    if (req.query.featured === 'true') docs = docs.filter((d) => d.featured);
  }
  const limit = Number(req.query.limit);
  if (limit > 0) docs = docs.slice(0, limit);
  cdnCache(res, 10, 60);
  res.json(docs);
}

export async function getPublicBySlug(req, res) {
  const { collection, slug } = req.params;
  assertCollection(collection, ['projects', 'posts']);
  const docs = (await getDb().list(collection)).filter(isPublic[collection]);
  const doc = docs.find((d) => d.slug === slug || d.id === slug);
  if (!doc) throw notFound(collection === 'posts' ? 'Post not found' : 'Project not found');

  let related = [];
  if (collection === 'posts') {
    related = sortPosts(docs.filter((d) => d.id !== doc.id && (d.category === doc.category || d.tags?.some((t) => doc.tags?.includes(t)))))
      .slice(0, 3)
      .map(({ content, ...rest }) => rest);
  } else {
    related = sortProjects(docs.filter((d) => d.id !== doc.id)).slice(0, 3);
  }
  res.json({ ...doc, related });
}

// ── Admin handlers ─────────────────────────────────────────────────────
async function uniqueSlug(collection, base, excludeId) {
  const docs = await getDb().list(collection);
  const taken = new Set(docs.filter((d) => d.id !== excludeId).map((d) => d.slug));
  let slug = base || 'untitled';
  for (let i = 2; taken.has(slug); i++) slug = `${base}-${i}`;
  return slug;
}

async function prepare(collection, data, existing) {
  const out = { ...data };
  if (collection === 'projects' || collection === 'posts') {
    if ('slug' in out || 'title' in out) {
      const base = slugify(out.slug || out.title || existing?.slug || existing?.title);
      out.slug = await uniqueSlug(collection, base, existing?.id);
    }
  }
  if (collection === 'projects' && 'description' in out) out.description = cleanRichText(out.description);
  if (collection === 'posts') {
    if ('content' in out) {
      out.content = cleanRichText(out.content);
      out.readingTime = readingTime(out.content);
      if (!out.excerpt && !existing?.excerpt) out.excerpt = stripHtml(out.content).slice(0, 220);
    }
    const status = out.status ?? existing?.status;
    if (status === 'published' && !(out.publishedAt || existing?.publishedAt)) out.publishedAt = new Date().toISOString();
  }
  return out;
}

export async function adminList(req, res) {
  const { collection } = req.params;
  assertCollection(collection);
  let docs = await getDb().list(collection);
  if (collection === 'messages') docs.sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)));
  if (collection === 'posts') docs = sortPosts(docs);
  res.json(docs);
}

export async function adminGet(req, res) {
  const { collection, id } = req.params;
  assertCollection(collection);
  const doc = await getDb().get(collection, id);
  if (!doc) throw notFound();
  res.json(doc);
}

export async function adminCreate(req, res) {
  const { collection } = req.params;
  assertCollection(collection);
  if (collection === 'messages') throw badRequest('Messages are created through the contact form');
  const data = await prepare(collection, validate(schemas[collection], req.body));
  const doc = await getDb().create(collection, data);
  res.status(201).json(doc);
}

export async function adminUpdate(req, res) {
  const { collection, id } = req.params;
  assertCollection(collection);
  const db = getDb();
  const existing = await db.get(collection, id);
  if (!existing) throw notFound();
  const patch = validate(schemas[collection].partial(), req.body);
  // .partial() keeps defaults for missing keys in zod 4 — only apply keys the client sent.
  const sent = Object.fromEntries(Object.entries(patch).filter(([k]) => k in (req.body || {})));
  const doc = await db.update(collection, id, await prepare(collection, sent, existing));
  res.json(doc);
}

export async function adminDelete(req, res) {
  const { collection, id } = req.params;
  assertCollection(collection);
  const ok = await getDb().remove(collection, id);
  if (!ok) throw notFound();
  res.status(204).end();
}

export async function adminGetSingleton(req, res) {
  const { name } = req.params;
  if (!SINGLETONS.includes(name)) throw notFound();
  res.json(await getDb().getSingleton(name));
}

export async function adminSetSingleton(req, res) {
  const { name } = req.params;
  if (!SINGLETONS.includes(name)) throw notFound();
  const db = getDb();
  const current = await db.getSingleton(name);
  const merged = { ...current, ...(req.body || {}) };
  delete merged.updatedAt;
  const data = validate(singletonSchemas[name], merged);
  res.json(await db.setSingleton(name, data));
}

export async function adminStats(_req, res) {
  const db = getDb();
  const [projects, posts, certificates, skills, messages, roadmap] = await Promise.all(
    ['projects', 'posts', 'certificates', 'skills', 'messages', 'roadmap'].map((c) => db.list(c)),
  );
  const topics = roadmap.flatMap((s) => s.topics || []);
  res.json({
    dataSource: db.kind,
    readOnly: db.readOnly,
    projects: { total: projects.length, published: projects.filter((p) => p.published).length, featured: projects.filter((p) => p.featured).length },
    posts: { total: posts.length, published: posts.filter((p) => p.status === 'published').length, drafts: posts.filter((p) => p.status !== 'published').length },
    certificates: { total: certificates.length },
    skills: { total: skills.length },
    messages: { total: messages.length, unread: messages.filter((m) => !m.read).length },
    roadmap: {
      topics: topics.length,
      completed: topics.filter((t) => t.status === 'Completed').length,
      learning: topics.filter((t) => t.status === 'Currently Learning').length,
    },
    recentMessages: messages
      .sort((a, b) => String(b.createdAt).localeCompare(String(a.createdAt)))
      .slice(0, 5)
      .map(({ id, name, subject, createdAt, read }) => ({ id, name, subject, createdAt, read })),
  });
}
