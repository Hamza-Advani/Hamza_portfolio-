import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import { env, isFirebaseConfigured } from './env.js';

let app = null;

function getApp() {
  if (!isFirebaseConfigured()) return null;
  if (app) return app;
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
  return app;
}

export const adminAuth = () => {
  const a = getApp();
  return a ? getAuth(a) : null;
};

let db = null;
export const adminDb = () => {
  const a = getApp();
  if (!a) return null;
  if (!db) {
    db = getFirestore(a);
    db.settings({ ignoreUndefinedProperties: true });
  }
  return db;
};
