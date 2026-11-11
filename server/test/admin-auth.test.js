process.env.NODE_ENV = 'test';
process.env.ADMIN_EMAILS = 'Owner@Example.com, second@example.com';

import { test } from 'node:test';
import assert from 'node:assert/strict';

const { isAdminToken } = await import('../src/middleware/auth.js');
const pw = { sign_in_provider: 'password' };

test('custom claim admin=true is accepted', () => {
  assert.equal(isAdminToken({ email: 'anyone@example.com', admin: true, firebase: { sign_in_provider: 'google.com' } }), true);
});

test('allow-listed email signed in with password is accepted (case-insensitive)', () => {
  assert.equal(isAdminToken({ email: 'owner@example.com', firebase: pw }), true);
  assert.equal(isAdminToken({ email: 'SECOND@example.com', firebase: pw }), true);
});

test('other emails are rejected', () => {
  assert.equal(isAdminToken({ email: 'attacker@example.com', firebase: pw }), false);
  assert.equal(isAdminToken({ email: '', firebase: pw }), false);
  assert.equal(isAdminToken({ firebase: pw }), false);
});

test('allow-listed email via a non-password provider is rejected', () => {
  assert.equal(isAdminToken({ email: 'owner@example.com', firebase: { sign_in_provider: 'google.com' } }), false);
  assert.equal(isAdminToken({ email: 'owner@example.com', firebase: { sign_in_provider: 'anonymous' } }), false);
  assert.equal(isAdminToken({ email: 'owner@example.com' }), false);
});

test('admin claim must be exactly true', () => {
  assert.equal(isAdminToken({ email: 'x@example.com', admin: 'true', firebase: pw }), false);
});
