// Removes the retired Learning Journey data from the LIVE content document (2026-11-25):
//   collections.roadmap, settings.roadmapDisclaimer, settings.roadmapYears.
// Nothing else is touched.
//
//   node scripts/remove-journey-data.mjs            → dry run
//   node scripts/remove-journey-data.mjs --apply    → backup, then write (ETag-guarded)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { get, put } from '@vercel/blob';

const here = path.dirname(fileURLToPath(import.meta.url));
const prefix = process.env.BLOB_PREFIX || 'data/';
const CONTENT = `${prefix}content.json`;
const apply = process.argv.includes('--apply');
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN is not set.');
  process.exit(1);
}

const res = await get(CONTENT, { access: 'private', useCache: false });
if (!res || res.statusCode !== 200) throw new Error(`${CONTENT} not found`);
const raw = await new Response(res.stream).text();
const etag = String(res.blob.etag || '').replace(/^W\//, '');
const state = JSON.parse(raw);
const log = [];

if (state.collections?.roadmap) {
  const n = state.collections.roadmap.length;
  const subjects = state.collections.roadmap.reduce((a, s) => a + (s.subjects?.length || 0), 0);
  delete state.collections.roadmap;
  log.push(`- collections.roadmap (${n} semesters, ${subjects} subjects)`);
}
const settings = state.singletons?.settings;
for (const key of ['roadmapDisclaimer', 'roadmapYears']) {
  if (settings && key in settings) {
    delete settings[key];
    log.push(`- settings.${key}`);
  }
}
const kept = Object.entries(state.collections || {}).map(([k, v]) => `${k}:${v.length}`).join(', ');
console.log(log.length ? log.join('\n') : 'Nothing to remove.');
console.log(`Kept collections: ${kept}`);
if (!log.length) process.exit(0);
if (!apply) {
  console.log('\nDry run. Re-run with --apply.');
  process.exit(0);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const localDir = path.resolve(here, '../.data/backups');
fs.mkdirSync(localDir, { recursive: true });
fs.writeFileSync(path.join(localDir, `content-${stamp}.json`), raw);
await put(`${prefix}backups/content-${stamp}.json`, raw, { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: false });
console.log(`\nBackup saved: server/.data/backups/content-${stamp}.json and ${prefix}backups/content-${stamp}.json`);

try {
  await put(CONTENT, JSON.stringify(state), { access: 'private', contentType: 'application/json', addRandomSuffix: false, allowOverwrite: true, ifMatch: etag, cacheControlMaxAge: 60 });
} catch (err) {
  console.error('Write rejected: the document changed since it was read. Nothing was changed; run again.', err.message);
  process.exit(1);
}
console.log(`Applied ${log.length} removal(s).`);
