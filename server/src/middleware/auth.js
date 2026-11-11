import crypto from 'node:crypto';
import { adminAuth } from '../config/firebase.js';
import { env, isDevAuthEnabled } from '../config/env.js';
import { unauthorized, forbidden, unavailable } from '../utils/httpError.js';

const safeEqual = (a, b) => {
  const ab = Buffer.from(String(a));
  const bb = Buffer.from(String(b));
  return ab.length === bb.length && crypto.timingSafeEqual(ab, bb);
};

/**
 * Verifies the Firebase ID token sent as "Authorization: Bearer <token>" and requires the
 * custom claim { admin: true } (set with `npm run set-admin -- <email>`).
 */
export async function requireAdmin(req, _res, next) {
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7).trim() : '';
  if (!token) throw unauthorized();

  if (isDevAuthEnabled() && safeEqual(token, env.devAdminToken)) {
    req.user = { uid: 'local-dev-admin', email: 'local developer', admin: true, dev: true };
    return next();
  }

  const auth = adminAuth();
  if (!auth) throw unavailable('Firebase Admin is not configured on the server.');

  let decoded;
  try {
    decoded = await auth.verifyIdToken(token, true); // true = reject revoked sessions
  } catch {
    throw unauthorized('Your session is invalid or has expired. Please sign in again.');
  }
  if (decoded.admin !== true) throw forbidden('This account is not authorised to access the admin dashboard.');

  req.user = { uid: decoded.uid, email: decoded.email, admin: true };
  next();
}
