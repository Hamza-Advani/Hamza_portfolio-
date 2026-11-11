// Firebase web SDK — used ONLY for Authentication in the browser.
// All Firestore reads/writes go through the Express API (Admin SDK on the server).
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || undefined,
};

export const firebaseEnabled = Boolean(config.apiKey && config.appId && config.projectId);
export const firebaseApp = firebaseEnabled ? initializeApp(config) : null;
export const auth = firebaseApp ? getAuth(firebaseApp) : null;

// Optional analytics, loaded lazily so it never blocks rendering.
if (firebaseApp && config.measurementId && import.meta.env.PROD) {
  import('firebase/analytics')
    .then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) getAnalytics(firebaseApp);
    })
    .catch(() => {});
}
