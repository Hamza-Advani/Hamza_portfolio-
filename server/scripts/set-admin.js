// Grants (or revokes) the admin role through a Firebase custom claim.
//   npm run set-admin -- hamzaadvani2006@gmail.com
//   npm run set-admin -- hamzaadvani2006@gmail.com --revoke
//
// If the account does not exist yet it is CREATED with a random password that is never shown,
// logged or stored. You then choose your own password with Firebase's secure reset flow:
// open /admin/login, enter the email and click "Forgot password?".
import crypto from 'node:crypto';
import { isFirebaseConfigured, isAuthEmulator } from '../src/config/env.js';
import { adminAuth } from '../src/config/firebase.js';

const email = process.argv.slice(2).find((a) => !a.startsWith('--'));
const revoke = process.argv.includes('--revoke');

if (!isFirebaseConfigured() && !isAuthEmulator()) {
  console.error('✖ Firebase Admin is not configured. Fill FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY in server/.env first.');
  process.exit(1);
}
if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  console.error('Usage: npm run set-admin -- <email> [--revoke]');
  process.exit(1);
}

try {
  const auth = adminAuth();
  let user;
  let created = false;
  try {
    user = await auth.getUserByEmail(email);
  } catch (err) {
    if (err.code !== 'auth/user-not-found' || revoke) throw err;
    user = await auth.createUser({ email, password: crypto.randomBytes(32).toString('base64url') });
    created = true;
  }
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: !revoke });
  await auth.revokeRefreshTokens(user.uid); // existing sessions must sign in again to pick up the change

  console.log(`✔ ${revoke ? 'Revoked admin role from' : 'Granted admin role to'} ${email} (uid ${user.uid}).`);
  if (created) {
    console.log('  The account was created with a random password that nobody knows.');
    console.log('  Set your own password: open /admin/login → enter this email → "Forgot password?".');
  } else if (!revoke) {
    console.log('  Sign in again at /admin/login to apply the role.');
  }
  process.exit(0);
} catch (err) {
  console.error('✖', err.message);
  process.exit(1);
}
