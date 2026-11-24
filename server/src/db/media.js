import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, put } from '@vercel/blob';
import { env, isBlobConfigured } from '../config/env.js';

/**
 * Media storage used when Cloudinary is NOT configured (the admin's image/PDF uploads).
 *
 * - Production with a Vercel Blob store → files go into the same PRIVATE store as the content
 *   (`<prefix>media/<folder>/<id>.<ext>`) and are streamed back through GET /api/media/...
 * - Local development → files are written next to the local JSON store (server/.data/media).
 * - Tests (in-memory store) → kept in memory.
 *
 * File names are random and never reused, so responses can be cached forever.
 */
export const MEDIA_TYPES = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
  'image/gif': 'gif',
  'application/pdf': 'pdf',
};
const TYPE_BY_EXT = Object.fromEntries(Object.entries(MEDIA_TYPES).map(([t, e]) => [e, t]));
export const MEDIA_MAX_BYTES = 4 * 1024 * 1024; // Vercel Functions accept request bodies up to 4.5 MB
export const MEDIA_FOLDERS = ['profile', 'projects', 'certificates', 'blog', 'video', 'documents', 'misc'];

const here = path.dirname(fileURLToPath(import.meta.url));
const memory = new Map();

export function mediaBackend() {
  if (isBlobConfigured()) return 'blob';
  if (env.isTest || env.isProduction) return 'memory';
  return 'local';
}

const localDir = () => path.resolve(env.dataFile ? path.dirname(env.dataFile) : path.resolve(here, '../../.data'), 'media');
const blobPath = (key) => `${env.blobPrefix}media/${key}`;

/** Validates a media key like "projects/ab12cd34ef.webp". Returns null when invalid. */
export function parseKey(folder, file) {
  const m = /^([a-z0-9]{16,40})\.([a-z0-9]{2,5})$/.exec(file || '');
  if (!m || !MEDIA_FOLDERS.includes(folder) || !TYPE_BY_EXT[m[2]]) return null;
  return { key: `${folder}/${file}`, contentType: TYPE_BY_EXT[m[2]] };
}

export async function saveMedia({ folder, contentType, buffer }) {
  const ext = MEDIA_TYPES[contentType];
  const id = crypto.randomBytes(12).toString('hex');
  const key = `${folder}/${id}.${ext}`;
  const backend = mediaBackend();
  if (backend === 'blob') {
    await put(blobPath(key), buffer, { access: 'private', contentType, addRandomSuffix: false, allowOverwrite: false });
  } else if (backend === 'local') {
    const file = path.join(localDir(), key);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, buffer);
  } else {
    memory.set(key, buffer);
  }
  return { key, url: `/api/media/${key}`, bytes: buffer.length, contentType, backend };
}

/** Returns { body: ReadableStream|Buffer, size? } or null when the file does not exist. */
export async function readMedia(key) {
  const backend = mediaBackend();
  if (backend === 'blob') {
    const res = await get(blobPath(key), { access: 'private' });
    if (!res || res.statusCode !== 200) return null;
    return { body: res.stream, size: res.blob?.size };
  }
  if (backend === 'local') {
    const file = path.join(localDir(), key);
    return fs.existsSync(file) ? { body: fs.readFileSync(file) } : null;
  }
  const buf = memory.get(key);
  return buf ? { body: buf } : null;
}
