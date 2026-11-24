// One-off correction of the LIVE project list (2026-11-24, owner request):
//   - remove "Personal Portfolio v1" (its GitHub repository was deleted)
//   - hide the portfolio's own repository entry (developer-portfolio-v2 → published: false)
//   - rename the LMS to "GU Tech LMS" and mark it "Under development"
//   - add MindBridge (digital-well-being) and Hire At Home
//
//   node scripts/correct-projects.mjs            → dry run
//   node scripts/correct-projects.mjs --apply    → backup, then write (ETag-guarded)
//
// Fields the owner may have edited in the admin are only changed when they still hold the
// original starter value, so manual edits are never overwritten.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, put } from '@vercel/blob';
import { projects as seedProjects } from '../src/data/projects.js';

const here = path.dirname(fileURLToPath(import.meta.url));
const prefix = process.env.BLOB_PREFIX || 'data/';
const CONTENT = `${prefix}content.json`;
const apply = process.argv.includes('--apply');
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('✖ BLOB_READ_WRITE_TOKEN is not set.');
  process.exit(1);
}

const res = await get(CONTENT, { access: 'private', useCache: false });
if (!res || res.statusCode !== 200) throw new Error(`${CONTENT} not found`);
const raw = await new Response(res.stream).text();
const etag = String(res.blob.etag || '').replace(/^W\//, '');
const state = JSON.parse(raw);
const list = state.collections.projects || [];
const bySlug = (slug) => list.find((p) => p.slug === slug);
const seed = (slug) => seedProjects.find((p) => p.slug === slug);
const now = new Date().toISOString();
const log = [];

// 1. Remove P1
const p1 = list.findIndex((p) => p.slug === 'personal-portfolio-v1');
if (p1 !== -1) {
  list.splice(p1, 1);
  log.push('- remove projects/personal-portfolio-v1 (GitHub repository deleted)');
}

// 2. Hide the portfolio's own repository entry
const self = bySlug('developer-portfolio-v2');
if (self && self.published !== false) {
  self.published = false;
  self.updatedAt = now;
  log.push('~ hide projects/developer-portfolio-v2 (the portfolio site itself, not a separate project)');
}

// 3. LMS name + status (only replace starter values)
const lms = bySlug('northstar-lms');
const lmsSeed = seed('northstar-lms');
if (lms) {
  const changes = [];
  if (lms.title === 'Northstar LMS (GU Tech LMS)') { lms.title = lmsSeed.title; changes.push('title'); }
  if (lms.status === 'In development') { lms.status = lmsSeed.status; changes.push('status'); }
  if (lms.description && !lms.description.includes('branded <em>Northstar</em>') && lms.description.includes('<p><em>Status:</em> the backend API')) {
    lms.description = lms.description.replace('<p><em>Status:</em> the backend API', '<p>Inside the code the workspace is branded <em>Northstar</em>.</p><p><em>Status:</em> the backend API');
    changes.push('description');
  }
  if (changes.length) {
    lms.updatedAt = now;
    log.push(`~ update projects/northstar-lms: ${changes.join(', ')}`);
  }
}

// 4. Add new projects
for (const slug of ['mindbridge-digital-well-being', 'hire-at-home']) {
  if (!bySlug(slug)) {
    list.push({ ...seed(slug), id: slug, createdAt: now, updatedAt: now });
    log.push(`+ add projects/${slug}`);
  }
}

console.log(log.length ? log.join('\n') : 'Nothing to change.');
if (!log.length) process.exit(0);
if (!apply) {
  console.log(`\nDry run: ${log.length} change(s). Re-run with --apply.`);
  process.exit(0);
}

const stamp = now.replace(/[:.]/g, '-');
const localDir = path.resolve(here, '../.data/backups');
fs.mkdirSync(localDir, { recursive: true });
fs.writeFileSync(path.join(localDir, `content-${stamp}.json`), raw);
await put(`${prefix}backups/content-${stamp}.json`, raw, { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false });
console.log(`\n✔ Backup saved: server/.data/backups/content-${stamp}.json and ${prefix}backups/content-${stamp}.json`);

state.collections.projects = list;
try {
  await put(CONTENT, JSON.stringify(state), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, ifMatch: etag, cacheControlMaxAge: 60 });
} catch (err) {
  console.error('✖ Write rejected — the document changed since it was read. Nothing was changed; run again.', err.message);
  process.exit(1);
}
console.log(`✔ Applied ${log.length} change(s).`);
