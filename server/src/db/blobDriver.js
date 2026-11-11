import crypto from 'node:crypto';
import { get, put, del, list, BlobPreconditionFailedError } from '@vercel/blob';
import { buildSeed, seedSingletons } from '../data/seed.js';
import { sortDocs } from './index.js';

/**
 * Vercel Blob storage driver (private store).
 *
 * - All site content (profile, settings, video, skills, projects, posts, …) lives in ONE JSON
 *   document: `<prefix>content.json`. Writes use the document's ETag (ifMatch) so two
 *   simultaneous saves can never silently overwrite each other — a conflict is retried on the
 *   latest version.
 * - Contact messages are stored one file per message (`<prefix>messages/<id>.json`), so
 *   concurrent visitors never contend for the same file.
 * - The store is PRIVATE: nothing is readable without the server's credentials.
 * - On first use the starter content is written once.
 */
const ACCESS = { access: 'private' };
const stamp = () => new Date().toISOString();
const newId = () => crypto.randomUUID().replace(/-/g, '').slice(0, 20);

// Larger JSON responses are served compressed, which turns the ETag into a "weak" one
// (W/"…"). Conditional writes (ifMatch) need the plain value, so normalise it.
const strongEtag = (etag) => String(etag || '').replace(/^W\//, '');

async function readJson(pathname, ifNoneMatch) {
  const res = await get(pathname, { ...ACCESS, useCache: false, ...(ifNoneMatch ? { ifNoneMatch } : {}) });
  if (!res) return null;
  if (res.statusCode === 304) return { notModified: true, etag: ifNoneMatch };
  const text = await new Response(res.stream).text();
  return { data: JSON.parse(text), etag: strongEtag(res.blob.etag) };
}

const writeJson = (pathname, data, opts = {}) =>
  put(pathname, JSON.stringify(data), {
    ...ACCESS,
    contentType: 'application/json',
    addRandomSuffix: false,
    cacheControlMaxAge: 60,
    ...opts,
  });

export function createBlobDriver({ prefix = 'data/' } = {}) {
  const CONTENT = `${prefix}content.json`;
  const MESSAGES = `${prefix}messages/`;
  let cache = null; // { state, etag } — revalidated with ETag on every read

  async function load() {
    const res = await readJson(CONTENT, cache?.etag);
    if (res?.notModified) return cache;
    if (res) {
      cache = { state: res.data, etag: res.etag };
      return cache;
    }
    // First run: write the starter content (only if nobody else did meanwhile).
    const { singletons, collections } = buildSeed();
    delete collections.messages;
    const state = { singletons, collections, createdAt: stamp() };
    try {
      const written = await writeJson(CONTENT, state, { allowOverwrite: false });
      cache = { state, etag: strongEtag(written.etag) };
      console.log('[db] Initialised Vercel Blob store with starter content');
    } catch {
      cache = null; // another instance created it first — read that one
      return load();
    }
    return cache;
  }

  /** Read-modify-write with optimistic concurrency (retries on ETag conflicts). */
  async function mutate(fn) {
    for (let attempt = 0; attempt < 5; attempt++) {
      const { state, etag } = await load();
      const next = structuredClone(state);
      const result = fn(next);
      if (result === undefined) return undefined; // nothing to change (e.g. not found)
      try {
        const written = await writeJson(CONTENT, next, { ifMatch: etag });
        cache = { state: next, etag: strongEtag(written.etag) };
        return result;
      } catch (err) {
        if (!(err instanceof BlobPreconditionFailedError)) throw err;
        cache = null; // someone else saved first: reload and retry
      }
    }
    throw new Error('Could not save after several attempts — please try again.');
  }

  // ── Messages (one file each) ──────────────────────────────────────
  async function listMessages() {
    const out = [];
    let cursor;
    do {
      const page = await list({ prefix: MESSAGES, cursor, limit: 1000 });
      out.push(...page.blobs);
      cursor = page.hasMore ? page.cursor : undefined;
    } while (cursor);
    const docs = await Promise.all(out.map((b) => readJson(b.pathname).then((r) => r?.data)));
    return docs.filter(Boolean);
  }
  const messagePath = (id) => `${MESSAGES}${id.replace(/[^a-zA-Z0-9_-]/g, '')}.json`;
  const getMessage = async (id) => (await readJson(messagePath(id)))?.data || null;

  return {
    kind: 'blob',
    readOnly: false,

    async list(col) {
      if (col === 'messages') return sortDocs(await listMessages());
      const { state } = await load();
      return sortDocs(structuredClone(state.collections[col] || []));
    },

    async get(col, id) {
      if (col === 'messages') return getMessage(id);
      const { state } = await load();
      return structuredClone((state.collections[col] || []).find((d) => d.id === id) || null);
    },

    async create(col, data, id) {
      const doc = { ...data, id: id || newId(), createdAt: data.createdAt || stamp(), updatedAt: stamp() };
      if (col === 'messages') {
        await writeJson(messagePath(doc.id), doc, { allowOverwrite: false });
        return doc;
      }
      return mutate((s) => {
        (s.collections[col] ||= []).push(doc);
        return doc;
      });
    },

    async update(col, id, patch) {
      if (col === 'messages') {
        const existing = await getMessage(id);
        if (!existing) return null;
        const doc = { ...existing, ...patch, id, updatedAt: stamp() };
        await writeJson(messagePath(id), doc, { allowOverwrite: true });
        return doc;
      }
      const res = await mutate((s) => {
        const list = s.collections[col] || [];
        const i = list.findIndex((d) => d.id === id);
        if (i === -1) return undefined;
        list[i] = { ...list[i], ...patch, id, updatedAt: stamp() };
        return list[i];
      });
      return res ?? null;
    },

    async remove(col, id) {
      if (col === 'messages') {
        if (!(await getMessage(id))) return false;
        await del(messagePath(id));
        return true;
      }
      const res = await mutate((s) => {
        const list = s.collections[col] || [];
        const i = list.findIndex((d) => d.id === id);
        if (i === -1) return undefined;
        list.splice(i, 1);
        return true;
      });
      return res === true;
    },

    async getSingleton(name) {
      const { state } = await load();
      return structuredClone(state.singletons[name] || seedSingletons[name] || {});
    },

    async setSingleton(name, data) {
      return mutate((s) => {
        s.singletons[name] = { ...data, updatedAt: stamp() };
        return structuredClone(s.singletons[name]);
      });
    },
  };
}
