import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env, isFirebaseConfigured, isAuthEmulator } from './env.js';

let app = null;

function getApp() {
  if (app) return app;
  if (isFirebaseConfigured()) {
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
  } else if (isAuthEmulator()) {
    // Local testing only: the Admin SDK talks to the Firebase Auth emulator
    // (FIREBASE_AUTH_EMULATOR_HOST) and needs no credentials. Never active in production.
    app = getApps()[0] || initializeApp({ projectId: env.firebase.projectId });
  }
  return app;
}

export const adminAuth = () => {
  const a = getApp();
  return a ? getAuth(a) : null;
};

let db = null;
export const adminDb = () => {
  if (!isFirebaseConfigured()) return null;
  if (!db) {
    db = getFirestore(getApp());
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
};
