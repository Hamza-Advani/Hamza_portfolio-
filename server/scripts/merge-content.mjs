// Adds NEW starter content (projects, blog posts) to the live Vercel Blob content document
// WITHOUT touching anything that already exists.
//
//   node scripts/merge-content.mjs                 → dry run: prints what would change
//   node scripts/merge-content.mjs --apply         → backup + add missing items
//   node scripts/merge-content.mjs --apply --fill-empty=developer-portfolio-v2,personal-portfolio-v1
//        also fills ONLY EMPTY fields (e.g. image, gallery, features) of those existing projects.
//
// Needs BLOB_READ_WRITE_TOKEN (e.g. `vercel env pull` → .env.local). Never prints the token.
// Safety: a full backup is written (locally to server/.data/backups/ and to <prefix>backups/ in the
// store) before writing, and the write uses the document's ETag, so a concurrent admin save is never
// overwritten — the script aborts instead.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, put } from '@vercel/blob';
import { buildSeed } from '../src/data/seed.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const prefix = process.env.BLOB_PREFIX || 'data/';
const CONTENT = `${prefix}content.json`;
const apply = process.argv.includes('--apply');
const fillArg = process.argv.find((a) => a.startsWith('--fill-empty='));
const fillSlugs = new Set(fillArg ? fillArg.split('=')[1].split(',').filter(Boolean) : []);

if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('✖ BLOB_READ_WRITE_TOKEN is not set.');
  process.exit(1);
}

const res = await get(CONTENT, { access: 'private', useCache: false });
if (!res || res.statusCode !== 200) {
  console.error(`✖ ${CONTENT} not found — nothing to merge into.`);
  process.exit(1);
}
const raw = await new Response(res.stream).text();
const etag = String(res.blob.etag || '').replace(/^W\//, '');
const state = JSON.parse(raw);
const { collections: seed } = buildSeed();
const now = new Date().toISOString();

const isEmpty = (v) => v === undefined || v === null || v === '' || (Array.isArray(v) && v.length === 0);
const report = [];
const next = structuredClone(state);

for (const col of ['projects', 'posts']) {
  const list = (next.collections[col] ||= []);
  const bySlug = new Map(list.map((d) => [d.slug, d]));
  for (const doc of seed[col]) {
    if (col === 'posts' && doc.status !== 'published') continue; // personal drafts are not pushed
    const existing = bySlug.get(doc.slug);
    if (!existing) {
      const id = list.some((d) => d.id === doc.id) ? `${doc.id}-${Date.now().toString(36)}` : doc.id;
      list.push({ ...doc, id, createdAt: now, updatedAt: now });
      report.push(`+ add ${col}/${doc.slug}`);
    } else if (col === 'projects' && fillSlugs.has(doc.slug)) {
      const filled = Object.keys(doc).filter((k) => !['id', 'createdAt', 'updatedAt'].includes(k) && isEmpty(existing[k]) && !isEmpty(doc[k]));
      if (filled.length) {
        for (const k of filled) existing[k] = doc[k];
        existing.updatedAt = now;
        report.push(`~ fill empty ${col}/${doc.slug}: ${filled.join(', ')}`);
      } else report.push(`= ${col}/${doc.slug} has no empty fields to fill`);
    } else {
      report.push(`= keep ${col}/${doc.slug} (already exists, untouched)`);
    }
  }
}

console.log(`Live document: ${CONTENT} (${state.collections.projects?.length || 0} projects, ${state.collections.posts?.length || 0} posts)`);
console.log(report.join('\n'));
const changes = report.filter((r) => r.startsWith('+') || r.startsWith('~')).length;
if (!changes) {
  console.log('\nNothing to change.');
  process.exit(0);
}
if (!apply) {
  console.log(`\nDry run: ${changes} change(s). Re-run with --apply to write them.`);
  process.exit(0);
}

// Backups first
const stamp = now.replace(/[:.]/g, '-');
const localDir = path.resolve(here, '../.data/backups');
fs.mkdirSync(localDir, { recursive: true });
const localFile = path.join(localDir, `content-${stamp}.json`);
fs.writeFileSync(localFile, raw);
await put(`${prefix}backups/content-${stamp}.json`, raw, { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false });
console.log(`\n✔ Backup saved: ${path.relative(process.cwd(), localFile)} and ${prefix}backups/content-${stamp}.json`);

try {
  await put(CONTENT, JSON.stringify(next), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, ifMatch: etag, cacheControlMaxAge: 60 });
} catch (err) {
  console.error('✖ Write rejected (the document changed since it was read — maybe an admin just saved). Nothing was changed. Run again.');
  console.error(err.message);
  process.exit(1);
}
console.log(`✔ Applied ${changes} change(s) to ${CONTENT}.`);
