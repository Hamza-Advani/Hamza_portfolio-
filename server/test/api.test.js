// API integration tests. They run against the in-memory store with a local dev admin token,
// so no Firebase/Cloudinary/Resend credentials are needed.
process.env.NODE_ENV = 'test';
process.env.DEV_ADMIN_TOKEN = 'test-admin-token-0123456789';
process.env.FIREBASE_CLIENT_EMAIL = '';
process.env.FIREBASE_PRIVATE_KEY = '';
process.env.CLOUDINARY_API_SECRET = '';
process.env.RESEND_API_KEY = '';
process.env.VERCEL = '';

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: app } = await import('../src/app.js');
const ADMIN = { Authorization: 'Bearer test-admin-token-0123456789' };

describe('public API', () => {
  test('health reports local data source', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.equal(res.body.ok, true);
    assert.equal(res.body.dataSource, 'local');
  });

  test('site bundle has profile, settings and video', async () => {
    const res = await request(app).get('/api/public/site').expect(200);
    assert.equal(res.body.profile.name, 'Muhammad Hamza');
    assert.equal(res.body.profile.email, 'hamzaadvani8547@gmail.com');
    assert.ok(res.body.settings.roadmapDisclaimer.includes('not an officially verified'));
    assert.ok(res.body.video.url);
  });

  test('blog drafts are hidden from the public', async () => {
    const res = await request(app).get('/api/public/posts').expect(200);
    assert.equal(res.body.length, 0);
    await request(app).get('/api/public/posts/my-first-semester-bscs-journey').expect(404);
  });

  test('published projects, certificates, skills, education, roadmap are listed', async () => {
    for (const [col, min] of [['projects', 2], ['certificates', 5], ['skills', 10], ['education', 3], ['roadmap', 8]]) {
      const res = await request(app).get(`/api/public/${col}`).expect(200);
      assert.ok(res.body.length >= min, `${col} has ${res.body.length}`);
    }
    const p = await request(app).get('/api/public/projects/developer-portfolio-v2').expect(200);
    assert.equal(p.body.title, 'Developer Portfolio v2');
    assert.ok(Array.isArray(p.body.related));
  });

  test('messages and unknown collections are never public', async () => {
    await request(app).get('/api/public/messages').expect(404);
    await request(app).get('/api/public/secrets').expect(404);
  });

  test('sitemap is valid xml', async () => {
    const res = await request(app).get('/sitemap.xml').expect(200);
    assert.match(res.headers['content-type'], /xml/);
    assert.match(res.text, /<loc>.*\/projects\/developer-portfolio-v2<\/loc>/);
    await request(app).get('/api/sitemap.xml').expect(200);
  });
});

describe('admin authorization', () => {
  test('rejects missing and wrong tokens', async () => {
    await request(app).get('/api/admin/stats').expect(401);
    await request(app).get('/api/admin/stats').set({ Authorization: 'Bearer nope' }).expect(503); // no Firebase → cannot verify
    await request(app).post('/api/admin/content/projects').send({ title: 'x' }).expect(401);
  });

  test('accepts the local dev token and returns stats', async () => {
    const res = await request(app).get('/api/admin/stats').set(ADMIN).expect(200);
    assert.equal(res.body.posts.drafts, 5);
    assert.equal(res.body.certificates.total, 5);
  });
});

