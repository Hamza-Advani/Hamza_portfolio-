// Rate limiting: public reads have a large budget (the homepage makes several reads per visit,
// and many visitors can share one IP), while admin calls and writes stay tightly limited.
process.env.NODE_ENV = 'development'; // rate limits are skipped in NODE_ENV=test
process.env.DEV_ADMIN_TOKEN = 'test-admin-token-0123456789';
process.env.FIREBASE_CLIENT_EMAIL = '';
process.env.FIREBASE_PRIVATE_KEY = '';
process.env.LOCAL_DATA_FILE = ':memory:';
process.env.VERCEL = '';

import { test } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const { default: app } = await import('../src/app.js');

test('700 public reads from one IP are not rate limited', async () => {
  for (let i = 0; i < 700; i++) {
    const res = await request(app).get(i % 2 ? '/api/public/skills' : '/api/public/certificates');
    assert.equal(res.status, 200, `request ${i} → ${res.status}`);
  }
});

test('contact form allows 5 submissions per 15 minutes', async () => {
  const body = { name: 'Rate Test', email: 'r@example.com', subject: 'Limit', message: 'Checking the contact rate limit.', startedAt: Date.now() - 10_000 };
  const statuses = [];
  for (let i = 0; i < 6; i++) statuses.push((await request(app).post('/api/contact').send({ ...body, subject: `Limit ${i}` })).status);
  assert.deepEqual(statuses.slice(0, 5), [201, 201, 201, 201, 201]);
  assert.equal(statuses[5], 429);
});

test('admin API is still limited (600 / 15 min)', async () => {
  let limited = null;
  for (let i = 0; i < 620; i++) {
    const res = await request(app).get('/api/admin/me').set('Authorization', 'Bearer test-admin-token-0123456789');
    if (res.status === 429) {
      limited = i;
      break;
    }
  }
  // The 6 contact submissions above share this per-IP budget: 600 - 6 = 594.
  assert.equal(limited, 594, 'requests beyond the 600 write/admin budget are rejected');
});
