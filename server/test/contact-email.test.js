// Verifies the Resend integration by intercepting the HTTPS request the Resend SDK makes.
// This checks what WOULD be sent (recipient, reply-to, escaping, error handling) without a real
// API key. Real delivery must still be confirmed once RESEND_API_KEY is configured.
process.env.NODE_ENV = 'test';
process.env.DEV_ADMIN_TOKEN = 'test-admin-token-0123456789';
process.env.FIREBASE_CLIENT_EMAIL = '';
process.env.FIREBASE_PRIVATE_KEY = '';
process.env.RESEND_API_KEY = 're_test_not_a_real_key';
process.env.CONTACT_EMAIL = 'owner@example.com';
process.env.RESEND_FROM = 'Portfolio Contact <onboarding@resend.dev>';
process.env.RESEND_SEND_ACKNOWLEDGEMENT = 'false';
process.env.VERCEL = '';

import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';

const calls = [];
let respond = () => new Response(JSON.stringify({ id: 'email_123' }), { status: 200, headers: { 'content-type': 'application/json' } });
const realFetch = globalThis.fetch;
globalThis.fetch = async (url, init) => {
  if (String(url).startsWith('https://api.resend.com')) {
    calls.push({ url: String(url), auth: new Headers(init.headers).get('authorization'), body: JSON.parse(init.body) });
    return respond();
  }
  return realFetch(url, init);
};

const { default: app } = await import('../src/app.js');
const ADMIN = { Authorization: 'Bearer test-admin-token-0123456789' };
const valid = { name: 'Ada <Visitor>', email: 'Visitor@Example.com', subject: 'Hello & welcome', message: 'Hi! <script>alert(1)</script> Would love to connect.', startedAt: Date.now() - 10_000 };

describe('contact → Resend', () => {
  beforeEach(() => {
    calls.length = 0;
  });

  test('sends the notification to CONTACT_EMAIL with reply-to the visitor', async () => {
    const res = await request(app).post('/api/contact').send(valid).expect(201);
    assert.equal(res.body.emailSent, true);
    assert.equal(res.body.stored, true);
    assert.equal(calls.length, 1, 'exactly one email (no acknowledgement by default)');
    const { body, auth } = calls[0];
    assert.deepEqual(body.to, ['owner@example.com']);
    assert.equal(body.from, 'Portfolio Contact <onboarding@resend.dev>');
    assert.equal(body.reply_to ?? body.replyTo, 'visitor@example.com');
    assert.equal(body.subject, 'Portfolio: Hello & welcome');
    assert.ok(!body.html.includes('<script>'), 'visitor HTML is escaped');
    assert.ok(body.html.includes('&lt;script&gt;'));
    assert.match(String(auth), /^Bearer re_test_/);
    assert.ok(!JSON.stringify(res.body).includes('re_test'), 'API key never returned to the client');

    const msgs = (await request(app).get('/api/admin/content/messages').set(ADMIN)).body;
    assert.equal(msgs[0].emailStatus, 'sent');
  });

  test('a Resend failure still stores the message and reports emailSent=false', async () => {
    respond = () => new Response(JSON.stringify({ name: 'validation_error', message: 'Domain not verified' }), { status: 403, headers: { 'content-type': 'application/json' } });
    const res = await request(app).post('/api/contact').send({ ...valid, subject: 'Second message' }).expect(201);
    assert.equal(res.body.emailSent, false);
    assert.equal(res.body.stored, true);
    const msgs = (await request(app).get('/api/admin/content/messages').set(ADMIN)).body;
    const m = msgs.find((x) => x.subject === 'Second message');
    assert.equal(m.emailStatus, 'failed');
    assert.match(m.emailError, /Domain not verified/);
  });

  test('the unavailable message no longer duplicates the "email me" wording', async () => {
    const { contactUnavailableMessage } = await import('../src/controllers/contactController.js');
    assert.ok(!/email me/i.test(contactUnavailableMessage));
  });
});
