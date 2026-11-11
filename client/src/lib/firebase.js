// Firebase web SDK — used ONLY for Authentication in the browser.
// All Firestore reads/writes go through the Express API (Admin SDK on the server).
import { initializeApp } from 'firebase/app';
import { connectAuthEmulator, getAuth } from 'firebase/auth';

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

// Local testing against the Firebase Auth emulator. import.meta.env.DEV is false in every
// production build, so this branch is removed from the deployed bundle entirely.
if (import.meta.env.DEV && auth && import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST) {
  connectAuthEmulator(auth, `http://${import.meta.env.VITE_FIREBASE_AUTH_EMULATOR_HOST}`, { disableWarnings: true });
}

// Optional analytics, loaded lazily so it never blocks rendering.
if (firebaseApp && config.measurementId && import.meta.env.PROD) {
  import('firebase/analytics')
    .then(async ({ getAnalytics, isSupported }) => {
      if (await isSupported()) getAnalytics(firebaseApp);
    })
    .catch(() => {});
}
