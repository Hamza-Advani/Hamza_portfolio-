// Upgrades the LIVE Learning Journey to the semester-wise subject tracker (2026-11-24).
//
//   node scripts/migrate-journey.mjs            → dry run
//   node scripts/migrate-journey.mjs --apply    → backup, then write (ETag-guarded)
//
// For every semester that has no `subjects` yet:
//   - adds the official GU Tech courses for that semester (server/src/data/curriculum.js), all Planned,
//   - carries over progress from the old `topics` ONLY where an old entry clearly is the same
//     official course in the same semester (CARRY_OVER rules),
//   - keeps the semester title, year, order and the old `topics` untouched (backward compatible).
// Semesters that already have `subjects` are never touched.
// The roadmap note in Settings is updated only if it still has the original starter text.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, put } from '@vercel/blob';
import { officialSubjects, withCarriedProgress } from '../src/data/curriculum.js';
import { seedSingletons } from '../src/data/seed.js';

const OLD_DISCLAIMER = 'This is a suggested, self-made learning plan. It is not an officially verified GU-Tech curriculum and will change as I progress.';
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
const now = new Date().toISOString();
const log = [];

for (const sem of state.collections.roadmap || []) {
  if (Array.isArray(sem.subjects)) {
    log.push(`= semester ${sem.semester} already has subjects — untouched`);
    continue;
  }
  sem.subjects = withCarriedProgress(sem.semester, officialSubjects(sem.semester), sem.topics || []);
  sem.updatedAt = now;
  const carried = sem.subjects.filter((s) => s.status !== 'Planned').map((s) => `${s.code} ${s.status}`);
  log.push(`+ semester ${sem.semester} "${sem.title}": ${sem.subjects.length} official subjects${carried.length ? ` (carried over: ${carried.join(', ')})` : ''}`);
}

const settings = state.singletons?.settings;
if (settings && settings.roadmapDisclaimer === OLD_DISCLAIMER) {
  settings.roadmapDisclaimer = seedSingletons.settings.roadmapDisclaimer;
  settings.updatedAt = now;
  log.push('~ settings.roadmapDisclaimer: starter text → official-curriculum note');
} else {
  log.push('= settings.roadmapDisclaimer was customised — untouched');
}

const changes = log.filter((l) => !l.startsWith('=')).length;
console.log(log.join('\n'));
if (!changes) process.exit(0);
if (!apply) {
  console.log(`\nDry run: ${changes} change(s). Re-run with --apply.`);
  process.exit(0);
}

const stamp = now.replace(/[:.]/g, '-');
const localDir = path.resolve(here, '../.data/backups');
fs.mkdirSync(localDir, { recursive: true });
fs.writeFileSync(path.join(localDir, `content-${stamp}.json`), raw);
await put(`${prefix}backups/content-${stamp}.json`, raw, { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false });
console.log(`\n✔ Backup saved: server/.data/backups/content-${stamp}.json and ${prefix}backups/content-${stamp}.json`);

try {
  await put(CONTENT, JSON.stringify(state), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, ifMatch: etag, cacheControlMaxAge: 60 });
} catch (err) {
  console.error('✖ Write rejected — the document changed since it was read. Nothing was changed; run again.', err.message);
  process.exit(1);
}
console.log(`✔ Applied ${changes} change(s).`);
