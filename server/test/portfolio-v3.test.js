// Tests for the v3 features: project case-study fields, technical articles, built-in media storage.
process.env.NODE_ENV = 'test';
process.env.DEV_ADMIN_TOKEN = 'test-admin-token-0123456789';
process.env.FIREBASE_CLIENT_EMAIL = '';
process.env.FIREBASE_PRIVATE_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';
process.env.BLOB_READ_WRITE_TOKEN = '';
process.env.VERCEL = '';

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: app } = await import('../src/app.js');
const ADMIN = { Authorization: 'Bearer test-admin-token-0123456789' };
// Smallest valid PNG (1×1)
const PNG = Buffer.from('89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000d49444154789c6360000002000154a24f5d0000000049454e44ae426082', 'hex');

describe('projects', () => {
  test('seeded case studies are public with features, gallery and status', async () => {
    const res = await request(app).get('/api/public/projects').expect(200);
    const slugs = res.body.map((p) => p.slug);
    assert.deepEqual(slugs.sort(), ['ah-clothing-hub', 'hire-at-home', 'mindbridge-digital-well-being', 'northstar-lms', 'storeforge']);
    // deleted repo (P1) and the portfolio's own repo are not shown as projects
    await request(app).get('/api/public/projects/personal-portfolio-v1').expect(404);
    await request(app).get('/api/public/projects/developer-portfolio-v2').expect(404);
    const lmsName = await request(app).get('/api/public/projects/northstar-lms').expect(200);
    assert.equal(lmsName.body.title, 'GU Tech LMS');
    assert.equal(lmsName.body.status, 'Under development');
    const hire = await request(app).get('/api/public/projects/hire-at-home').expect(200);
    assert.equal(hire.body.features.length, 0, 'no invented features');
    assert.equal(hire.body.githubUrl, '');
    const detail = await request(app).get('/api/public/projects/ah-clothing-hub').expect(200);
    assert.equal(detail.body.status, 'Live');
    assert.ok(detail.body.features.length >= 5);
    assert.ok(detail.body.gallery.every((g) => g.image.startsWith('/images/projects/')));
    assert.equal(detail.body.liveUrl, 'https://ahclothinghub.vercel.app');
  });

  test('private projects expose no source link, only a note', async () => {
    const { body } = await request(app).get('/api/public/projects/storeforge').expect(200);
    assert.equal(body.githubUrl, '');
    assert.equal(body.sourceNote, 'Private repository');
    const lms = await request(app).get('/api/public/projects/northstar-lms').expect(200);
    assert.equal(lms.body.githubUrl, '');
    assert.equal(lms.body.liveUrl, '');
  });

  test('admin can save the new case-study fields; blank feature lines are dropped', async () => {
    const created = await request(app)
      .post('/api/admin/content/projects')
      .set(ADMIN)
      .send({ title: 'Case Study', published: true, status: 'In development', features: ['One', '', '  Two  '], gallery: [{ image: '/images/x.jpg', caption: 'x' }], problem: 'Why' })
      .expect(201);
    assert.deepEqual(created.body.features, ['One', 'Two']);
    const patched = await request(app).patch(`/api/admin/content/projects/${created.body.id}`).set(ADMIN).send({ featured: true }).expect(200);
    assert.equal(patched.body.status, 'In development', 'PATCH must not reset other fields');
    assert.equal(patched.body.published, true);
    await request(app).get('/api/public/projects/case-study').expect(200);
    await request(app).post('/api/admin/content/projects').set(ADMIN).send({ title: 'Bad', status: 'Finished?' }).expect(400);
    await request(app).delete(`/api/admin/content/projects/${created.body.id}`).set(ADMIN).expect(204);
    await request(app).get('/api/public/projects/case-study').expect(404);
  });
});

describe('technical articles', () => {
  test('10–20 published articles with content, tags and reading time', async () => {
    const list = await request(app).get('/api/public/posts').expect(200);
    assert.ok(list.body.length >= 10 && list.body.length <= 20, `got ${list.body.length}`);
    const post = await request(app).get('/api/public/posts/firebase-authentication-react').expect(200);
    assert.ok(post.body.content.includes('<pre><code'));
    assert.ok(post.body.tags.includes('firebase'));
    assert.ok(post.body.readingTime >= 1);
    assert.ok(Array.isArray(post.body.related));
  });
});

describe('built-in media storage (no Cloudinary)', () => {
  test('health reports the upload backend', async () => {
    const { body } = await request(app).get('/api/health').expect(200);
    assert.equal(body.services.cloudinary, false);
    assert.equal(body.services.uploads, 'memory');
  });

  test('requires admin', async () => {
    await request(app).post('/api/admin/uploads/media?folder=projects').set('Content-Type', 'image/png').send(PNG).expect(401);
  });

  test('stores an image and serves it back with long-lived caching', async () => {
    const up = await request(app).post('/api/admin/uploads/media?folder=projects').set(ADMIN).set('Content-Type', 'image/png').send(PNG).expect(201);
    assert.match(up.body.url, /^\/api\/media\/projects\/[a-f0-9]{24}\.png$/);
    const got = await request(app).get(up.body.url).buffer(true).parse((res, cb) => { const c = []; res.on('data', (d) => c.push(d)); res.on('end', () => cb(null, Buffer.concat(c))); }).expect(200);
    assert.equal(got.headers['content-type'], 'image/png');
    assert.match(got.headers['cache-control'], /immutable/);
    assert.ok(Buffer.compare(got.body, PNG) === 0);
  });

  test('rejects wrong types, spoofed content and bad paths', async () => {
    await request(app).post('/api/admin/uploads/media').set(ADMIN).set('Content-Type', 'text/html').send('<script>').expect(400);
    await request(app).post('/api/admin/uploads/media').set(ADMIN).set('Content-Type', 'image/png').send(Buffer.from('not really a png')).expect(400);
    await request(app).get('/api/media/projects/..%2F..%2Fsecret.png').expect(404);
    await request(app).get('/api/media/unknown/abcdefabcdefabcdefabcdef.png').expect(404);
    await request(app).get('/api/media/projects/abcdefabcdefabcdefabcdef.png').expect(404);
  });

  test('rejects files over 4 MB', async () => {
    const big = Buffer.concat([PNG.subarray(0, 8), Buffer.alloc(4 * 1024 * 1024 + 10)]);
    const res = await request(app).post('/api/admin/uploads/media').set(ADMIN).set('Content-Type', 'image/png').send(big);
    assert.ok([400, 413].includes(res.status), `status ${res.status}`);
  });
});
