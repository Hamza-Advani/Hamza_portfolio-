import crypto from 'node:crypto';
import { adminAuth, hasAdminCredentials } from '../config/firebase.js';
import { env, isDevAuthEnabled } from '../config/env.js';
import { unauthorized, forbidden, unavailable } from '../utils/httpError.js';

const safeEqual = (a, b) => {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

/**
 * Admin authorisation for a verified Firebase ID token:
 * - the custom claim admin === true (set with `npm run set-admin`), or
 * - an email listed in ADMIN_EMAILS that signed in with email + password.
 *   Firebase allows only one account per email, so only the owner of that account
 *   (who knows its password) can obtain such a token.
 */
export function isAdminToken(decoded) {
  if (decoded.admin === true) return true;
  const email = String(decoded.email || '').toLowerCase();
  return Boolean(email) && env.adminEmails.includes(email) && decoded.firebase?.sign_in_provider === 'password';
}

/** Verifies "Authorization: Bearer <Firebase ID token>" and requires the admin role. */
export async function requireAdmin(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw unauthorized();

  if (isDevAuthEnabled() && safeEqual(token, env.devAdminToken)) {
    req.user = { uid: 'local-dev-admin', email: 'local developer', admin: true, dev: true };
    return next();
  }

  const auth = adminAuth();
  if (!auth) throw unavailable('Firebase Authentication is not configured on the server.');

  let decoded;
  try {
    // Revoked-session checks need the service-account key; without it, tokens still expire
    // after one hour and Firebase stops refreshing them once a password is changed.
    decoded = await auth.verifyIdToken(token, hasAdminCredentials());
  } catch {
    throw unauthorized('Your session is invalid or has expired. Please sign in again.');
  }
  if (!isAdminToken(decoded)) throw forbidden('This account is not authorised to access the admin dashboard.');

  req.user = { uid: decoded.uid, email: decoded.email, admin: true };
  next();
}
