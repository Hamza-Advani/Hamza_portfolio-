import { adminDb } from '../config/firebase.js';
import { buildSeed, seedSingletons } from '../data/seed.js';
import { sortDocs } from './index.js';

const stamp = () => new Date().toISOString();

/**
 * First-run seeding: a brand-new Firestore database would otherwise show an empty site.
 * The first time the API connects, it copies the starter content into any EMPTY collection
 * and missing site document, then writes a marker (site/_meta) so it never runs again —
 * content the admin later edits or deletes is never re-created.
 */
async function seedOnce(db) {
  const marker = db.collection('site').doc('_meta');
  if ((await marker.get()).exists) return;
  const { singletons, collections } = buildSeed();
  const batch = db.batch();
  for (const [name, data] of Object.entries(singletons)) {
    const ref = db.collection('site').doc(name);
    if (!(await ref.get()).exists) batch.set(ref, { ...data, updatedAt: stamp() });
  }
  for (const [name, docs] of Object.entries(collections)) {
    if (!docs.length || !(await db.collection(name).limit(1).get()).empty) continue;
    for (const { id, ...doc } of docs) batch.set(db.collection(name).doc(id), doc);
  }
  batch.set(marker, { seededAt: stamp() });
  await batch.commit();
  console.log('[db] Seeded Firestore with starter content');
}

export function createFirestoreDriver() {
  const db = adminDb();
  let ready = null;
  const init = () => {
    ready ||= seedOnce(db).catch((err) => {
      ready = null; // retry on the next request
      console.error('[db] Initial seed failed:', err.message);
    });
    return ready;
  };

  return {
    kind: 'firestore',
    readOnly: false,

    async list(col) {
      await init();
      const snap = await db.collection(col).get();
      return sortDocs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
    },

    async get(col, id) {
      await init();
      const doc = await db.collection(col).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    },

    async create(col, data, id) {
      await init();
      const ref = id ? db.collection(col).doc(id) : db.collection(col).doc();
      const doc = { ...data, createdAt: data.createdAt || stamp(), updatedAt: stamp() };
      await ref.set(doc);
      return { id: ref.id, ...doc };
    },

    async update(col, id, patch) {
      await init();
      const ref = db.collection(col).doc(id);
      const existing = await ref.get();
      if (!existing.exists) return null;
      const doc = { ...existing.data(), ...patch, updatedAt: stamp() };
      delete doc.id;
      await ref.set(doc);
      return { id, ...doc };
    },

    async remove(col, id) {
      await init();
      const ref = db.collection(col).doc(id);
      const existing = await ref.get();
      if (!existing.exists) return false;
      await ref.delete();
      return true;
    },

    async getSingleton(name) {
      await init();
      const doc = await db.collection('site').doc(name).get();
      return doc.exists ? doc.data() : structuredClone(seedSingletons[name] || {});
    },

    async setSingleton(name, data) {
      await init();
      const doc = { ...data, updatedAt: stamp() };
      await db.collection('site').doc(name).set(doc);
      return doc;
    },
  };
}
