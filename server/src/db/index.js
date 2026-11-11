import { isFirebaseConfigured, env } from '../config/env.js';
import { createFirestoreDriver } from './firestoreDriver.js';
import { createLocalDriver } from './localDriver.js';

/**
 * Storage drivers share one interface:
 *   list(col) · get(col, id) · create(col, data, id?) · update(col, id, patch) · remove(col, id)
 *   getSingleton(name) · setSingleton(name, data)
 *
 * - "firestore": used whenever Firebase Admin credentials are present.
 * - "local":     JSON file store for development without Firebase (server/.data/db.json).
 * - "seed":      read-only seed content, used in production if Firebase is missing,
 *                so the public site still renders while admin writes return 503.
 */
let driver = null;

export function getDb() {
  if (driver) return driver;
  if (isFirebaseConfigured()) driver = createFirestoreDriver();
  else if (env.isProduction) driver = createLocalDriver({ readOnly: true, file: ':memory:' });
  else driver = createLocalDriver({ file: env.dataFile || (env.isTest ? ':memory:' : undefined) });
  return driver;
}

// Used by tests to start from a clean store.
export function resetDb() {
  driver = null;
}

export const COLLECTIONS = ['skills', 'education', 'projects', 'certificates', 'posts', 'roadmap', 'messages'];
export const SINGLETONS = ['profile', 'settings', 'video'];

export function sortDocs(docs) {
  return [...docs].sort((a, b) => {
    const ao = a.order ?? Number.MAX_SAFE_INTEGER;
    const bo = b.order ?? Number.MAX_SAFE_INTEGER;
    if (ao !== bo) return ao - bo;
    return String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
  });
}