describe('admin CRUD', () => {
  test('project lifecycle: create → publish → update → delete', async () => {
    const created = await request(app)
      .post('/api/admin/content/projects')
      .set(ADMIN)
      .send({ title: 'Test Project', technologies: ['C'], description: '<p>Hi</p><script>alert(1)</script>' })
      .expect(201);
    assert.equal(created.body.slug, 'test-project');
    assert.equal(created.body.published, false);
    assert.ok(!created.body.description.includes('<script>'), 'HTML is sanitised');

    await request(app).get('/api/public/projects/test-project').expect(404);
    await request(app).patch(`/api/admin/content/projects/${created.body.id}`).set(ADMIN).send({ published: true }).expect(200);
    const pub = await request(app).get('/api/public/projects/test-project').expect(200);
    assert.deepEqual(pub.body.technologies, ['C'], 'partial update keeps other fields');

    const dup = await request(app).post('/api/admin/content/projects').set(ADMIN).send({ title: 'Test Project' }).expect(201);
    assert.equal(dup.body.slug, 'test-project-2');

    await request(app).delete(`/api/admin/content/projects/${created.body.id}`).set(ADMIN).expect(204);
    await request(app).delete(`/api/admin/content/projects/${dup.body.id}`).set(ADMIN).expect(204);
    await request(app).get('/api/public/projects/test-project').expect(404);
  });

  test('blog publishing sets publishedAt and reading time', async () => {
    const posts = (await request(app).get('/api/admin/content/posts').set(ADMIN).expect(200)).body;
    const draft = posts.find((p) => p.slug === 'learning-programming-fundamentals');
    const res = await request(app)
      .patch(`/api/admin/content/posts/${draft.id}`)
      .set(ADMIN)
      .send({ status: 'published', content: '<p>' + 'word '.repeat(450) + '</p>' })
      .expect(200);
    assert.ok(res.body.publishedAt);
    assert.equal(res.body.readingTime, 2);
    const list = (await request(app).get('/api/public/posts').expect(200)).body;
    assert.equal(list.length, 1);
    assert.equal(list[0].content, undefined, 'list omits content');
    await request(app).patch(`/api/admin/content/posts/${draft.id}`).set(ADMIN).send({ status: 'draft' }).expect(200);
    assert.equal((await request(app).get('/api/public/posts')).body.length, 0);
  });

  test('validation errors return 400 with details', async () => {
    const res = await request(app).post('/api/admin/content/skills').set(ADMIN).send({ name: '', category: 'Nope' }).expect(400);
    assert.ok(res.body.details.length >= 1);
    await request(app).post('/api/admin/content/projects').set(ADMIN).send({ title: 'x', liveUrl: 'javascript:alert(1)' }).expect(400);
  });

  test('singleton update merges and validates', async () => {
    const res = await request(app).put('/api/admin/site/settings').set(ADMIN).send({ availability: 'Open to internships' }).expect(200);
    assert.equal(res.body.availability, 'Open to internships');
    assert.ok(res.body.roadmapYears.length === 4, 'other settings kept');
    await request(app).put('/api/admin/site/profile').set(ADMIN).send({ email: 'not-an-email' }).expect(400);
  });

  test('roadmap topic status can be changed', async () => {
    const sems = (await request(app).get('/api/admin/content/roadmap').set(ADMIN)).body;
    const s = sems[0];
    const topics = s.topics.map((t, i) => (i === 0 ? { ...t, status: 'Completed' } : t));
    const res = await request(app).patch(`/api/admin/content/roadmap/${s.id}`).set(ADMIN).send({ topics }).expect(200);
    assert.equal(res.body.topics[0].status, 'Completed');
    await request(app).patch(`/api/admin/content/roadmap/${s.id}`).set(ADMIN).send({ topics: [{ id: 'x', title: 'y', status: 'Done' }] }).expect(400);
  });

  test('uploads report Cloudinary as not configured', async () => {
    await request(app).post('/api/admin/uploads/sign').set(ADMIN).send({ kind: 'image', folder: 'projects' }).expect(503);
  });
});

describe('contact form', () => {
  const valid = { name: 'Test Visitor', email: 'visitor@example.com', subject: 'Hello there', message: 'I would like to connect about a project.', startedAt: Date.now() - 10_000 };

  test('stores a valid message (email not configured)', async () => {
    const res = await request(app).post('/api/contact').send(valid).expect(201);
    assert.equal(res.body.stored, true);
    assert.equal(res.body.emailSent, false);
    const msgs = (await request(app).get('/api/admin/content/messages').set(ADMIN)).body;
    assert.equal(msgs[0].email, 'visitor@example.com');
    assert.equal(msgs[0].emailStatus, 'not-configured');
    await request(app).patch(`/api/admin/content/messages/${msgs[0].id}`).set(ADMIN).send({ read: true }).expect(200);
  });

  test('rejects invalid input', async () => {
    const res = await request(app).post('/api/contact').send({ ...valid, email: 'bad' }).expect(400);
    assert.match(res.body.error, /email/i);
    await request(app).post('/api/contact').send({ ...valid, message: 'short' }).expect(400);
  });

  test('spam protection: honeypot, speed trap, links', async () => {
    const before = (await request(app).get('/api/admin/content/messages').set(ADMIN)).body.length;
    await request(app).post('/api/contact').send({ ...valid, website: 'http://spam.example' }).expect(200);
    await request(app).post('/api/contact').send({ ...valid, startedAt: Date.now() }).expect(400);
    await request(app).post('/api/contact').send({ ...valid, message: 'buy http://a.co http://b.co http://c.co http://d.co now' }).expect(400);
    const after = (await request(app).get('/api/admin/content/messages').set(ADMIN)).body.length;
    assert.equal(after, before, 'spam is never stored');
  });

  test('messages cannot be created by admins directly', async () => {
    await request(app).post('/api/admin/content/messages').set(ADMIN).send({}).expect(400);
  });
});

test('unknown API routes return JSON 404', async () => {
  const res = await request(app).get('/api/does-not-exist').expect(404);
  assert.ok(res.body.error);
});
