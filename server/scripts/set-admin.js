// Grants (or revokes) the admin role through a Firebase custom claim.
//   npm run set-admin -- you@example.com
//   npm run set-admin -- you@example.com --revoke
import { isFirebaseConfigured } from '../src/config/env.js';
import { adminAuth } from '../src/config/firebase.js';

const email = process.argv.slice(2).find((a) => !a.startsWith('--'));
const revoke = process.argv.includes('--revoke');

if (!isFirebaseConfigured()) {
  console.error('✖ Firebase Admin is not configured. Fill FIREBASE_* in server/.env first.');
  process.exit(1);
}
if (!email) {
  console.error('Usage: npm run set-admin -- <email> [--revoke]');
  process.exit(1);
}

try {
  const auth = adminAuth();
  const user = await auth.getUserByEmail(email);
  await auth.setCustomUserClaims(user.uid, { ...(user.customClaims || {}), admin: !revoke });
  // Force existing sessions to refresh so the new role applies immediately.
  await auth.revokeRefreshTokens(user.uid);
  console.log(`✔ ${revoke ? 'Revoked admin from' : 'Granted admin to'} ${email} (uid ${user.uid}). Sign in again to apply.`);
  process.exit(0);
} catch (err) {
  if (err.code === 'auth/user-not-found') {
    console.error(`✖ No Firebase user with email ${email}. Create it in Firebase console → Authentication → Users first.`);
  } else console.error('✖', err.message);
  process.exit(1);
}
