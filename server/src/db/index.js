import { isFirebaseConfigured, isBlobConfigured, env } from '../config/env.js';
import { createFirestoreDriver } from './firestoreDriver.js';
import { createLocalDriver } from './localDriver.js';
import { createBlobDriver } from './blobDriver.js';

/**
 * Storage drivers share one interface:
 *   list(col) · get(col, id) · create(col, data, id?) · update(col, id, patch) · remove(col, id)
 *   getSingleton(name) · setSingleton(name, data)
 *
 * Chosen in this order:
 * - "firestore": Firebase Admin credentials present (FIREBASE_CLIENT_EMAIL + FIREBASE_PRIVATE_KEY).
 * - "blob":      a Vercel Blob store is connected (BLOB_READ_WRITE_TOKEN / BLOB_STORE_ID).
 * - "seed":      production without either — read-only starter content.
 * - "local":     development — JSON file at server/.data/db.json.
 */
let driver = null;

export function getDb() {
  if (driver) return driver;
  if (isFirebaseConfigured()) driver = createFirestoreDriver();
  else if (isBlobConfigured()) driver = createBlobDriver({ prefix: env.blobPrefix });
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
