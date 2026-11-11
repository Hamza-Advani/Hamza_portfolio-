// Integration test against a REAL Vercel Blob store. Skipped unless BLOB_TEST=1 and a token is set:
//   BLOB_TEST=1 BLOB_READ_WRITE_TOKEN=... node --test test/blob.integration.test.js
// Uses an isolated prefix and deletes everything it created.
process.env.NODE_ENV = 'test';

import { test, after } from 'node:test';
import assert from 'node:assert/strict';
import { list, del } from '@vercel/blob';

const enabled = process.env.BLOB_TEST === '1' && Boolean(process.env.BLOB_READ_WRITE_TOKEN);
const prefix = `test-runs/${Date.now()}/`;

after(async () => {
  if (!enabled) return;
  const { blobs } = await list({ prefix });
  if (blobs.length) await del(blobs.map((b) => b.url));
});

test('blob driver: seed, CRUD, singletons, messages, concurrency', { skip: !enabled && 'set BLOB_TEST=1 to run' }, async () => {
  const { createBlobDriver } = await import('../src/db/blobDriver.js');
  const db = createBlobDriver({ prefix });

  // First read seeds the starter content
  const certs = await db.list('certificates');
  assert.equal(certs.length, 5);
  assert.equal((await db.getSingleton('profile')).email, 'hamzaadvani8547@gmail.com');

  // CRUD on a collection
  const p = await db.create('projects', { title: 'Blob Test', slug: 'blob-test', published: false });
  assert.ok(p.id);
  assert.equal((await db.get('projects', p.id)).title, 'Blob Test');
  assert.equal((await db.update('projects', p.id, { published: true })).published, true);
  assert.equal(await db.update('projects', 'missing', { x: 1 }), null);

  // A second driver instance (another serverless instance) sees the change
  const other = createBlobDriver({ prefix });
  assert.equal((await other.get('projects', p.id)).published, true);

  // Concurrent writes from two instances: both survive (ETag retry)
  await Promise.all([db.create('skills', { name: 'A', category: 'Database' }), other.create('skills', { name: 'B', category: 'Database' })]);
  const names = (await createBlobDriver({ prefix }).list('skills')).map((s) => s.name);
  assert.ok(names.includes('A') && names.includes('B'), `both concurrent writes kept: ${names.slice(-3)}`);

  assert.equal(await db.remove('projects', p.id), true);
  assert.equal(await db.get('projects', p.id), null);

  // Singletons
  const s = await db.setSingleton('settings', { ...(await db.getSingleton('settings')), availability: 'Blob test' });
  assert.equal(s.availability, 'Blob test');
  assert.equal((await other.getSingleton('settings')).availability, 'Blob test');

  // Messages are separate files
  const m = await db.create('messages', { name: 'Visitor', email: 'v@example.com', subject: 'Hi', message: 'Hello there!', read: false });
  assert.equal((await db.list('messages')).length, 1);
  assert.equal((await db.update('messages', m.id, { read: true })).read, true);
  assert.equal(await db.remove('messages', m.id), true);
  assert.equal((await db.list('messages')).length, 0);
});
