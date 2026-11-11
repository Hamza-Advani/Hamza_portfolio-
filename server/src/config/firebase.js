import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env, isFirebaseConfigured, isAuthEmulator, isFirebaseAuthAvailable } from './env.js';

let app = null;

function getApp() {
  if (app) return app;
  if (isFirebaseConfigured()) {
    // Full access (Firestore, custom claims, revocation checks) with the service-account key.
    app =
      getApps()[0] ||
      initializeApp({
        credential: cert({
          projectId: env.firebase.projectId,
          clientEmail: env.firebase.clientEmail,
          privateKey: env.firebase.privateKey,
        }),
        projectId: env.firebase.projectId,
      });
  } else if (isAuthEmulator() || isFirebaseAuthAvailable()) {
    // Token verification only. Verifying a Firebase ID token needs just the project ID:
    // the signature is checked against Google's public keys, so no secret key is required.
    // (Local emulator testing uses the same path via FIREBASE_AUTH_EMULATOR_HOST.)
    app = getApps()[0] || initializeApp({ projectId: env.firebase.projectId });
  }
  return app;
}

export const adminAuth = () => {
  const a = getApp();
  return a ? getAuth(a) : null;
};

/** True when the Admin SDK has credentials (needed for revocation checks and claims). */
export const hasAdminCredentials = () => isFirebaseConfigured();

let db = null;
export const adminDb = () => {
  if (!isFirebaseConfigured()) return null;
  if (!db) {
    db = getFirestore(getApp());
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
};
